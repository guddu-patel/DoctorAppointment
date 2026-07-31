import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { API_TIMEOUT, API_URL } from '@/config';
import type { ApiResponse } from '@/types';

const TOKEN_KEY = 'dc_access_token';
const REFRESH_KEY = 'dc_refresh_token';
const USER_KEY = 'dc_user';

export const tokenStore = {
  getAccess: () => (typeof window !== 'undefined' ? localStorage.getItem(TOKEN_KEY) : null),
  getRefresh: () => (typeof window !== 'undefined' ? localStorage.getItem(REFRESH_KEY) : null),
  set: (access: string, refresh: string) => {
    localStorage.setItem(TOKEN_KEY, access);
    localStorage.setItem(REFRESH_KEY, refresh);
  },
  clear: () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_KEY);
    localStorage.removeItem(USER_KEY);
  },
  getUser: () => {
    if (typeof window === 'undefined') return null;
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  },
  setUser: (user: unknown) => localStorage.setItem(USER_KEY, JSON.stringify(user)),
};

export const api = axios.create({
  baseURL: API_URL,
  timeout: API_TIMEOUT,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = tokenStore.getAccess();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

let refreshing = false;
let queue: Array<(token: string | null) => void> = [];

function flushQueue(token: string | null) {
  queue.forEach((cb) => cb(token));
  queue = [];
}

api.interceptors.response.use(
  (res) => res,
  async (error: AxiosError<ApiResponse<unknown>>) => {
    const original = error.config as InternalAxiosRequestConfig & { _retry?: boolean };
    if (error.response?.status === 401 && original && !original._retry) {
      if (refreshing) {
        return new Promise((resolve, reject) => {
          queue.push((token) => {
            if (!token) return reject(error);
            original.headers.Authorization = `Bearer ${token}`;
            resolve(api(original));
          });
        });
      }

      original._retry = true;
      refreshing = true;
      const refreshToken = tokenStore.getRefresh();

      try {
        if (!refreshToken) throw error;
        const { data } = await axios.post<ApiResponse<{ accessToken: string; refreshToken: string }>>(
          `${API_URL}/auth/refresh`,
          { refreshToken }
        );
        tokenStore.set(data.data.accessToken, data.data.refreshToken);
        flushQueue(data.data.accessToken);
        original.headers.Authorization = `Bearer ${data.data.accessToken}`;
        return api(original);
      } catch {
        flushQueue(null);
        tokenStore.clear();
        if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/login')) {
          window.location.href = '/login';
        }
        return Promise.reject(error);
      } finally {
        refreshing = false;
      }
    }
    return Promise.reject(error);
  }
);

export function getErrorMessage(err: unknown): string {
  if (axios.isAxiosError(err)) {
    return err.response?.data?.message || err.message || 'Something went wrong';
  }
  if (err instanceof Error) return err.message;
  return 'Something went wrong';
}
