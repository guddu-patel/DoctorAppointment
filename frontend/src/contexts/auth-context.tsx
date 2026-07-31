'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { authApi } from '@/services/api';
import { getErrorMessage, tokenStore } from '@/lib/api';
import type { User } from '@/types';
import { ROLE_HOME } from '@/config';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (payload: { name: string; email: string; password: string; phone?: string }) => Promise<void>;
  logout: () => Promise<void>;
  refreshMe: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const refreshMe = useCallback(async () => {
    const token = tokenStore.getAccess();
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }
    try {
      const { data } = await authApi.me();
      setUser(data.data);
      tokenStore.setUser(data.data);
    } catch {
      tokenStore.clear();
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const cached = tokenStore.getUser();
    if (cached) setUser(cached);
    refreshMe();
  }, [refreshMe]);

  const login = useCallback(
    async (email: string, password: string) => {
      const { data } = await authApi.login(email, password);
      tokenStore.set(data.data.accessToken, data.data.refreshToken);
      tokenStore.setUser(data.data.user);
      setUser(data.data.user);
      toast.success(`Welcome back, ${data.data.user.name.split(' ')[0]}`);
      router.push(ROLE_HOME[data.data.user.role] || '/');
    },
    [router]
  );

  const register = useCallback(
    async (payload: { name: string; email: string; password: string; phone?: string }) => {
      const { data } = await authApi.register(payload);
      tokenStore.set(data.data.accessToken, data.data.refreshToken);
      tokenStore.setUser(data.data.user);
      setUser(data.data.user);
      toast.success('Account created successfully');
      router.push('/patient');
    },
    [router]
  );

  const logout = useCallback(async () => {
    try {
      await authApi.logout(tokenStore.getRefresh() || undefined);
    } catch {
      /* ignore */
    }
    tokenStore.clear();
    setUser(null);
    toast.success('Logged out');
    router.push('/login');
  }, [router]);

  const value = useMemo(
    () => ({ user, loading, login, register, logout, refreshMe }),
    [user, loading, login, register, logout, refreshMe]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

export function useRequireAuth(roles?: string[]) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace('/login');
      return;
    }
    if (roles && !roles.includes(user.role) && user.role !== 'SUPER_ADMIN') {
      toast.error('Access denied');
      router.replace(ROLE_HOME[user.role] || '/');
    }
  }, [user, loading, roles, router]);

  return { user, loading };
}

export { getErrorMessage };
