import { createContext, useContext, useState, type ReactNode } from 'react';
import { authApi } from '../api/auth';
import { session } from '../api/client';
import type { AuthResponse, User } from '../types';

interface AuthContextValue {
  user: User | null;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  // Start from localStorage so a refresh keeps you logged in
  const [user, setUser] = useState<User | null>(() => session.getUser());

  const handleAuth = ({ token, user }: AuthResponse) => {
    session.save(token, user);
    setUser(user);
  };

  const value: AuthContextValue = {
    user,
    isAdmin: user?.role === 'ADMIN',
    login: async (email, password) => handleAuth(await authApi.login(email, password)),
    register: async (name, email, password) => handleAuth(await authApi.register(name, email, password)),
    logout: () => {
      session.clear();
      setUser(null);
    },
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}