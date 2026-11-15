import crypto from 'crypto';
import mongoose from 'mongoose';
import { getApps } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { UserModel, OtpVerificationModel } from '../db/mongodb';
import { dbStore } from '../db/store';
import { emailService } from './emailService';
import { fcmService } from './fcmService';
import { OtpChannel, OtpStatusResponse, VerificationStatus } from '../types';

const OTP_LENGTH = Number(process.env.OTP_LENGTH) || 6;
const OTP_EXPIRY_SECONDS = Number(process.env.OTP_EXPIRY_SECONDS) || 300; // 5 minutes
const OTP_RESEND_COOLDOWN_SECONDS = Number(process.env.OTP_RESEND_COOLDOWN_SECONDS) || 60; // 60 seconds
const OTP_MAX_SENDS_PER_24H = Number(process.env.OTP_MAX_SENDS_PER_24H) || 3; // 3 sends
const OTP_MAX_FAILED_ATTEMPTS = Number(process.env.OTP_MAX_FAILED_ATTEMPTS) || 3; // 3 attempts
const OTP_BLOCK_DURATION_HOURS = Number(process.env.OTP_BLOCK_DURATION_HOURS) || 24; // 24 hours
const OTP_HASH_SECRET = process.env.OTP_HASH_SECRET || 'sikchakhub-otp-secure-hmac-secret-2026';

export function generateSecureOtp(length: number = OTP_LENGTH): string {
  const min = Math.pow(10, length - 1);
  const max = Math.pow(10, length) - 1;
  return crypto.randomInt(min, max + 1).toString();
}

export function hashOtp(otp: string, userId: string, channel: OtpChannel): string {
  return crypto
    .createHmac('sha256', OTP_HASH_SECRET)
    .update(`${userId}:${channel}:${otp.trim()}`)
    .digest('hex');
}

export function verifyOtpHash(inputOtp: string, storedHash: string, userId: string, channel: OtpChannel): boolean {
  if (!inputOtp || !storedHash) return false;
  const computed = hashOtp(inputOtp, userId, channel);
  try {
    const computedBuf = Buffer.from(computed, 'hex');
    const storedBuf = Buffer.from(storedHash, 'hex');
    if (computedBuf.length !== storedBuf.length) return false;
    return crypto.timingSafeEqual(computedBuf, storedBuf);
  } catch {
    return false;
  }
}

export function maskEmail(email: string): string {
  if (!email || !email.includes('@')) return email || '';
  const [user, domain] = email.split('@');
  if (user.length <= 2) return `${user[0]}*@${domain}`;
  return `${user[0]}***${user[user.length - 1]}@${domain}`;
}

export function normalizePhoneNumber(rawPhone: string): string {
  if (!rawPhone) return '';
  const digits = rawPhone.replace(/\D/g, '');
  if (digits.length === 10) {
    return `+91${digits}`;
  }
  if (digits.length === 12 && digits.startsWith('91')) {
    return `+${digits}`;
  }
  if (rawPhone.trim().startsWith('+')) {
    return `+${digits}`;
  }
  return `+91${digits.slice(-10)}`;
}

export function maskPhone(phone: string): string {
  if (!phone) return '';
  const normalized = normalizePhoneNumber(phone);
  if (normalized.length < 8) return normalized;
  const last4 = normalized.slice(-4);
  const prefix = normalized.slice(0, 3); // e.g. +91
  return `${prefix} ******${last4}`;
}

export class OtpService {
  /**
   * Safe fetch of User document from MongoDB with dbStore fallback
   */
  public async getUser(userId: string): Promise<any> {
    if (mongoose.connection.readyState === 1) {
      try {
        const user = await UserModel.findOne({ id: userId }).lean();
        if (user) return user;
      } catch (e) {}
    }
    return dbStore.getUserById(userId);
  }

  /**
   * Safe fetch of active or latest OTP verification record
   */
  public async getOtpRecord(userId: string, channel: OtpChannel): Promise<any> {
    if (mongoose.connection.readyState === 1) {
      try {
        const record = await OtpVerificationModel.findOne({ userId, channel }).sort({ createdAt: -1 }).lean();
        if (record) return record;
      } catch (e) {}
    }
    return dbStore.otpRecords.find(r => r.userId === userId && r.channel === channel);
  }

