'use client';

import { AuthShell } from '@/components/AuthShell';


import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import api from '@/lib/api';
import { apiErrorMessage } from '@/lib/apiError';
import Link from 'next/link';

import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { UserRoles } from '@/constants/roles';

export default function UserLoginPage() {
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
      const res = await api.post('/auth/login', { username, password });
      await authLogin();

      // Navigate based on role
      if (res.data.userRole === UserRoles.Admin) {
        window.location.href = '/admin';
      } else {
        window.location.href = '/teacher';
      }
    } catch (err: unknown) {
      setError(apiErrorMessage(err, t, 'auth.loginFailed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell title={t('common.login')} description={t('auth.loginDesc')} footer={<p>{t('auth.noAccount')}{' '}<Link href="/auth/register" className="font-semibold text-brand-text hover:underline">{t('auth.createAccount')}</Link></p>}>
      <form onSubmit={handleLogin} className="space-y-6">
            <Input
              autoComplete="username" label={t('auth.username')}
              placeholder={t('auth.username')}

              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
            <Input
              label={t('auth.password')}
              autoComplete="current-password" type="password"
              placeholder="••••••••"

              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <Link href="/auth/forgot-password" className="block text-sm font-medium text-brand-primary hover:underline">{t('auth.forgotPassword')}</Link>
            {error && <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700 font-medium text-left">{error}</p>}

            <Button type="submit" className="w-full h-12 rounded-lg" isLoading={loading}>
              {t('common.login')}
            </Button>
          </form>
    </AuthShell>
  );
}
