'use client';

import Link from 'next/link';
import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, Users, LayoutDashboard, X, LogOut } from 'lucide-react';
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

const getInitialsBg = (name: string) => {
  if (!name) return 'linear-gradient(135deg, #10b981 0%, #059669 100%)';
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const h = Math.abs(hash) % 360;
  return `linear-gradient(135deg, hsl(${h}, 80%, 60%) 0%, hsl(${(h + 40) % 360}, 85%, 50%) 100%)`;
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
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-surface-900/40 backdrop-blur-sm z-[80] lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar Container */}
      <aside id="teacher-navigation" ref={sidebarRef} aria-label={t('common.navigation')} className={`fixed top-0 left-0 h-dvh w-72 max-w-[calc(100vw-3rem)] bg-white border-r border-surface-100 z-[100] transition-transform duration-200 ease-out lg:visible lg:translate-x-0 ${
        isOpen ? 'visible translate-x-0' : 'invisible -translate-x-full'
      }`}>
        <div className="h-full flex flex-col overflow-y-auto p-5">
          {/* Logo Section */}
          <div className="flex items-center justify-between mb-8">
            <Link href="/" className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-brand-primary rounded-2xl flex items-center justify-center shadow-lg shadow-brand-primary/20 text-white">
                <LayoutDashboard className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-black text-surface-900 tracking-tighter leading-none">Teacher</h2>
                <p className="text-[10px] font-black text-brand-primary uppercase tracking-widest mt-1">Lounge</p>
              </div>
            </Link>
            <button type="button" aria-label={t('common.closeNavigation')} onClick={onClose} className="lg:hidden p-3 text-surface-600 rounded-xl hover:bg-surface-100">
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-2">
            {menuItems.map((item) => {
              const isActive = pathname === item.href || (item.href === '/teacher' ? pathname.startsWith('/teacher/class/') : pathname.startsWith(`${item.href}/`));
              return (
                <Link key={item.href} href={item.href} aria-current={isActive ? 'page' : undefined} className="block rounded-xl" onClick={() => onClose()}>
                  <div className={`flex items-center px-4 py-3 rounded-xl font-semibold text-sm transition-colors ${
                    isActive 
                      ? 'bg-surface-100 text-surface-900'
                      : 'text-surface-400 hover:bg-surface-50 hover:text-surface-900'
                  }`}>
                    <item.icon className="w-5 h-5 mr-4" />
                    <span className="tracking-tight">{item.title}</span>
                  </div>
                </Link>
              );
            })}
          </nav>

          {/* User Section */}
          <div className="mt-auto pt-8 border-t border-surface-50 space-y-6">
            <div className="px-2">
               <LanguageSwitcher />
            </div>
            
            <div className="p-5 bg-surface-50 rounded-3xl">
              <Link 
                href="/me" 
                onClick={() => onClose()}
                className="flex items-center space-x-3 mb-4 hover:bg-surface-100/50 p-1.5 rounded-2xl transition-colors duration-200 cursor-pointer block"
              >
                {user?.imageUrl ? (
                  <img 
                    src={getAvatarUrl(user.imageUrl) || ''} 
                    alt={user.fullName} 
                    className="w-10 h-10 rounded-xl object-cover border border-brand-primary/20 shrink-0"
                  />
                ) : (
                  <div 
                    style={{ background: getInitialsBg(user?.fullName || '') }}
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-black text-xs shrink-0 shadow-sm"
                  >
                    {getInitials(user?.fullName || '')}
                  </div>
                )}
                <div className="flex-1 overflow-hidden">
                  <p className="text-sm font-semibold text-surface-900 truncate">{user?.fullName}</p>
                  <p className="text-xs text-surface-500">{t('auth.teacherRole') || 'Giáo viên'}</p>
                </div>
              </Link>
              <button 
                onClick={logout}
                className="w-full h-11 bg-white rounded-xl border border-red-50 text-red-500 font-black text-[10px] uppercase tracking-widest hover:bg-red-50 transition-all flex items-center justify-center space-x-2"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>{t('auth.logout')}</span>
              </button>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
