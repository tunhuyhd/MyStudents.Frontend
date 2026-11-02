'use client';

import { AuthShell } from '@/components/AuthShell';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useLanguage } from '@/context/LanguageContext';
import api from '@/lib/api';
import { apiErrorMessage } from '@/lib/apiError';

export default function ForgotPasswordPage() {
  const { t, language } = useLanguage();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const submit = async (event: React.FormEvent) => {
    event.preventDefault(); setLoading(true); setError('');
    try { await api.post('/auth/forgot-password', { email, language }); setSent(true); }
    catch (error: unknown) { setError(apiErrorMessage(error, t)); }
    finally { setLoading(false); }
  };
  return (
    <AuthShell title={t('auth.forgotPassword')}>
        <p className="text-surface-500 mt-3 mb-8">{t('auth.forgotPasswordDesc')}</p>
        {sent ? <p role="status" className="text-brand-primary mb-8">{t('auth.forgotPasswordSuccess')}</p> : (
          <form onSubmit={submit} className="space-y-6">
            <Input label={t('auth.email')} type="email" autoComplete="email" maxLength={255} value={email} onChange={e => setEmail(e.target.value)} required />
            {error && <p role="alert" className="text-red-600">{error}</p>}
            <Button type="submit" isLoading={loading} className="w-full">{t('auth.sendResetLink')}</Button>
          </form>
        )}
        <Link href="/auth/login" className="inline-block mt-8 text-brand-primary font-medium hover:underline">{t('auth.backToLogin')}</Link>
      </AuthShell>
  );
}

