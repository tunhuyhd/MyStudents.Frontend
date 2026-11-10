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
  const [emailExists, setEmailExists] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setEmailExists(false);
    try {
      await api.post('/auth/register', { ...formData, language });
      setSent(true);
      setFormData(current => ({ ...current, password: '' }));
    } catch (err: unknown) {
      const code = (err as { response?: { data?: { errorCode?: string } } }).response?.data?.errorCode;
      setEmailExists(code === 'ERR_EMAIL_EXISTS');
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

            {error && <div role="alert" className="md:col-span-2 space-y-3 text-sm">
              <p className="text-red-700 font-medium">{emailExists ? t('auth.emailAlreadyRegistered') : error}</p>
              {emailExists && <div className="flex flex-wrap gap-x-6 gap-y-3">
                <Link href="/auth/login" className="font-semibold text-brand-text underline underline-offset-4">{t('common.login')}</Link>
                <Link href="/auth/verify-email" className="font-semibold text-brand-text underline underline-offset-4">{t('auth.verificationResend')}</Link>
              </div>}
            </div>}

            <Button type="submit" className="md:col-span-2 h-12 rounded-lg" isLoading={loading}>
              {t('common.register')}
            </Button>
          </form>}
      {!sent && <GoogleSignIn />}
    </AuthShell>
  );
}