  /**
   * Request / Generate and Send an Email OTP
   * Enforces 60s cooldown, 3-sends per 24h, single-use invalidation, and 24h lockout
   */
  public async requestEmailOtp(userId: string): Promise<{
    success: boolean;
    message: string;
    cooldownSeconds?: number;
    sendsRemaining?: number;
  }> {
    const user = await this.getUser(userId);
    if (!user) {
      return { success: false, message: 'User account not found.' };
    }

    if (user.emailVerified) {
      return { success: true, message: 'Email address is already verified.' };
    }

    const now = new Date();
    const existingRecord = await this.getOtpRecord(userId, 'EMAIL');

    // 1. Check if user is currently blocked due to repeated failed attempts (24h lockout)
    if (existingRecord?.isBlocked && existingRecord?.blockedUntil) {
      const blockedUntil = new Date(existingRecord.blockedUntil);
      if (now < blockedUntil) {
        return {
          success: false,
          message: 'Too many incorrect OTP attempts. Your verification has been temporarily blocked for 24 hours.',
        };
      }
    }

    // 2. Enforce 60-second resend cooldown
    if (existingRecord?.resendCooldownUntil) {
      const cooldownUntil = new Date(existingRecord.resendCooldownUntil);
      if (now < cooldownUntil) {
        const remainingSeconds = Math.ceil((cooldownUntil.getTime() - now.getTime()) / 1000);
        return {
          success: false,
          message: `Please wait ${remainingSeconds} seconds before requesting a new OTP.`,
          cooldownSeconds: remainingSeconds,
        };
      }
    }

    // 3. Enforce maximum 3 OTP sends per rolling 24-hour period
    let currentSendCount = 1;
    let windowAnchor = now;

    if (existingRecord) {
      const firstSend = new Date(existingRecord.firstSendAt24h || existingRecord.createdAt);
      const isWithin24h = (now.getTime() - firstSend.getTime()) < 24 * 60 * 60 * 1000;

      if (isWithin24h) {
        if (existingRecord.sendCount24h >= OTP_MAX_SENDS_PER_24H) {
          return {
            success: false,
            message: 'You have reached your OTP request limit. Please try again after 24 hours.',
          };
        }
        currentSendCount = existingRecord.sendCount24h + 1;
        windowAnchor = firstSend;
      } else {
        // Reset 24-hour window
        currentSendCount = 1;
        windowAnchor = now;
      }
    }

    // 4. Generate cryptographically secure 6-digit OTP
    const rawOtp = generateSecureOtp(OTP_LENGTH);
    const otpHash = hashOtp(rawOtp, userId, 'EMAIL');
    const expiresAt = new Date(now.getTime() + OTP_EXPIRY_SECONDS * 1000);
    const resendCooldownUntil = new Date(now.getTime() + OTP_RESEND_COOLDOWN_SECONDS * 1000);

    const recordId = `otp-em-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const newRecordDoc = {
      id: recordId,
      userId,
      channel: 'EMAIL',
      identifier: user.email,
      otpHash,
      expiresAt,
      resendCooldownUntil,
      sendCount24h: currentSendCount,
      firstSendAt24h: windowAnchor,
      failedAttempts: 0,
      isBlocked: false,
      blockedUntil: undefined,
      isConsumed: false,
    };

    // Invalidate previous active OTPs for this channel & save new challenge
    if (mongoose.connection.readyState === 1) {
      try {
        await OtpVerificationModel.updateMany(
          { userId, channel: 'EMAIL', isConsumed: false },
          { $set: { isConsumed: true, consumedAt: now } }
        );
        await OtpVerificationModel.create(newRecordDoc);
      } catch (dbErr) {
        console.warn('MongoDB OtpVerificationModel write warning:', dbErr);
      }
    }

    // Update in-memory store
    dbStore.otpRecords = dbStore.otpRecords.filter(r => !(r.userId === userId && r.channel === 'EMAIL' && !r.isConsumed));
    dbStore.otpRecords.push(newRecordDoc);

    // 5. Dispatch email via Email Service
    await emailService.sendOtpEmail({
      to: user.email,
      otp: rawOtp,
      userName: user.fullName,
    });

    return {
      success: true,
      message: 'A 6-digit verification code has been dispatched to your email address.',
      cooldownSeconds: OTP_RESEND_COOLDOWN_SECONDS,
      sendsRemaining: Math.max(0, OTP_MAX_SENDS_PER_24H - currentSendCount),
    };
  }

  /**
   * Verify Email OTP
   * Enforces single-use consumption, timing-safe validation, 3-attempt lockout
   */
  public async verifyEmailOtp(userId: string, inputOtp: string): Promise<{
    success: boolean;
    message: string;
    verificationStatus?: VerificationStatus;
    isFullyVerified?: boolean;
    remainingAttempts?: number;
  }> {
    const user = await this.getUser(userId);
    if (!user) {
      return { success: false, message: 'User account not found.' };
    }

    if (user.emailVerified) {
      return { 
        success: true, 
        message: 'Email address is already verified.',
        verificationStatus: user.verificationStatus || 'EMAIL_VERIFIED',
        isFullyVerified: user.isVerified || false,
      };
    }

    const now = new Date();
    const record = await this.getOtpRecord(userId, 'EMAIL');

    if (!record) {
      return { success: false, message: 'No OTP challenge found. Please request an OTP first.' };
    }

    // Check 24-hour block status
    if (record.isBlocked && record.blockedUntil) {
      const blockedUntil = new Date(record.blockedUntil);
      if (now < blockedUntil) {
        return {
          success: false,
          message: 'Too many incorrect OTP attempts. Your verification has been temporarily blocked for 24 hours.',
        };
      }
    }

    if (record.isConsumed) {
      return { success: false, message: 'This OTP has already been used. Please request a new one.' };
    }

    // Check expiration (5 minutes)
    if (now > new Date(record.expiresAt)) {
      return { success: false, message: 'The OTP code has expired. Please request a new code.' };
    }

    // Timing-safe comparison of OTP hash
    const isValid = verifyOtpHash(inputOtp, record.otpHash, userId, 'EMAIL');

    if (!isValid) {
      const newFailedCount = (record.failedAttempts || 0) + 1;
      const isNowBlocked = newFailedCount >= OTP_MAX_FAILED_ATTEMPTS;
      const blockedUntil = isNowBlocked ? new Date(now.getTime() + OTP_BLOCK_DURATION_HOURS * 3600 * 1000) : undefined;

      if (mongoose.connection.readyState === 1) {
        try {
          await OtpVerificationModel.updateOne(
            { id: record.id },
            {
              $set: {
                failedAttempts: newFailedCount,
                isBlocked: isNowBlocked,
                blockedUntil,
                isConsumed: isNowBlocked, // Invalidate on block
              },
            }
          );
        } catch (e) {}
      }

      record.failedAttempts = newFailedCount;
      record.isBlocked = isNowBlocked;
      record.blockedUntil = blockedUntil;

      if (isNowBlocked) {
        if (mongoose.connection.readyState === 1) {
          try {
            await UserModel.updateOne(
              { id: userId },
              { $set: { verificationStatus: 'TEMPORARILY_BLOCKED' } }
            );
          } catch (e) {}
        }
        return {
          success: false,
          message: 'Too many incorrect OTP attempts. Your verification has been temporarily blocked for 24 hours.',
        };
      }

      return {
        success: false,
        message: `Invalid verification code. ${OTP_MAX_FAILED_ATTEMPTS - newFailedCount} attempt(s) remaining.`,
        remainingAttempts: OTP_MAX_FAILED_ATTEMPTS - newFailedCount,
      };
    }

    // OTP is valid! Consume it atomically
    if (mongoose.connection.readyState === 1) {
      try {
        await OtpVerificationModel.updateOne(
          { id: record.id },
          {
            $set: {
              isConsumed: true,
              consumedAt: now,
              failedAttempts: 0,
            },
          }
        );
      } catch (e) {}
    }

    record.isConsumed = true;
    record.consumedAt = now;

    // Update user verification status
    const isPhoneAlreadyVerified = user.phoneVerified || false;
    const newStatus: VerificationStatus = isPhoneAlreadyVerified ? 'FULLY_VERIFIED' : 'EMAIL_VERIFIED';
    const isNowFullyVerified = isPhoneAlreadyVerified;

    if (mongoose.connection.readyState === 1) {
      try {
        await UserModel.updateOne(
          { id: userId },
          {
            $set: {
              emailVerified: true,
              emailVerifiedAt: now,
              verificationStatus: newStatus,
              isVerified: isNowFullyVerified,
            },
          }
        );
      } catch (e) {}
    }

    user.emailVerified = true;
    user.emailVerifiedAt = now.toISOString();
    user.verificationStatus = newStatus;
    user.isVerified = isNowFullyVerified;

    return {
      success: true,
      message: 'Email address verified successfully!',
      verificationStatus: newStatus,
      isFullyVerified: isNowFullyVerified,
    };
  }

  /**
   * Pre-flight Authorization Ticket for Phone OTP
   * Enforces backend rate limiting, 60s cooldown, 3-sends per 24h, and 24h lockout
   * before client triggers Firebase Phone Auth SMS
   */
  public async requestPhoneTicket(userId: string): Promise<{
    success: boolean;
    message: string;
    cooldownSeconds?: number;
    sendsRemaining?: number;
    ticket?: string;
  }> {
    const user = await this.getUser(userId);
    if (!user) {
      return { success: false, message: 'User account not found.' };
    }

    if (user.phoneVerified) {
      return { success: true, message: 'Mobile number is already verified.' };
    }

    if (!user.phone) {
      return { success: false, message: 'No registered mobile number found for this account.' };
    }

    const now = new Date();
    const existingRecord = await this.getOtpRecord(userId, 'PHONE');

    // 1. Check if user is currently blocked (24h lockout)
    if (existingRecord?.isBlocked && existingRecord?.blockedUntil) {
      const blockedUntil = new Date(existingRecord.blockedUntil);
      if (now < blockedUntil) {
        return {
          success: false,
          message: 'Too many incorrect OTP attempts. Your verification has been temporarily blocked for 24 hours.',
        };
      }
    }

    // 2. Enforce 60-second cooldown
    if (existingRecord?.resendCooldownUntil) {
      const cooldownUntil = new Date(existingRecord.resendCooldownUntil);
      if (now < cooldownUntil) {
        const remainingSeconds = Math.ceil((cooldownUntil.getTime() - now.getTime()) / 1000);
        return {
          success: false,
          message: `Please wait ${remainingSeconds} seconds before requesting a new OTP.`,
          cooldownSeconds: remainingSeconds,
        };
      }
    }

    // 3. Enforce maximum 3 sends per rolling 24-hour period
    let currentSendCount = 1;
    let windowAnchor = now;

    if (existingRecord) {
      const firstSend = new Date(existingRecord.firstSendAt24h || existingRecord.createdAt);
      const isWithin24h = (now.getTime() - firstSend.getTime()) < 24 * 60 * 60 * 1000;

      if (isWithin24h) {
        if (existingRecord.sendCount24h >= OTP_MAX_SENDS_PER_24H) {
          return {
            success: false,
            message: 'You have reached your OTP request limit. Please try again after 24 hours.',
          };
        }
        currentSendCount = existingRecord.sendCount24h + 1;
        windowAnchor = firstSend;
      } else {
        currentSendCount = 1;
        windowAnchor = now;
      }
    }

    return {
      success: true,
      message: 'Mobile verification challenge authorized.',
      sendsRemaining: Math.max(0, OTP_MAX_SENDS_PER_24H - (existingRecord?.sendCount24h || 0)),
    };
  }

  /**
   * Called ONLY after Firebase Phone Auth SDK genuinely confirms SMS dispatch
   * Starts the 60s cooldown and records the challenge.
   */
  public async confirmPhoneSent(userId: string): Promise<{
    success: boolean;
    cooldownSeconds?: number;
    sendsRemaining?: number;
  }> {
    const user = await this.getUser(userId);
    if (!user || !user.phone) {
      return { success: false };
    }

    const now = new Date();
    const existingRecord = await this.getOtpRecord(userId, 'PHONE');

    let currentSendCount = 1;
    let windowAnchor = now;

    if (existingRecord) {
      const firstSend = new Date(existingRecord.firstSendAt24h || existingRecord.createdAt);
      const isWithin24h = (now.getTime() - firstSend.getTime()) < 24 * 60 * 60 * 1000;
      if (isWithin24h) {
        currentSendCount = (existingRecord.sendCount24h || 0) + 1;
        windowAnchor = firstSend;
      }
    }

    const ticket = crypto.randomBytes(24).toString('hex');
    const otpHash = crypto.createHash('sha256').update(ticket).digest('hex');
    const expiresAt = new Date(now.getTime() + OTP_EXPIRY_SECONDS * 1000);
    const resendCooldownUntil = new Date(now.getTime() + OTP_RESEND_COOLDOWN_SECONDS * 1000);

    const recordId = `otp-ph-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const newRecordDoc = {
      id: recordId,
      userId,
      channel: 'PHONE' as const,
      identifier: normalizePhoneNumber(user.phone),
      otpHash,
      expiresAt,
      resendCooldownUntil,
      sendCount24h: currentSendCount,
      firstSendAt24h: windowAnchor,
      failedAttempts: 0,
      isBlocked: false,
      blockedUntil: undefined,
      isConsumed: false,
    };

    if (mongoose.connection.readyState === 1) {
      try {
        await OtpVerificationModel.updateMany(
          { userId, channel: 'PHONE', isConsumed: false },
          { $set: { isConsumed: true, consumedAt: now } }
        );
        await OtpVerificationModel.create(newRecordDoc);
      } catch (e) {}
    }

    dbStore.otpRecords = dbStore.otpRecords.filter(r => !(r.userId === userId && r.channel === 'PHONE' && !r.isConsumed));
    dbStore.otpRecords.push(newRecordDoc);

    return {
      success: true,
      cooldownSeconds: OTP_RESEND_COOLDOWN_SECONDS,
      sendsRemaining: Math.max(0, OTP_MAX_SENDS_PER_24H - currentSendCount),
    };
  }

