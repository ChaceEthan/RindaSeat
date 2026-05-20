const REQUIRED_PRIVATE_KEY_PARTS = [
  '-----BEGIN PRIVATE KEY-----',
  '-----END PRIVATE KEY-----'
];
const PLACEHOLDER_PATTERNS = [
  /^YOUR_/i,
  /_HERE$/i,
  /^REPLACE/i,
  /^CHANGE_ME$/i,
  /^TODO$/i
];

const stripWrappingQuotes = (value) => {
  const trimmed = String(value || '').trim();
  const quote = trimmed[0];

  if ((quote === '"' || quote === "'") && trimmed[trimmed.length - 1] === quote) {
    return trimmed.slice(1, -1);
  }

  return trimmed;
};

const normalizeFirebasePrivateKey = (privateKey = process.env.FIREBASE_PRIVATE_KEY) => {
  if (!privateKey) {
    return null;
  }

  return stripWrappingQuotes(privateKey)
    .replace(/\\r\\n/g, '\n')
    .replace(/\\n/g, '\n')
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .trim();
};

const validateFirebasePrivateKey = ({ logger = console } = {}) => {
  const privateKey = normalizeFirebasePrivateKey();

  if (!privateKey || PLACEHOLDER_PATTERNS.some((pattern) => pattern.test(privateKey))) {
    return {
      valid: false,
      privateKey: null
    };
  }

  const valid = REQUIRED_PRIVATE_KEY_PARTS.every((part) => privateKey.includes(part));

  return {
    valid,
    privateKey
  };
};

module.exports = {
  normalizeFirebasePrivateKey,
  validateFirebasePrivateKey
};
