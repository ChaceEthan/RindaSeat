// @ts-nocheck
import axios from 'axios';
import { API_BASE_URL } from '../config/environment';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

const decodeJwtPayload = (token) => {
  try {
    const [, payload] = String(token || '').split('.');

    if (!payload) {
      return null;
    }

    const normalizedPayload = payload.replace(/-/g, '+').replace(/_/g, '/');
    return JSON.parse(window.atob(normalizedPayload));
  } catch (error) {
    return null;
  }
};

const isJwtExpired = (token) => {
  const payload = decodeJwtPayload(token);

  if (!payload || !payload.exp) {
    return false;
  }

  return payload.exp * 1000 <= Date.now();
};

const clearStoredAuth = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('user');
};

const redirectToLogin = () => {
  if (window.location.pathname !== '/auth/login') {
    window.location.href = '/auth/login?expired=true';
  }
};

// Request interceptor to add token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');

    if (token) {
      if (isJwtExpired(token)) {
        clearStoredAuth();
        redirectToLogin();
        return Promise.reject(new Error('Authentication token has expired'));
      }

      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      clearStoredAuth();
      redirectToLogin();
    }

    return Promise.reject(error);
  }
);

export default api;
