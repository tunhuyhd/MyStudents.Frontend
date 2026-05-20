'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/Button';
import { LanguageSwitcher } from './LanguageSwitcher';
import { GraduationCap, LogOut, User as UserIcon, Menu, X, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getAvatarUrl } from '@/lib/api';

import { useLanguage } from '@/context/LanguageContext';
import { UserRoles } from '@/constants/roles';

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

export function Navbar({ onMenuClick }: { onMenuClick?: () => void }) {
  const { t } = useLanguage();
  const { user, logout, loading } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const isAdmin = user?.role === UserRoles.Admin;

  const NavLinks = () => {
    // Generate background color based on name hash for initials avatar
    const getInitialsBg = (name: string) => {
      let hash = 0;
      for (let i = 0; i < name.length; i++) {
        hash = name.charCodeAt(i) + ((hash << 5) - hash);
      }
      const h = Math.abs(hash) % 360;
      return `linear-gradient(135deg, hsl(${h}, 80%, 60%) 0%, hsl(${(h + 40) % 360}, 85%, 50%) 100%)`;
    };

    return (
      <>
        {user && isAdmin && (
          <Link 
            href="/admin" 
            onClick={() => setIsMenuOpen(false)}
            className="flex items-center space-x-2 text-sm font-black text-brand-primary hover:opacity-70 transition-opacity uppercase tracking-tighter"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>{t('admin.panel')}</span>
          </Link>
        )}
        {user ? (
          <div className="flex flex-col md:flex-row items-center gap-4 md:gap-6">
            <Link 
              href="/me" 
              onClick={() => setIsMenuOpen(false)}
              className="flex items-center space-x-2 px-4 py-2 bg-surface-50 rounded-full border border-surface-100 hover:bg-surface-100 transition-all active:scale-95 group w-full md:w-auto justify-center"
            >
              {user.imageUrl ? (
                <img 
                  src={getAvatarUrl(user.imageUrl) || ''} 
                  alt={user.fullName} 
                  className="w-6 h-6 rounded-full object-cover border border-brand-primary/20 shrink-0"
                />
              ) : (
                <div 
                  style={{ background: getInitialsBg(user.fullName) }}
                  className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black text-white shrink-0 shadow-sm"
                >
                  {getInitials(user.fullName)}
                </div>
              )}
              <span className="text-sm font-bold text-surface-700 truncate max-w-[120px]">{t('common.hello')}, {user.fullName}</span>
            </Link>
          <button 
            onClick={() => { logout(); setIsMenuOpen(false); }}
            className="flex items-center space-x-2 text-sm font-bold text-red-500 hover:text-red-600 transition-colors px-4 py-2"
          >
            <LogOut className="w-4 h-4" />
            <span>{t('auth.logout')}</span>
          </button>
        </div>
      ) : (
        <div className="flex flex-col md:flex-row items-center gap-4 md:gap-4 w-full md:w-auto">
          <Link href="/auth/login" onClick={() => setIsMenuOpen(false)} className="w-full md:w-auto">
            <Button variant="outline" className="w-full rounded-full border-brand-primary/20 text-brand-primary font-bold">
              {t('auth.login')}
            </Button>
          </Link>
          <Link href="/auth/register" onClick={() => setIsMenuOpen(false)} className="w-full md:w-auto">
            <Button className="w-full rounded-full bg-brand-primary text-white font-bold shadow-lg shadow-brand-primary/20">
              {t('auth.register')}
            </Button>
          </Link>
        </div>
      )}
    </>
    );
  };

  return (
    <nav className="sticky top-0 z-50 bg-white/70 backdrop-blur-xl border-b border-surface-100 px-6 py-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-3">
          {onMenuClick && (
            <button 
              onClick={onMenuClick}
              className="p-2 -ml-2 hover:bg-brand-primary/5 rounded-xl lg:hidden text-brand-primary"
            >
              <Menu className="w-6 h-6" />
            </button>
          )}
          <Link href="/" className="flex items-center space-x-3 group transition-transform active:scale-95">
            <div className="w-10 h-10 bg-brand-primary rounded-xl flex items-center justify-center shadow-lg shadow-brand-primary/20 group-hover:rotate-6 transition-transform">
              <GraduationCap className="text-white w-6 h-6" />
            </div>
            <span className="text-2xl font-black tracking-tighter text-surface-900 group-hover:text-brand-primary transition-colors">
              My<span className="text-brand-primary">Students</span>
            </span>
          </Link>
        </div>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center space-x-8">
          <LanguageSwitcher />
          {!loading && <NavLinks />}
        </div>

        {/* Mobile Toggle */}
        <div className="flex md:hidden items-center space-x-4">
          <LanguageSwitcher />
          <button 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="p-2 text-surface-600 hover:bg-surface-100 rounded-xl transition-colors"
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden overflow-hidden bg-white border-t border-surface-50 mt-4"
          >
            <div className="flex flex-col space-y-6 py-6 items-center">
              {!loading && <NavLinks />}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
