import { initializeApp } from "firebase/app"
import { getAuth } from "firebase/auth"
import { getFirestore } from "firebase/firestore"

// Your Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCLGFjHFkStGAGl3BrxQrHaoVERKZNTSE0",
  authDomain: "disaster-management-syst-8ac17.firebaseapp.com",
  projectId: "disaster-management-syst-8ac17",
  storageBucket: "disaster-management-syst-8ac17.firebasestorage.app",
  messagingSenderId: "251166428888",
  appId: "1:251166428888:web:91c7915be487cdcd7651ad",
}

// Initialize Firebase
export const app = initializeApp(firebaseConfig)

// 🔑 MAIN SERVICES
export const auth = getAuth(app)
export const db = getFirestore(app)
