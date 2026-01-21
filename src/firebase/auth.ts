import {
  signInWithPhoneNumber,
  RecaptchaVerifier,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut,
  updateProfile,
  User as FirebaseUser,
} from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { auth, db } from "./firebase";

// Extend window interface to include recaptchaVerifier
declare global {
  interface Window {
    recaptchaVerifier?: RecaptchaVerifier | null;
  }
}

// --- HELPERS ---
const setupRecaptcha = (containerId: string) => {
  if (window.recaptchaVerifier) {
    try { 
      window.recaptchaVerifier.clear(); 
    } catch (e) {
      console.error("Error clearing recaptcha:", e);
    }
    window.recaptchaVerifier = null;
  }
  window.recaptchaVerifier = new RecaptchaVerifier(auth, containerId, {
    size: "invisible",
  });
};

// --- AUTH FUNCTIONS ---

export const loginWithPhone = async (phoneNumber: string, containerId: string) => {
  const finalPhone = phoneNumber.startsWith("+") ? phoneNumber : `+91${phoneNumber}`;
  setupRecaptcha(containerId);
  const appVerifier = window.recaptchaVerifier;
  return await signInWithPhoneNumber(auth, finalPhone, appVerifier as RecaptchaVerifier);
};

export const sendOTP = loginWithPhone;

export const registerWithEmail = (email: string, pass: string) => 
  createUserWithEmailAndPassword(auth, email, pass);

export const loginWithEmail = (email: string, pass: string) => 
  signInWithEmailAndPassword(auth, email, pass);

/**
 * UPDATED: Password Reset Logic
 * This sends a custom link pointing to your /reset-password route.
 */
export const resetPassword = (email: string) => {
  const actionCodeSettings = {
    // This points to http://localhost:8080/reset-password in dev
    // and your actual domain in production automatically.
    url: `${window.location.origin}/reset-password`, 
    handleCodeInApp: true,
  };

  return sendPasswordResetEmail(auth, email, actionCodeSettings);
};

export const syncUserProfile = async (user: FirebaseUser, name: string) => {
  await updateProfile(user, { displayName: name });
  await setDoc(doc(db, "users", user.uid), {
    name,
    email: user.email || null,
    phoneNumber: user.phoneNumber || null,
    role: "user",
    createdAt: Date.now(),
  });
};

export const logoutUser = () => signOut(auth);

export const getUserRole = async (uid: string) => {
  const snap = await getDoc(doc(db, "users", uid));
  return snap.exists() ? snap.data().role : null;
};