  /**
   * Verify Mobile Phone using Firebase ID Token verified via Firebase Admin SDK
   * Never trusts frontend-only success.
   * Compares verified phone number with user's registered phone number.
   * Strictly rejects mock tokens, dev bypasses, or raw OTP codes.
   */
  public async verifyPhoneWithFirebase(
    userId: string, 
    idToken?: string
  ): Promise<{
    success: boolean;
    message: string;
    verificationStatus?: VerificationStatus;
    isFullyVerified?: boolean;
    remainingAttempts?: number;
  }> {
    const user = await this.getUser(userId);
    if (!user) {
      return { success: false, message: 'User account not found.' };
    }

    if (user.phoneVerified) {
      return { 
        success: true, 
        message: 'Mobile number is already verified.',
        verificationStatus: user.verificationStatus || 'PHONE_VERIFIED',
        isFullyVerified: user.isVerified || false,
      };
    }

    const now = new Date();
    const record = await this.getOtpRecord(userId, 'PHONE');

    // Check block status
    if (record?.isBlocked && record?.blockedUntil) {
      const blockedUntil = new Date(record.blockedUntil);
      if (now < blockedUntil) {
        return {
          success: false,
          message: 'Too many incorrect OTP attempts. Your verification has been temporarily blocked for 24 hours.',
        };
      }
    }

    // Require genuine Firebase ID Token
    if (!idToken || typeof idToken !== 'string' || idToken.trim().length === 0) {
      return {
        success: false,
        message: 'Firebase verification token is required. Please verify with SMS OTP.',
      };
    }

    const registeredPhoneNormalized = normalizePhoneNumber(user.phone || '');

    let verifiedPhone: string | null = null;
    try {
      if (getApps().length === 0) {
        fcmService.initFirebase();
      }
      const decodedToken = await getAuth().verifyIdToken(idToken.trim());
      verifiedPhone = decodedToken.phone_number || null;
    } catch (adminErr: any) {
      console.warn('Firebase Admin verifyIdToken error:', adminErr.message);

      // Record failed attempt for phone verification
      const currentFailed = record?.failedAttempts || 0;
      const newFailed = currentFailed + 1;
      const isNowBlocked = newFailed >= OTP_MAX_FAILED_ATTEMPTS;
      const blockedUntil = isNowBlocked ? new Date(now.getTime() + OTP_BLOCK_DURATION_HOURS * 3600 * 1000) : undefined;

      if (record) {
        if (mongoose.connection.readyState === 1) {
          try {
            await OtpVerificationModel.updateOne(
              { id: record.id },
              { $set: { failedAttempts: newFailed, isBlocked: isNowBlocked, blockedUntil } }
            );
          } catch (e) {}
        }
        record.failedAttempts = newFailed;
        record.isBlocked = isNowBlocked;
        record.blockedUntil = blockedUntil;
      }

      if (isNowBlocked) {
        return {
          success: false,
          message: 'Too many incorrect OTP attempts. Your verification has been temporarily blocked for 24 hours.',
        };
      }

      return {
        success: false,
        message: `Invalid or expired Firebase verification credential. ${OTP_MAX_FAILED_ATTEMPTS - newFailed} attempt(s) remaining.`,
        remainingAttempts: OTP_MAX_FAILED_ATTEMPTS - newFailed,
      };
    }

    if (!verifiedPhone) {
      return {
        success: false,
        message: 'No verified phone number found in authentication credential.',
      };
    }

    // Security check: Verify that verified phone number matches registered user's phone number!
    const normalizedFirebasePhone = normalizePhoneNumber(verifiedPhone);
    if (normalizedFirebasePhone !== registeredPhoneNormalized) {
      const currentFailed = record?.failedAttempts || 0;
      const newFailed = currentFailed + 1;
      const isNowBlocked = newFailed >= OTP_MAX_FAILED_ATTEMPTS;
      const blockedUntil = isNowBlocked ? new Date(now.getTime() + OTP_BLOCK_DURATION_HOURS * 3600 * 1000) : undefined;

      if (record) {
        if (mongoose.connection.readyState === 1) {
          try {
            await OtpVerificationModel.updateOne(
              { id: record.id },
              { $set: { failedAttempts: newFailed, isBlocked: isNowBlocked, blockedUntil } }
            );
          } catch (e) {}
        }
        record.failedAttempts = newFailed;
        record.isBlocked = isNowBlocked;
        record.blockedUntil = blockedUntil;
      }

      return {
        success: false,
        message: 'Verified phone number does not match your registered mobile number.',
      };
    }

    // Verification Succeeded!
    if (record) {
      if (mongoose.connection.readyState === 1) {
        try {
          await OtpVerificationModel.updateOne(
            { id: record.id },
            { $set: { isConsumed: true, consumedAt: now, failedAttempts: 0 } }
          );
        } catch (e) {}
      }
      record.isConsumed = true;
      record.consumedAt = now;
    }

    const isEmailAlreadyVerified = user.emailVerified === true;
    const isNowFullyVerified = isEmailAlreadyVerified;
    const newStatus: VerificationStatus = isNowFullyVerified ? 'FULLY_VERIFIED' : 'PHONE_VERIFIED';

    if (mongoose.connection.readyState === 1) {
      try {
        await UserModel.updateOne(
          { id: userId },
          {
            $set: {
              phoneVerified: true,
              phoneVerifiedAt: now,
              verificationStatus: newStatus,
              isVerified: isNowFullyVerified,
            },
          }
        );
      } catch (e) {}
    }

    user.phoneVerified = true;
    user.phoneVerifiedAt = now.toISOString();
    user.verificationStatus = newStatus;
    user.isVerified = isNowFullyVerified;

    return {
      success: true,
      message: 'Mobile number verified successfully!',
      verificationStatus: newStatus,
      isFullyVerified: isNowFullyVerified,
    };
  }

