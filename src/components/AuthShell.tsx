'use client';

import Link from 'next/link';
import { ArrowLeft, BookOpen, CalendarDays, Users } from '@/components/ui/icons';
import { BrandLogo } from './BrandLogo';
import { LanguageSwitcher } from './LanguageSwitcher';
import { useLanguage } from '@/context/LanguageContext';
import type { ReactNode } from 'react';

export function AuthShell({ title, description, children, footer }: { title: string; description?: string; children: ReactNode; footer?: ReactNode }) {
  const { t } = useLanguage();
  return (
    <main className="club-auth min-h-dvh grid lg:grid-cols-[minmax(320px,.85fr)_minmax(0,1.15fr)]">
      <aside className="club-auth-story hidden lg:flex flex-col justify-between p-12 xl:p-16">
        <Link href="/" className="self-start rounded-lg"><BrandLogo /></Link>
        <div className="py-16 max-w-md">
          <h2 className="club-auth-headline mb-6">{t('club.titleOne')}<br />{t('club.titleTwo')}</h2>
          <p className="text-surface-600 leading-relaxed mb-10">{t('home.heroDesc')}</p>
          <div className="space-y-5 text-sm">
            {[[BookOpen, 'home.features.flex'], [Users, 'home.features.secure'], [CalendarDays, 'home.features.connect']].map(([Icon, key]) => {
              const Glyph = Icon as typeof BookOpen;
              return <div key={String(key)} className="flex items-center gap-3"><Glyph className="h-5 w-5 text-brand-text" aria-hidden="true" /><span>{t(String(key))}</span></div>;
            })}
          </div>
        </div>
        <p className="text-sm text-surface-600">{t('home.footerSlogan')}</p>
      </aside>
      <div className="club-auth-form flex min-w-0 flex-col px-5 py-6 sm:px-10 lg:px-16">
        <header className="flex items-center justify-between gap-3 mb-8">
          <Link href="/" className="inline-flex items-center gap-2 text-sm text-surface-600 hover:text-brand-text"><ArrowLeft className="h-4 w-4" />{t('common.backToHome')}</Link>
          <LanguageSwitcher />
        </header>
        <div className="w-full max-w-md mx-auto my-auto py-8 sm:py-12">
          <div className="lg:hidden mb-8"><BrandLogo /></div>
          <h1 className="text-3xl text-surface-900 mb-3">{title}</h1>
          {description && <p className="text-surface-500 mb-8">{description}</p>}
          {children}
          {footer && <footer className="mt-8 pt-6 border-t border-surface-200 text-sm text-surface-500">{footer}</footer>}
        </div>
      </div>
    </main>
  );
}
