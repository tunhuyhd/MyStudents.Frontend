'use client';

import { Lock } from '@/components/ui/icons';
import { AuthShell } from '@/components/AuthShell';


import { useState } from 'react';
import { apiErrorMessage } from '@/lib/apiError';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import api from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import Link from 'next/link';

export default function AdminLoginPage() {
  const { t } = useLanguage();
  const { login: authLogin } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await api.post('/admin/login', { username, password });
      await authLogin();
      window.location.href = '/admin';
    } catch (error: unknown) {
      setError(apiErrorMessage(error, t, 'admin.loginFailed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell title={t('admin.loginTitle')} description={t('admin.loginSubtitle')} footer={<Link href="/auth/login" className="text-brand-text hover:underline">{t('common.login')}</Link>}>
      <form onSubmit={handleLogin} className="space-y-6">
            <Input
              theme="light"
              autoComplete="username" label={t('admin.loginIdentifier')}
              placeholder={t('auth.username')}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
            <Input
              theme="light"
              label={t('admin.securityKey')}
              autoComplete="current-password" type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            {error && (
              <div
                className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-xs font-medium text-red-700 text-center"
              >
                {error}
              </div>
            )}

            <Button
              type="submit"
              theme="light"
              className="w-full h-12 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black font-semibold tracking-normal"
              isLoading={loading}
            >
              <Lock className="w-4 h-4 mr-2" />
              {t('admin.authorize')}
            </Button>
          </form>
    </AuthShell>
  );
}
