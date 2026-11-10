'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { Button } from '@/components/ui/Button';
import RecordSessionModal from '@/components/teacher/RecordSessionModal';
import { dashboardService, type DashboardSession, type TeacherDashboard } from '@/services/dashboardService';
import { classifyLoadFailure, type LoadFailure } from '@/lib/loadFailure';

export default function TeacherOverview() {
  const { user, loading: authLoading } = useAuth();
  const { t, language } = useLanguage();
  const router = useRouter();
  const [data, setData] = useState<TeacherDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [failure, setFailure] = useState<LoadFailure | null>(null);
  const [selected, setSelected] = useState<DashboardSession | null>(null);
  const requestNumber = useRef(0);
  const load = useCallback(async (signal?: AbortSignal) => {
    const currentRequest = ++requestNumber.current;
    setLoading(true);
    setFailure(null);
    try {
      const response = await dashboardService.get(signal);
      if (!signal?.aborted && currentRequest === requestNumber.current) setData(response.data);
    } catch (error) {
      if (!signal?.aborted && currentRequest === requestNumber.current) setFailure(classifyLoadFailure(error));
    } finally {
      if (!signal?.aborted && currentRequest === requestNumber.current) setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (authLoading) return;
    if (!user || user.role !== 'User') {
      router.replace(user?.role === 'Admin' ? '/admin' : '/auth/login');
      return;
    }
    const controller = new AbortController();
    const timer = window.setTimeout(() => { void load(controller.signal); }, 0);
    return () => { window.clearTimeout(timer); controller.abort(); };
  }, [authLoading, user, router, load]);

  // Refresh after returning to this tab, including across midnight in Vietnam.
  useEffect(() => {
    const refresh = () => { if (document.visibilityState === 'visible' && user?.role === 'User') void load(); };
    document.addEventListener('visibilitychange', refresh);
    return () => document.removeEventListener('visibilitychange', refresh);
  }, [user, load]);

  if (authLoading || !user || user.role !== 'User') return null;
  const dateLabel = (date: string) => new Intl.DateTimeFormat(language === 'vi' ? 'vi-VN' : 'en-GB', {
    weekday: 'short', day: 'numeric', month: 'numeric', timeZone: 'Asia/Ho_Chi_Minh',
  }).format(new Date(`${date}T12:00:00+07:00`));
  const rows = (sessions: DashboardSession[], showDate: boolean, allowAttendance: boolean) => <ul className="divide-y divide-surface-200">
    {sessions.map(session => <li key={session.id} className="flex flex-wrap items-center justify-between gap-4 py-5">
      <div className="min-w-0 flex-1 basis-48">
        <p className="text-sm font-medium text-surface-600">{showDate && `${dateLabel(session.date)} · `}<time>{session.startTime.slice(0, 5)} – {session.endTime.slice(0, 5)}</time></p>
        <Link className="mt-1 block break-words text-lg font-semibold text-brand-text hover:underline" href={`/teacher/class/${session.classId}`}>{session.className}</Link>
        <p className="mt-1 text-sm text-surface-600">{t('overview.rosterCount', { count: session.studentCount })} · {session.status === 2 ? t('overview.completed') : t('overview.pendingCount', { count: session.pendingAttendanceCount })}</p>
      </div>
      {allowAttendance && session.status === 1 && <Button variant="outline" onClick={() => setSelected(session)}>{t('overview.attendance')}</Button>}
      {!allowAttendance && <Link className="text-sm font-semibold text-brand-text underline underline-offset-4" href={`/teacher/class/${session.classId}`}>{t('overview.viewClass')}</Link>}
    </li>)}
  </ul>;

  return <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
    <header className="flex flex-wrap items-start justify-between gap-5">
      <div><h1 className="text-3xl font-semibold tracking-tight text-surface-900 sm:text-4xl">{t('overview.title')}</h1><p className="mt-3 max-w-2xl text-surface-600">{t('overview.description')}</p></div>
      <Button variant="outline" isLoading={loading} onClick={() => void load()}>{t('admin.refresh')}</Button>
    </header>
    {failure && <div role="alert" className="mt-6 rounded-xl border border-red-200 bg-red-50 p-5 text-red-800">
      <p>{t(failure === 'unauthorized' ? 'common.sessionExpired' : failure === 'forbidden' ? 'overview.forbidden' : 'overview.loadError')}</p>
      {failure === 'failed' && <Button variant="outline" className="mt-3" onClick={() => void load()} isLoading={loading}>{t('common.retry')}</Button>}
    </div>}
    {loading && !data && <p role="status" className="py-12 text-surface-600">{t('common.loading')}</p>}
    {data && (!failure || failure === 'failed') && <>
      <div className="mt-8 flex flex-wrap gap-x-8 gap-y-3 border-y border-surface-200 py-4 text-sm text-surface-700">
        <Link href="/teacher" className="hover:underline">{t('overview.activeClasses', { count: data.activeClassCount })}</Link>
        <Link href="/teacher/students" className="hover:underline">{t('overview.activeStudents', { count: data.activeStudentCount })}</Link>
        <span>{t('overview.pendingTotal', { count: data.pendingSessionCount })}</span>
      </div>
      <p className="mt-3 text-xs text-surface-600">{t('overview.updatedAt', { time: new Intl.DateTimeFormat(language === 'vi' ? 'vi-VN' : 'en-GB', { timeZone: 'Asia/Ho_Chi_Minh', hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit' }).format(new Date(data.generatedAt)) })}</p>
      <div className="mt-8 grid items-start gap-8 lg:grid-cols-[1.4fr_1fr]">
        <section aria-labelledby="today-heading" className="rounded-xl border border-surface-200 bg-white p-5 sm:p-7">
          <h2 id="today-heading" className="text-2xl font-semibold text-surface-900">{t('overview.today')}</h2>
          <p className="mt-2 text-sm text-surface-600">{dateLabel(data.today)} · {t('overview.vietnamTime')}</p>
          {data.todaySessions.length ? rows(data.todaySessions, false, false) : <p className="py-8 text-surface-600">{t('overview.todayEmpty')}</p>}
        </section>
        <section aria-labelledby="pending-heading" className="rounded-xl border border-surface-200 bg-white p-5 sm:p-7">
          <h2 id="pending-heading" className="text-xl font-semibold text-surface-900">{t('overview.pending')}</h2>
          <p className="mt-2 text-sm text-surface-600">{t('overview.pendingDescription')}</p>
          {data.pendingSessions.length ? <>{rows(data.pendingSessions, true, true)}<p className="mt-3 text-xs text-surface-600">{t('overview.shown', { count: data.pendingSessions.length, total: data.pendingSessionCount })}</p></> : <p className="py-8 text-surface-600">{t('overview.pendingEmpty')}</p>}
        </section>
      </div>
      <section aria-labelledby="upcoming-heading" className="mt-8 rounded-xl border border-surface-200 bg-white p-5 sm:p-7">
        <h2 id="upcoming-heading" className="text-2xl font-semibold text-surface-900">{t('overview.upcoming')}</h2>
        <p className="mt-2 text-sm text-surface-600">{t('overview.upcomingDescription')}</p>
        {data.upcomingSessions.length ? <>{rows(data.upcomingSessions, true, false)}<p className="mt-3 text-xs text-surface-600">{t('overview.shown', { count: data.upcomingSessions.length, total: data.upcomingSessionCount })}</p></> : <p className="py-8 text-surface-600">{t('overview.upcomingEmpty')}</p>}
      </section>
    </>}
    {selected && <RecordSessionModal key={selected.id} isOpen classId={selected.classId} sessionId={selected.id} onClose={() => setSelected(null)} onSuccess={() => { setSelected(null); void load(); }} />}
  </main>;
}
