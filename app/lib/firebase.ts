import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

// Get authorized origins from environment variables
const authorizedOrigins = process.env.NEXT_PUBLIC_AUTHORIZED_ORIGINS
  ? process.env.NEXT_PUBLIC_AUTHORIZED_ORIGINS.split(',')
  : [];

// Validate Firebase config to avoid connection errors
const validateFirebaseConfig = () => {
  // Check if essential Firebase config values are present
  const requiredFields = ['apiKey', 'authDomain', 'projectId', 'appId'];
  const missingFields = requiredFields.filter(field => !firebaseConfig[field]);
  
  if (missingFields.length > 0) {
    if (typeof window !== 'undefined') {
      console.error(`Firebase initialization error: Missing required fields: ${missingFields.join(', ')}`);
      console.error('Please make sure your .env.local file is properly configured with Firebase settings');
      console.log('Authorized origins:', authorizedOrigins);
    }
    // Return a minimal valid config to prevent crashes, but it won't connect to a real project
    return false;
  }
  
  return true;
};

// Initialize Firebase
let firebaseApp: FirebaseApp;
let isConfigValid = validateFirebaseConfig();

try {
  if (!getApps().length) {
    firebaseApp = initializeApp(firebaseConfig);
    
    // Log authorized origins in development mode
    if (process.env.NODE_ENV === 'development' && typeof window !== 'undefined') {
      console.log('Firebase initialized with authorized origins:', authorizedOrigins);
    }
  } else {
    firebaseApp = getApps()[0];
  }
} catch (error) {
  console.error('Firebase initialization error:', error);
  // Create a placeholder app to prevent crashes
  firebaseApp = getApps().length ? getApps()[0] : initializeApp({ apiKey: 'dummy', appId: 'dummy', projectId: 'dummy' });
}

export const auth = getAuth(firebaseApp);
export const db = getFirestore(firebaseApp);
export const storage = getStorage(firebaseApp);

// If we're in a development environment and using Firebase emulators (optional)
if (process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATOR === 'true' && typeof window !== 'undefined') {
  const host = process.env.NEXT_PUBLIC_FIREBASE_EMULATOR_HOST || 'localhost';
  connectFirestoreEmulator(db, host, 8080);
} 