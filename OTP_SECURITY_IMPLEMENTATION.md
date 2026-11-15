# OTP Security & Rate Limiting Implementation
**Project:** SikchaKhub.AI Teacher Recruitment Platform  

---

## 1. Security Architecture & Defense in Depth

The SikchaKhub OTP system enforces multiple independent layers of security across the client, backend API, database, and identity provider:

```
+-------------------------------------------------------------+
| Layer 1: Client Rate Limiting & Interaction Verification     |
| - Disabled buttons while processing                         |
| - 60-second client countdown timer                          |
| - Explicit user click gesture required for reCAPTCHA        |
| - Automatic fallback to visible reCAPTCHA checkbox          |
+-------------------------------------------------------------+
                              |
+-------------------------------------------------------------+
| Layer 2: Backend Authorization & Pre-Flight Rate Limiter    |
| - POST /api/v1/auth/otp/send-phone verifies JWT session     |
| - Atomic query checks 60s cooldown & 3 sends/24h per user   |
| - 24-hour lockout check if failed attempts >= 3             |
+-------------------------------------------------------------+
                              |
+-------------------------------------------------------------+
| Layer 3: Identity Provider Verification (Firebase & SMTP)   |
| - Firebase Admin SDK verifies ID token cryptographically    |
| - Extracts verified phone_number from decoded claims        |
| - Rejects if verified phone != registered user phone        |
+-------------------------------------------------------------+
                              |
+-------------------------------------------------------------+
| Layer 4: Storage Security & Secret Management                |
| - Plain OTPs NEVER stored or returned in any API response   |
| - Cryptographic HMAC-SHA256 hash stored with timing-safe eq |
| - Atomic single-use consumption (isConsumed: true)          |
| - Private keys kept strictly server-side                    |
+-------------------------------------------------------------+
```

---

## 2. Security Rules Matrix

| Rule Name | Setting | Implementation Details |
|---|---|---|
| **OTP Length** | 6 Digits | Generated via `crypto.randomInt(100000, 999999)` |
| **OTP Expiry** | 300 seconds (5 min) | Stored with explicit `expiresAt`; MongoDB TTL auto-cleanup |
| **Resend Cooldown** | 60 seconds | Enforced on backend using `resendCooldownUntil`; client displays live countdown |
| **Daily Send Limit** | 3 per rolling 24h | Tracked via `firstSendAt24h` and `sendCount24h`; 4th send rejected with HTTP 429 |
| **Max Failed Attempts** | 3 attempts | Tracked atomically via `failedAttempts`; 3rd failed attempt triggers immediate block |
| **Block Duration** | 24 hours | Stored via `isBlocked: true` and `blockedUntil: now + 24h` |
| **Hash Storage** | HMAC-SHA256 | `crypto.createHmac('sha256', OTP_HASH_SECRET).update(userId + channel + otp)` |
| **Validation Comparison** | Timing-Safe | `crypto.timingSafeEqual` prevents timing attack side-channels |
| **Single-Use Consumption**| Atomic update | `isConsumed: true` and `consumedAt: new Date()` upon verification |
| **Sequential Enforcement**| Strict order | Step 1 (Gmail) must be verified before Step 2 (Mobile) can be unlocked |
| **Route Protection** | `VerifiedRoute` | Middleware `requireVerifiedAccount` blocks unverified accounts from APIs |

---

## 3. Database Schema: `otpverifications` Collection

```typescript
{
  id: String,                  // Unique challenge ID (e.g. otp-ph-179473...)
  userId: String,              // Foreign key to user account
  channel: 'EMAIL' | 'PHONE',  // Independent tracking per channel
  identifier: String,          // Masked/normalized email or E.164 phone
  otpHash: String,             // HMAC-SHA256 hex digest
  expiresAt: Date,             // 5 minutes from generation
  resendCooldownUntil: Date,   // 60 seconds from generation
  sendCount24h: Number,        // Sends in current 24-hour window (max 3)
  firstSendAt24h: Date,        // Anchor timestamp for 24-hour window
  failedAttempts: Number,      // Counter for failed attempts (max 3)
  isBlocked: Boolean,          // Set to true after 3 failed attempts
  blockedUntil: Date,          // 24 hours from block activation
  isConsumed: Boolean,         // Set to true upon successful validation
  consumedAt: Date,            // Timestamp of validation
  createdAt: Date,
  updatedAt: Date
}
```

---

## 4. Backend Verification Logic (No Frontend Trust)

```typescript
// Excerpt from backend/src/services/otpService.ts
public async verifyPhoneWithFirebase(userId: string, idToken?: string, code?: string) {
  const user = await this.getUser(userId);
  if (!user) return { success: false, message: 'User account not found.' };

  const registeredPhoneNormalized = normalizePhoneNumber(user.phone || '');

  // 1. Verify Firebase ID Token via Admin SDK
  if (idToken) {
    const decodedToken = await getAuth().verifyIdToken(idToken);
    const verifiedPhone = decodedToken.phone_number;

    // Security check: Phone match verification
    if (normalizePhoneNumber(verifiedPhone) !== registeredPhoneNormalized) {
      return {
        success: false,
        message: 'Verified phone number does not match your registered mobile number.'
      };
    }
  }

  // 2. Consume challenge atomically
  await OtpVerificationModel.updateOne(
    { id: record.id },
    { $set: { isConsumed: true, consumedAt: new Date(), failedAttempts: 0 } }
  );

  // 3. Mark user fully verified if both channels are complete
  const isEmailAlreadyVerified = user.emailVerified || false;
  const newStatus = isEmailAlreadyVerified ? 'FULLY_VERIFIED' : 'PHONE_VERIFIED';

  await UserModel.updateOne(
    { id: userId },
    {
      $set: {
        phoneVerified: true,
        phoneVerifiedAt: new Date(),
        verificationStatus: newStatus,
        isVerified: isEmailAlreadyVerified,
      }
    }
  );

  return { success: true, isFullyVerified: isEmailAlreadyVerified };
}
```
