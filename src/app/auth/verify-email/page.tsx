'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { AuthShell } from '@/components/AuthShell';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useLanguage } from '@/context/LanguageContext';
import api from '@/lib/api';
import { apiErrorMessage } from '@/lib/apiError';

export default function VerifyEmailPage() {
  const { t, language } = useLanguage();
  const token = useRef('');
  const [status, setStatus] = useState<'loading' | 'resend' | 'ready' | 'invalid' | 'success'>('loading');
  const [email, setEmail] = useState('');
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const readToken = () => {
      const value = new URLSearchParams(window.location.hash.slice(1)).get('token');
      if (value !== null) {
        token.current = value;
        window.history.replaceState(null, '', window.location.pathname);
      }
      // Consuming the token requires an explicit click and is safe in Strict Mode.
      setError(''); setSent(false);
      setStatus(token.current ? (/^[A-F0-9]{64}$/.test(token.current) ? 'ready' : 'invalid') : 'resend');
    };
    readToken();
    window.addEventListener('hashchange', readToken);
    return () => window.removeEventListener('hashchange', readToken);
  }, []);

  const verify = async () => {
    setBusy(true); setError('');
    try {
      await api.post('/auth/verify-email', { token: token.current });
      token.current = ''; setStatus('success');
    } catch (failure: unknown) {
      const code = (failure as { response?: { data?: { errorCode?: string } } }).response?.data?.errorCode;
      if (code === 'ERR_INVALID_VERIFICATION_TOKEN') setStatus('invalid');
      else setError(apiErrorMessage(failure, t));
    } finally { setBusy(false); }
  };

  const resend = async (event: React.FormEvent) => {
    event.preventDefault(); setBusy(true); setError(''); setSent(false);
    try { await api.post('/auth/resend-verification', { email, language }); setSent(true); }
    catch (failure: unknown) { setError(apiErrorMessage(failure, t)); }
    finally { setBusy(false); }
  };

  return <AuthShell title={t('auth.verificationTitle')}>
    <div className="space-y-6">
      {status === 'loading' && <p role="status">{t('common.loading')}</p>}
      {status === 'ready' && <><p>{t('auth.verificationConfirmDesc')}</p><Button className="w-full" isLoading={busy} onClick={verify}>{t('auth.verificationConfirm')}</Button></>}
      {status === 'success' && <p role="status">{t('auth.verificationSuccess')}</p>}
      {status === 'invalid' && <p role="alert">{t('errors.ERR_INVALID_VERIFICATION_TOKEN')}</p>}
      {(status === 'resend' || status === 'invalid') && <form onSubmit={resend} className="space-y-6">
        <p>{t('auth.verificationResendDesc')}</p>
        <Input label={t('auth.email')} type="email" autoComplete="email" maxLength={255} value={email} onChange={event => setEmail(event.target.value)} required />
        <Button type="submit" className="w-full" isLoading={busy}>{t('auth.verificationResend')}</Button>
        {sent && <p role="status">{t('auth.verificationResent')}</p>}
      </form>}
      {error && <p role="alert" className="text-red-700">{error}</p>}
      <Link href="/auth/login" className="inline-block font-semibold text-brand-text hover:underline">{t('auth.backToLogin')}</Link>
    </div>
  </AuthShell>;
}
