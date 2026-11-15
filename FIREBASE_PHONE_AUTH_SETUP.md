# Firebase Phone Authentication Setup & Configuration Guide
**Project:** SikchaKhub.AI Teacher Recruitment Platform  
**Firebase Project ID:** `<your-firebase-project-id>`  
**Web App ID:** `<your-firebase-web-app-id>`  

---

## 1. Overview

SikchaKhub utilizes a hybrid dual-factor verification architecture:
- **Email Channel:** Cryptographic 6-digit OTP delivered via Gmail SMTP (`sikchakhub@gmail.com`).
- **Mobile Channel:** Real-time cellular SMS verification powered by Firebase Phone Authentication and Google Identity Toolkit, with backend verification via Firebase Admin SDK.

---

## 2. Firebase Console Configuration Checklist

### A. Enable Phone Authentication Provider
1. Navigate to [Firebase Console](https://console.firebase.google.com/project/_/authentication/providers).
2. Under **Sign-in method**, click **Phone**.
3. Toggle **Enable** to ON.
4. Click **Save**.

### B. SMS Region Policy Configuration
To prevent SMS pumping while guaranteeing delivery to Indian mobile numbers:
1. Go to **Authentication** > **Settings** tab.
2. Scroll to **SMS Region Policy**.
3. Set policy to **Allowlist only**.
4. Ensure **India (IN) (+91)** is in the allowed countries list.
*(Verified via Identity Toolkit API: `smsRegionConfig.allowlistOnly.allowedRegions = ["IN"]`)*.

### C. Authorized Domains Configuration
1. Go to **Authentication** > **Settings** > **Authorized domains**.
2. Verify the following domains are listed:
   - `localhost`
   - `127.0.0.1`
   - `sikchakhub.ai`
   - `www.sikchakhub.ai`
   - `<your-project-id>.firebaseapp.com`
   - `<your-project-id>.web.app`

### D. Firebase Plan: Blaze (Pay-as-you-go)
- Phone Authentication provides **10 free SMS/day**.
- Beyond 10 SMS/day, real cellular delivery requires an active **Blaze** plan.
- Ensure billing is active on your Firebase project.

### E. Real Cellular SMS Delivery (Production-Grade Security)
- In accordance with production security standards, **all mock OTPs, bypasses, and static test phone numbers (`123456`) have been completely purged**.
- All mobile verifications now trigger real cellular SMS dispatch through Google Firebase / Identity Toolkit.
- Users receive a one-time 6-digit numeric SMS code on their registered mobile device.
- The web client confirms the OTP with Firebase Authentication, obtains a cryptographic Firebase ID token, and transmits the token to `/api/v1/auth/otp/verify-phone`.
- The backend verifies the token directly with Google Firebase Admin SDK and confirms the phone number matches the user's database record.
- Any attempt to submit raw codes, mock tokens, or static numbers is strictly rejected with HTTP 400 Bad Request.

---

## 3. Environment Variables Reference

### Frontend (`frontend/.env.example`)
```bash
# Backend API Base URL
VITE_API_BASE_URL=http://localhost:5001

# Firebase Web Client Configuration
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project_id.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id
```

### Backend (`backend/.env.example`)
```bash
PORT=5001
NODE_ENV=development
MONGODB_URI="mongodb+srv://<username>:<password>@cluster.example.mongodb.net/sikchakhub?retryWrites=true&w=majority"
JWT_SECRET="your_secure_jwt_secret_min_32_characters"
JWT_EXPIRES_IN="7d"
CORS_ORIGIN="http://localhost:5173,http://localhost:8081"

# Firebase Admin SDK Credentials (Never expose publicly)
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_CLIENT_EMAIL="firebase-adminsdk-xxxxx@your_project_id.iam.gserviceaccount.com"
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY_HERE\n-----END PRIVATE KEY-----\n"
FIREBASE_SERVICE_ACCOUNT="./firebase-service-account.json"

# Email Provider (SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_smtp_app_password
SMTP_FROM="SikchaKhub" <your_email@gmail.com>

# Application-Level OTP Security & Rate Limiting
OTP_LENGTH=6
OTP_EXPIRY_SECONDS=300
OTP_RESEND_COOLDOWN_SECONDS=60
OTP_MAX_SENDS_PER_24H=3
OTP_MAX_FAILED_ATTEMPTS=3
OTP_BLOCK_DURATION_HOURS=24
OTP_HASH_SECRET="your_secure_otp_hmac_secret"
```

---

## 4. End-to-End Authentication Architecture

```mermaid
sequenceDiagram
    autonumber
    actor User as User Browser
    participant FE as React Frontend (Vite)
    participant BE as Express Backend
    participant FB as Firebase Identity Platform
    participant DB as MongoDB Atlas

    User->>FE: Step 1: Enters Email OTP
    FE->>BE: POST /api/v1/auth/otp/verify-email
    BE->>DB: Atomic verify & update (status: EMAIL_VERIFIED)
    BE-->>FE: HTTP 200 { success: true }
    FE->>User: Step 2 Unlocks: "Send SMS Code" button enabled

    User->>FE: Clicks "Send SMS Code"
    FE->>BE: POST /api/v1/auth/otp/send-phone (pre-flight check)
    BE->>DB: Check rate limits (max 3/24h, 60s cooldown)
    BE-->>FE: HTTP 200 { success: true, ticket: "..." }

    FE->>FB: signInWithPhoneNumber(auth, "+91...", recaptchaVerifier)
    FB-->>FE: confirmationResult (SMS dispatched or test session)
    FE->>User: "SMS OTP sent. Please enter 6-digit code"

    User->>FE: Enters 6-digit SMS OTP
    FE->>FB: confirmationResult.confirm(otpCode)
    FB-->>FE: UserCredential + Firebase ID Token

    FE->>BE: POST /api/v1/auth/otp/verify-phone { idToken, code }
    BE->>FB: firebaseAdmin.auth().verifyIdToken(idToken)
    FB-->>BE: DecodedToken { phone_number: "+91..." }
    BE->>BE: Compare phone_number == user.registeredPhone
    BE->>DB: Atomic update (status: FULLY_VERIFIED, isVerified: true)
    BE-->>FE: HTTP 200 { success: true, isFullyVerified: true }
    FE->>User: Success Banner -> Auto-redirect to Dashboard
```
