// @ts-nocheck
const { initializeFirebase, getFirebaseAdmin } = require('../config/firebase');

const providerNotConfigured = () => ({
  success: false,
  message: 'Firebase authentication not configured'
});

const verifyFirebaseToken = async (token) => {
  if (!token) {
    return {
      success: false,
      message: 'Firebase token is required'
    };
  }

  const app = initializeFirebase();

  if (!app) {
    return providerNotConfigured();
  }

  try {
    const decodedToken = await getFirebaseAdmin().auth().verifyIdToken(token);

    return {
      success: true,
      data: decodedToken
    };
  } catch (error) {
    return {
      success: false,
      message: 'Invalid Firebase token'
    };
  }
};

const decodeUserFromToken = async (token) => {
  const result = await verifyFirebaseToken(token);

  if (!result.success) {
    return result;
  }

  const decodedToken = result.data;

  return {
    success: true,
    data: {
      uid: decodedToken.uid,
      email: decodedToken.email || null,
      phone: decodedToken.phone_number || null,
      name: decodedToken.name || null
    }
  };
};

module.exports = {
  decodeUserFromToken,
  verifyFirebaseToken
};
