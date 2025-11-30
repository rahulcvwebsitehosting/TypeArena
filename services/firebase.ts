import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';

// Use environment variables for configuration.
// In a real scenario, ensure these are set in your environment (e.g., .env file or cloud console).
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY || "AIzaSyDummyKeyForMockingUsuallyNeedsRealOne",
  authDomain: process.env.FIREBASE_AUTH_DOMAIN || "typearena.firebaseapp.com",
  projectId: process.env.FIREBASE_PROJECT_ID || "typearena",
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID
};

// Initialize Firebase
// Note: If config is invalid, this might log errors to console, but app execution continues.
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();