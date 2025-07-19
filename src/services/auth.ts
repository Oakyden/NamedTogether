import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut as firebaseSignOut,
  updateProfile,
  User as FirebaseUser
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../config/firebase';
import { User } from '../types';

export const signUp = async (email: string, password: string, displayName: string): Promise<User> => {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  const firebaseUser = userCredential.user;
  
  await updateProfile(firebaseUser, { displayName });
  
  const userData = {
    email: firebaseUser.email!,
    displayName,
    createdAt: serverTimestamp(),
    invitePending: false,
  };
  
  await setDoc(doc(db, 'users', firebaseUser.uid), userData);
  
  return {
    id: firebaseUser.uid,
    email: firebaseUser.email!,
    displayName,
    createdAt: userData.createdAt as any,
    invitePending: false,
  };
};

export const signIn = async (email: string, password: string): Promise<User> => {
  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  const firebaseUser = userCredential.user;
  
  const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
  if (!userDoc.exists()) {
    throw new Error('User document not found');
  }
  
  return {
    id: firebaseUser.uid,
    ...userDoc.data() as Omit<User, 'id'>,
  };
};

export const signOut = async (): Promise<void> => {
  await firebaseSignOut(auth);
};

export const getCurrentUser = async (firebaseUser: FirebaseUser): Promise<User | null> => {
  if (!firebaseUser) return null;
  
  console.log('Getting current user for:', firebaseUser.uid);
  const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
  
  if (!userDoc.exists()) {
    console.log('User document not found for:', firebaseUser.uid);
    // Return basic user data from Firebase auth if document doesn't exist
    return {
      id: firebaseUser.uid,
      email: firebaseUser.email!,
      displayName: firebaseUser.displayName || 'User',
      createdAt: new Date() as any,
      invitePending: false,
    };
  }
  
  console.log('User document found:', userDoc.data());
  return {
    id: firebaseUser.uid,
    ...userDoc.data() as Omit<User, 'id'>,
  };
};