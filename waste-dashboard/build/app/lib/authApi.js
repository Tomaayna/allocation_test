// src/lib/authApi.ts
import { signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider, signOut,
//    browserLocalPersistence,
//    setPersistence,
 } from "firebase/auth";
import { auth } from "./firebase";
import { setPersistence, inMemoryPersistence } from "firebase/auth";
/* ❶ セッション保持を localStorage（自動ログイン）に固定 */
//setPersistence(auth, browserLocalPersistence);
setPersistence(auth, inMemoryPersistence); // ← これでリロード毎に必ず signedOut
export const loginWithEmail = (mail, pass) => signInWithEmailAndPassword(auth, mail, pass);
export const loginWithGoogle = () => signInWithPopup(auth, new GoogleAuthProvider());
export const logout = () => signOut(auth);
