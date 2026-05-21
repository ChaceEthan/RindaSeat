/* global __RINDASEAT_API_URL__, __RINDASEAT_SOCKET_URL__, __RINDASEAT_IS_PRODUCTION__ */

const trimTrailingSlash = (value) => String(value || '').replace(/\/+$/, '');
const PRODUCTION_API_URL = 'https://rindaseat.onrender.com/api';
const PRODUCTION_SOCKET_URL = 'https://rindaseat.onrender.com';
const isLocalUrl = (value = '') => /(^|\/\/)(localhost|127\.0\.0\.1|\[::1\])(?::|\/|$)/i.test(value);
const sanitizeProductionUrl = (value, fallback) => {
  if (import.meta.env.PROD && isLocalUrl(value)) {
    return fallback;
  }

  return value;
};

// Use global variables injected by Vite, with fallbacks to import.meta.env
const getApiUrl = () => {
  // First try Vite-injected globals
  if (typeof __RINDASEAT_API_URL__ !== 'undefined') {
    return sanitizeProductionUrl(__RINDASEAT_API_URL__, PRODUCTION_API_URL);
  }
  // Fallback to import.meta.env
  if (import.meta.env.VITE_API_URL) {
    return sanitizeProductionUrl(import.meta.env.VITE_API_URL, PRODUCTION_API_URL);
  }
  if (import.meta.env.VITE_API_BASE_URL) {
    return sanitizeProductionUrl(import.meta.env.VITE_API_BASE_URL, PRODUCTION_API_URL);
  }
  // Default to the hosted API; set VITE_API_URL or VITE_API_BASE_URL for a local backend.
  return PRODUCTION_API_URL;
};

const getSocketUrl = () => {
  // First try Vite-injected globals
  if (typeof __RINDASEAT_SOCKET_URL__ !== 'undefined') {
    return sanitizeProductionUrl(__RINDASEAT_SOCKET_URL__, PRODUCTION_SOCKET_URL);
  }
  // Fallback to import.meta.env
  if (import.meta.env.VITE_SOCKET_URL) {
    return sanitizeProductionUrl(import.meta.env.VITE_SOCKET_URL, PRODUCTION_SOCKET_URL);
  }
  // Default to the hosted socket; set VITE_SOCKET_URL for a local backend.
  return PRODUCTION_SOCKET_URL;
};

const getIsProduction = () => {
  // First try Vite-injected globals
  if (typeof __RINDASEAT_IS_PRODUCTION__ !== 'undefined') {
    return __RINDASEAT_IS_PRODUCTION__;
  }
  // Fallback to import.meta.env
  return import.meta.env.PROD;
};

export const API_BASE_URL = trimTrailingSlash(getApiUrl());
export const SOCKET_URL = trimTrailingSlash(getSocketUrl());
export const IS_PRODUCTION = getIsProduction();
