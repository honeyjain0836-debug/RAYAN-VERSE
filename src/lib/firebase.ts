import { initializeApp, getApps } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAuth, signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';

const app = getApps().length === 0 
  ? initializeApp(firebaseConfig) 
  : getApps()[0];

export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
console.log('Firebase Initialized with Project:', firebaseConfig.projectId);
console.log('Firestore Database ID:', firebaseConfig.firestoreDatabaseId || 'default');
export const storage = getStorage(app);
export const auth = getAuth(app);

/* Auto sign in anonymously when app loads */
onAuthStateChanged(auth, (user) => {
  if (!user) {
    signInAnonymously(auth)
      .then(() => console.log('Signed in anonymously'))
      .catch((err) => console.error('Auth error:', err));
  }
});
