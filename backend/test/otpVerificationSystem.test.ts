import test from 'node:test';
import assert from 'node:assert';
import { getAuth } from 'firebase-admin/auth';
import { fcmService } from '../src/services/fcmService';
import { 
  otpService, 
  generateSecureOtp, 
  hashOtp, 
  verifyOtpHash, 
  maskEmail, 
  maskPhone,
  normalizePhoneNumber 
} from '../src/services/otpService';
import { dbStore } from '../src/db/store';
import { requireVerifiedAccount } from '../src/middleware/authMiddleware';

test('1. Normal signup creates pending verification state', async () => {
  const testUserId = `user-test-${Date.now()}`;
  dbStore.users.push({
    id: testUserId,
    email: 'neweducator@sikchakhub.ai',
    fullName: 'Test Educator',
    role: 'TEACHER',
    phone: '9876543210',
    isVerified: false,
    verificationStatus: 'PENDING_VERIFICATION',
    emailVerified: false,
    phoneVerified: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });

  const user = dbStore.getUserById(testUserId);
  assert.strictEqual(user?.isVerified, false);
  assert.strictEqual(user?.verificationStatus, 'PENDING_VERIFICATION');
  assert.strictEqual(user?.emailVerified, false);
  assert.strictEqual(user?.phoneVerified, false);
});

test('2. Email OTP generation & Timing-Safe Hash Verification', async () => {
  const testUserId = `user-hash-${Date.now()}`;
  const otp = generateSecureOtp(6);
  assert.strictEqual(otp.length, 6);
  assert.match(otp, /^\d{6}$/);

  const hash = hashOtp(otp, testUserId, 'EMAIL');
  assert.ok(hash);
  assert.strictEqual(verifyOtpHash(otp, hash, testUserId, 'EMAIL'), true);
  assert.strictEqual(verifyOtpHash('000000', hash, testUserId, 'EMAIL'), false);
});

test('3. Phone Normalization & Masking', () => {
  const normalized = normalizePhoneNumber('9876543210');
  assert.strictEqual(normalized, '+919876543210');

  const masked = maskPhone('9876543210');
  assert.strictEqual(masked, '+91 ******3210');

  const maskedEmailStr = maskEmail('priyasharma@gmail.com');
  assert.strictEqual(maskedEmailStr, 'p***a@gmail.com');
});

test('4. Resend Cooldown Enforcement (Before 60 seconds)', async () => {
  const testUserId = `user-cd-${Date.now()}`;
  dbStore.users.push({
    id: testUserId,
    email: 'cooldown.user@sikchakhub.ai',
    fullName: 'Cooldown User',
    role: 'TEACHER',
    phone: '9876543211',
    isVerified: false,
    verificationStatus: 'PENDING_VERIFICATION',
    emailVerified: false,
    phoneVerified: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });

  // First request: should succeed
  const firstReq = await otpService.requestEmailOtp(testUserId);
  assert.strictEqual(firstReq.success, true);
  assert.strictEqual(firstReq.cooldownSeconds, 60);

  // Immediate second request: should be blocked by 60s cooldown
  const secondReq = await otpService.requestEmailOtp(testUserId);
  assert.strictEqual(secondReq.success, false);
  assert.match(secondReq.message, /Please wait \d+ seconds before requesting a new OTP/);
});

