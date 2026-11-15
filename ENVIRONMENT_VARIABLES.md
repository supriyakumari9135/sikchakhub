# SikchakHub.AI — Complete Environment Variables Specification

This document details all environment variables across backend and frontend services.

---

## 1. Backend Environment Variables (`backend/.env`)

All private server credentials, database strings, and signing keys must reside in `backend/.env`. **Never expose these to the frontend or check them into git.**

| Variable                      | Required in Prod | Example / Default                          | Description                                                  |
| :---------------------------- | :--------------: | :----------------------------------------- | :----------------------------------------------------------- |
| `PORT`                        |       Yes        | `5001`                                     | Express HTTP server listen port                              |
| `NODE_ENV`                    |       Yes        | `production`                               | Node environment (`development` / `production`)              |
| `MONGODB_URI`                 |       Yes        | `mongodb+srv://...`                        | MongoDB Atlas replica set connection string                  |
| `JWT_SECRET`                  |       Yes        | `<secure_256_bit_secret>`                  | Secret key for signing and verifying JSON Web Tokens         |
| `JWT_EXPIRES_IN`              |        No        | `7d`                                       | Token lifetime (7 days default)                              |
| `CORS_ORIGIN`                 |       Yes        | `https://sikchakhub.in`                    | Comma-separated list of allowed origins                      |
| **Firebase Admin SDK**        |                  |                                            |                                                              |
| `FIREBASE_PROJECT_ID`         |       Yes        | `sikchakhub-prod`                          | Firebase Google Cloud project identifier                     |
| `FIREBASE_CLIENT_EMAIL`       |       Yes        | `firebase-adminsdk@...`                    | Service account service email                                |
| `FIREBASE_PRIVATE_KEY`        |       Yes        | `"-----BEGIN PRIVATE KEY-----\n..."`       | RSA private key from Firebase service account JSON           |
| **Email Provider (SMTP)**     |                  |                                            |                                                              |
| `SMTP_HOST`                   |       Yes        | `smtp.gmail.com`                           | SMTP host server (e.g. Gmail, SendGrid, Amazon SES)          |
| `SMTP_PORT`                   |        No        | `587`                                      | SMTP port (587 for TLS, 465 for SSL)                         |
| `SMTP_USER`                   |       Yes        | `support@sikchakhub.ai`                    | SMTP authentication username / email                         |
| `SMTP_PASS`                   |       Yes        | `<app_password>`                           | SMTP authentication password or App Password                 |
| `SMTP_FROM`                   |        No        | `"SikchakHub.AI" <no-reply@sikchakhub.ai>` | Verified sender address in outgoing email header             |
| **OTP Security Parameters**   |                  |                                            |                                                              |
| `OTP_LENGTH`                  |        No        | `6`                                        | Length of generated email OTP (default: 6)                   |
| `OTP_EXPIRY_SECONDS`          |        No        | `300`                                      | Expiration time for OTP challenge (default: 300s / 5m)       |
| `OTP_RESEND_COOLDOWN_SECONDS` |        No        | `60`                                       | Minimum wait time between resends (default: 60s)             |
| `OTP_MAX_SENDS_PER_24H`       |        No        | `3`                                        | Maximum sends per channel per 24 hours (default: 3)          |
| `OTP_MAX_FAILED_ATTEMPTS`     |        No        | `3`                                        | Maximum incorrect attempts before 24h lockout (default: 3)   |
| `OTP_BLOCK_DURATION_HOURS`    |        No        | `24`                                       | Duration of temporary lockout upon 3 failures (default: 24h) |
| `OTP_HASH_SECRET`             |       Yes        | `<high_entropy_secret>`                    | Cryptographic secret for salted HMAC-SHA256 OTP hashes       |

---

## 2. Frontend Environment Variables (`frontend/.env`)

These variables are bundled by Vite for client-side execution. **Only public identifiers and client configurations belong here.**

| Variable                            | Required in Prod | Example / Default                 | Description                         |
| :---------------------------------- | :--------------: | :-------------------------------- | :---------------------------------- |
| `VITE_API_BASE_URL`                 |       Yes        | `https://api.sikchakhub.in`       | Backend REST API base URL           |
| `VITE_FIREBASE_API_KEY`             |       Yes        | `AIzaSy...`                       | Firebase web client API key         |
| `VITE_FIREBASE_AUTH_DOMAIN`         |       Yes        | `sikchakhub-prod.firebaseapp.com` | Firebase Authentication domain      |
| `VITE_FIREBASE_PROJECT_ID`          |       Yes        | `sikchakhub-prod`                 | Firebase project ID                 |
| `VITE_FIREBASE_STORAGE_BUCKET`      |       Yes        | `sikchakhub-prod.appspot.com`     | Firebase Cloud Storage bucket       |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` |       Yes        | `123456789012`                    | Firebase Cloud Messaging sender ID  |
| `VITE_FIREBASE_APP_ID`              |       Yes        | `1:123456789012:web:...`          | Firebase web application identifier |
