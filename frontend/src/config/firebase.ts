/**
 * SikchaKhub.AI - Real Firebase Client Configuration
 * Connected to Firebase project: sikchakhub-9593c
 * Enables Live Real-Time Phone OTP Authentication with invisible reCAPTCHA
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

// Initialize or reuse existing Firebase App
export const firebaseApp: FirebaseApp = getApps().length === 0 
  ? initializeApp(firebaseConfig) 
  : getApp();

export const firebaseAuth: Auth = getAuth(firebaseApp);

// Configure language code to India standard (+91)
firebaseAuth.languageCode = 'en';

export { RecaptchaVerifier, signInWithPhoneNumber };
export type { ConfirmationResult };
