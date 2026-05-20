/* global __RINDASEAT_API_URL__, __RINDASEAT_SOCKET_URL__, __RINDASEAT_IS_PRODUCTION__ */

const trimTrailingSlash = (value) => String(value || '').replace(/\/+$/, '');

// Use global variables injected by Vite, with fallbacks to import.meta.env
const getApiUrl = () => {
  // First try Vite-injected globals
  if (typeof __RINDASEAT_API_URL__ !== 'undefined') {
    return __RINDASEAT_API_URL__;
  }
  // Fallback to import.meta.env
  if (import.meta.env.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL;
  }
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  // Development fallback
  return import.meta.env.DEV ? 'http://localhost:5000/api' : 'https://rindaseat.onrender.com/api';
};

const getSocketUrl = () => {
  // First try Vite-injected globals
  if (typeof __RINDASEAT_SOCKET_URL__ !== 'undefined') {
    return __RINDASEAT_SOCKET_URL__;
  }
  // Fallback to import.meta.env
  if (import.meta.env.VITE_SOCKET_URL) {
    return import.meta.env.VITE_SOCKET_URL;
  }
  // Development fallback
  return import.meta.env.DEV ? 'http://localhost:5000' : 'https://rindaseat.onrender.com';
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
