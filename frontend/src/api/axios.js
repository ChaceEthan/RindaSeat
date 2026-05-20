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

// Request interceptor to add token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
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
    const originalRequest = error.config;

    if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (refreshToken) {
          // Create a plain axios instance for refresh to avoid infinite loops
          const refreshClient = axios.create({
            baseURL: API_BASE_URL,
            withCredentials: true,
          });
          
          const response = await refreshClient.post('/auth/refresh', {
            refreshToken,
          });

          const { token } = response.data.data || response.data;
          if (!token) {
            throw new Error('No token in refresh response');
          }

          localStorage.setItem('token', token);
          api.defaults.headers.common.Authorization = `Bearer ${token}`;
          originalRequest.headers = originalRequest.headers || {};
          originalRequest.headers.Authorization = `Bearer ${token}`;

          return api(originalRequest);
        } else {
          throw new Error('No refresh token available');
        }
      } catch (refreshError) {
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        // Only redirect if not already on login page
        if (window.location.pathname !== '/auth/login') {
          window.location.href = '/auth/login?expired=true';
        }
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
