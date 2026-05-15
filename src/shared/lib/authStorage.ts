const TOKEN_KEY = 'tutoring_access_token';
const USER_KEY = 'tutoring_user';

export function getStoredToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setStoredAuth(token: string, userJson: string): void {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, userJson);
}

export function clearStoredAuth(): void {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

export function getStoredUserJson(): string | null {
  return localStorage.getItem(USER_KEY);
}
