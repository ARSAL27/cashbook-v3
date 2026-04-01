import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { 
  onAuthStateChanged, 
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  signOut, 
  type User,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  EmailAuthProvider,
  linkWithCredential,
  deleteUser,
  sendEmailVerification,
  sendPasswordResetEmail
} from 'firebase/auth';
import { auth, googleProvider, db } from '../lib/firebase';
import { doc, setDoc, getDoc, serverTimestamp, deleteDoc, onSnapshot } from 'firebase/firestore';
import toast from 'react-hot-toast';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signInWithGoogle: () => Promise<{ isNewUser: boolean; email: string } | null>;
  signInWithEmail: (e: string, p: string) => Promise<void>;
  signUpWithEmail: (e: string, p: string, n: string, phone: string) => Promise<void>;
  linkEmailPassword: (email: string, password: string) => Promise<void>;
  hasPasswordLinked: boolean;
  isPasswordRecorded: boolean;
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
  sendResetPassword: (email: string) => Promise<void>;
  isSecurityReady: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [pinVerified, setPinVerified] = useState(true);
  const [userPin, setUserPin] = useState<string | null>(null);
  const [pinEnabled, setPinEnabled] = useState(false);
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [lockedUntil, setLockedUntil] = useState<number | null>(null);
  const [isChangingPin, setIsChangingPin] = useState(false);
  const [autoLockTimer, setAutoLockTimer] = useState<number>(0);
  const [hasPasswordLinked, setHasPasswordLinked] = useState(false);
  const [isPasswordRecorded, setIsPasswordRecorded] = useState(true);
  const [isSecurityReady, setIsSecurityReady] = useState(false);

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

  // ── Handle Google Redirect Result (fires after signInWithRedirect returns) ──
  useEffect(() => {
    const handleRedirectResult = async () => {
      try {
        const result = await getRedirectResult(auth);
        if (!result) return; // No redirect login pending
        const u = result.user;
        // Save users doc
        await setDoc(doc(db, 'users', u.uid), {
          email: u.email,
          name: u.displayName || u.email?.split('@')[0],
          emailVerified: true,
          lastLoginAt: serverTimestamp(),
        }, { merge: true });
        // Save/update shops doc
        const shopSnap = await getDoc(doc(db, 'shops', u.uid));
        if (shopSnap.exists()) {
          await setDoc(doc(db, 'shops', u.uid), {
            email: u.email,
            name: u.displayName || u.email?.split('@')[0],
            ownerUid: u.uid,
            emailVerified: true,
            updatedAt: serverTimestamp(),
          }, { merge: true });
          toast.success('Welcome Back! Aapka data load ho raha hai...');
        } else {
          toast.success('Google Login Successful! Shop setup karein.');
        }
      } catch (err: any) {
        console.error('Redirect result error:', err);
        if (err.code !== 'auth/null-user') {
          toast.error('Google login mein masla hua. Dobara try karein.');
        }
      }
    };
    handleRedirectResult();
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
            let iterations = userDoc.data();
            let existingPin = iterations?.securityPin || null;
            let isPinEnabled = iterations?.pinEnabled || false;
            let timer = iterations?.autoLockTimer || 0;
            let lockout = iterations?.lockedUntil || null;
            let passwordLinked = iterations?.hasPasswordLinked || false;
            let passwordRecorded = !!iterations?.signupPassword;

            setHasPasswordLinked(passwordLinked);
            setIsPasswordRecorded(passwordRecorded);
            setUserPin(existingPin);
            setPinEnabled(isPinEnabled);
            setFailedAttempts(iterations?.failedAttempts ?? 0);
            setLockedUntil(lockout);
            setAutoLockTimer(timer);

            // Sync to shops collection if email is verified
            if (u.emailVerified) {
              const profileData = {
                email: u.email,
                name: u.displayName || u.email?.split('@')[0],
                ownerUid: u.uid,
                securityPin: existingPin,
                updatedAt: serverTimestamp(),
                emailVerified: true
              };
              await setDoc(doc(db, 'shops', u.uid), profileData, { merge: true });
              await setDoc(doc(db, 'users', u.uid), { emailVerified: true }, { merge: true });
            }

            checkPinRequirement(!!existingPin, isPinEnabled, timer, lockout);
            setIsSecurityReady(true);
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
        setIsSecurityReady(true);
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

  const saveGoogleUserToFirestore = async (u: User): Promise<boolean> => {
    // Always create/merge users document (keeps existing PIN/settings)
    await setDoc(doc(db, 'users', u.uid), {
      email: u.email,
      name: u.displayName || u.email?.split('@')[0],
      emailVerified: true,
      lastLoginAt: serverTimestamp(),
    }, { merge: true });

    // Check if shop already exists
    const shopSnap = await getDoc(doc(db, 'shops', u.uid));
    if (shopSnap.exists()) {
      // Returning user → update profile only, all shop data stays safe
      await setDoc(doc(db, 'shops', u.uid), {
        email: u.email,
        name: u.displayName || u.email?.split('@')[0],
        ownerUid: u.uid,
        emailVerified: true,
        updatedAt: serverTimestamp(),
      }, { merge: true });
      return false; // not a new user
    } else {
      return true; // new user — needs onboarding + password setup
    }
  };

  const signInWithGoogle = async (): Promise<{ isNewUser: boolean; email: string } | null> => {
    try {
      // Try popup first (works on desktop & browser)
      const result = await signInWithPopup(auth, googleProvider);
      const isNewUser = await saveGoogleUserToFirestore(result.user);
      return { isNewUser, email: result.user.email || '' };
    } catch (error: any) {
      console.error('Google Popup Error:', error);
      const redirectCodes = [
        'auth/popup-blocked',
        'auth/popup-closed-by-user', 
        'auth/cancelled-popup-request',
        'auth/operation-not-supported-in-this-environment',
      ];
      if (redirectCodes.includes(error.code)) {
        // Popup blocked (mobile/WebView) → fall back to redirect
        toast('Google se login ho raha hai...', { icon: '🔄', duration: 3000 });
        await signInWithRedirect(auth, googleProvider);
        return null; // Page will reload; getRedirectResult will handle the rest
      } else if (error.code === 'auth/network-request-failed') {
        toast.error('Network error. Connection check karein.');
      } else {
        toast.error('Google Login Error: ' + (error.message || 'Failed'));
      }
      return null;
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
      
      // Store pending data in users collection (not shops — shop only created after verification)
      const userData = {
        email: email.trim(), 
        name, 
        phone,
        createdAt: serverTimestamp(), 
        securityPin: null, 
        pinEnabled: false, 
        failedAttempts: 0, 
        lockedUntil: null, 
        autoLockTimer: 0,
        emailVerified: false
      };
      await setDoc(doc(db, 'users', res.user.uid), userData);
      // NOTE: Do NOT create shops entry yet — only created on first verified login
      
      await sendEmailVerification(res.user);
      // Sign out immediately so unverified user cannot access the app
      await signOut(auth);
      toast.success('Account created! Please check your email and verify before logging in.', { duration: 6000 });
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

  // Link email+password to an existing Google account
  // so user can also login with email+password in the future
  const linkEmailPassword = async (email: string, password: string): Promise<void> => {
    if (!auth.currentUser) throw new Error('Not logged in');
    try {
      const credential = EmailAuthProvider.credential(email, password);
      try {
        await linkWithCredential(auth.currentUser, credential);
      } catch (linkError: any) {
        // If already linked, we just proceed to update Firestore fields if they are missing
        if (linkError.code !== 'auth/provider-already-linked') {
          throw linkError; 
        }
      }

      // Save password hint to Firestore for Control Center visibility
      await setDoc(doc(db, 'users', auth.currentUser.uid), {
        hasPasswordLinked: true,
      }, { merge: true });

      setHasPasswordLinked(true);
      setIsPasswordRecorded(true);
      toast.success('Password record update ho gaya!');
    } catch (error: any) {
      console.error('Link/Update error:', error);
      if (error.code === 'auth/credential-already-in-use') {
        toast.error('Yeh email pehle se kisi aur account se link hai.');
      } else if (error.code === 'auth/weak-password') {
        toast.error('Password kam se kam 6 characters ka hona chahiye.');
      } else {
        toast.error('Process fail ho gaya: ' + (error.message || 'error'));
      }
      throw error;
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
      // 2. Delete shops doc from firestore (so email can be re-used on signup)
      await deleteDoc(doc(db, 'shops', user.uid));
      // 3. Delete auth account
      await deleteUser(user);
      toast.success('Account completely deleted');
    } catch (error: any) {
      console.error('Delete Account Error:', error);
      if (error.code === 'auth/requires-recent-login') {
        toast.error('Security: Please log out and log back in before deleting your account.');
        await logout();
      } else {
        toast.error('Account deletion failed. Please try again.');
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

  const sendResetPassword = async (email: string) => {
    try {
      await sendPasswordResetEmail(auth, email.trim());
      toast.success('Password reset link bheja gaya hai! Apni email check karein.');
    } catch (error: any) {
      toast.error('Reset link bhejney mein masla hua.');
      throw error;
    }
  };

  const sendVerification = async () => {
    if (auth.currentUser) {
      await sendEmailVerification(auth.currentUser);
      toast.success('Verification email sent! Check your inbox.');
    } else {
      toast.error('You must be logged in to verify email.');
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, loading, signInWithGoogle, signInWithEmail, signUpWithEmail, linkEmailPassword, hasPasswordLinked, isPasswordRecorded, logout,
      pinVerified, setPinVerified, userPin, pinEnabled, savePin, togglePin,
      failedAttempts, lockedUntil, updateSecurityStatus, isChangingPin, setIsChangingPin, resetPin,
      autoLockTimer, saveAutoLockTimer, deleteAccount, reloadUser, sendVerification, sendResetPassword,
      isSecurityReady
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
