// @ts-nocheck
/**
 * Request Validation Utilities
 * Validates and sanitizes incoming request data
 */

const sanitizeString = (str) => {
  if (typeof str !== 'string') {
    return null;
  }

  return String(str)
    .trim()
    .replace(/[<>]/g, '')
    .substring(0, 500); // Limit length
};

const validateEmail = (email) => {
  if (!email || typeof email !== 'string') {
    return false;
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(sanitizeString(email));
};

const validatePhoneNumber = (phone) => {
  if (!phone || typeof phone !== 'string') {
    return false;
  }

  // Remove non-digits, should be at least 10 digits
  const cleaned = String(phone).replace(/\D/g, '');
  return cleaned.length >= 10 && cleaned.length <= 20;
};

const validateUUID = (uuid) => {
  if (!uuid || typeof uuid !== 'string') {
    return false;
  }

  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
};

const validateNumberRange = (value, min, max) => {
  const num = Number(value);

  if (Number.isNaN(num)) {
    return false;
  }

  return num >= min && num <= max;
};

const validateArray = (arr, validator, maxLength = 100) => {
  if (!Array.isArray(arr)) {
    return false;
  }

  if (arr.length > maxLength) {
    return false;
  }

  if (validator) {
    return arr.every(validator);
  }

  return true;
};

const validateBookingInput = ({ tripId, seatNumber }) => {
  const errors = [];

  if (!validateUUID(tripId)) {
    errors.push('Invalid trip ID');
  }

  if (!Number.isInteger(seatNumber) || seatNumber < 1 || seatNumber > 100) {
    errors.push('Invalid seat number (must be 1-100)');
  }

  return {
    valid: errors.length === 0,
    errors
  };
};

const validatePaymentInput = ({ bookingId, amount, method }) => {
  const errors = [];

  if (!validateUUID(bookingId)) {
    errors.push('Invalid booking ID');
  }

  const numAmount = Number(amount);

  if (Number.isNaN(numAmount) || numAmount <= 0 || numAmount > 1000000) {
    errors.push('Invalid amount (must be between 0 and 1,000,000)');
  }

  const validMethods = ['mobile_money', 'card', 'cash', 'bank_transfer'];

  if (!validMethods.includes(method)) {
    errors.push(`Invalid payment method. Must be one of: ${validMethods.join(', ')}`);
  }

  return {
    valid: errors.length === 0,
    errors
  };
};

const validateAuthInput = ({ email, password, fullName, phone }) => {
  const errors = [];

  if (!validateEmail(email)) {
    errors.push('Invalid email address');
  }

  if (!password || password.length < 6 || password.length > 100) {
    errors.push('Password must be between 6 and 100 characters');
  }

  if (fullName && (fullName.length < 2 || fullName.length > 120)) {
    errors.push('Full name must be between 2 and 120 characters');
  }

  if (phone && !validatePhoneNumber(phone)) {
    errors.push('Invalid phone number');
  }

  return {
    valid: errors.length === 0,
    errors
  };
};

module.exports = {
  sanitizeString,
  validateEmail,
  validatePhoneNumber,
  validateUUID,
  validateNumberRange,
  validateArray,
  validateBookingInput,
  validatePaymentInput,
  validateAuthInput
};
