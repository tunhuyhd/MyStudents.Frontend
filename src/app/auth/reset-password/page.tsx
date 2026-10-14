'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useLanguage } from '@/context/LanguageContext';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/api';
import { apiErrorMessage } from '@/lib/apiError';

export default function ResetPasswordPage() {
  const { t } = useLanguage();
  const { refreshUser } = useAuth();
  const token = useRef<string | null>(null);
  const [status, setStatus] = useState<'loading' | 'ready' | 'invalid' | 'success'>('loading');
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  useEffect(() => {
    const controller = new AbortController();
    if (token.current === null) {
      token.current = new URLSearchParams(window.location.hash.slice(1)).get('token') || new URLSearchParams(window.location.search).get('token') || '';
      // The email uses a fragment, so the token is never sent in an HTTP URL.
      window.history.replaceState(null, '', window.location.pathname);
    }
    const validation = /^[A-F0-9]{64}$/.test(token.current)
      ? api.post('/auth/reset-password/validate', { token: token.current }, { signal: controller.signal })
      : Promise.reject(new Error('Invalid reset token.'));
    validation.then(() => { if (!controller.signal.aborted) setStatus('ready'); })
      .catch(() => { if (!controller.signal.aborted) setStatus('invalid'); });
    return () => controller.abort();
  }, []);
  const submit = async (event: React.FormEvent) => {
    event.preventDefault(); setError('');
    if (password !== confirmation) { setError(t('profile.passwordMismatch')); return; }
    setSaving(true);
    try {
      await api.post('/auth/reset-password', { token: token.current, newPassword: password });
      localStorage.removeItem('accessToken'); localStorage.removeItem('refreshToken');
      await refreshUser(); setStatus('success'); token.current = null;
    } catch (error: unknown) { setError(apiErrorMessage(error, t)); }
    finally { setSaving(false); }
  };
  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <section className="w-full max-w-md bg-white p-10 rounded-[3rem] shadow-xl border border-surface-100">
        <h1 className="text-3xl font-black text-surface-900 mb-6">{t('auth.resetPassword')}</h1>
        {status === 'loading' && <p role="status">{t('common.loading')}</p>}
        {status === 'invalid' && <div role="alert"><p>{t('auth.invalidToken')}</p><Link className="block mt-6 text-brand-primary font-bold" href="/auth/forgot-password">{t('auth.requestNewLink')}</Link></div>}
        {status === 'success' && <p role="status" className="text-brand-primary">{t('auth.resetSuccess')}</p>}
        {status === 'ready' && <form onSubmit={submit} className="space-y-6">
          <p className="text-surface-500">{t('auth.passwordTooShort')}</p>
          <Input label={t('profile.newPassword')} type="password" autoComplete="new-password" minLength={12} maxLength={128} value={password} onChange={e => setPassword(e.target.value)} required />
          <Input label={t('profile.confirmPassword')} type="password" autoComplete="new-password" minLength={12} maxLength={128} value={confirmation} onChange={e => setConfirmation(e.target.value)} required />
          {error && <p role="alert" className="text-red-600">{error}</p>}
          <Button type="submit" isLoading={saving} className="w-full">{t('auth.resetPassword')}</Button>
        </form>}
        <Link href="/auth/login" className="inline-block mt-8 text-brand-primary font-bold hover:underline">{t('auth.backToLogin')}</Link>
      </section>
    </main>
  );
}

