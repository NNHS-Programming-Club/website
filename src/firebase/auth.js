import { auth, db } from "./firebase";
import { doc, setDoc, getDoc, writeBatch } from "firebase/firestore";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  sendEmailVerification,
  updatePassword,
  signInWithPopup,
  GoogleAuthProvider,
} from "firebase/auth";

export const doCreateUserWithEmailAndPassword = async (email, password) => {
  try {
    // Step 1: Check email availability in the emails collection
    const emailDoc = await getDoc(doc(db, "emails", email));
    if (emailDoc.exists()) {
      throw new Error("Email already registered");
    }

    // Step 2: Create Firebase Auth account
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Step 3: Now user IS authenticated, so Firestore writes will work
    const userProfile = {
      uid: user.uid,
      email: email,
      bio: "",
      points: 0,
      createdAt: new Date(),
      lastLogin: new Date(),
      isEmailVerified: false,
    };

    // Use batch write for consistency
    const batch = writeBatch(db);
    
    // Add user profile to users collection
    batch.set(doc(db, "users", user.uid), userProfile);
    
    // Add email to emails collection for future availability checking
    batch.set(doc(db, "emails", email), {
      uid: user.uid,
      registeredAt: new Date()
    });
    
    await batch.commit();
    
    return userCredential;
  } catch (error) {
    console.error('Registration error details:', error);
    throw error;
  }
};

export const doSignInWithEmailAndPassword = async (email, password) => {
  try {
    // Sign in with email and password using Firebase Auth
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Update last login in users collection
    await setDoc(doc(db, "users", user.uid), {
      lastLogin: new Date()
    }, { merge: true });
    
    return userCredential;
  } catch (error) {
    console.error('Email login error:', error);
    throw error;
  }
};

export const doSignInWithGoogle = async () => {
  const provider = new GoogleAuthProvider();
  const result = await signInWithPopup(auth, provider);
  const user = result.user;

  // Check if user already exists
  const userDocRef = doc(db, "users", user.uid);
  const userDoc = await getDoc(userDocRef);

  if (!userDoc.exists()) {
    // Create user profile for new Google users
    const userProfile = {
      uid: user.uid,
      email: user.email,
      bio: "",
      points: 0,
      createdAt: new Date(),
      lastLogin: new Date(),
      isEmailVerified: user.emailVerified,
    };

    // Use batch write to ensure both collections are updated
    const batch = writeBatch(db);
    
    // Add user profile to users collection
    batch.set(userDocRef, userProfile);
    
    // Add email to emails collection
    batch.set(doc(db, "emails", user.email), {
      uid: user.uid,
      registeredAt: new Date()
    });
    
    await batch.commit();
  } else {
    // Update last login for existing users
    await setDoc(userDocRef, {
      lastLogin: new Date()
    }, { merge: true });
  }

  return result;
};

export const doSignOut = () => {
  return auth.signOut();
};

export const doPasswordReset = (email) => {
  return sendPasswordResetEmail(auth, email);
};

export const doPasswordChange = (password) => {
  return updatePassword(auth.currentUser, password);
};

export const doSendEmailVerification = () => {
  return sendEmailVerification(auth.currentUser, {
    url: `${window.location.origin}/home`,
  });
};

// Get user profile data
export const getUserProfile = async (uid) => {
  const userDoc = await getDoc(doc(db, "users", uid));
  if (userDoc.exists()) {
    return userDoc.data();
  }
  return null;
};

// Update user profile
export const updateUserProfile = async (uid, updates) => {
  await setDoc(doc(db, "users", uid), updates, { merge: true });
};

// Check if email is available (for registration)
export const checkEmailAvailability = async (email) => {
  const emailDoc = await getDoc(doc(db, "emails", email));
  return !emailDoc.exists();
};