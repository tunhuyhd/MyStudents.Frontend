'use client';

import { useState } from 'react';
import { TeacherSidebar } from '@/components/teacher/TeacherSidebar';
import { Menu, Search, Bell } from 'lucide-react';

export default function TeacherLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#FDFEFE] flex">
      {/* Sidebar - Fixed on the left */}
      <TeacherSidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      {/* Content Area - Shifted by sidebar width (80) on desktop */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-80">
        
        {/* Mobile Header - Only visible on small screens */}
        <header className="lg:hidden h-20 bg-white border-b border-surface-100 px-6 flex items-center justify-between sticky top-0 z-[50]">
          <button 
            onClick={() => setIsSidebarOpen(true)}
            className="p-2 text-surface-400"
          >
            <Menu className="w-6 h-6" />
          </button>
          <span className="font-black text-lg text-surface-900 tracking-tighter">MyStudents</span>
          <div className="w-10 h-10 rounded-full bg-surface-50 flex items-center justify-center">
            <Bell className="w-5 h-5 text-surface-300" />
          </div>
        </header>

        {/* Desktop Header - Simple and Clean */}
        <header className="hidden lg:flex h-24 px-12 items-center justify-end">
          <div className="flex items-center space-x-4">
            <button className="w-12 h-12 rounded-2xl bg-white border border-surface-100 flex items-center justify-center text-surface-300 hover:text-brand-primary hover:border-brand-primary/20 transition-all">
              <Search className="w-5 h-5" />
            </button>
            <button className="w-12 h-12 rounded-2xl bg-white border border-surface-100 flex items-center justify-center text-surface-300 hover:text-brand-primary hover:border-brand-primary/20 transition-all">
              <Bell className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* Main Page Content */}
        <main className="p-6 md:p-12 pt-4 md:pt-4">
          {children}
        </main>
      </div>
    </div>
  );
}
