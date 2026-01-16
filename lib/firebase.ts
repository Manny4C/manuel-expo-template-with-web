// https://docs.expo.dev/guides/using-firebase/
import { FirebaseApp, initializeApp, getApps } from "firebase/app";
import { Auth, getAuth } from "firebase/auth";
import { Database, getDatabase } from "firebase/database";
import { Firestore, getFirestore } from "firebase/firestore";
import { FirebaseStorage, getStorage } from "firebase/storage";

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
let app: FirebaseApp | undefined;
let db: Database | undefined;
let firestore: Firestore | undefined;
let auth: Auth | undefined;
let storage: FirebaseStorage | undefined;

function initializeFirebase() {
  try {
    // Check if app already exists to avoid re-initialization errors
    const existingApps = getApps();
    if (existingApps.length > 0) {
      app = existingApps[0];
    } else {
      if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
        const missingVars = [];
        if (!firebaseConfig.apiKey) missingVars.push("EXPO_PUBLIC_FIREBASE_API_KEY");
        if (!firebaseConfig.projectId) missingVars.push("EXPO_PUBLIC_FIREBASE_PROJECT_ID");
        console.error(
          `Firebase configuration is missing required environment variables: ${missingVars.join(", ")}`
        );
        // Don't throw, allow app to continue but log the error
        return;
      }
      app = initializeApp(firebaseConfig);
    }
    
    // Use getAuth for web (default browser persistence)
    // For native, we'll initialize with React Native persistence in the native file
    auth = getAuth(app);
    
    db = getDatabase(app);
    firestore = getFirestore(app);
    storage = getStorage(app);
  } catch (error: any) {
    if (/already exists/u.test(error.message)) {
      // App already initialized, get existing instances
      const existingApps = getApps();
      if (existingApps.length > 0) {
        app = existingApps[0];
        auth = getAuth(app);
        db = getDatabase(app);
        firestore = getFirestore(app);
        storage = getStorage(app);
      } else {
        console.error("Firebase initialization error: app marked as existing but not found", error);
      }
    } else {
      console.error("Firebase initialization error", error);
    }
  }
}

// Initialize Firebase
initializeFirebase();

// Ensure auth is always defined (fallback to prevent undefined errors)
if (!auth && app) {
  try {
    auth = getAuth(app);
  } catch (error) {
    console.error("Failed to initialize Firebase Auth", error);
  }
}

if (!auth) {
  console.error(
    "Firebase Auth is not initialized. Please check your Firebase configuration."
  );
}

export { app, auth, db, firestore, storage };
