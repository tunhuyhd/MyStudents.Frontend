'use client';

import Link from 'next/link';
import { ArrowRight, BookOpen, CalendarDays, Users } from '@/components/ui/icons';
import { SubjectIcon } from '@/components/ui/SubjectIcon';
import { BrandLogo } from '@/components/BrandLogo';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';

export default function Home() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const workspace = user?.role === 'Admin' ? '/admin' : '/teacher';
  return (
    <div className="club-home">
      <section className="club-home-hero max-w-7xl mx-auto px-6 py-16 sm:py-24 grid lg:grid-cols-[.9fr_1.1fr] gap-8 lg:gap-16 items-center">
        <div className="max-w-xl">
          <h1 className="text-[2.75rem] sm:text-[3.75rem] leading-[1.12] tracking-[-0.035em] text-surface-900 mb-6">{t('club.titleOne')}<br />{t('club.titleTwo')}</h1>
          <p className="text-lg leading-relaxed text-surface-600 mb-8">{t('campus.homeDesc')}</p>
          <div className="flex flex-wrap items-center gap-3">
            <Link href={user ? workspace : '/auth/register'}><Button size="lg">{user ? t('campus.workspace') : t('common.getStarted')}<ArrowRight className="h-4 w-4 ml-2" /></Button></Link>
            <a href="#features" className="inline-flex items-center min-h-11 px-3 text-sm font-semibold text-surface-700 hover:text-brand-text">{t('campus.homeExplore')}</a>
          </div>
        </div>
        <div className="club-home-preview overflow-hidden bg-white">
          <div className="flex items-center justify-between gap-3 px-5 py-4 border-b border-surface-200"><BrandLogo size="sm" /><span className="text-xs text-surface-500">{t('campus.preview')}</span></div>
          <div className="club-preview-body min-h-[340px]">
            <div className="p-4 sm:p-6 bg-surface-50">
              <div className="flex items-center justify-between mb-5"><h2 className="text-base sm:text-lg">{t('teacher.title')}</h2><BookOpen className="h-5 w-5 text-brand-text" /></div>
              <div className="club-preview-classes">
                {['exampleClass1','exampleClass2','exampleClass3'].map((key,i) => {
                  return (
                  <div key={key} className={`club-preview-class preview-tone-${i} p-4 sm:px-5 flex items-start sm:items-center justify-between gap-3`}>
                    <span className="club-preview-subject" aria-hidden="true"><SubjectIcon subjectName={t(`campus.${key}`)} /></span>
                    <div className="min-w-0 flex-1"><p className="text-sm font-semibold text-surface-900">{t(`campus.${key}`)}</p><p className="text-xs text-surface-500 mt-1 tabular-nums">{['17:30 – 19:00','19:00 – 20:30','18:00 – 19:30'][i]}</p></div>
                    <span className="inline-flex gap-1 items-center text-xs text-brand-text bg-surface-100 px-2 py-1 rounded-md shrink-0"><Users className="h-4 w-4" />{[12,8,15][i]}</span>
                  </div>
                );})}
              </div>
              <p className="mt-4 text-xs text-surface-500">{t('home.footerSlogan')}</p>
            </div>
          </div>
        </div>
      </section>
      <section id="features" className="club-home-features scroll-mt-24">
        <div className="max-w-7xl mx-auto px-6 py-16 sm:py-20 grid lg:grid-cols-[.8fr_1.2fr] gap-6 lg:gap-20">
          <div><h2 className="text-3xl text-surface-900 max-w-sm mb-5">{t('campus.homeSection')}</h2><p className="text-surface-500 max-w-sm leading-relaxed">{t('home.heroDesc')}</p></div>
          <div className="divide-y divide-surface-200">
            {[{icon:BookOpen,key:'flex'},{icon:Users,key:'secure'},{icon:CalendarDays,key:'connect'}].map(({icon:Icon,key}) => (
              <div key={key} className="flex gap-5 py-6 first:pt-0 last:pb-0"><Icon className="w-6 h-6 text-brand-text shrink-0 mt-1" /><div><h3 className="text-lg mb-2">{t(`home.features.${key}`)}</h3><p className="text-surface-500 leading-relaxed">{t(`home.features.${key}Desc`)}</p></div></div>
            ))}
          </div>
        </div>
      </section>
      <footer className="max-w-7xl mx-auto px-6 py-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"><BrandLogo size="sm" /><p className="text-sm text-surface-500">{t('home.footerSlogan')}</p></footer>
    </div>
  );
}
