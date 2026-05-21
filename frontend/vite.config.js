import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'node:url';

const PRODUCTION_API_URL = 'https://rindaseat.onrender.com/api';
const PRODUCTION_SOCKET_URL = 'https://rindaseat.onrender.com';

const isLocalBackendUrl = (value = '') => (
  /(^|\/\/)(localhost|127\.0\.0\.1|\[::1\])(?::|\/|$)/i.test(value)
);

const normalizeUrl = (value = '') => String(value).replace(/\/+$/, '');

const resolveProductionUrl = ({ configuredUrl, fallback }) => {
  if (!configuredUrl || isLocalBackendUrl(configuredUrl)) {
    return fallback;
  }

  return configuredUrl;
};

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const isProduction = mode === 'production';
  const configuredApiUrl = env.VITE_API_URL || env.VITE_API_BASE_URL;
  const popupSafeHeaders = {
    'Cross-Origin-Opener-Policy': 'same-origin-allow-popups',
  };
  const apiUrl = normalizeUrl(isProduction
    ? resolveProductionUrl({
      configuredUrl: configuredApiUrl,
      fallback: PRODUCTION_API_URL,
    })
    : configuredApiUrl || PRODUCTION_API_URL);
  const socketUrl = normalizeUrl(isProduction
    ? resolveProductionUrl({
      configuredUrl: env.VITE_SOCKET_URL,
      fallback: PRODUCTION_SOCKET_URL,
    })
    : env.VITE_SOCKET_URL || PRODUCTION_SOCKET_URL);

  return {
    plugins: [react()],
    define: {
      __RINDASEAT_API_URL__: JSON.stringify(apiUrl),
      __RINDASEAT_SOCKET_URL__: JSON.stringify(socketUrl),
      __RINDASEAT_IS_PRODUCTION__: JSON.stringify(isProduction),
    },
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
    server: {
      host: '0.0.0.0',
      port: 3000,
      strictPort: false,
      headers: popupSafeHeaders,
    },
    preview: {
      host: '0.0.0.0',
      port: 3000,
      strictPort: false,
      headers: popupSafeHeaders,
    },
    build: {
      outDir: 'dist',
      sourcemap: false,
    },
  };
});
