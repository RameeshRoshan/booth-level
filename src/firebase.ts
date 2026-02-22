// Firebase initialization (TypeScript)
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Replace values with your Firebase project's config if different.
const firebaseConfig = {
  apiKey: "AIzaSyAjWphRp82XxtGVfCnJsnu0QxDmlK7DeXY",
  authDomain: "booth-level.firebaseapp.com",
  projectId: "booth-level",
  storageBucket: "booth-level.appspot.com",
  messagingSenderId: "775874324082",
  appId: "1:775874324082:web:6836cc1fc047af6ef344eb"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);

export default app;
