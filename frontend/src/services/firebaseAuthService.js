// @ts-nocheck
import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithPopup, 
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged,
  browserLocalPersistence,
  setPersistence
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

const requiredFirebaseKeys = [
  ['apiKey', 'VITE_FIREBASE_API_KEY'],
  ['authDomain', 'VITE_FIREBASE_AUTH_DOMAIN'],
  ['projectId', 'VITE_FIREBASE_PROJECT_ID'],
  ['appId', 'VITE_FIREBASE_APP_ID'],
];

const isPlaceholderValue = (value) => {
  const normalized = String(value || '').trim();
  return !normalized
    || normalized.startsWith('@')
    || normalized.startsWith('YOUR_')
    || normalized.includes('YOUR_FIREBASE')
    || normalized.includes('your-project');
};

const getCurrentHostname = () => {
  if (typeof window === 'undefined') return '';
  return window.location.hostname;
};

// Validate Firebase config
const getFirebaseConfigStatus = () => {
  const missing = requiredFirebaseKeys
    .filter(([configKey]) => isPlaceholderValue(firebaseConfig[configKey]))
    .map(([, envKey]) => envKey);
  const configured = missing.length === 0;

  return {
    configured,
    missing,
    authDomain: firebaseConfig.authDomain || '',
    projectId: firebaseConfig.projectId || '',
    currentDomain: getCurrentHostname(),
    authorizedDomainHint: 'Add rinda-seat.vercel.app and rindaseat.vercel.app in Firebase Authentication > Settings > Authorized domains.',
  };
};

const isFirebaseConfigured = () => getFirebaseConfigStatus().configured;

let firebaseApp = null;
let firebaseAuth = null;

const initializeFirebase = () => {
  if (firebaseApp) return firebaseApp;
  
  if (!isFirebaseConfigured()) {
    const status = getFirebaseConfigStatus();
    console.warn(`[Firebase] Configuration incomplete - missing ${status.missing.join(', ')}`);
    return null;
  }

  try {
    firebaseApp = initializeApp(firebaseConfig);
    firebaseAuth = getAuth(firebaseApp);
    firebaseAuth.useDeviceLanguage();
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

const getFirebaseAuthErrorMessage = (error) => {
  const code = error?.code || '';

  if (code === 'auth/popup-closed-by-user') {
    return 'Google sign-in was closed before it finished.';
  }

  if (code === 'auth/popup-blocked') {
    return 'The browser blocked the Google sign-in popup. Allow popups for this site and try again.';
  }

  if (code === 'auth/unauthorized-domain') {
    return `Firebase rejected this domain (${getCurrentHostname()}). Add it to Firebase Authentication authorized domains.`;
  }

  if (code === 'auth/operation-not-allowed') {
    return 'Google provider is not enabled in Firebase Authentication.';
  }

  if (code === 'auth/invalid-api-key') {
    return 'Firebase API key is invalid. Check the VITE_FIREBASE_API_KEY value in Vercel.';
  }

  return error?.message || 'Google sign-in failed';
};

export const firebaseAuthService = {
  async signInWithGoogle() {
    try {
      const auth = getFirebaseAuth();
      
      if (!auth) {
        throw new Error('Firebase not configured');
      }

      const provider = new GoogleAuthProvider();
      provider.addScope('email');
      provider.addScope('profile');
      provider.setCustomParameters({
        prompt: 'select_account'
      });

      await setPersistence(auth, browserLocalPersistence);
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
        error: getFirebaseAuthErrorMessage(error),
        code: error.code
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
  getConfigurationStatus: getFirebaseConfigStatus,
};

export default firebaseAuthService;
