// Native-specific Firebase initialization with React Native persistence
// https://docs.expo.dev/guides/using-firebase/
import { FirebaseApp, initializeApp } from "firebase/app";
// @ts-ignore https://stackoverflow.com/questions/76914913/cannot-import-getreactnativepersistence-in-firebase10-1-0
import { Auth, getReactNativePersistence, initializeAuth, getAuth } from "firebase/auth";
import { Database, getDatabase } from "firebase/database";
import { Firestore, getFirestore } from "firebase/firestore";
import { FirebaseStorage, getStorage } from "firebase/storage";

import ReactNativeAsyncStorage from "@react-native-async-storage/async-storage";

// Initialize Firebase
const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID || "you-gotta-see-the-baby",
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

//* Firebase Setup
let app: FirebaseApp;
let db: Database;
let firestore: Firestore;
let auth: Auth;
let storage: FirebaseStorage;

try {
  app = initializeApp(firebaseConfig);
  
  // Use initializeAuth with React Native persistence for native platforms
  try {
    auth = initializeAuth(app, {
      persistence: getReactNativePersistence(ReactNativeAsyncStorage),
    });
  } catch (error: any) {
    // If auth already exists, get the existing instance
    if (/already exists/u.test(error.message)) {
      auth = getAuth(app);
    } else {
      throw error;
    }
  }
  
  db = getDatabase(app);
  firestore = getFirestore(app);
  storage = getStorage(app);
} catch (error: any) {
  if (!/already exists/u.test(error.message)) {
    console.error("Firebase native initialization error", error.stack);
  }
}

export { app, auth, db, firestore, storage };
