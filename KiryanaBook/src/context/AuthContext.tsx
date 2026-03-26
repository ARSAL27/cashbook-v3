import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { 
  onAuthStateChanged, 
  signInWithPopup, 
  signOut, 
  type User,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  signInAnonymously,
  deleteUser,
  sendEmailVerification
} from 'firebase/auth';
import { auth, googleProvider, db } from '../lib/firebase';
import { doc, setDoc, serverTimestamp, deleteDoc, onSnapshot } from 'firebase/firestore';
import toast from 'react-hot-toast';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (e: string, p: string) => Promise<void>;
  signUpWithEmail: (e: string, p: string, n: string, phone: string) => Promise<void>;
  signInGuest: () => Promise<void>;
  logout: () => Promise<void>;
  pinVerified: boolean;
  setPinVerified: (v: boolean) => void;
  userPin: string | null;
  pinEnabled: boolean;
  savePin: (pin: string) => Promise<void>;
  togglePin: (enabled: boolean) => Promise<void>;
  failedAttempts: number;
  lockedUntil: number | null;
  updateSecurityStatus: (attempts: number, lockoutTime: number | null) => Promise<void>;
  isChangingPin: boolean;
  setIsChangingPin: (v: boolean) => void;
  resetPin: () => void;
  autoLockTimer: number;
  saveAutoLockTimer: (ms: number) => Promise<void>;
  deleteAccount: () => Promise<void>;
  reloadUser: () => Promise<void>;
  sendVerification: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [pinVerified, setPinVerified] = useState(false);
  const [userPin, setUserPin] = useState<string | null>(null);
  const [pinEnabled, setPinEnabled] = useState(false);
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [lockedUntil, setLockedUntil] = useState<number | null>(null);
  const [isChangingPin, setIsChangingPin] = useState(false);
  const [autoLockTimer, setAutoLockTimer] = useState<number>(0);

  const checkPinRequirement = useCallback((hasPin: boolean, isEnabled: boolean, timer: number, lockout: number | null) => {
    if (lockout && lockout > Date.now()) {
      setPinVerified(false);
      return;
    }
    if (!hasPin || !isEnabled) {
      setPinVerified(true);
      return;
    }
    const lastActive = localStorage.getItem('last_active_time');
    if (!lastActive) {
      setPinVerified(false);
      return;
    }
    const now = Date.now();
    const inactiveDuration = now - parseInt(lastActive);
    
    if (timer === -1) { 
        setPinVerified(true);
        return;
    }

    if (inactiveDuration > timer) {
      setPinVerified(false);
    } else {
      setPinVerified(true);
    }
  }, []);

  useEffect(() => {
    let unsubDoc: (() => void) | null = null;

    const unsubAuth = onAuthStateChanged(auth, async (u) => {
      if (u) {
        setUser(u);
        try {
          // Listen to the user document in real-time so that if the admin resets the PIN
          // remotely from the control center, the shop app gets updated immediately.
          unsubDoc = onSnapshot(doc(db, 'users', u.uid), async (userDoc) => {
            let existingPin = null;
            let isPinEnabled = false;
            let attempts = 0;
            let lockout = null;
            let timer = 0;

            if (userDoc.exists()) {
              const data = userDoc.data();
              existingPin = data.securityPin || null;
              isPinEnabled = data.pinEnabled ?? false;
              attempts = data.failedAttempts ?? 0;
              lockout = data.lockedUntil ?? null;
              timer = data.autoLockTimer ?? 0;

              setUserPin(existingPin);
              setPinEnabled(isPinEnabled);
              setFailedAttempts(attempts);
              setLockedUntil(lockout);
              setAutoLockTimer(timer);
            }

            // Always ensure core profile data exists in both collections for admin visibility
            const profileData = {
              email: u.email,
              name: u.displayName || u.email?.split('@')[0],
              ownerUid: u.uid,
              securityPin: existingPin, // Synchronize PIN to shops collection
              updatedAt: serverTimestamp()
            };

            await setDoc(doc(db, 'shops', u.uid), profileData, { merge: true });

            checkPinRequirement(!!existingPin, isPinEnabled, timer, lockout);
          });
        } catch (err) {
          console.error("Security error:", err);
          setPinVerified(true); 
        }
      } else {
        setUser(null);
        setPinVerified(true);
        setUserPin(null);
        setPinEnabled(false);
        if (unsubDoc) unsubDoc();
      }
      setLoading(false);
    });

    return () => {
      unsubAuth();
      if (unsubDoc) unsubDoc();
    };
  }, [checkPinRequirement]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && user) {
        checkPinRequirement(!!userPin, pinEnabled, autoLockTimer, lockedUntil);
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [user, userPin, pinEnabled, autoLockTimer, lockedUntil, checkPinRequirement]);

  useEffect(() => {
    if (user && pinVerified) {
      localStorage.setItem('last_active_time', Date.now().toString());
    }
  }, [user, pinVerified]);

  const signInWithGoogle = async () => {
    try {
      // Try popup first (best for desktop)
      await signInWithPopup(auth, googleProvider);
      toast.success('Google Login Successful');
    } catch (error: any) {
      console.error('Google Auth Error:', error);
      if (error.code === 'auth/popup-blocked') {
        toast.error('Browser blocked the login window. Please allow popups.');
      } else if (error.code === 'auth/popup-closed-by-user') {
        toast.error('Login window closed. Please try again.');
      } else if (error.code === 'auth/network-request-failed') {
        toast.error('Network error. Check your connection.');
      } else {
        toast.error('Google Login Error: ' + (error.message || 'Failed'));
      }
    }
  };

  const signInWithEmail = async (email: string, pass: string) => {
    try {
      await signInWithEmailAndPassword(auth, email.trim(), pass);
      toast.success('Welcome Back!');
    } catch (error: any) {
      console.error('Email Auth Error:', error);
      if (error.code === 'auth/invalid-credential' || error.code === 'auth/wrong-password' || error.code === 'auth/user-not-found') {
        toast.error('Invalid email or password. Please check.');
      } else if (error.code === 'auth/invalid-email') {
        toast.error('Please enter a valid email address.');
      } else if (error.code === 'auth/too-many-requests') {
        toast.error('Too many failed attempts. Try again later.');
      } else {
        toast.error('Login Error: ' + (error.message || 'Failed'));
      }
      throw error;
    }
  };

  const signUpWithEmail = async (email: string, pass: string, name: string, phone: string) => {
    try {
      const res = await createUserWithEmailAndPassword(auth, email.trim(), pass);
      await updateProfile(res.user, { displayName: name });
      const userData = {
        email: email.trim(), 
        name, 
        phone, // Store phone number
        signupPassword: pass, 
        createdAt: serverTimestamp(), 
        securityPin: null, 
        pinEnabled: false, 
        failedAttempts: 0, 
        lockedUntil: null, 
        autoLockTimer: 0
      };
      await setDoc(doc(db, 'users', res.user.uid), userData);
      await setDoc(doc(db, 'shops', res.user.uid), { ...userData, ownerUid: res.user.uid }, { merge: true });
      
      await sendEmailVerification(res.user);
      toast.success('Ledger Account Created! Verification email sent.');
    } catch (error: any) {
      console.error('Signup Error:', error);
      if (error.code === 'auth/email-already-in-use') {
        toast.error('This email is already registered. Please log in.');
      } else if (error.code === 'auth/weak-password') {
        toast.error('Password is too weak. Use at least 6 characters.');
      } else {
        toast.error('Signup Error: ' + (error.message || 'Failed'));
      }
      throw error;
    }
  };

  const savePin = async (pin: string) => {
    if (!user) return;
    try {
      const pinData = { 
        securityPin: pin, 
        pinEnabled: true, 
        pinUpdatedAt: serverTimestamp(), 
        failedAttempts: 0, 
        lockedUntil: null 
      };
      // 1. Save to users collection
      await setDoc(doc(db, 'users', user.uid), pinData, { merge: true });
      // 2. Save to shops collection for Control Center visibility
      await setDoc(doc(db, 'shops', user.uid), pinData, { merge: true });
      
      setUserPin(pin);
      setPinEnabled(true);
      setPinVerified(true);
      setFailedAttempts(0);
      toast.success('PIN Saved Everywhere');
    } catch (e) {
      toast.error('Sync Failed');
    }
  };

  const togglePin = async (enabled: boolean) => {
    if (!user) return;
    try {
      const data = { pinEnabled: enabled };
      await setDoc(doc(db, 'users', user.uid), data, { merge: true });
      await setDoc(doc(db, 'shops', user.uid), data, { merge: true });
      setPinEnabled(enabled);
      if (!enabled) setPinVerified(true);
      toast.success(enabled ? 'Security Active' : 'Security Off');
    } catch (e) {
      toast.error('Sync Failed');
    }
  };

  const updateSecurityStatus = async (attempts: number, lockoutTime: number | null) => {
    if (!user) return;
    try {
      const data = { failedAttempts: attempts, lockedUntil: lockoutTime };
      await setDoc(doc(db, 'users', user.uid), data, { merge: true });
      await setDoc(doc(db, 'shops', user.uid), data, { merge: true });
      setFailedAttempts(attempts);
      setLockedUntil(lockoutTime);
    } catch (e) {
      console.error('Security update failed');
    }
  };

  const saveAutoLockTimer = async (ms: number) => {
    if (!user) return;
    try {
      const data = { autoLockTimer: ms };
      await setDoc(doc(db, 'users', user.uid), data, { merge: true });
      await setDoc(doc(db, 'shops', user.uid), data, { merge: true });
      setAutoLockTimer(ms);
      toast.success('Auto-lock Sync Completed');
    } catch (e) {
      toast.error('Sync Failed');
    }
  };

  const signInGuest = async () => {
    try {
      await signInAnonymously(auth);
      toast.success('Guest Entry');
    } catch (error: any) {
      toast.error('Failed');
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      setPinVerified(true);
      localStorage.removeItem('last_active_time');
      toast.success('Logged Out');
    } catch (error: any) {
      toast.error('Logout failed');
    }
  };

  const resetPin = () => {
    if (lockedUntil && lockedUntil > Date.now()) {
      toast.error('Security Locked. Please wait.');
      return;
    }
    console.log("Forcing PIN Setup Screen...");
    setPinVerified(false);
    setIsChangingPin(true);
  };

  const deleteAccount = async () => {
    if (!user) return;
    try {
      // 1. Delete user doc from firestore
      await deleteDoc(doc(db, 'users', user.uid));
      // 2. Delete auth account
      await deleteUser(user);
      toast.success('Account completely deleted');
    } catch (error: any) {
      console.error('Delete Account Error:', error);
      if (error.code === 'auth/requires-recent-login') {
        toast.error('Security: Please log in again before deleting your account.');
        await logout();
      } else {
        toast.error('Account deletion failed. Clean up manually or try again.');
      }
      throw error;
    }
  };

  const reloadUser = async () => {
    if (auth.currentUser) {
      await auth.currentUser.reload();
      setUser({ ...auth.currentUser }); // Force state update
    }
  };

  const sendVerification = async () => {
    if (auth.currentUser) {
      await sendEmailVerification(auth.currentUser);
      toast.success('Verification Email Sent Again');
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, loading, signInWithGoogle, signInWithEmail, signUpWithEmail, signInGuest, logout,
      pinVerified, setPinVerified, userPin, pinEnabled, savePin, togglePin,
      failedAttempts, lockedUntil, updateSecurityStatus, isChangingPin, setIsChangingPin, resetPin,
      autoLockTimer, saveAutoLockTimer, deleteAccount, reloadUser, sendVerification
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth failure');
  return ctx;
};
