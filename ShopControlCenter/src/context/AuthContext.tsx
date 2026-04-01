import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth, googleProvider } from '../lib/firebase';
import { onAuthStateChanged, signInWithPopup, signInWithRedirect, getRedirectResult, signOut, type User } from 'firebase/auth';
import { Capacitor } from '@capacitor/core';

const ADMIN_EMAIL = 'mrarsal410@gmail.com';

interface AuthCtx {
  user: User | null;
  isAdmin: boolean;
  loading: boolean;
  login: () => Promise<void>;
  logout: () => Promise<void>;
  error: string;
}

const Ctx = createContext<AuthCtx>({} as AuthCtx);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    // Process redirect results for native APK
    getRedirectResult(auth).catch(e => {
      if (e.code !== 'auth/redirect-cancelled-by-user') setError(e.message);
    });

    return onAuthStateChanged(auth, (u) => { 
      if (u) console.log("--- YOUR ADMIN UID ---", u.uid);
      setUser(u); 
      setLoading(false); 
    });
  }, []);

  const login = async () => {
    setError('');
    try { 
      if (Capacitor.isNativePlatform()) {
        await signInWithRedirect(auth, googleProvider);
      } else {
        await signInWithPopup(auth, googleProvider); 
      }
    }
    catch (e: any) { setError(e.message || 'Login failed'); }
  };

  const logout = async () => { await signOut(auth); };

  const isAdmin = !!user && user.email === ADMIN_EMAIL;

  return <Ctx.Provider value={{ user, isAdmin, loading, login, logout, error }}>{children}</Ctx.Provider>;
};

export const useAuth = () => useContext(Ctx);
