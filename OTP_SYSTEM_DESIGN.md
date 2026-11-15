# SikchakHub.AI — Dual Email & Mobile OTP Verification System Design

**System Version:** 2.1.0 (Production Release)  
**Security Classification:** High (Identity & Authentication Gateway)  
**Target Platform:** SikchakHub / SikchaKhub.AI (Job Seeker & Job Poster Onboarding)

---

## 1. Architecture Overview & Workflow

The SikchakHub Dual Verification System mandates that all newly registered Job Seekers (`TEACHER`) and Job Posters (`EMPLOYER`) verify both their registered Email Address and Mobile Number before gaining access to platform dashboards and protected APIs.

```mermaid
sequenceDiagram
    autonumber
    actor User as Educator / Institution Admin
    participant FE as Unified React Page (/verify-otp)
    participant FB_Client as Firebase Web Auth (reCAPTCHA)
    participant API as Express API (/api/v1/auth/otp/*)
    participant OTP_Svc as Backend OTP Service
    participant SMTP as SMTP Transporter (Nodemailer)
    participant FB_Admin as Firebase Admin SDK
    participant DB as MongoDB Atlas & Resilient Store

    Note over User,DB: Phase 1: User Registration
    User->>FE: Submits Registration Form (Email + Mobile)
    FE->>API: POST /api/v1/auth/register
    API->>DB: Create User (status: PENDING_VERIFICATION, isVerified: false)
    API->>OTP_Svc: Trigger Initial Email OTP
    OTP_Svc->>SMTP: Dispatch 6-digit Email OTP (Valid 5m)
    API-->>FE: 201 Created (Token + verificationStatus: PENDING_VERIFICATION)
    FE->>FE: Redirect to /verify-otp

    Note over User,DB: Phase 2: Email OTP Verification
    User->>FE: Enters 6-digit Email OTP
    FE->>API: POST /api/v1/auth/otp/verify-email (Bearer Token)
    API->>OTP_Svc: Verify Timing-Safe Hash
    OTP_Svc->>DB: Invalidate Challenge (Single-Use), set emailVerified: true
    API-->>FE: 200 OK (verificationStatus: EMAIL_VERIFIED)
    FE->>FE: Show Green Verified Badge on Email Card

    Note over User,DB: Phase 3: Mobile Phone Verification (Firebase)
    User->>FE: Clicks "Send Verification SMS"
    FE->>API: POST /api/v1/auth/otp/send-phone (Check Cooldown & 24h Limits)
    API-->>FE: 200 OK (Ticket Issued, Cooldown 60s)
    FE->>FB_Client: signInWithPhoneNumber(auth, userPhone, recaptchaVerifier)
    FB_Client-->>User: Delivers SMS with 6-digit Firebase Code
    User->>FE: Enters 6-digit Mobile OTP
    FE->>FB_Client: confirmationResult.confirm(otp)
    FB_Client-->>FE: Returns UserCredential & ID Token
    FE->>API: POST /api/v1/auth/otp/verify-phone ({ idToken })
    API->>FB_Admin: verifyIdToken(idToken)
    FB_Admin-->>API: Validated Phone Number
    API->>API: Confirm Phone Matches Registered User Phone
    API->>DB: set phoneVerified: true, verificationStatus: FULLY_VERIFIED, isVerified: true
    API-->>FE: 200 OK (isFullyVerified: true)

    Note over User,DB: Phase 4: Platform Unlock & Redirection
    FE->>FE: Display Celebratory Banner
    FE->>User: Automatic Redirection to Teacher or Recruiter Dashboard
```

---

## 2. Account Verification State Machine

Every user account follows a deterministic state machine managed by `verificationStatus`:

```mermaid
stateDiagram-v2
    [*] --> PENDING_VERIFICATION: User Registers (Teacher / Employer)

    PENDING_VERIFICATION --> EMAIL_VERIFIED: Verify Email OTP First
    PENDING_VERIFICATION --> PHONE_VERIFIED: Verify Mobile SMS First

    EMAIL_VERIFIED --> FULLY_VERIFIED: Verify Mobile SMS Second
    PHONE_VERIFIED --> FULLY_VERIFIED: Verify Email OTP Second

    PENDING_VERIFICATION --> TEMPORARILY_BLOCKED: 3 Failed Attempts on either channel
    EMAIL_VERIFIED --> TEMPORARILY_BLOCKED: 3 Failed Attempts on Phone
    PHONE_VERIFIED --> TEMPORARILY_BLOCKED: 3 Failed Attempts on Email

    TEMPORARILY_BLOCKED --> PENDING_VERIFICATION: 24-Hour Cooldown Elapses

    FULLY_VERIFIED --> [*]: Full Access to Dashboard & Applications
```

### State Definitions

| Status                 | Meaning                                             | Access Privileges                                                     |
| :--------------------- | :-------------------------------------------------- | :-------------------------------------------------------------------- |
| `PENDING_VERIFICATION` | New signup; neither channel verified.               | Restricted to `/verify-otp`, `/api/v1/auth/otp/*`, and public routes. |
| `EMAIL_VERIFIED`       | Email OTP verified; mobile phone pending.           | Restricted to `/verify-otp` until mobile number is verified.          |
| `PHONE_VERIFIED`       | Mobile SMS verified; email pending.                 | Restricted to `/verify-otp` until email is verified.                  |
| `FULLY_VERIFIED`       | Both email and phone verified (`isVerified: true`). | Full access to role dashboards, job posting, and applications.        |
| `TEMPORARILY_BLOCKED`  | 3 incorrect attempts recorded.                      | Locked out of verification for 24 hours.                              |

---

## 3. Server-Side Anti-Abuse & Rate Limiting Architecture

All verification gates, rate limits, and blockages are strictly computed and enforced on the backend. Frontend timers serve purely for user feedback.

### 3.1 60-Second Resend Cooldown

- On every OTP request (`send-email` or `send-phone`), the backend sets `resendCooldownUntil = now + 60s`.
- If an API request arrives before this timestamp, the backend rejects it with `429 Too Many Requests`:
  `"Please wait {N} seconds before requesting a new OTP."`

### 3.2 Maximum 3 Sends per 24-Hour Window

- Tracked via `sendCount24h` and `firstSendAt24h` in MongoDB.
- If $t_{\text{now}} - t_{\text{first}} < 24\text{ hours}$ and $\text{sendCount24h} \ge 3$, further requests are blocked:
  `"You have reached your OTP request limit. Please try again after 24 hours."`
- When 24 hours have elapsed, the window automatically anchors to the new request timestamp and the counter resets to 1.

### 3.3 24-Hour Temporary Lockout after 3 Failed Attempts

- If an incorrect OTP is submitted, `failedAttempts` is atomically incremented.
- Upon the 3rd failed attempt:
  - `isBlocked = true`
  - `blockedUntil = now + 24 hours`
  - The outstanding challenge is immediately invalidated to prevent brute-force attacks.
  - The user's status transitions to `TEMPORARILY_BLOCKED`.
  - All subsequent verification attempts during the 24-hour window return `429 Too Many Requests`:
    `"Too many incorrect OTP attempts. Your verification has been temporarily blocked for 24 hours."`

---

## 4. Single-Use Consumption & Replay Prevention

- Every OTP is valid for a maximum of 300 seconds (5 minutes).
- As soon as an OTP is successfully validated:
  - `isConsumed = true`
  - `consumedAt = now`
- Any duplicate submission of the same code is immediately rejected, preventing replay attacks.
