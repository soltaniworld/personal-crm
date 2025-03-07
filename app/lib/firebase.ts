import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

type FirebaseConfigKey = keyof typeof firebaseConfig;

// Firebase configuration
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
} as const;

// Get authorized origins from environment variables
const authorizedOrigins = process.env.NEXT_PUBLIC_AUTHORIZED_ORIGINS
  ? process.env.NEXT_PUBLIC_AUTHORIZED_ORIGINS.split(',')
  : [];

// Validate Firebase config
const validateFirebaseConfig = () => {
  const requiredFields = ['apiKey', 'authDomain', 'projectId', 'appId'] as const;
  const missingFields = requiredFields.filter(field => !firebaseConfig[field]);
  
  if (missingFields.length > 0) {
    throw new Error(`Firebase initialization error: Missing required fields: ${missingFields.join(', ')}`);
  }
  
  return true;
};

// Initialize Firebase
let firebaseApp: FirebaseApp;

try {
  validateFirebaseConfig();
  
  if (!getApps().length) {
    firebaseApp = initializeApp(firebaseConfig);
  } else {
    firebaseApp = getApps()[0];
  }
} catch (error) {
  // Create a placeholder app for development/testing
  if (process.env.NODE_ENV === 'development') {
    firebaseApp = getApps().length 
      ? getApps()[0] 
      : initializeApp({ apiKey: 'dummy', appId: 'dummy', projectId: 'dummy' });
  } else {
    throw error; // Re-throw in production
  }
}

export const auth = getAuth(firebaseApp);
export const db = getFirestore(firebaseApp);
export const storage = getStorage(firebaseApp);

// Connect to Firebase emulator in development if configured
if (process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATOR === 'true' && typeof window !== 'undefined') {
  const host = process.env.NEXT_PUBLIC_FIREBASE_EMULATOR_HOST || 'localhost';
  connectFirestoreEmulator(db, host, 8080);
}