test('5. Maximum 3 OTP Sends in Rolling 24 Hours', async () => {
  const testUserId = `user-limit-${Date.now()}`;
  dbStore.users.push({
    id: testUserId,
    email: 'limit.user@sikchakhub.ai',
    fullName: 'Limit User',
    role: 'EMPLOYER',
    phone: '9876543212',
    isVerified: false,
    verificationStatus: 'PENDING_VERIFICATION',
    emailVerified: false,
    phoneVerified: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });

  // Mock record with sendCount24h = 3
  const now = new Date();
  dbStore.otpRecords.push({
    id: `rec-${testUserId}`,
    userId: testUserId,
    channel: 'EMAIL',
    identifier: 'limit.user@sikchakhub.ai',
    otpHash: 'dummyhash',
    expiresAt: new Date(now.getTime() + 300000),
    resendCooldownUntil: new Date(now.getTime() - 1000), // cooldown expired
    sendCount24h: 3,
    firstSendAt24h: new Date(now.getTime() - 3600000), // 1 hour ago
    failedAttempts: 0,
    isBlocked: false,
    isConsumed: false,
  });

  const fourthReq = await otpService.requestEmailOtp(testUserId);
  assert.strictEqual(fourthReq.success, false);
  assert.strictEqual(
    fourthReq.message, 
    'You have reached your OTP request limit. Please try again after 24 hours.'
  );
});

test('6. Three Incorrect Verification Attempts Trigger 24-Hour Lockout', async () => {
  const testUserId = `user-lockout-${Date.now()}`;
  dbStore.users.push({
    id: testUserId,
    email: 'lockout.user@sikchakhub.ai',
    fullName: 'Lockout User',
    role: 'TEACHER',
    phone: '9876543213',
    isVerified: false,
    verificationStatus: 'PENDING_VERIFICATION',
    emailVerified: false,
    phoneVerified: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });

  await otpService.requestEmailOtp(testUserId);

  // Attempt 1: wrong OTP
  const res1 = await otpService.verifyEmailOtp(testUserId, '000000');
  assert.strictEqual(res1.success, false);
  assert.strictEqual(res1.remainingAttempts, 2);

  // Attempt 2: wrong OTP
  const res2 = await otpService.verifyEmailOtp(testUserId, '111111');
  assert.strictEqual(res2.success, false);
  assert.strictEqual(res2.remainingAttempts, 1);

  // Attempt 3: wrong OTP -> Lockout!
  const res3 = await otpService.verifyEmailOtp(testUserId, '222222');
  assert.strictEqual(res3.success, false);
  assert.match(res3.message, /Too many incorrect OTP attempts. Your verification has been temporarily blocked for 24 hours./);

  // Attempt 4: Block is enforced immediately
  const res4 = await otpService.verifyEmailOtp(testUserId, '333333');
  assert.strictEqual(res4.success, false);
  assert.match(res4.message, /temporarily blocked for 24 hours/);
});

test('7. Single-Use Consumption: Reused OTP is rejected', async () => {
  const testUserId = `user-consume-${Date.now()}`;
  dbStore.users.push({
    id: testUserId,
    email: 'singleuse.user@sikchakhub.ai',
    fullName: 'Single Use User',
    role: 'TEACHER',
    phone: '9876543214',
    isVerified: false,
    verificationStatus: 'PENDING_VERIFICATION',
    emailVerified: false,
    phoneVerified: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });

  const correctOtp = '654321';
  const now = new Date();
  dbStore.otpRecords.push({
    id: `rec-${testUserId}`,
    userId: testUserId,
    channel: 'EMAIL',
    identifier: 'singleuse.user@sikchakhub.ai',
    otpHash: hashOtp(correctOtp, testUserId, 'EMAIL'),
    expiresAt: new Date(now.getTime() + 300000),
    sendCount24h: 1,
    firstSendAt24h: now,
    failedAttempts: 0,
    isBlocked: false,
    isConsumed: false,
  });

  // Verify first time: should succeed
  const verifyRes = await otpService.verifyEmailOtp(testUserId, correctOtp);
  assert.strictEqual(verifyRes.success, true);

  // Reset user verification to simulate a second challenge reuse attempt
  const user = dbStore.getUserById(testUserId);
  if (user) user.emailVerified = false;

  // Verify second time: should fail due to single-use consumption
  const reuseRes = await otpService.verifyEmailOtp(testUserId, correctOtp);
  assert.strictEqual(reuseRes.success, false);
  assert.match(reuseRes.message, /already been used/);
});

