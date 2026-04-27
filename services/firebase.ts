import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, signInWithCredential } from 'firebase/auth';
import firebaseConfig from '../firebase-applet-config.json';
import { College } from '../types';

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

export const loginWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error) {
    console.error("Error signing in with Google:", error);
    throw error;
  }
};

export const logoutUser = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error("Error signing out:", error);
  }
};

// Database logic
export const getSavedCollegesFromFirestore = async (userId: string): Promise<College[]> => {
  return [];
};

export const saveCollegesToFirestore = async (userId: string, colleges: College[]) => {
  return;
};
