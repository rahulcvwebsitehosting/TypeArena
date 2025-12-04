
import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';

// Helper to safely get env vars without crashing if process is undefined (common in browser)
const getEnv = (key: string, fallback: string | undefined = undefined) => {
  try {
    if (typeof process !== 'undefined' && process.env && process.env[key]) {
      return process.env[key];
    }
  } catch (e) {}

  try {
    // @ts-ignore
    if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env[`VITE_${key}`]) {
      // @ts-ignore
      return import.meta.env[`VITE_${key}`];
    }
  } catch (e) {}

  return fallback;
};

// FORCE DUMMY KEY: This ensures the app always runs in Offline Demo Mode for you
// since we cannot create a real Firebase project programmatically.
const DUMMY_KEY = "AIzaSyDummyKeyForMockingUsuallyNeedsRealOne";

const firebaseConfig = {
  // We explicitly use DUMMY_KEY here to force isMockMode = true
  apiKey: DUMMY_KEY, 
  authDomain: "typearena.firebaseapp.com",
  projectId: "typearena",
  storageBucket: "typearena.firebasestorage.app",
  messagingSenderId: "752525686200",
  appId: "1:752525686200:web:45e3feafa2c626aa038b4d",
  measurementId: "G-230PSF2X07"
};

// This flag controls the AuthContext behavior.
// When TRUE, it bypasses Firebase completely and uses LocalStorage.
export const isMockMode = true; 

// Initialize Firebase (The SDK might log a warning, but our AuthContext will ignore it)
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
