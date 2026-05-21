/* global __RINDASEAT_API_URL__, __RINDASEAT_SOCKET_URL__, __RINDASEAT_IS_PRODUCTION__ */

const trimTrailingSlash = (value) => String(value || '').replace(/\/+$/, '');
const stripApiSuffix = (value) => trimTrailingSlash(value).replace(/\/api$/i, '');
const PRODUCTION_API_ORIGIN = 'https://rindaseat.onrender.com';
const PRODUCTION_SOCKET_URL = 'https://rindaseat.onrender.com';
const LOCALHOST_NAME = ['local', 'host'].join('');
const LOOPBACK_IPV4 = ['127', '0', '0', '1'].join('.');

const isUnsafeLocalUrl = (value = '') => {
  try {
    const parsed = new URL(value);
    return [LOCALHOST_NAME, LOOPBACK_IPV4, '::1', '[::1]'].includes(parsed.hostname);
  } catch (error) {
    return false;
  }
};

const sanitizeProductionUrl = (value, fallback) => {
  if (import.meta.env.PROD && isUnsafeLocalUrl(value)) {
    return fallback;
  }

  return value;
};

const getInjectedApiUrl = () => {
  if (typeof __RINDASEAT_API_URL__ !== 'undefined') {
    return __RINDASEAT_API_URL__;
  }

  return '';
};

const getInjectedSocketUrl = () => {
  if (typeof __RINDASEAT_SOCKET_URL__ !== 'undefined') {
    return __RINDASEAT_SOCKET_URL__;
  }

  return '';
};

const getApiOrigin = () => {
  const configuredUrl = getInjectedApiUrl()
    || import.meta.env.VITE_API_URL
    || PRODUCTION_API_ORIGIN;

  return stripApiSuffix(sanitizeProductionUrl(configuredUrl, PRODUCTION_API_ORIGIN));
};

const getSocketUrl = () => {
  const configuredUrl = getInjectedSocketUrl() || import.meta.env.VITE_SOCKET_URL || '';

  if (!configuredUrl) {
    return '';
  }

  return trimTrailingSlash(sanitizeProductionUrl(configuredUrl, PRODUCTION_SOCKET_URL));
};

const getIsProduction = () => {
  if (typeof __RINDASEAT_IS_PRODUCTION__ !== 'undefined') {
    return __RINDASEAT_IS_PRODUCTION__;
  }

  return import.meta.env.PROD;
};

export const API_ORIGIN_URL = getApiOrigin();
export const API_BASE_URL = `${API_ORIGIN_URL}/api`;
export const SOCKET_URL = getSocketUrl();
export const SOCKET_ENABLED = Boolean(SOCKET_URL);
export const IS_PRODUCTION = getIsProduction();

console.log('API URL:', API_BASE_URL);
