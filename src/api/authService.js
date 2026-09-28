// src/api/authService.js
import {
    createUserWithEmailAndPassword,
    onAuthStateChanged,
    reload,
    sendEmailVerification,
    signInWithEmailAndPassword,
    signOut,
} from "firebase/auth";
import { auth } from "./firebase";

const registerWithEmail = async (email, password) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password,
    );
    return { user: userCredential.user, error: null };
  } catch (error) {
    return { user: null, error: error.message };
  }
};

const loginWithEmail = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password,
    );
    return { user: userCredential.user, error: null };
  } catch (error) {
    return { user: null, error: error.message };
  }
};

const sendVerificationEmail = async () => {
  const currentUser = auth.currentUser;
  if (!currentUser) return { success: false, error: "No signed-in user." };

  try {
    await sendEmailVerification(currentUser);
    return { success: true, error: null };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

const checkEmailVerification = async () => {
  const currentUser = auth.currentUser;
  if (!currentUser) return { verified: false, error: "No signed-in user." };

  try {
    await reload(currentUser);
    return { verified: currentUser.emailVerified, error: null };
  } catch (error) {
    return { verified: false, error: error.message };
  }
};

const logout = async () => {
  try {
    await signOut(auth);
    return { success: true, error: null };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

const onAuthChange = (callback) => {
  return onAuthStateChanged(auth, callback);
};

export const authService = {
  registerWithEmail,
  loginWithEmail,
  sendVerificationEmail,
  checkEmailVerification,
  logout,
  onAuthChange,
};
