// src/services/firebase/authService.ts
import { 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut, 
  onAuthStateChanged, 
  type User 
} from 'firebase/auth';
import { auth } from "./firebase";

const googleProvider = new GoogleAuthProvider();

/**
 * Triggers the Google Sign-In popup.
 */
export async function loginWithGoogle(): Promise<User | null> {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error) {
    console.error('Error during Google sign-in:', error);
    throw error;
  }
}

/**
 * Logs out the current user.
 */
export async function logoutUser(): Promise<void> {
  try {
    await signOut(auth);
  } catch (error) {
    console.error('Error during sign-out:', error);
    throw error;
  }
}

/**
 * Listens for authentication state changes (logged in / logged out).
 */
export function onAuthChange(callback: (user: User | null) => void) {
  return onAuthStateChanged(auth, callback);
}

export function getAuthenticatedUser(): Promise<User | null> {
    return new Promise((resolve) => {
        const unsubscribe = auth.onAuthStateChanged((user) => {
            unsubscribe();
            resolve(user);
        });
    });
}

export type { User };

/**
 * Checks Firebase Auth Custom Claims to determine if the user is an admin.
 * (Keeps the _uid parameter optional/ignored so existing calls don't break)
 */
export async function getUserRole(_uid?: string): Promise<string | null> {
  const user = auth.currentUser;
  if (!user) return null;

  try {
    const tokenResult = await user.getIdTokenResult(true);
    
    if (tokenResult.claims.admin === true) {
      return 'admin';
    }
    
    return null;
  } catch (error) {
    console.error("Error fetching user custom claims:", error);
    return null;
  }
}