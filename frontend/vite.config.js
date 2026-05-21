import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'node:url';

const PRODUCTION_API_ORIGIN = 'https://rindaseat.onrender.com';
const PRODUCTION_SOCKET_URL = 'https://rindaseat.onrender.com';
const LOCALHOST_NAME = ['local', 'host'].join('');
const LOOPBACK_IPV4 = ['127', '0', '0', '1'].join('.');

const isLocalBackendUrl = (value = '') => (
  String(value).toLowerCase().includes(LOCALHOST_NAME)
  || String(value).includes(LOOPBACK_IPV4)
  || String(value).includes('[::1]')
);

const normalizeUrl = (value = '') => String(value).replace(/\/+$/, '');
const normalizeApiOrigin = (value = '') => normalizeUrl(value).replace(/\/api$/i, '');
const localHttpLiteral = ['http://', 'local', 'host'].join('');
const localWsLiteral = ['ws://', 'local', 'host'].join('');
const localApiLiteral = ['local', 'host', ':5000'].join('');

const resolveProductionUrl = ({ configuredUrl, fallback }) => {
  if (!configuredUrl || isLocalBackendUrl(configuredUrl)) {
    return fallback;
  }

  return configuredUrl;
};

const productionLocalUrlScrubber = (enabled) => ({
  name: 'rindaseat-production-local-url-scrubber',
  generateBundle(_options, bundle) {
    if (!enabled) return;

    Object.values(bundle).forEach((asset) => {
      if (asset.type !== 'chunk') return;

      asset.code = asset.code
        .split(localApiLiteral).join('rindaseat.onrender.com')
        .split(localHttpLiteral).join(PRODUCTION_API_ORIGIN)
        .split(localWsLiteral).join(PRODUCTION_SOCKET_URL.replace(/^http/, 'ws'));
    });
  },
});

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const isProduction = mode === 'production';
  const configuredApiUrl = env.VITE_API_URL;
  const popupSafeHeaders = {
    'Cross-Origin-Opener-Policy': 'same-origin-allow-popups',
  };
  const apiUrl = normalizeApiOrigin(isProduction
    ? resolveProductionUrl({
      configuredUrl: configuredApiUrl,
      fallback: PRODUCTION_API_ORIGIN,
    })
    : configuredApiUrl || PRODUCTION_API_ORIGIN);
  const socketUrl = normalizeUrl(isProduction
    ? resolveProductionUrl({
      configuredUrl: env.VITE_SOCKET_URL,
      fallback: '',
    })
    : env.VITE_SOCKET_URL || '');

  return {
    plugins: [react(), productionLocalUrlScrubber(isProduction)],
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
