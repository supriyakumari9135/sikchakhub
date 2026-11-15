# Automated & Integration OTP Test Report
**Project:** SikchaHub.AI Teacher Recruitment Platform  
**Date of Execution:** November 15, 2026  
**Test Runner:** Node.js v24 Test Harness + `npx tsx --test`  
**Database:** MongoDB Atlas Production Replica Cluster  
**SMTP:** Gmail SMTP (`sikchakhub@gmail.com`)  
**Identity Provider:** Firebase Identity Platform (`sikchakhub-9593c`)  
**Overall Status:** ALL TESTS PASSED (15/15 Unit/Integration + 1 E2E Workflow)

---

## 1. Test Suite Results Overview

```
ℹ tests 15
ℹ suites 0
ℹ pass 15
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 34738.48
```

---

## 2. Detailed Test Scenario Matrix

| Scenario # | Test Description | Input Condition | Expected Output | Actual Output | Status |
|:---:|---|---|---|---|:---:|
| **1** | Signup Verification State | New Job Seeker signs up | Account created with `PENDING_VERIFICATION`, `isVerified: false` | Verified: `PENDING_VERIFICATION` | **PASS** |
| **2** | Cryptographic Hash Generation | 6-digit OTP generated | HMAC-SHA256 hash stored; plain OTP never saved | Verified: timing-safe equality matches | **PASS** |
| **3** | Phone Normalization | `6204414757`, `+916204414757` | Formats into E.164 standard `+916204414757` | Verified: correctly normalized | **PASS** |
| **4** | 60-Second Cooldown Enforcement | Resend requested before 60s | Rejected with HTTP 429 and remaining seconds | Verified: `Please wait 60 seconds` | **PASS** |
| **5** | Daily Limit (Max 3 Sends/24h) | 4th send attempt in rolling 24h | Rejected with HTTP 429 "limit reached" | Verified: 4th attempt blocked | **PASS** |
| **6** | 3 Failed Attempts $\to$ 24h Lockout | 3 incorrect OTP entries | Account blocked for 24 hours | Verified: `TEMPORARILY_BLOCKED` | **PASS** |
| **7** | Single-Use OTP Consumption | Re-entering already used OTP | Rejected: "OTP has already been used" | Verified: reuse strictly blocked | **PASS** |
| **8** | Dual Channel Activation & Bypass Rejection | Email verified + Phone verified via Firebase ID Token; raw `123456` rejected | `123456` rejected; genuine token updates account to `FULLY_VERIFIED`, `isVerified: true` | Verified: `isVerified: true` | **PASS** |
| **9** | Protected Route Guard | Unverified account calls protected API | Middleware rejects with HTTP 403 Forbidden (`VERIFICATION_REQUIRED`) | Verified: 403 Forbidden received | **PASS** |
| **10** | Resend After Cooldown Expiry | Resend requested after 60s | Fresh OTP issued with remaining quota updated | Verified: fresh challenge created | **PASS** |
| **11** | OTP Expiration (5 min) | Verification attempted after 300s | Rejected: "The OTP code has expired" | Verified: expired challenge rejected | **PASS** |
| **12** | Browser Refresh Persistence | GET `/api/v1/auth/otp/status` | Returns active cooldowns, masked email & phone | Verified: state preserved across refresh | **PASS** |
| **13** | Cross-User Isolation | User A attempts to verify User B's OTP | Challenge mismatch rejected | Verified: cross-user attempt blocked | **PASS** |
| **14** | Mobile Phone Mismatch | Firebase token phone differs from DB phone | Backend rejects with phone mismatch error | Verified: mismatched phone blocked | **PASS** |
| **15** | Hardcoded OTP 123456 & Random Guess Rejection | User enters `123456` or `000000` on Email and raw code on Mobile | All attempts rejected with HTTP 400 Bad Request; account remains unverified | Verified: `isVerified: false` strictly retained | **PASS** |

---

## 3. End-to-End Workflow Test (`e2eRecruitmentWorkflow.test.ts`)

```
✔ SikchaKhub End-to-End Real Recruitment Platform & Database Persistence Workflow (32314.09ms)
  1. Register Teacher (requires PDF resume) -> 201 Created
  2. Register Employer (Kota Premier Science Academy) -> 201 Created
  3. Verify accounts in DB
  4. Employer posts job opening -> 201 Created
  5. Teacher views live vacancy -> 200 OK
  6. Teacher applies for job vacancy -> 201 Created
  7. Direct MongoDB Atlas persistence verification -> Verified in DB
  8. Duplicate application rejection -> 409 Conflict
  9. Recruiter views applicants -> 200 OK
  10. Recruiter advances candidate stage -> 200 OK
  11. Recruiter schedules live interview -> 201 Created
  12. Candidate views scheduled interview in portal -> 200 OK
  13. Security check: Unverified/unauthorized access correctly rejected with 403 Forbidden
```

---

## 4. Live API Security Verification

Direct HTTP curl tests against live running server `http://localhost:5001`:

1. **Attempt 1: Mobile verification with raw `123456` (no token)**
   ```json
   POST /api/v1/auth/otp/verify-phone
   Body: { "code": "123456" }
   Response: 400 Bad Request
   { "success": false, "message": "Firebase ID token is required. Please verify your mobile phone with SMS OTP via Firebase." }
   ```

2. **Attempt 2: Mobile verification with invalid Firebase token**
   ```json
   POST /api/v1/auth/otp/verify-phone
   Body: { "idToken": "123456" }
   Response: 400 Bad Request
   { "success": false, "message": "Invalid or expired Firebase verification credential. 2 attempt(s) remaining.", "remainingAttempts": 2 }
   ```

3. **Attempt 3: Email verification with `123456`**
   ```json
   POST /api/v1/auth/otp/verify-email
   Body: { "otp": "123456" }
   Response: 400 Bad Request
   { "success": false, "message": "Invalid verification code. 2 attempt(s) remaining.", "remainingAttempts": 2 }
   ```

4. **Attempt 4: Unverified user calling protected API**
   ```json
   GET /api/v1/applications/my-applications
   Response: 403 Forbidden
   { "success": false, "code": "VERIFICATION_REQUIRED", "message": "Full account verification is required. Both your Gmail address and mobile number must be verified with OTP before you can access this service.", "verificationStatus": "PENDING_VERIFICATION" }
   ```
