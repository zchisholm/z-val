// src/lib/firebase.ts
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries
// Your web app's Firebase configuration

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: "z-val-a78a6.firebasestorage.app",
  messagingSenderId: "904722073500",
  appId: "1:904722073500:web:747a142e5099e8f022aa59",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
// Export Firestore instance
export const db = getFirestore(app);