'use client';

import Script from 'next/script';
import { useCallback, useEffect, useRef, useState } from 'react';
import api from '@/lib/api';
import { apiErrorMessage } from '@/lib/apiError';
import { useLanguage } from '@/context/LanguageContext';
import { useAuth } from '@/context/AuthContext';

declare global {
  interface Window {
    google?: { accounts: { id: {
      initialize: (options: { client_id: string; callback: (response: { credential: string }) => void; auto_select: boolean }) => void;
      renderButton: (element: HTMLElement, options: { type: string; theme: string; size: string; shape: string; text: string; width: number; locale: string }) => void;
    } } };
  }
}

export function GoogleSignIn() {
  const { t, language } = useLanguage();
  const { login } = useAuth();
  const container = useRef<HTMLDivElement>(null);
  const submitting = useRef(false);
  const [ready, setReady] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
  const authenticate = useCallback(async ({ credential }: { credential: string }) => {
    if (submitting.current) return;
    submitting.current = true;
    setBusy(true);
    setError('');
    try {
      await api.post('/auth/google', { credential });
      await login();
      window.location.assign('/teacher');
    } catch (failure) {
      setError(apiErrorMessage(failure, t, 'auth.googleFailed'));
    } finally { submitting.current = false; setBusy(false); }
  }, [login, t]);
  useEffect(() => {
    if (!ready || !clientId || !container.current || !window.google) return;
    window.google.accounts.id.initialize({ client_id: clientId, callback: authenticate, auto_select: false });
    container.current.replaceChildren();
    window.google.accounts.id.renderButton(container.current, {
      type: 'standard', theme: 'outline', size: 'large', shape: 'pill', text: 'continue_with',
      width: Math.min(400, container.current.clientWidth), locale: language,
    });
  }, [ready, clientId, authenticate, language]);
  if (!clientId) return null;
  return <div className="mt-6 space-y-4">
    <div className="flex items-center gap-3 text-sm text-brand-text/70"><span className="h-px flex-1 bg-brand-text/15" />{t('auth.or')}<span className="h-px flex-1 bg-brand-text/15" /></div>
    <Script src="https://accounts.google.com/gsi/client" strategy="afterInteractive" onReady={() => setReady(true)} onError={() => setError(t('auth.googleLoadFailed'))} />
    <div ref={container} className={busy ? 'pointer-events-none flex justify-center opacity-60' : 'flex justify-center'} aria-busy={busy} />
    {(!ready && !error || busy) && <p role="status" className="text-center text-sm text-brand-text/70">{t(busy ? 'auth.googleSigningIn' : 'auth.googleLoading')}</p>}
    {error && <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
  </div>;
}
