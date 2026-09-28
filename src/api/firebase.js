import ReactNativeAsyncStorage from "@react-native-async-storage/async-storage";
import { getApp, getApps, initializeApp } from "firebase/app";
import {
    getAuth,
    getReactNativePersistence,
    initializeAuth,
} from "firebase/auth";
import { getDatabase } from "firebase/database";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
  databaseURL: process.env.EXPO_PUBLIC_FIREBASE_DATABASE_URL,
};

if (Object.values(firebaseConfig).some((value) => !value)) {
  throw new Error(
    "Set the required EXPO_PUBLIC_FIREBASE_* values. See .env.example.",
  );
}

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
let auth;
try {
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(ReactNativeAsyncStorage),
  });
} catch (error) {
  if (error.code !== "auth/already-initialized") throw error;
  auth = getAuth(app);
}

const firestoreDB = getFirestore(app);
const realtimeDB = getDatabase(app);
const storage = getStorage(app);

export { app, auth, firestoreDB, realtimeDB, storage };