test('8. Full Dual Verification (Email + Phone) Unlocks Account and Grants Dashboard Access', async () => {
  const testUserId = `user-dual-${Date.now()}`;
  const userDoc: any = {
    id: testUserId,
    email: 'dual.verified@sikchakhub.ai',
    fullName: 'Dual Verified Educator',
    role: 'TEACHER',
    phone: '9876543215',
    isVerified: false,
    verificationStatus: 'PENDING_VERIFICATION',
    emailVerified: false,
    phoneVerified: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  dbStore.users.push(userDoc);

  // Setup email OTP
  const emailOtp = '888999';
  const now = new Date();
  dbStore.otpRecords.push({
    id: `rec-em-${testUserId}`,
    userId: testUserId,
    channel: 'EMAIL',
    identifier: userDoc.email,
    otpHash: hashOtp(emailOtp, testUserId, 'EMAIL'),
    expiresAt: new Date(now.getTime() + 300000),
    sendCount24h: 1,
    firstSendAt24h: now,
    failedAttempts: 0,
    isBlocked: false,
    isConsumed: false,
  });

  // 1. Verify Email
  const emailVerifyRes = await otpService.verifyEmailOtp(testUserId, emailOtp);
  assert.strictEqual(emailVerifyRes.success, true);
  assert.strictEqual(emailVerifyRes.verificationStatus, 'EMAIL_VERIFIED');
  assert.strictEqual(emailVerifyRes.isFullyVerified, false);

  // 2. Security Test: Attempting to verify phone with raw 123456 or undefined token FAILS
  await otpService.requestPhoneTicket(testUserId);
  const bypassAttempt1 = await otpService.verifyPhoneWithFirebase(testUserId, undefined as any);
  assert.strictEqual(bypassAttempt1.success, false);
  assert.match(bypassAttempt1.message, /Firebase verification token is required/);

  const bypassAttempt2 = await otpService.verifyPhoneWithFirebase(testUserId, '123456');
  assert.strictEqual(bypassAttempt2.success, false);
  assert.match(bypassAttempt2.message, /Invalid or expired Firebase verification credential/);

  // 3. Genuine Firebase Verification with ID Token matching registered mobile (+919876543215)
  fcmService.initFirebase();
  const auth = getAuth();
  const origVerify = auth.verifyIdToken.bind(auth);
  auth.verifyIdToken = async (token: string) => {
    if (token === 'firebase-verified-test-id-token') {
      return { phone_number: '+919876543215' } as any;
    }
    throw new Error('Firebase ID token verification failed');
  };

  const phoneVerifyRes = await otpService.verifyPhoneWithFirebase(testUserId, 'firebase-verified-test-id-token');
  assert.strictEqual(phoneVerifyRes.success, true);
  assert.strictEqual(phoneVerifyRes.verificationStatus, 'FULLY_VERIFIED');
  assert.strictEqual(phoneVerifyRes.isFullyVerified, true);

  // 3. Check middleware protection
  let passedMiddleware = false;
  const mockReq: any = {
    user: {
      id: testUserId,
      email: userDoc.email,
      role: 'TEACHER',
      isVerified: true,
      verificationStatus: 'FULLY_VERIFIED',
    },
  };
  const mockRes: any = {
    status: (code: number) => ({ json: (data: any) => data }),
  };
  const mockNext = () => { passedMiddleware = true; };

  requireVerifiedAccount(mockReq, mockRes, mockNext);
  assert.strictEqual(passedMiddleware, true);
});

test('9. Unverified Account Is Blocked From Protected Dashboard Routes by Middleware', () => {
  let middlewareResponse: any = null;
  const unverifiedReq: any = {
    user: {
      id: 'usr-unverified',
      email: 'unverified@sikchakhub.ai',
      role: 'TEACHER',
      isVerified: false,
      verificationStatus: 'PENDING_VERIFICATION',
    },
  };
  const mockRes: any = {
    status: (code: number) => ({
      json: (data: any) => {
        middlewareResponse = { code, data };
        return data;
      },
    }),
  };
  let nextCalled = false;
  const mockNext = () => { nextCalled = true; };

  requireVerifiedAccount(unverifiedReq, mockRes, mockNext);
  assert.strictEqual(nextCalled, false);
  assert.strictEqual(middlewareResponse.code, 403);
  assert.strictEqual(middlewareResponse.data.code, 'VERIFICATION_REQUIRED');
});

test('10. Resend Allowed After 60-Second Cooldown Expires', async () => {
  const testUserId = `user-cd-exp-${Date.now()}`;
  dbStore.users.push({
    id: testUserId,
    email: 'cd.expired@sikchakhub.ai',
    fullName: 'Cooldown Expired User',
    role: 'TEACHER',
    phone: '9876543220',
    isVerified: false,
    verificationStatus: 'PENDING_VERIFICATION',
    emailVerified: false,
    phoneVerified: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });

  // First send
  await otpService.requestEmailOtp(testUserId);

  // Fast forward cooldown to the past
  const record = await otpService.getOtpRecord(testUserId, 'EMAIL');
  if (record) {
    record.resendCooldownUntil = new Date(Date.now() - 5000);
  }

  // Second send after cooldown expired
  const resendRes = await otpService.requestEmailOtp(testUserId);
  assert.strictEqual(resendRes.success, true);
  assert.strictEqual(resendRes.cooldownSeconds, 60);
});

test('11. Expired OTP is Rejected (Beyond 5 Minutes)', async () => {
  const testUserId = `user-exp-${Date.now()}`;
  dbStore.users.push({
    id: testUserId,
    email: 'expired.otp@sikchakhub.ai',
    fullName: 'Expired OTP User',
    role: 'TEACHER',
    phone: '9876543221',
    isVerified: false,
    verificationStatus: 'PENDING_VERIFICATION',
    emailVerified: false,
    phoneVerified: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });

  const otp = '999111';
  // Create expired challenge (expiresAt 10 minutes ago)
  dbStore.otpRecords.push({
    id: `rec-exp-${testUserId}`,
    userId: testUserId,
    channel: 'EMAIL',
    identifier: 'expired.otp@sikchakhub.ai',
    otpHash: hashOtp(otp, testUserId, 'EMAIL'),
    expiresAt: new Date(Date.now() - 600000), // 10 mins ago
    sendCount24h: 1,
    firstSendAt24h: new Date(Date.now() - 600000),
    failedAttempts: 0,
    isBlocked: false,
    isConsumed: false,
  });

  const verifyRes = await otpService.verifyEmailOtp(testUserId, otp);
  assert.strictEqual(verifyRes.success, false);
  assert.match(verifyRes.message, /expired/i);
});

test('12. Browser Refresh Persistence: Status API returns active challenges and masked info', async () => {
  const testUserId = `user-refresh-${Date.now()}`;
  dbStore.users.push({
    id: testUserId,
    email: 'refresh.test@sikchakhub.ai',
    fullName: 'Refresh Test User',
    role: 'TEACHER',
    phone: '9876543222',
    isVerified: false,
    verificationStatus: 'EMAIL_VERIFIED',
    emailVerified: true,
    phoneVerified: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });

  const status = await otpService.getVerificationStatus(testUserId);
  assert.strictEqual(status.emailVerified, true);
  assert.strictEqual(status.phoneVerified, false);
  assert.strictEqual(status.isVerified, false);
  assert.strictEqual(status.verificationStatus, 'EMAIL_VERIFIED');
  assert.ok(status.email.includes('***'));
  assert.ok(status.phone?.includes('******'));
});

test('13. Cross-User Isolation: User A cannot verify User B\'s OTP challenge', async () => {
  const userA = `user-A-${Date.now()}`;
  const userB = `user-B-${Date.now()}`;

  dbStore.users.push(
    {
      id: userA,
      email: 'userA@sikchakhub.ai',
      fullName: 'User A',
      role: 'TEACHER',
      phone: '9876543223',
      isVerified: false,
      verificationStatus: 'PENDING_VERIFICATION',
      emailVerified: false,
      phoneVerified: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: userB,
      email: 'userB@sikchakhub.ai',
      fullName: 'User B',
      role: 'TEACHER',
      phone: '9876543224',
      isVerified: false,
      verificationStatus: 'PENDING_VERIFICATION',
      emailVerified: false,
      phoneVerified: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
  );

  // User A requests OTP
  await otpService.requestEmailOtp(userA);

  // User B tries to verify using their own user ID but guesses user A's parameters
  // Since User B has no record, User B's verification fails
  const attackRes = await otpService.verifyEmailOtp(userB, '123456');
  assert.strictEqual(attackRes.success, false);
  assert.match(attackRes.message, /No OTP challenge found/);
});

test('14. Mobile Phone Mismatch: Verified phone that differs from user phone is rejected', async () => {
  const testUserId = `user-phone-mismatch-${Date.now()}`;
  dbStore.users.push({
    id: testUserId,
    email: 'mismatch@sikchakhub.ai',
    fullName: 'Phone Mismatch User',
    role: 'EMPLOYER',
    phone: '9876543225',
    isVerified: false,
    verificationStatus: 'PENDING_VERIFICATION',
    emailVerified: false,
    phoneVerified: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });

  await otpService.requestPhoneTicket(testUserId);
  fcmService.initFirebase();
  const auth = getAuth();
  auth.verifyIdToken = async (token: string) => {
    if (token === 'mismatched-phone-token') {
      return { phone_number: '+919999999999' } as any; // differs from user phone (+919876543225)
    }
    throw new Error('Invalid token');
  };

  const mismatchRes = await otpService.verifyPhoneWithFirebase(testUserId, 'mismatched-phone-token');
  assert.strictEqual(mismatchRes.success, false);
  assert.match(mismatchRes.message, /Verified phone number does not match your registered mobile number/);
});

test('15. Security Audit: Hardcoded OTP 123456 and random guesses are strictly rejected', async () => {
  const testUserId = `user-security-audit-${Date.now()}`;
  dbStore.users.push({
    id: testUserId,
    email: 'security.audit@sikchakhub.ai',
    fullName: 'Security Audit User',
    role: 'TEACHER',
    phone: '9876543226',
    isVerified: false,
    verificationStatus: 'PENDING_VERIFICATION',
    emailVerified: false,
    phoneVerified: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });

  // User has a real challenge generated
  await otpService.requestEmailOtp(testUserId);

  // Attack 1: Attempt email verification with '123456'
  const emailAttack1 = await otpService.verifyEmailOtp(testUserId, '123456');
  assert.strictEqual(emailAttack1.success, false);
  assert.match(emailAttack1.message, /Invalid verification code/);

  // Attack 2: Attempt email verification with '000000'
  const emailAttack2 = await otpService.verifyEmailOtp(testUserId, '000000');
  assert.strictEqual(emailAttack2.success, false);
  assert.match(emailAttack2.message, /Invalid verification code/);

  // Attack 3: Attempt mobile verification with raw '123456'
  await otpService.requestPhoneTicket(testUserId);
  const phoneAttack = await otpService.verifyPhoneWithFirebase(testUserId, '123456');
  assert.strictEqual(phoneAttack.success, false);

  // Check user is STILL unverified!
  const auditedUser = dbStore.getUserById(testUserId);
  assert.strictEqual(auditedUser?.isVerified, false);
  assert.strictEqual(auditedUser?.emailVerified, false);
  assert.strictEqual(auditedUser?.phoneVerified, false);
  assert.notStrictEqual(auditedUser?.verificationStatus, 'FULLY_VERIFIED');
});

