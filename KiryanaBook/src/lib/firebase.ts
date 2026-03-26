import { initializeApp, getApp, getApps } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { 
  getAuth, 
  GoogleAuthProvider, 
  browserLocalPersistence, 
  setPersistence,
} from 'firebase/auth';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// REAL config from Firebase Console > Project: kiryanabook
// Both Google and Email/Password are ENABLED
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const firebaseConfig = {
  apiKey: "AIzaSyAduHq5SFHiPpv93FIqjMmz4udI9usBaaY",
  authDomain: "kiryanabook.firebaseapp.com",
  projectId: "kiryanabook",
  storageBucket: "kiryanabook.firebasestorage.app",
  messagingSenderId: "979880042570",
  appId: "1:979880042570:web:2ff34dd3e731b7906546b3"
};

// Singleton pattern prevents double-init errors
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);

// Set local persistence so users stay logged in across sessions
setPersistence(auth, browserLocalPersistence)
  .catch(err => console.error('Persistence error:', err));

export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });
