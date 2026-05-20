// @ts-nocheck
require('dotenv').config();

const admin = require('firebase-admin');
const {
  normalizeFirebasePrivateKey,
  validateFirebasePrivateKey
} = require('../utils/firebaseKeyValidator');

let firebaseApp = null;
let firebaseInitError = null;

const parseServiceAccountJson = (logger = console) => {
  const rawServiceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_JSON
    || process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON;

  if (!rawServiceAccount) {
    return null;
  }

  try {
    const parsed = JSON.parse(rawServiceAccount);

    return {
      projectId: parsed.project_id || parsed.projectId,
      clientEmail: parsed.client_email || parsed.clientEmail,
      privateKey: normalizeFirebasePrivateKey(parsed.private_key || parsed.privateKey)
    };
  } catch (error) {
    if (logger && typeof logger.warn === 'function') {
      logger.warn('[FIREBASE WARNING] Service account JSON could not be parsed');
    }

    return null;
  }
};

const getFirebaseConfig = (logger = console) => {
  const serviceAccountJson = parseServiceAccountJson(logger);

  if (
    serviceAccountJson
    && serviceAccountJson.projectId
    && serviceAccountJson.clientEmail
    && serviceAccountJson.privateKey
  ) {
    return serviceAccountJson;
  }

  const { valid, privateKey } = validateFirebasePrivateKey({ logger });
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;

  if (!projectId || !clientEmail || !valid) {
    return null;
  }

  return {
    projectId,
    clientEmail,
    privateKey
  };
};

const initializeFirebase = (logger = console) => {
  if (firebaseApp) {
    return firebaseApp;
  }

  // Check if already initialized by Firebase Admin SDK
  if (admin.apps.length > 0) {
    firebaseApp = admin.app();
    return firebaseApp;
  }

  const serviceAccount = getFirebaseConfig(logger);

  if (!serviceAccount) {
    if (logger && typeof logger.log === 'function') {
      logger.log('[FIREBASE] Missing or invalid config - running in degraded mode');
    }
    firebaseInitError = new Error('Firebase configuration missing or invalid');
    return null;
  }

  try {
    firebaseApp = admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
    if (logger && typeof logger.log === 'function') {
      logger.log('[FIREBASE] Initialized successfully');
    }
    return firebaseApp;
  } catch (error) {
    // Check if app was already initialized
    if (error.code === 'app/duplicate-app') {
      firebaseApp = admin.app();
      return firebaseApp;
    }
    
    if (logger && typeof logger.warn === 'function') {
      logger.warn(`[FIREBASE WARNING] Initialization failed: ${error.message}`);
    }
    firebaseInitError = error;
    return null;
  }
};

const getFirebaseAdmin = () => admin;

const isFirebaseConfigured = () => {
  const result = initializeFirebase({ log: () => {}, warn: () => {} });
  return Boolean(result);
};

const getFirebaseInitError = () => firebaseInitError;

module.exports = {
  admin,
  getFirebaseAdmin,
  initializeFirebase,
  isFirebaseConfigured,
  getFirebaseInitError
};
