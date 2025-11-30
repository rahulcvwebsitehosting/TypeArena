import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';

// Helper to safely get env vars without crashing if process is undefined (common in browser)
const getEnv = (key: string, fallback: string | undefined = undefined) => {
  try {
    if (typeof process !== 'undefined' && process.env && process.env[key]) {
      return process.env[key];
    }
  } catch (e) {
    // Ignore ReferenceError if process is not defined
  }
  return fallback;
};

// Use environment variables for configuration.
// In a real scenario, ensure these are set in your environment (e.g., .env file or cloud console).
const firebaseConfig = {
  apiKey: getEnv("FIREBASE_API_KEY", "AIzaSyDummyKeyForMockingUsuallyNeedsRealOne"),
  authDomain: getEnv("FIREBASE_AUTH_DOMAIN", "typearena.firebaseapp.com"),
  projectId: getEnv("FIREBASE_PROJECT_ID", "typearena"),
  storageBucket: getEnv("FIREBASE_STORAGE_BUCKET"),
  messagingSenderId: getEnv("FIREBASE_MESSAGING_SENDER_ID"),
  appId: getEnv("FIREBASE_APP_ID")
};

// Initialize Firebase
// Note: If config is invalid, this might log errors to console, but app execution continues.
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();