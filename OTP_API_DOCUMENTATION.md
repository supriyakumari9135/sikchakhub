# SikchakHub.AI — OTP Verification API Documentation

**API Version:** v1  
**Prefix:** `/api/v1/auth/otp`  
**Authentication Scheme:** Bearer Token (`Authorization: Bearer <JWT>`)

---

## 1. Summary of Endpoints

| Method | Endpoint        | Description                                             | Auth Required |
| :----- | :-------------- | :------------------------------------------------------ | :-----------: |
| `POST` | `/send-email`   | Request / Generate a 6-digit email verification OTP     |      Yes      |
| `POST` | `/resend-email` | Alias of `send-email` with 60s cooldown enforcement     |      Yes      |
| `POST` | `/verify-email` | Submit 6-digit email OTP for verification               |      Yes      |
| `POST` | `/send-phone`   | Authorize mobile verification & rate limit before SMS   |      Yes      |
| `POST` | `/verify-phone` | Submit Firebase ID Token / OTP for backend verification |      Yes      |
| `GET`  | `/status`       | Fetch combined verification status & cooldown timers    |      Yes      |

---

## 2. Endpoint Details

### 2.1 Request Email OTP

- **Endpoint:** `POST /api/v1/auth/otp/send-email`
- **Headers:** `Authorization: Bearer <token>`
- **Response (200 OK):**

```json
{
  "success": true,
  "message": "A 6-digit verification code has been dispatched to your email address.",
  "cooldownSeconds": 60,
  "sendsRemaining": 2
}
```

- **Error Responses:**
  - `429 Too Many Requests` (Cooldown active):
    ```json
    {
      "success": false,
      "message": "Please wait 48 seconds before requesting a new OTP.",
      "cooldownSeconds": 48
    }
    ```
  - `429 Too Many Requests` (24h send limit reached):
    ```json
    {
      "success": false,
      "message": "You have reached your OTP request limit. Please try again after 24 hours."
    }
    ```
  - `429 Too Many Requests` (Account blocked):
    ```json
    {
      "success": false,
      "message": "Too many incorrect OTP attempts. Your verification has been temporarily blocked for 24 hours."
    }
    ```

---

### 2.2 Verify Email OTP

- **Endpoint:** `POST /api/v1/auth/otp/verify-email`
- **Headers:** `Authorization: Bearer <token>`
- **Request Body:**

```json
{
  "otp": "491823"
}
```

- **Response (200 OK — Both channels now verified):**

```json
{
  "success": true,
  "message": "Email address verified successfully!",
  "verificationStatus": "FULLY_VERIFIED",
  "isFullyVerified": true
}
```

- **Response (200 OK — Mobile still pending):**

```json
{
  "success": true,
  "message": "Email address verified successfully!",
  "verificationStatus": "EMAIL_VERIFIED",
  "isFullyVerified": false
}
```

- **Error Responses:**
  - `400 Bad Request` (Invalid code with attempts remaining):
    ```json
    {
      "success": false,
      "message": "Invalid verification code. 2 attempt(s) remaining.",
      "remainingAttempts": 2
    }
    ```
  - `429 Too Many Requests` (3rd failed attempt triggers 24h lockout):
    ```json
    {
      "success": false,
      "message": "Too many incorrect OTP attempts. Your verification has been temporarily blocked for 24 hours."
    }
    ```
  - `400 Bad Request` (Expired code):
    ```json
    {
      "success": false,
      "message": "The OTP code has expired. Please request a new code."
    }
    ```

---

### 2.3 Authorize Mobile Verification SMS

- **Endpoint:** `POST /api/v1/auth/otp/send-phone`
- **Headers:** `Authorization: Bearer <token>`
- **Description:** Verifies server-side cooldown and rolling 24-hour limits before the client calls Firebase Phone Auth.
- **Response (200 OK):**

```json
{
  "success": true,
  "message": "Mobile verification challenge authorized.",
  "ticket": "b4f912e84d29a...",
  "cooldownSeconds": 60,
  "sendsRemaining": 2
}
```

---

### 2.4 Verify Mobile Phone

- **Endpoint:** `POST /api/v1/auth/otp/verify-phone`
- **Headers:** `Authorization: Bearer <token>`
- **Request Body (Mandatory Cryptographic Firebase ID Token):**

```json
{
  "idToken": "eyJhbGciOiJSUzI1NiIsImtpZCI..."
}
```

> **Security Requirement:** Raw OTP codes and dummy bypass tokens are strictly rejected. The client must obtain the Firebase ID token via `confirmationResult.confirm(otp)` and transmit it to this endpoint.

- **Response (200 OK):**

```json
{
  "success": true,
  "message": "Mobile number verified successfully!",
  "verificationStatus": "FULLY_VERIFIED",
  "isFullyVerified": true
}
```

- **Error Responses:**
  - `400 Bad Request` (Phone mismatch):
    ```json
    {
      "success": false,
      "message": "Verified phone number does not match your registered mobile number."
    }
    ```

---

### 2.5 Get Verification Status

- **Endpoint:** `GET /api/v1/auth/otp/status`
- **Headers:** `Authorization: Bearer <token>`
- **Response (200 OK):**

```json
{
  "success": true,
  "status": {
    "email": "p***a@gmail.com",
    "phone": "+91 ******3866",
    "verificationStatus": "EMAIL_VERIFIED",
    "emailVerified": true,
    "phoneVerified": false,
    "isVerified": false,
    "emailCooldownRemaining": 0,
    "phoneCooldownRemaining": 42,
    "emailSendsRemaining": 2,
    "phoneSendsRemaining": 1,
    "isEmailBlocked": false,
    "isPhoneBlocked": false,
    "emailBlockRemainingSeconds": 0,
    "phoneBlockRemainingSeconds": 0
  }
}
```
