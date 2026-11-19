/**
 * SikchaKhub.AI - Real Firebase Client Configuration
 * Connected to Firebase Phone & Authentication Service
 * Enables Live Real-Time Phone OTP Authentication with reCAPTCHA
 */
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { 
  getAuth, 
  RecaptchaVerifier, 
  signInWithPhoneNumber, 
  ConfirmationResult,
  Auth 
} from 'firebase/auth';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyBTS6wmG2rS3_Y71FeV-j5nTEKJBtOE2UY",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "sikchakhub-9593c.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "sikchakhub-9593c",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "sikchakhub-9593c.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "1079295695023",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:1079295695023:web:59049cdbe2c8c0625ddc5a",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-X5RK71EGFE"
};

// Initialize or reuse existing Firebase App safely
let app: FirebaseApp;
try {
  app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
} catch (err) {
  console.warn("Firebase App initialization notice:", err);
  app = getApps()[0] || initializeApp(firebaseConfig, "sikchakhub-client");
}

let auth: Auth;
try {
  auth = getAuth(app);
  auth.languageCode = 'en';
} catch (err) {
  console.warn("Firebase Auth initialization notice:", err);
  auth = {} as Auth;
}

export const firebaseApp: FirebaseApp = app;
export const firebaseAuth: Auth = auth;

export { RecaptchaVerifier, signInWithPhoneNumber };
export type { ConfirmationResult };