  /**
   * Get Combined Verification Status for user dashboard / verification page
   */
  public async getVerificationStatus(userId: string): Promise<OtpStatusResponse> {
    const user = await this.getUser(userId);
    const now = new Date();

    const emailRecord = await this.getOtpRecord(userId, 'EMAIL');
    const phoneRecord = await this.getOtpRecord(userId, 'PHONE');

    // Email cooldown
    let emailCooldownRemaining = 0;
    if (emailRecord?.resendCooldownUntil) {
      const cool = new Date(emailRecord.resendCooldownUntil);
      if (now < cool) emailCooldownRemaining = Math.ceil((cool.getTime() - now.getTime()) / 1000);
    }

    // Phone cooldown
    let phoneCooldownRemaining = 0;
    if (phoneRecord?.resendCooldownUntil) {
      const cool = new Date(phoneRecord.resendCooldownUntil);
      if (now < cool) phoneCooldownRemaining = Math.ceil((cool.getTime() - now.getTime()) / 1000);
    }

    // Email send count
    let emailSendsRemaining = OTP_MAX_SENDS_PER_24H;
    if (emailRecord) {
      const first = new Date(emailRecord.firstSendAt24h || emailRecord.createdAt);
      if (now.getTime() - first.getTime() < 24 * 3600 * 1000) {
        emailSendsRemaining = Math.max(0, OTP_MAX_SENDS_PER_24H - (emailRecord.sendCount24h || 0));
      }
    }

    // Phone send count
    let phoneSendsRemaining = OTP_MAX_SENDS_PER_24H;
    if (phoneRecord) {
      const first = new Date(phoneRecord.firstSendAt24h || phoneRecord.createdAt);
      if (now.getTime() - first.getTime() < 24 * 3600 * 1000) {
        phoneSendsRemaining = Math.max(0, OTP_MAX_SENDS_PER_24H - (phoneRecord.sendCount24h || 0));
      }
    }

    // Email block
    let isEmailBlocked = false;
    let emailBlockRemainingSeconds = 0;
    if (emailRecord?.isBlocked && emailRecord?.blockedUntil) {
      const b = new Date(emailRecord.blockedUntil);
      if (now < b) {
        isEmailBlocked = true;
        emailBlockRemainingSeconds = Math.ceil((b.getTime() - now.getTime()) / 1000);
      }
    }

    // Phone block
    let isPhoneBlocked = false;
    let phoneBlockRemainingSeconds = 0;
    if (phoneRecord?.isBlocked && phoneRecord?.blockedUntil) {
      const b = new Date(phoneRecord.blockedUntil);
      if (now < b) {
        isPhoneBlocked = true;
        phoneBlockRemainingSeconds = Math.ceil((b.getTime() - now.getTime()) / 1000);
      }
    }

    const emailVerified = user?.emailVerified === true;
    const phoneVerified = user?.phoneVerified === true;
    const isFullyVerified = emailVerified && phoneVerified;

    let verificationStatus: VerificationStatus = user?.verificationStatus || 'PENDING_VERIFICATION';
    if (isEmailBlocked || isPhoneBlocked) {
      verificationStatus = 'TEMPORARILY_BLOCKED';
    } else if (isFullyVerified) {
      verificationStatus = 'FULLY_VERIFIED';
    } else if (emailVerified) {
      verificationStatus = 'EMAIL_VERIFIED';
    } else if (phoneVerified) {
      verificationStatus = 'PHONE_VERIFIED';
    }

    return {
      email: maskEmail(user?.email || ''),
      phone: maskPhone(user?.phone || ''),
      verificationStatus,
      emailVerified,
      phoneVerified,
      isVerified: isFullyVerified,
      emailCooldownRemaining,
      phoneCooldownRemaining,
      emailSendsRemaining,
      phoneSendsRemaining,
      isEmailBlocked,
      isPhoneBlocked,
      emailBlockRemainingSeconds,
      phoneBlockRemainingSeconds,
      emailFailedAttempts: emailRecord?.failedAttempts || 0,
      phoneFailedAttempts: phoneRecord?.failedAttempts || 0,
    };
  }
}

export const otpService = new OtpService();
