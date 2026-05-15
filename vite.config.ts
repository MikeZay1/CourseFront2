import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const base = env.VITE_BASE_URL || '/';
  const useDevProxy = env.VITE_DEV_PROXY === 'true';
  const proxyTarget = env.VITE_API_PROXY_TARGET || 'http://localhost:4000';

  return {
    base,
    plugins: [react()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, 'src'),
      },
    },
    server: {
      port: 5173,
      proxy: useDevProxy
        ? {
            '/auth': { target: proxyTarget, changeOrigin: true },
            '/lessons': { target: proxyTarget, changeOrigin: true },
            '/dashboard': { target: proxyTarget, changeOrigin: true },
          }
        : undefined,
    },
  };
});
