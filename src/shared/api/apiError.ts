import { isAxiosError } from 'axios';

export function getApiErrorMessage(error: unknown, fallback = 'Произошла ошибка сети'): string {
  if (isAxiosError(error)) {
    const fromBody = error.response?.data as { message?: string } | undefined;
    if (fromBody?.message) return fromBody.message;
    if (error.message) return error.message;
  }
  if (error instanceof Error && error.message) return error.message;
  return fallback;
}
