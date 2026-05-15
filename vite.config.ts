import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** GitHub Pages: приложение живёт в /<repo>/, base должен совпадать, иначе JS/CSS 404 → белый экран. */
function resolveBaseUrl(mode: string): string {
  const envFile = loadEnv(mode, process.cwd(), '');
  const fromShell = process.env.VITE_BASE_URL?.trim();
  const repo = process.env.GITHUB_REPOSITORY?.split('/')?.[1];
  const fromGithubActions =
    process.env.GITHUB_ACTIONS === 'true' && repo ? `/${repo}/` : undefined;
  const fromFile = envFile.VITE_BASE_URL?.trim();

  const raw = fromShell || fromGithubActions || fromFile || '/';
  if (raw === '/') return '/';
  return raw.endsWith('/') ? raw : `${raw}/`;
}

export default defineConfig(({ mode }) => {
  const base = resolveBaseUrl(mode);
  const env = loadEnv(mode, process.cwd(), '');
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
