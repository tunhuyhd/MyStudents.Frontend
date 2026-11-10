'use client';

import { BrandLogo } from '@/components/BrandLogo';

import Link from 'next/link';
import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, Users, X, LogOut, UserRound, ArrowUpRight } from '@/components/ui/icons';
import { useLanguage } from '@/context/LanguageContext';
import { useAuth } from '@/context/AuthContext';
import { LanguageSwitcher } from '../LanguageSwitcher';
import { getAvatarUrl } from '@/lib/api';

const getInitials = (name: string) => {
  if (!name) return '?';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }
  const first = parts[0];
  const last = parts[parts.length - 1];
  return (first[0] + last[0]).toUpperCase();
};

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function TeacherSidebar({ isOpen, onClose }: SidebarProps) {
  const { t } = useLanguage();
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const sidebarRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const media = window.matchMedia('(min-width: 1024px)');
    if (media.matches) return;
    const previousFocus = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const getControls = () => Array.from(sidebarRef.current?.querySelectorAll<HTMLElement>('a[href], button:not(:disabled), select, [tabindex="0"]') || [])
      .filter((element) => element.getClientRects().length > 0);
    getControls()[0]?.focus();
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onClose();
      }
      if (event.key === 'Tab') {
        const controls = getControls();
        const first = controls[0];
        const last = controls[controls.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last?.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first?.focus();
        }
      }
    };
    const handleResize = () => { if (media.matches) onClose(); };
    document.addEventListener('keydown', handleKeyDown);
    media.addEventListener('change', handleResize);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', handleKeyDown);
      media.removeEventListener('change', handleResize);
      const returnTarget = previousFocus && previousFocus !== document.body
        ? previousFocus
        : document.querySelector<HTMLElement>('[aria-controls="teacher-navigation"]');
      returnTarget?.focus();
    };
  }, [isOpen, onClose]);

  const menuItems = [
    { title: t('overview.nav'), icon: BookOpen, href: '/teacher/overview' },
    {
      title: t('teacher.title'),
      icon: BookOpen,
      href: '/teacher',
    },
    {
      title: t('teacher.students.label'),
      icon: Users,
      href: '/teacher/students',
    },
  ];

  return (
    <>
      {/* Mobile Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={false}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-surface-900/40 z-[80] lg:hidden"
          />
        )}
      </AnimatePresence>

      <aside id="teacher-navigation" ref={sidebarRef} aria-label={t('common.navigation')} className={`campus-rail fixed top-0 left-0 h-dvh w-64 max-w-[calc(100vw-3rem)] z-[100] transition-transform duration-200 ease-out lg:visible lg:translate-x-0 ${isOpen ? 'visible translate-x-0' : 'invisible -translate-x-full'}`}>
        <div className="h-full flex flex-col overflow-y-auto p-4">
          <div className="flex items-center justify-between px-1 py-3 mb-8">
            <Link href="/" className="rounded-lg"><BrandLogo theme="dark" size="sm" /></Link>
            <button type="button" aria-label={t('common.closeNavigation')} onClick={onClose} className="lg:hidden p-2 text-white rounded-lg hover:bg-white/10"><X className="w-5 h-5" /></button>
          </div>
          <nav className="flex-1 space-y-1.5">
            {menuItems.map(item => {
              const isActive = pathname === item.href || (item.href === '/teacher' ? pathname.startsWith('/teacher/class/') : pathname.startsWith(`${item.href}/`));
              return <Link key={item.href} href={item.href} aria-current={isActive ? 'page' : undefined} onClick={onClose} className={`flex items-center gap-3 px-4 py-3 min-h-12 rounded-lg text-sm font-medium ${isActive ? 'bg-white text-surface-800' : 'text-emerald-50'}`}><item.icon className="h-5 w-5 shrink-0" /><span>{item.title}</span></Link>;
            })}
            <Link href="/me" onClick={onClose} className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-emerald-50"><UserRound className="h-5 w-5" />{t('campus.profileNav')}</Link>
          </nav>
          <div className="border-t border-white/20 pt-5 mt-8 space-y-5">
            <LanguageSwitcher theme="dark" />
            <Link href="/me" onClick={onClose} className="flex items-center gap-3 rounded-lg py-2">
              {user?.imageUrl ? <img src={getAvatarUrl(user.imageUrl) || ''} alt="" className="w-9 h-9 rounded-full object-cover" /> : <div className="w-9 h-9 rounded-full bg-white/15 text-white grid place-items-center text-sm font-semibold shrink-0">{getInitials(user?.fullName || '')}</div>}
              <div className="min-w-0 flex-1"><p className="text-sm text-white truncate">{user?.fullName}</p><p className="text-xs text-emerald-100">{t('auth.teacherRole')}</p></div><ArrowUpRight className="h-4 w-4 text-emerald-100" />
            </Link>
            <button onClick={logout} className="w-full flex gap-3 items-center min-h-11 px-3 text-sm text-emerald-50 rounded-lg hover:bg-white/10"><LogOut className="h-4 w-4" />{t('auth.logout')}</button>
          </div>
        </div>
      </aside>
    </>
  );
}
