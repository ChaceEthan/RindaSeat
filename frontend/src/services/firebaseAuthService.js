// @ts-nocheck
import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithPopup, 
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged
} from 'firebase/auth';

// Firebase configuration from environment variables
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

// Validate Firebase config
const isFirebaseConfigured = () => {
  return firebaseConfig.apiKey 
    && firebaseConfig.authDomain 
    && firebaseConfig.projectId;
};

let firebaseApp = null;
let firebaseAuth = null;

const initializeFirebase = () => {
  if (firebaseApp) return firebaseApp;
  
  if (!isFirebaseConfigured()) {
    console.warn('[Firebase] Configuration incomplete - Google Auth will not be available');
    return null;
  }

  try {
    firebaseApp = initializeApp(firebaseConfig);
    firebaseAuth = getAuth(firebaseApp);
    if (import.meta.env.VITE_DEBUG_FIREBASE === 'true') {
      console.info('[Firebase] Initialized successfully');
    }
    return firebaseApp;
  } catch (error) {
    console.error('[Firebase] Initialization failed:', error);
    return null;
  }
};

const getFirebaseAuth = () => {
  if (!firebaseAuth) {
    initializeFirebase();
  }
  return firebaseAuth;
};

export const firebaseAuthService = {
  async signInWithGoogle() {
    try {
      const auth = getFirebaseAuth();
      
      if (!auth) {
        throw new Error('Firebase not configured');
      }

      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({
        prompt: 'select_account'
      });

      const result = await signInWithPopup(auth, provider);
      const idToken = await result.user.getIdToken();

      return {
        success: true,
        idToken,
        user: {
          email: result.user.email,
          displayName: result.user.displayName,
          photoURL: result.user.photoURL,
        }
      };
    } catch (error) {
      console.error('[Google Auth Error]', error);
      return {
        success: false,
        error: error.message || 'Google sign-in failed'
      };
    }
  },

  async signOut() {
    try {
      const auth = getFirebaseAuth();
      if (auth) {
        await signOut(auth);
      }
    } catch (error) {
      console.error('[Firebase Sign Out Error]', error);
    }
  },

  onAuthStateChanged(callback) {
    try {
      const auth = getFirebaseAuth();
      if (auth) {
        return onAuthStateChanged(auth, callback);
      }
    } catch (error) {
      console.error('[Firebase Auth State Error]', error);
    }
  },

  isConfigured: isFirebaseConfigured,
};

export default firebaseAuthService;
