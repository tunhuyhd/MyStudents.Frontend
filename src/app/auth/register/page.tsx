'use client';

import { GoogleSignIn } from '@/components/GoogleSignIn';
import { AuthShell } from '@/components/AuthShell';


import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import api from '@/lib/api';
import { apiErrorMessage } from '@/lib/apiError';
import Link from 'next/link';

import { useLanguage } from '@/context/LanguageContext';

export default function RegisterPage() {
  const { t, language } = useLanguage();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    fullName: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await api.post('/auth/register', { ...formData, language });
      setSent(true);
      setFormData(current => ({ ...current, password: '' }));
    } catch (err: unknown) {
      setError(apiErrorMessage(err, t, 'auth.registrationFailed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell title={t('common.register')} description={t('auth.createAccount')} footer={<p>{t('auth.haveAccount')}{' '}<Link href="/auth/login" className="font-semibold text-brand-text hover:underline">{t('common.login')}</Link></p>}>
      {sent ? <div className="space-y-6"><p role="status">{t('auth.verificationRegistrationSent')}</p><Link href="/auth/verify-email" className="inline-block font-semibold text-brand-text hover:underline">{t('auth.verificationResend')}</Link></div> : <form onSubmit={handleRegister} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <Input
                label={t('auth.fullName')}
                placeholder="Ex: John Smith"

                value={formData.fullName}
                onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                required
              />
            </div>
            <Input
              autoComplete="username" label={t('auth.username')}
              placeholder="jsmith88"

              value={formData.username}
              onChange={(e) => setFormData({...formData, username: e.target.value})}
              required
            />
            <Input
              label={t('auth.email')}
              type="email"
              autoComplete="email"
              maxLength={255}
              placeholder="john@example.com"

              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              required
            />
            <div className="md:col-span-2">
              <Input
                label={t('auth.password')}
                autoComplete="new-password" type="password"
                placeholder="••••••••"

                value={formData.password}
                minLength={12}
                maxLength={128}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                required
              />
            </div>

            {error && <p className="md:col-span-2 text-sm text-red-500 font-medium text-center">{error}</p>}

            <Button type="submit" className="md:col-span-2 h-12 rounded-lg" isLoading={loading}>
              {t('common.register')}
            </Button>
          </form>}
      {!sent && <GoogleSignIn />}
    </AuthShell>
  );
}
