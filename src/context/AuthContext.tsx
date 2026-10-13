'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import api from '@/lib/api';
import { useRouter } from 'next/navigation';
import { Toast } from '@/components/ui/Toast';
import { useLanguage } from '@/context/LanguageContext';

interface User {
  id: string;
  username: string;
  email: string;
  fullName: string;
  role: string;
  imageUrl?: string | null;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (token: string, refreshToken: string) => void;
  logout: () => Promise<void>;
  clearSession: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

async function fetchCurrentUser(): Promise<User | null> {
  if (!localStorage.getItem('accessToken')) return null;
  const response = await api.get<User>('/auth/me');
  return response.data;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { t } = useLanguage();
  const [logoutError, setLogoutError] = useState(false);

  const refreshUser = async () => {
    try {
      const currentUser = await fetchCurrentUser();
      setUser(currentUser);
    } catch (error) {
      console.error('Failed to fetch user', error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let active = true;
    fetchCurrentUser()
      .then((currentUser) => {
        if (active) setUser(currentUser);
      })
      .catch((error: unknown) => {
        console.error('Failed to restore session', error);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => { active = false; };
  }, []);

  const login = (token: string, refreshToken: string) => {
    localStorage.setItem('accessToken', token);
    localStorage.setItem('refreshToken', refreshToken);
    refreshUser();
  };

  const clearSession = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    setUser(null);
    router.push('/auth/login');
  };

  const logout = async () => {
    // Keep credentials until the server has revoked the session. On a network
    // failure, callers can retry instead of reporting a successful logout.
    try {
      await api.post('/auth/logout');
    } catch (error) {
      const status = (error as { response?: { status?: number } }).response?.status;
      if (status !== 401) {
        setLogoutError(true);
        return;
      }
    }
    clearSession();
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, clearSession, refreshUser }}>
      {children}
      <Toast isOpen={logoutError} message={t('auth.logoutError')} type="error" onClose={() => setLogoutError(false)} />
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
