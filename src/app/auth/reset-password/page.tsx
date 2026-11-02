'use client';

import { AuthShell } from '@/components/AuthShell';

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
  const [status, setStatus] = useState<'loading' | 'ready' | 'invalid' | 'failed' | 'success'>('loading');
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [saving, setSaving] = useState(false);
  const [attempt, setAttempt] = useState(0);
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
      : Promise.reject({response:{status:400,data:{errorCode:'ERR_INVALID_RESET_TOKEN'}}});
    validation.then(() => { if (!controller.signal.aborted) setStatus('ready'); })
      .catch((failure: unknown) => {
        if (controller.signal.aborted) return;
        const response = (failure as { response?: { data?: { errorCode?: string } } }).response;
        if (response?.data?.errorCode === 'ERR_INVALID_RESET_TOKEN') {
          setStatus('invalid');
        } else {
          setError(apiErrorMessage(failure, t, 'apiErrors.loadFailed'));
          setStatus('failed');
        }
      });
    return () => controller.abort();
  }, [attempt, t]);
  const submit = async (event: React.FormEvent) => {
    event.preventDefault(); setError('');
    if (password !== confirmation) { setError(t('profile.passwordMismatch')); return; }
    setSaving(true);
    try {
      await api.post('/auth/reset-password', { token: token.current, newPassword: password });
      await refreshUser(); setStatus('success'); token.current = null;
    } catch (error: unknown) { setError(apiErrorMessage(error, t)); }
    finally { setSaving(false); }
  };
  return (
    <AuthShell title={t('auth.resetPassword')}>
        {status === 'loading' && <p role="status">{t('common.loading')}</p>}
        {status === 'failed' && <div role="alert"><p>{error}</p><Button className="mt-4" onClick={()=>{setStatus('loading');setAttempt(v=>v+1);}}>{t('common.retry')}</Button></div>}
        {status === 'invalid' && <div role="alert"><p>{t('auth.invalidToken')}</p><Link className="block mt-6 text-brand-primary font-medium" href="/auth/forgot-password">{t('auth.requestNewLink')}</Link></div>}
        {status === 'success' && <p role="status" className="text-brand-primary">{t('auth.resetSuccess')}</p>}
        {status === 'ready' && <form onSubmit={submit} className="space-y-6">
          <p className="text-surface-500">{t('auth.passwordTooShort')}</p>
          <Input label={t('profile.newPassword')} type="password" autoComplete="new-password" minLength={12} maxLength={128} value={password} onChange={e => setPassword(e.target.value)} required />
          <Input label={t('profile.confirmPassword')} type="password" autoComplete="new-password" minLength={12} maxLength={128} value={confirmation} onChange={e => setConfirmation(e.target.value)} required />
          {error && <p role="alert" className="text-red-600">{error}</p>}
          <Button type="submit" isLoading={saving} className="w-full">{t('auth.resetPassword')}</Button>
        </form>}
        <Link href="/auth/login" className="inline-block mt-8 text-brand-primary font-medium hover:underline">{t('auth.backToLogin')}</Link>
      </AuthShell>
  );
}

