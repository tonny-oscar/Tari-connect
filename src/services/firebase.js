
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getDatabase } from "firebase/database";
import { getStorage } from "firebase/storage";
import { getFunctions, connectFunctionsEmulator } from "firebase/functions";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

const app = initializeApp(firebaseConfig);

const auth = getAuth(app);
const db = getFirestore(app);
const rtdb = getDatabase(app);
const storage = getStorage(app);
const functions = getFunctions(app);

// Configure functions to use local emulator in development environment
if (import.meta.env.VITE_USE_FIREBASE_EMULATOR === 'true') {
  const functionsEmulatorHost = import.meta.env.VITE_FIREBASE_FUNCTIONS_EMULATOR_HOST || 'localhost:5001';
  const [host, portStr] = functionsEmulatorHost.split(':');
  const port = parseInt(portStr, 10) || 5001;
  
  console.log(`Connecting to Firebase Functions emulator at ${host}:${port}`);
  connectFunctionsEmulator(functions, host, port);
}

export { auth, db, rtdb, storage, functions };
export default app;