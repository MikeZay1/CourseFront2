import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type { AuthUser } from '@/shared/types/models';
import { login as apiLogin, register as apiRegister } from '@/shared/api/authApi';
import {
  clearStoredAuth,
  getStoredToken,
  getStoredUserJson,
  setStoredAuth,
} from '@/shared/lib/authStorage';

type AuthContextValue = {
  user: AuthUser | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (payload: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
  }) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function readUserFromStorage(): AuthUser | null {
  const raw = getStoredUserJson();
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AuthUser;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => readUserFromStorage());
  const [token, setToken] = useState<string | null>(() => getStoredToken());
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const onUnauthorized = () => {
      setUser(null);
      setToken(null);
    };
    window.addEventListener('auth:unauthorized', onUnauthorized);
    return () => window.removeEventListener('auth:unauthorized', onUnauthorized);
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    setLoading(true);
    try {
      const res = await apiLogin({ email, password });
      setStoredAuth(res.accessToken, JSON.stringify(res.user));
      setToken(res.accessToken);
      setUser(res.user);
    } finally {
      setLoading(false);
    }
  }, []);

  const register = useCallback(
    async (payload: { email: string; password: string; firstName: string; lastName: string }) => {
      setLoading(true);
      try {
        const res = await apiRegister(payload);
        setStoredAuth(res.accessToken, JSON.stringify(res.user));
        setToken(res.accessToken);
        setUser(res.user);
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  const logout = useCallback(() => {
    clearStoredAuth();
    setToken(null);
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({ user, token, loading, login, register, logout }),
    [user, token, loading, login, register, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
