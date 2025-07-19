import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../config/firebase';
import { User, AuthContextType } from '../types';
import { signIn as authSignIn, signUp as authSignUp, signOut as authSignOut, getCurrentUser } from '../services/auth';
import { seedNamesDatabase } from '../utils/seedDatabase';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Seed the database with sample names
    seedNamesDatabase();

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      console.log('Auth state changed:', firebaseUser ? 'User logged in' : 'User logged out');
      if (firebaseUser) {
        try {
          console.log('Fetching user data for:', firebaseUser.uid);
          const userData = await getCurrentUser(firebaseUser);
          console.log('User data fetched:', userData);
          setUser(userData);
        } catch (error) {
          console.error('Error fetching user data:', error);
          setUser(null);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const signIn = async (email: string, password: string): Promise<void> => {
    await authSignIn(email, password);
    // User state will be set by onAuthStateChanged
  };

  const signUp = async (email: string, password: string, displayName: string): Promise<void> => {
    console.log('Starting signup process for:', email);
    await authSignUp(email, password, displayName);
    console.log('Signup completed, waiting for auth state change...');
    // User state will be set by onAuthStateChanged
  };

  const signOut = async (): Promise<void> => {
    await authSignOut();
    setUser(null);
  };

  const value: AuthContextType = {
    user,
    loading,
    signIn,
    signUp,
    signOut,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};