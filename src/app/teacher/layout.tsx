'use client';

import { useCallback, useState } from 'react';
import { TeacherSidebar } from '@/components/teacher/TeacherSidebar';
import { Menu } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

export default function TeacherLayout({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const closeSidebar = useCallback(() => setIsSidebarOpen(false), []);
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-white flex">
      <a href="#teacher-content" className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[110] focus:rounded-xl focus:bg-white focus:p-4 focus:text-surface-900">
        {t('common.skipToContent')}
      </a>
      <TeacherSidebar isOpen={isSidebarOpen} onClose={closeSidebar} />
      <div className="flex-1 flex flex-col min-w-0 lg:pl-72">
        <header className="lg:hidden h-16 bg-white border-b border-surface-200 px-4 flex items-center gap-3 sticky top-0 z-[60]">
          <button
            type="button"
            onClick={() => setIsSidebarOpen(true)}
            aria-label={t('common.openNavigation')}
            aria-expanded={isSidebarOpen}
            aria-controls="teacher-navigation"
            className="p-3 text-surface-700 rounded-xl hover:bg-surface-100"
          >
            <Menu className="w-5 h-5" aria-hidden="true" />
          </button>
          <span className="font-bold text-lg text-surface-900">MyStudents</span>
        </header>
        <div id="teacher-content" tabIndex={-1} className="w-full max-w-[1600px] mx-auto p-4 sm:p-6 lg:p-8 xl:p-10">
          {children}
        </div>
      </div>
    </div>
  );
}
