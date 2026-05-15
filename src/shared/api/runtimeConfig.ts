function trimSlashes(s: string): string {
  return s.replace(/\/+$/, '');
}

/**
 * Настройки HTTP-клиента: мок, базовый URL внешнего API, прокси в dev, таймаут.
 */
export function getApiRuntime(): {
  useMock: boolean;
  baseURL: string;
  timeoutMs: number;
  devProxy: boolean;
} {
  const useMock = import.meta.env.VITE_USE_MOCK !== 'false';
  const devProxy = import.meta.env.VITE_DEV_PROXY === 'true';
  const raw = (import.meta.env.VITE_API_URL || '').trim();
  const baseURL = raw ? trimSlashes(raw) : '';
  const timeoutMs = Number(import.meta.env.VITE_API_TIMEOUT_MS || 15000);

  if (!useMock && !baseURL && !devProxy && import.meta.env.DEV) {
    // eslint-disable-next-line no-console
    console.warn(
      '[api] VITE_USE_MOCK=false, но не задан VITE_API_URL и не включён VITE_DEV_PROXY. Включите прокси или URL API.',
    );
  }

  return {
    useMock,
    /** При devProxy запросы идут на origin Vite (относительные пути), прокси перенаправляет на бэкенд. */
    baseURL: useMock ? '' : devProxy ? '' : baseURL,
    timeoutMs: Number.isFinite(timeoutMs) && timeoutMs > 0 ? timeoutMs : 15000,
    devProxy,
  };
}
