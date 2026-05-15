import axios, {
  AxiosError,
  type AxiosRequestConfig,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from 'axios';
import { clearStoredAuth, getStoredToken } from '@/shared/lib/authStorage';
import { handleMockRequest } from '@/shared/api/mockEngine';
import { getApiRuntime } from '@/shared/api/runtimeConfig';

const { useMock, baseURL, timeoutMs } = getApiRuntime();

export const apiClient = axios.create({
  baseURL: useMock ? '' : baseURL,
  headers: { 'Content-Type': 'application/json' },
  timeout: useMock ? undefined : timeoutMs,
});

apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = getStoredToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (res) => res,
  (error: AxiosError<{ message?: string }>) => {
    const url = error.config?.url || '';
    if (
      error.response?.status === 401 &&
      !url.includes('/auth/login') &&
      !url.includes('/auth/register')
    ) {
      clearStoredAuth();
      window.dispatchEvent(new CustomEvent('auth:unauthorized'));
    }
    return Promise.reject(error);
  },
);

if (useMock) {
  apiClient.defaults.adapter = async (config: AxiosRequestConfig) => {
    const method = (config.method || 'get').toUpperCase();
    const urlPath = `${config.url || ''}`;
    let fullUrl = urlPath.startsWith('http') ? urlPath : `${config.baseURL || ''}${urlPath}`;
    const params = config.params as Record<string, unknown> | undefined;
    if (params && typeof params === 'object') {
      const usp = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value === undefined || value === null || value === '') return;
        usp.set(key, String(value));
      });
      const qs = usp.toString();
      if (qs) {
        fullUrl += fullUrl.includes('?') ? `&${qs}` : `?${qs}`;
      }
    }
    let payload: unknown = config.data;
    if (typeof payload === 'string') {
      try {
        payload = JSON.parse(payload) as unknown;
      } catch {
        /* оставляем строку */
      }
    }
    const { status, data } = await handleMockRequest(method, fullUrl, payload);
    if (status >= 400) {
      const err = new AxiosError(
        typeof data === 'object' && data && 'message' in data
          ? String((data as { message?: string }).message)
          : 'Ошибка запроса',
        String(status),
        config as InternalAxiosRequestConfig,
        undefined,
        {
          status,
          data,
          statusText: status === 401 ? 'Unauthorized' : 'Error',
          headers: {},
          config: config as InternalAxiosRequestConfig,
        },
      );
      return Promise.reject(err);
    }
    const response: AxiosResponse = {
      data,
      status,
      statusText: 'OK',
      headers: { 'content-type': 'application/json' },
      config: config as InternalAxiosRequestConfig,
    };
    return response;
  };
}
