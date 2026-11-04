'use client';

import { useEffect, useId, useRef, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useLanguage } from '@/context/LanguageContext';
import { mutationErrorMessage } from '@/lib/mutationError';
import api from '@/lib/api';

export default function DeleteUserDialog({ user, onClose, onDeleted }: {
  user: { id: string; email: string; username: string };
  onClose: () => void;
  onDeleted: (id: string) => void;
}) {
  const { t } = useLanguage();
  const id = useId();
  const dialog = useRef<HTMLDialogElement>(null);
  const [confirmation, setConfirmation] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  useEffect(() => {
    const element = dialog.current;
    const previous = document.activeElement as HTMLElement | null;
    element?.showModal();
    return () => { element?.close(); previous?.focus(); };
  }, []);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (busy || confirmation.trim().toLowerCase() !== user.email.toLowerCase()) return;
    setBusy(true); setError('');
    try {
      await api.delete(`/admin/users/${user.id}`, { data: { confirmationEmail: confirmation.trim() } });
      onDeleted(user.id);
    } catch (failure: unknown) {
      setError(mutationErrorMessage(failure, t));
      setBusy(false);
    }
  };

  return <dialog ref={dialog} aria-labelledby={`${id}-title`} aria-describedby={`${id}-description`}
    onCancel={event => { event.preventDefault(); if (!busy) onClose(); }}
    className="m-auto max-h-[90dvh] w-[calc(100%_-_2rem)] max-w-lg overflow-y-auto rounded-2xl bg-white p-6 text-surface-900 backdrop:bg-surface-900/40 md:p-8">
    <form onSubmit={submit} className="space-y-6">
      <h2 id={`${id}-title`} className="text-2xl font-bold">{t('admin.deleteUserTitle')}</h2>
      <div className="space-y-2 [overflow-wrap:anywhere]">
        <p className="font-semibold">{user.username}</p>
        <p>{user.email}</p>
      </div>
      <p id={`${id}-description`}>{t('admin.deleteUserDescription')}</p>
      <Input label={t('admin.deleteUserConfirmation')} type="email" autoComplete="off" maxLength={255}
        value={confirmation} disabled={busy} required onChange={event => setConfirmation(event.target.value)} />
      {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
      <div className="flex flex-wrap justify-end gap-3">
        <Button type="button" variant="outline" disabled={busy} onClick={onClose}>{t('admin.cancel')}</Button>
        <button type="submit" disabled={busy || confirmation.trim().toLowerCase() !== user.email.toLowerCase()} aria-busy={busy || undefined}
          className="min-h-11 rounded-xl bg-red-700 px-5 py-2.5 font-semibold text-white hover:bg-red-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-700 disabled:cursor-not-allowed disabled:opacity-50">
          {busy ? t('common.loading') : t('admin.deleteUserAction')}
        </button>
      </div>
    </form>
  </dialog>;
}
