/**
 * SikchaKhub.AI - Real Firebase Client Configuration
 * Connected to Firebase Phone & Authentication Service
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
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || ""
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
