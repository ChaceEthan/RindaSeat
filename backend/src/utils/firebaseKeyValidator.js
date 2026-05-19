const REQUIRED_PRIVATE_KEY_PARTS = [
  '-----BEGIN PRIVATE KEY-----',
  '-----END PRIVATE KEY-----'
];

const normalizeFirebasePrivateKey = (privateKey = process.env.FIREBASE_PRIVATE_KEY) => {
  if (!privateKey) {
    return null;
  }

  return privateKey.replace(/\\n/g, '\n').trim();
};

const validateFirebasePrivateKey = ({ logger = console } = {}) => {
  const privateKey = normalizeFirebasePrivateKey();

  if (!privateKey) {
    return {
      valid: false,
      privateKey: null
    };
  }

  const valid = REQUIRED_PRIVATE_KEY_PARTS.every((part) => privateKey.includes(part));

  if (!valid && logger && typeof logger.warn === 'function') {
    logger.warn('[FIREBASE WARNING] Invalid private key format');
  }

  return {
    valid,
    privateKey
  };
};

module.exports = {
  normalizeFirebasePrivateKey,
  validateFirebasePrivateKey
};
