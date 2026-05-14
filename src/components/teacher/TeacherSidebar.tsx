'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, Users, LayoutDashboard, ChevronRight, X, LogOut, User as UserIcon, Settings, Globe } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { useAuth } from '@/context/AuthContext';
import { LanguageSwitcher } from '../LanguageSwitcher';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function TeacherSidebar({ isOpen, onClose }: SidebarProps) {
  const { t } = useLanguage();
  const { user, logout } = useAuth();
  const pathname = usePathname();

  const menuItems = [
    {
      title: t('teacher.title'),
      icon: BookOpen,
      href: '/teacher',
    },
    {
      title: 'Học sinh', // Will localize later
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
            className="fixed inset-0 bg-surface-900/60 backdrop-blur-sm z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      <div className={`fixed lg:sticky top-0 left-0 z-50 w-80 h-screen flex flex-col transition-transform duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] transform ${
        isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}>
        <div className="flex-1 m-4 mr-0 bg-white/80 backdrop-blur-2xl border border-white rounded-[3.5rem] shadow-[0_30px_60px_-15px_rgba(0,0,0,0.05)] flex flex-col overflow-hidden relative group/sidebar">
          {/* Internal Decorative Aura */}
          <div className="absolute -top-20 -left-20 w-40 h-40 bg-brand-primary/10 aura-bg rounded-full animate-float pointer-events-none" />

          {/* Sidebar Header */}
          <div className="p-10 pb-12 flex items-center justify-between relative z-10">
            <Link href="/" className="flex items-center space-x-4 group/logo">
              <div className="w-12 h-12 bg-brand-primary rounded-[1.25rem] flex items-center justify-center shadow-2xl shadow-brand-primary/30 group-hover/logo:rotate-[15deg] transition-all duration-500">
                <LayoutDashboard className="w-6 h-6 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-black text-surface-900 tracking-tighter leading-none">Teacher</span>
                <span className="text-[10px] font-black text-brand-primary uppercase tracking-[0.3em] leading-none mt-1">Lounge</span>
              </div>
            </Link>
            <button onClick={onClose} className="p-3 hover:bg-surface-50 rounded-2xl lg:hidden text-surface-400">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Menu Items */}
          <nav className="flex-1 px-4 space-y-3 relative z-10">
            {menuItems.map((item, index) => {
              const isActive = pathname === item.href;
              return (
                <Link key={item.href} href={item.href}>
                  <motion.div 
                    initial={false}
                    animate={isActive ? { x: 8 } : { x: 0 }}
                    className={`relative group flex items-center px-8 py-5 rounded-[2rem] transition-all duration-500 ${
                      isActive 
                      ? 'bg-brand-primary text-white shadow-2xl shadow-brand-primary/30' 
                      : 'text-surface-400 hover:bg-surface-50 hover:text-surface-900'
                    }`}
                  >
                    <item.icon className={`w-6 h-6 mr-4 transition-all duration-500 ${isActive ? 'text-white scale-110' : 'group-hover:text-brand-primary group-hover:scale-110'}`} />
                    <span className="font-black tracking-tight text-sm">{item.title}</span>
                    
                    <AnimatePresence>
                      {isActive && (
                        <motion.div 
                          layoutId="active-dot"
                          className="ml-auto w-1.5 h-1.5 bg-white rounded-full shadow-[0_0_10px_#fff]"
                        />
                      )}
                    </AnimatePresence>
                  </motion.div>
                </Link>
              );
            })}
          </nav>

          {/* Sidebar Footer */}
          <div className="p-8 space-y-6 relative z-10 border-t border-surface-100/30">
            {/* Language Selection in Sidebar */}
            <div className="px-4">
              <div className="text-[10px] font-black text-surface-300 uppercase tracking-[0.2em] mb-4 ml-2">Preferences</div>
              <LanguageSwitcher />
            </div>

            {/* User Profile / Logout Action */}
            <div className="bg-surface-50/50 rounded-[2.5rem] p-5 flex flex-col space-y-4 border border-surface-100/50 group/footer hover:bg-white hover:shadow-2xl transition-all duration-500">
              <Link href="/me" className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-brand-primary rounded-[1.25rem] shadow-sm flex items-center justify-center text-sm font-black text-white group-hover/footer:rotate-6 transition-transform">
                  {user?.fullName?.substring(0, 2).toUpperCase() || 'US'}
                </div>
                <div className="flex-1 overflow-hidden">
                  <div className="text-sm font-black text-surface-900 truncate">{user?.fullName || t('admin.title')}</div>
                  <div className="text-[10px] font-bold text-brand-primary uppercase tracking-widest flex items-center">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full mr-2 animate-pulse" />
                    {t('common.online')}
                  </div>
                </div>
              </Link>
              
              <button 
                onClick={logout}
                className="w-full h-12 bg-white rounded-2xl flex items-center justify-center space-x-2 text-red-500 font-black text-xs border border-red-50 hover:bg-red-50 transition-all active:scale-95 shadow-sm"
              >
                <LogOut className="w-4 h-4" />
                <span>{t('auth.logout')}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
