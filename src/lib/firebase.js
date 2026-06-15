import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup } from "firebase/auth";

export const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyC1l7VjJMj9DT2Z41G8bEr_eIO75bLDC1g",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "purplexity-4eef7.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "purplexity-4eef7",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "purplexity-4eef7.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "589953643775",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:589953643775:web:0f48425e0c63b122bd48ca"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Auth
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

export { signInWithPopup };
