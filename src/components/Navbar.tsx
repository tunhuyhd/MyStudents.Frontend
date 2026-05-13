'use client';

import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/Button';
import { LanguageSwitcher } from './LanguageSwitcher';
import { GraduationCap, LogOut, User as UserIcon } from 'lucide-react';

import { useLanguage } from '@/context/LanguageContext';
import { UserRoles } from '@/constants/roles';

export function Navbar() {
  const { t } = useLanguage();
  const { user, logout, loading } = useAuth();

  return (
    <nav className="relative z-10 flex items-center justify-between px-6 py-6 max-w-7xl mx-auto w-full">
      <Link href="/" className="flex items-center space-x-2">
        <div className="w-10 h-10 bg-brand-primary flex items-center justify-center rounded-xl shadow-lg shadow-brand-primary/30">
          <GraduationCap className="w-6 h-6 text-white" />
        </div>
        <span className="text-2xl font-bold tracking-tight text-surface-900">MyStudents</span>
      </Link>

      <div className="flex items-center space-x-4 md:space-x-8">
        <LanguageSwitcher />
        {!loading && (
          <>
            {user ? (
              <div className="flex items-center space-x-6">
                {user.role === UserRoles.Admin && (
                  <Link href="/admin" className="text-sm font-black text-brand-primary hover:opacity-70 transition-opacity uppercase tracking-tighter">
                    {t('admin.panel')}
                  </Link>
                )}
                <Link 
                  href="/me" 
                  className="flex items-center space-x-2 px-4 py-2 bg-surface-50 rounded-full border border-surface-100 hover:bg-surface-100 transition-all active:scale-95 group"
                >
                  <div className="w-6 h-6 bg-brand-primary/10 rounded-full flex items-center justify-center group-hover:bg-brand-primary group-hover:text-white transition-colors">
                    <UserIcon className="w-3.5 h-3.5 text-brand-primary group-hover:text-white" />
                  </div>
                  <span className="text-sm font-bold text-surface-700">{t('common.hi')}, {user.fullName}</span>
                </Link>
                <button 
                  onClick={logout}
                  className="flex items-center text-sm font-bold text-surface-400 hover:text-red-500 transition-colors"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  {t('common.logout')}
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link href="/auth/login">
                  <Button variant="ghost" size="sm" className="font-bold">{t('common.login')}</Button>
                </Link>
                <Link href="/auth/register">
                  <Button size="sm" className="rounded-full px-6 shadow-md">{t('common.getStarted')}</Button>
                </Link>
              </div>
            )}
          </>
        )}
      </div>
    </nav>
  );
}
