'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, Users, LayoutDashboard, ChevronRight, X } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function TeacherSidebar({ isOpen, onClose }: SidebarProps) {
  const { t } = useLanguage();
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

      <div className={`fixed lg:sticky top-0 left-0 z-50 w-80 h-screen bg-white border-r border-surface-100 flex flex-col transition-transform duration-300 transform ${
        isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}>
        {/* Sidebar Header */}
        <div className="p-8 pb-10 flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="w-10 h-10 bg-brand-primary rounded-xl flex items-center justify-center shadow-lg shadow-brand-primary/20 group-hover:scale-110 transition-transform">
              <LayoutDashboard className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-black text-surface-900 tracking-tight">Teacher Hub</span>
          </Link>
          <button onClick={onClose} className="p-2 hover:bg-surface-50 rounded-xl lg:hidden">
            <X className="w-5 h-5 text-surface-400" />
          </button>
        </div>

      {/* Menu Items */}
      <nav className="flex-1 px-4 space-y-2">
        {menuItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link key={item.href} href={item.href}>
              <div className={`relative group flex items-center px-6 py-4 rounded-2xl transition-all duration-300 ${
                isActive 
                ? 'bg-brand-primary/5 text-brand-primary' 
                : 'text-surface-400 hover:bg-surface-50 hover:text-surface-600'
              }`}>
                {isActive && (
                  <motion.div 
                    layoutId="active-sidebar"
                    className="absolute left-0 w-1 h-8 bg-brand-primary rounded-r-full"
                  />
                )}
                <item.icon className={`w-5 h-5 mr-4 transition-colors ${isActive ? 'text-brand-primary' : 'group-hover:text-brand-primary/50'}`} />
                <span className="font-bold tracking-tight">{item.title}</span>
                <ChevronRight className={`w-4 h-4 ml-auto transition-all duration-300 ${
                  isActive ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-2'
                }`} />
              </div>
            </Link>
          );
        })}
      </nav>

      {/* Sidebar Footer */}
      <div className="p-8 border-t border-surface-50">
        <div className="bg-surface-50 rounded-2xl p-4 flex items-center space-x-3">
          <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center text-xs font-black text-brand-primary">
            AD
          </div>
          <div>
            <div className="text-xs font-black text-surface-900">Admin Mode</div>
            <div className="text-[10px] font-bold text-surface-400 uppercase tracking-widest">v1.0.2</div>
          </div>
        </div>
      </div>
      </div>
    </>
  );
}
