import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBvPmvpg8yuAsTa9cuN5ZruFX-JINr_taE",
  authDomain: "namedtogether-b58d9.firebaseapp.com",
  projectId: "namedtogether-b58d9",
  storageBucket: "namedtogether-b58d9.firebasestorage.app",
  messagingSenderId: "875389950049",
  appId: "1:875389950049:web:ec445dc5282ed67b30b220",
  measurementId: "G-XKF28M244J"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;