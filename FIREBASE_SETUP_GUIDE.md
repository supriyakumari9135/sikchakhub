# SikchakHub.AI — Firebase Phone Authentication Setup Guide

This guide walks you through configuring **Firebase Phone Authentication** and **Firebase Admin SDK** in the Firebase Console for SikchakHub.AI.

---

## 1. Firebase Project & Authentication Setup

### Step 1.1: Enable Phone Provider

1. Open the [Firebase Console](https://console.firebase.google.com/).
2. Select your Firebase project (or create one named `sikchakhub-prod`).
3. In the left navigation, go to **Build** > **Authentication**.
4. Click on the **Sign-in method** tab.
5. In the list of providers, click **Phone**.
6. Toggle **Enable** to **ON**.
7. _(Optional for Testing)_: Under **Phone numbers for testing (optional)**, add your test phone numbers and static verification codes (e.g., `+91 9999999999` with code `123456`) to test without consuming SMS credits.
8. Click **Save**.

### Step 1.2: Add Authorized Domains

1. In the **Authentication** > **Settings** tab, scroll to **Authorized domains**.
2. Click **Add domain** and ensure the following domains are added:
   - `localhost` (for local development)
   - `127.0.0.1`
   - `sikchakhub.in` (Vercel production frontend)
   - `www.sikchakhub.in`
   - `api.sikchakhub.in` (VPS backend)

### Step 1.3: Configure SMS Region Policy (Anti-Abuse)

1. In **Authentication** > **Settings**, find **SMS region policy**.
2. Restrict SMS sending exclusively to the countries where SikchakHub operates:
   - Enable **India (+91)**.
   - Disable international destinations to eliminate SMS toll fraud risks.

---

## 2. Obtain Firebase Web Client Configuration (Frontend)

1. In the Firebase Console, go to **Project settings** (gear icon) > **General**.
2. Scroll to **Your apps** and click the **Web** icon (`</>`).
3. Register the app with nickname `SikchakHub Web`.
4. Firebase will display your `firebaseConfig` object:
   ```javascript
   const firebaseConfig = {
     apiKey: "AIzaSy...",
     authDomain: "sikchakhub-prod.firebaseapp.com",
     projectId: "sikchakhub-prod",
     storageBucket: "sikchakhub-prod.appspot.com",
     messagingSenderId: "123456789012",
     appId: "1:123456789012:web:abcdef123456",
   };
   ```
5. Copy these values to your `frontend/.env` file:
   ```ini
   VITE_FIREBASE_API_KEY=AIzaSy...
   VITE_FIREBASE_AUTH_DOMAIN=sikchakhub-prod.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=sikchakhub-prod
   VITE_FIREBASE_STORAGE_BUCKET=sikchakhub-prod.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=123456789012
   VITE_FIREBASE_APP_ID=1:123456789012:web:abcdef123456
   ```

---

## 3. Generate Firebase Admin SDK Service Account (Backend)

The backend uses the Firebase Admin SDK to cryptographically verify Firebase ID Tokens returned by the web client.

1. In the Firebase Console, go to **Project settings** > **Service accounts** tab.
2. Ensure **Node.js** is selected.
3. Click **Generate new private key**, then click **Generate key** in the confirmation dialog.
4. A JSON file will download (e.g. `sikchakhub-prod-firebase-adminsdk-xxxxx.json`).
5. Open this file and extract the following three values:
   - `project_id`
   - `client_email`
   - `private_key`
6. Add them to your `backend/.env` file:
   ```ini
   FIREBASE_PROJECT_ID="your-project-id"
   FIREBASE_CLIENT_EMAIL="firebase-adminsdk-xxxxx@your-project-id.iam.gserviceaccount.com"
   FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY_HERE\n-----END PRIVATE KEY-----\n"
   ```
   _Note: Ensure the `\n` linebreaks are preserved in double quotes._

---

## 4. Quotas & Cost Protection

1. Set up daily SMS spending alerts in the Google Cloud Console associated with your Firebase project:
   - Go to [Google Cloud Billing](https://console.cloud.google.com/billing).
   - Set up budget alerts at 50%, 80%, and 100% of your monthly threshold.
2. Firebase provides **10,000 free phone verifications/month** on the Blaze plan.
3. The server-side 60s cooldown and 3-send limit implemented in SikchakHub prevent client-side spamming and unexpected bills.
