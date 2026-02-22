// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAjWphRp82XxtGVfCnJsnu0QxDmlK7DeXY",
  authDomain: "booth-level.firebaseapp.com",
  projectId: "booth-level",
  storageBucket: "booth-level.firebasestorage.app",
  messagingSenderId: "775874324082",
  appId: "1:775874324082:web:6836cc1fc047af6ef344eb"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);


export const auth = getAuth(app);
export const db = getFirestore(app);
