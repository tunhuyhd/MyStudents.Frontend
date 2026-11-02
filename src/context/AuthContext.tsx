'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import api from '@/lib/api';
import { apiErrorMessage } from '@/lib/apiError';
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
  login: () => Promise<void>;
  logout: () => Promise<void>;
  clearSession: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

async function fetchCurrentUser(): Promise<User | null> {
  try {
    const response = await api.get<User>('/auth/me');
    return response.data;
  } catch (error) {
    if ((error as { response?: { status?: number } }).response?.status === 401) return null;
    throw error;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { t } = useLanguage();
  const [logoutError, setLogoutError] = useState<unknown>(null);
  const [restoreError, setRestoreError] = useState<unknown>(null);

  const refreshUser = async () => {
    try {
      const currentUser = await fetchCurrentUser();
      setUser(currentUser);
      setRestoreError(null);
    } catch (error) {
      console.error('Failed to fetch user', error);
      setRestoreError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Remove credentials left by the pre-BFF version; never reuse them.
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    let active = true;
    fetchCurrentUser()
      .then((currentUser) => {
        if (active) setUser(currentUser);
      })
      .catch((error: unknown) => {
        if(active)setRestoreError(error);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => { active = false; };
  }, []);

  const login = async () => {
    const currentUser = await fetchCurrentUser();
    if (!currentUser) throw { response: { status: 503 } };
    setUser(currentUser);setRestoreError(null);setLoading(false);
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
        setLogoutError(error);
        return;
      }
    }
    clearSession();
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, clearSession, refreshUser }}>
      {!!restoreError&&<div role="alert" className="m-4 rounded-xl bg-red-50 p-4 text-sm text-red-800"><p>{apiErrorMessage(restoreError,t,'apiErrors.loadFailed')}</p><button type="button" className="min-h-11 underline" onClick={()=>{void refreshUser().catch(()=>{});}}>{t('common.retry')}</button></div>}
      {children}
      <Toast isOpen={!!logoutError} message={apiErrorMessage(logoutError,t,'auth.logoutError')} type="error" onClose={() => setLogoutError(null)} />
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
