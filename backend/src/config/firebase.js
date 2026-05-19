// @ts-nocheck
require('dotenv').config();

const admin = require('firebase-admin');
const { validateFirebasePrivateKey } = require('../utils/firebaseKeyValidator');

let firebaseApp = null;

const getFirebaseConfig = (logger = console) => {
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

  if (admin.apps.length > 0) {
    firebaseApp = admin.app();
    return firebaseApp;
  }

  const serviceAccount = getFirebaseConfig(logger);

  if (!serviceAccount) {
    logger.warn('[FIREBASE] Missing config - running in degraded mode');
    return null;
  }

  try {
    firebaseApp = admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
    logger.log('[FIREBASE] Admin SDK initialized');
    return firebaseApp;
  } catch (error) {
    logger.warn(`[FIREBASE WARNING] Initialization failed: ${error.message}`);
    return null;
  }
};

const getFirebaseAdmin = () => admin;
const isFirebaseConfigured = () => Boolean(initializeFirebase({ log: () => {}, warn: () => {} }));

module.exports = {
  admin,
  getFirebaseAdmin,
  initializeFirebase,
  isFirebaseConfigured
};
