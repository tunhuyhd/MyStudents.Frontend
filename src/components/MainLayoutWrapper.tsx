'use client';

import { useAuth } from '@/context/AuthContext';
import { TeacherSidebar } from '@/components/teacher/TeacherSidebar';
import { Navbar } from '@/components/Navbar';
import { usePathname } from 'next/navigation';
import { UserRoles } from '@/constants/roles';

import { useState, useEffect } from 'react';

export function MainLayoutWrapper({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Close sidebar when navigating
  useEffect(() => {
    setIsSidebarOpen(false);
  }, [pathname]);

  // Don't show sidebar for Auth pages or Admin pages (Admin has its own logic or zodiac theme)
  const isAuthPage = pathname.startsWith('/auth');
  const isAdminPage = pathname.startsWith('/admin');
  
  // Show Sidebar if logged in as User (Teacher) and NOT on admin/auth pages
  const showSidebar = !loading && user && user.role === UserRoles.User && !isAuthPage && !isAdminPage;
  const isHomePage = pathname === '/';

  if (showSidebar) {
    return (
      <div className={`flex min-h-screen ${isHomePage ? 'bg-transparent' : 'bg-surface-50'}`}>
        <TeacherSidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
        <div className="flex-1 flex flex-col overflow-hidden relative">
          {/* Ensure landing orbs are visible if on home page */}
          <Navbar onMenuClick={() => setIsSidebarOpen(true)} />
          <main className="flex-1 relative z-10">
            {children}
          </main>
        </div>
      </div>
    );
  }

  // Default layout (Landing, Auth, Admin)
  return (
    <div className="min-h-screen flex flex-col">
      {!isAdminPage && <Navbar />}
      <main className="flex-1">
        {children}
      </main>
    </div>
  );
}
