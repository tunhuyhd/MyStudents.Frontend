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
            className="fixed inset-0 bg-surface-900/60 backdrop-blur-sm z-[9990] lg:hidden"
          />
        )}
      </AnimatePresence>

      <div className={`fixed lg:sticky top-0 left-0 z-[9995] w-72 h-screen flex flex-col transition-transform duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] transform ${
        isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}>
        <div className="flex-1 m-4 mr-0 bg-white/80 backdrop-blur-2xl border border-white rounded-[3rem] shadow-[0_30px_60px_-15px_rgba(0,0,0,0.05)] flex flex-col overflow-hidden relative group/sidebar">
          {/* Internal Decorative Aura */}
          <div className="absolute -top-20 -left-20 w-40 h-40 bg-brand-primary/10 aura-bg rounded-full animate-float pointer-events-none" />

          {/* Sidebar Header */}
          <div className="p-8 pb-10 flex items-center justify-between relative z-10">
            <Link href="/" className="flex items-center space-x-3 group/logo">
              <div className="w-10 h-10 bg-brand-primary rounded-[1rem] flex items-center justify-center shadow-2xl shadow-brand-primary/30 group-hover/logo:rotate-[15deg] transition-all duration-500">
                <LayoutDashboard className="w-5 h-5 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="text-lg font-black text-surface-900 tracking-tighter leading-none">Teacher</span>
                <span className="text-[9px] font-black text-brand-primary uppercase tracking-[0.3em] leading-none mt-1">Lounge</span>
              </div>
            </Link>
            <button onClick={onClose} className="p-2 hover:bg-surface-50 rounded-xl lg:hidden text-surface-400">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Menu Items */}
          <nav className="flex-1 px-3 space-y-2.5 relative z-10">
            {menuItems.map((item, index) => {
              const isActive = pathname === item.href;
              return (
                <Link key={item.href} href={item.href}>
                  <motion.div 
                    initial={false}
                    animate={isActive ? { x: 4 } : { x: 0 }}
                    className={`relative group flex items-center px-6 py-4 rounded-[1.75rem] transition-all duration-500 ${
                      isActive 
                      ? 'bg-brand-primary text-white shadow-2xl shadow-brand-primary/30' 
                      : 'text-surface-400 hover:bg-surface-50 hover:text-surface-900'
                    }`}
                  >
                    <item.icon className={`w-5 h-5 mr-3 transition-all duration-500 ${isActive ? 'text-white scale-110' : 'group-hover:text-brand-primary group-hover:scale-110'}`} />
                    <span className="font-black tracking-tight text-xs">{item.title}</span>
                    
                    <AnimatePresence>
                      {isActive && (
                        <motion.div 
                          layoutId="active-dot"
                          className="ml-auto w-1 h-1 bg-white rounded-full shadow-[0_0_10px_#fff]"
                        />
                      )}
                    </AnimatePresence>
                  </motion.div>
                </Link>
              );
            })}
          </nav>

          {/* Sidebar Footer */}
          <div className="p-6 space-y-5 relative z-10 border-t border-surface-100/30">
            {/* Language Selection in Sidebar */}
            <div className="px-2">
              <div className="text-[9px] font-black text-surface-300 uppercase tracking-[0.2em] mb-3 ml-2">Preferences</div>
              <LanguageSwitcher />
            </div>

            {/* User Profile / Logout Action */}
            <div className="bg-surface-50/50 rounded-[2rem] p-4 flex flex-col space-y-4 border border-surface-100/50 group/footer hover:bg-white hover:shadow-2xl transition-all duration-500">
              <Link href="/me" className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-brand-primary rounded-[0.8rem] shadow-sm flex items-center justify-center text-xs font-black text-white group-hover/footer:rotate-6 transition-transform">
                  {user?.fullName?.substring(0, 2).toUpperCase() || 'US'}
                </div>
                <div className="flex-1 overflow-hidden">
                  <div className="text-xs font-black text-surface-900 truncate">{user?.fullName || t('admin.title')}</div>
                  <div className="text-[9px] font-bold text-brand-primary uppercase tracking-widest flex items-center">
                    <div className="w-1 h-1 bg-green-500 rounded-full mr-1.5 animate-pulse" />
                    {t('common.online')}
                  </div>
                </div>
              </Link>
              
              <button 
                onClick={logout}
                className="w-full h-10 bg-white rounded-xl flex items-center justify-center space-x-2 text-red-500 font-black text-[10px] border border-red-50 hover:bg-red-50 transition-all active:scale-95 shadow-sm"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>{t('auth.logout')}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
