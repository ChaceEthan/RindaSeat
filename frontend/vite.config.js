import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'node:url';

const PRODUCTION_API_URL = 'https://rindaseat.onrender.com/api';
const PRODUCTION_SOCKET_URL = 'https://rindaseat.onrender.com';

const isLocalBackendUrl = (value = '') => (
  /(^|\/\/)(localhost|127\.0\.0\.1|\[::1\])(?::|\/|$)/i.test(value)
);

const normalizeUrl = (value = '') => String(value).replace(/\/+$/, '');

const getDevelopmentSocketUrl = () => 'http://localhost:5000';

const resolveProductionUrl = ({ configuredUrl, fallback }) => {
  if (!configuredUrl || isLocalBackendUrl(configuredUrl)) {
    return fallback;
  }

  return configuredUrl;
};

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const isProduction = mode === 'production';
  const apiUrl = normalizeUrl(isProduction
    ? resolveProductionUrl({
      configuredUrl: env.VITE_API_URL,
      fallback: PRODUCTION_API_URL,
    })
    : env.VITE_API_URL || `${getDevelopmentSocketUrl()}/api`);
  const socketUrl = normalizeUrl(isProduction
    ? resolveProductionUrl({
      configuredUrl: env.VITE_SOCKET_URL,
      fallback: PRODUCTION_SOCKET_URL,
    })
    : env.VITE_SOCKET_URL || getDevelopmentSocketUrl());

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
    },
    preview: {
      host: '0.0.0.0',
      port: 3000,
      strictPort: false,
    },
    build: {
      outDir: 'dist',
      sourcemap: false,
      rolldownOptions: {
        checks: {
          pluginTimings: false,
        },
      },
    },
  };
});
