import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage"; // <--- 1. Must be imported

const firebaseConfig = {
  apiKey: "AIzaSyCLGFjHFkStGAGl3BrxQrHaoVERKZNTSE0",
  authDomain: "disaster-management-syst-8ac17.firebaseapp.com",
  projectId: "disaster-management-syst-8ac17",
  storageBucket: "disaster-management-syst-8ac17.firebasestorage.app",
  messagingSenderId: "251166428888",
  appId: "1:251166428888:web:91c7915be487cdcd7651ad",
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app); // <--- 2. Must be exported