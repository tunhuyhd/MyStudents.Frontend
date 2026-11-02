'use client';
import { Navbar } from '@/components/Navbar';
import { useLanguage } from '@/context/LanguageContext';
export default function TeacherLayout({ children }: { children: React.ReactNode }) {
 const {t}=useLanguage();
 return <div className="club-workspace"><a href="#teacher-content" className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[110] focus:bg-white focus:p-4">{t('common.skipToContent')}</a><Navbar/><div id="teacher-content" tabIndex={-1} className="club-workspace-content">{children}</div></div>;
}
