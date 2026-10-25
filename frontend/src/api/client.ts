import type { User } from '../types';

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:4000/api';
const TOKEN_KEY = 'token';
const USER_KEY = 'user';

/** Keeps the login session in localStorage so it survives page refresh. */
export const session = {
  getToken: () => localStorage.getItem(TOKEN_KEY),
  getUser: (): User | null => {
    try {
      const raw = localStorage.getItem(USER_KEY);
      return raw ? (JSON.parse(raw) as User) : null;
    } catch {
      return null;
    }
  },
  save: (token: string, user: User) => {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  },
  clear: () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  },
};

export async function apiRequest<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = session.getToken();
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${API_URL}${path}`, { ...options, headers });

  // Token expired or invalid: log out and send to login
  if (res.status === 401 && token) {
    session.clear();
    window.location.href = '/login';
  }

  if (res.status === 204) return undefined as T; // e.g. DELETE has no body

  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message ?? 'Something went wrong');
  return data as T;
}