import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserSession } from '../types';

interface AuthContextType {
  user: UserSession | null;
  signIn: (username: string, password: string) => { success: boolean; error?: string };
  signUp: (username: string, password: string) => { success: boolean; error?: string };
  signOut: () => void;
  isAuthModalOpen: boolean;
  openAuthModal: (mode?: 'signin' | 'signup') => void;
  closeAuthModal: () => void;
  authMode: 'signin' | 'signup';
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_SESSION_KEY = 'zoo_user_session_v2';
const STORAGE_ACCOUNTS_KEY = 'kern_registered_accounts_v1';

// Seed account for immediate zero-friction access
const DEFAULT_ACCOUNTS: Record<string, string> = {
  'alex.dev': 'password123',
  'lead_architect': 'kern2026',
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserSession | null>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_SESSION_KEY);
      if (saved) return JSON.parse(saved);
      return null;
    } catch {
      return null;
    }
  });

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');

  // Save session changes
  useEffect(() => {
    if (user) {
      localStorage.setItem(STORAGE_SESSION_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_SESSION_KEY);
    }
  }, [user]);

  // Load existing accounts
  const getAccounts = (): Record<string, string> => {
    try {
      const stored = localStorage.getItem(STORAGE_ACCOUNTS_KEY);
      if (stored) {
        return { ...DEFAULT_ACCOUNTS, ...JSON.parse(stored) };
      }
    } catch {
      // fallback
    }
    return DEFAULT_ACCOUNTS;
  };

  const signIn = (username: string, password: string): { success: boolean; error?: string } => {
    const cleanUser = username.trim().toLowerCase();
    if (!cleanUser) return { success: false, error: 'Username is required.' };
    if (!password) return { success: false, error: 'Password is required.' };

    const accounts = getAccounts();
    if (accounts[cleanUser] && accounts[cleanUser] === password) {
      const newSession: UserSession = {
        username: cleanUser,
        role: 'Engineer / Maintainer',
        signedInAt: new Date().toISOString(),
      };
      setUser(newSession);
      setIsAuthModalOpen(false);
      return { success: true };
    }

    // For ease of demo, if user entered credentials that don't match, warn or allow sign up
    return { success: false, error: 'Invalid username or password. Check credentials or register a new account.' };
  };

  const signUp = (username: string, password: string): { success: boolean; error?: string } => {
    const cleanUser = username.trim().toLowerCase();
    if (!cleanUser) return { success: false, error: 'Username is required.' };
    if (cleanUser.length < 3) return { success: false, error: 'Username must be at least 3 characters.' };
    if (!password || password.length < 4) return { success: false, error: 'Password must be at least 4 characters.' };

    const accounts = getAccounts();
    if (accounts[cleanUser]) {
      return { success: false, error: 'Username already taken. Please pick another username or sign in.' };
    }

    accounts[cleanUser] = password;
    try {
      localStorage.setItem(STORAGE_ACCOUNTS_KEY, JSON.stringify(accounts));
    } catch {
      // ignore
    }

    const newSession: UserSession = {
      username: cleanUser,
      role: 'Engineer / Maintainer',
      signedInAt: new Date().toISOString(),
    };
    setUser(newSession);
    setIsAuthModalOpen(false);
    return { success: true };
  };

  const signOut = () => {
    setUser(null);
  };

  const openAuthModal = (mode: 'signin' | 'signup' = 'signin') => {
    setAuthMode(mode);
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        signIn,
        signUp,
        signOut,
        isAuthModalOpen,
        openAuthModal,
        closeAuthModal,
        authMode,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
