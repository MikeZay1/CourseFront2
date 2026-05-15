/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_BASE_URL: string;
  /** Путь репозитория для Router при base './' (GitHub Actions), например /CourseFront2 */
  readonly VITE_ROUTER_BASENAME: string;
  readonly VITE_USE_MOCK: string;
  readonly VITE_API_URL: string;
  readonly VITE_DEV_PROXY: string;
  readonly VITE_API_PROXY_TARGET: string;
  readonly VITE_API_TIMEOUT_MS: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
