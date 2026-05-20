// @ts-nocheck
const crypto = require('crypto');
const jwt = require('jsonwebtoken');

const runtimeJwtSecret = crypto.randomBytes(32).toString('hex');
let warnedAboutRuntimeSecret = false;

const getJwtSecret = () => {
  if (process.env.JWT_SECRET) {
    return process.env.JWT_SECRET;
  }

  if (!warnedAboutRuntimeSecret) {
    console.warn('[JWT WARNING] JWT_SECRET is not configured. Using a temporary runtime secret; existing tokens will be invalid after restart.');
    warnedAboutRuntimeSecret = true;
  }

  return runtimeJwtSecret;
};

const generateToken = (user) => {
  return jwt.sign(
    {
      id: user.id,
      role: user.role
    },
    getJwtSecret(),
    {
      expiresIn: process.env.JWT_EXPIRES_IN || '7d'
    }
  );
};

module.exports = generateToken;
module.exports.getJwtSecret = getJwtSecret;
