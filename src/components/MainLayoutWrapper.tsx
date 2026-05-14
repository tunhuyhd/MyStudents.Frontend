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
      <div className={`flex min-h-screen relative overflow-hidden ${isHomePage ? 'bg-transparent' : 'bg-surface-50'}`}>
        {/* Global Organic Decoration */}
        <div className="absolute top-[-20%] right-[-10%] w-[60%] h-[60%] bg-brand-primary/5 aura-bg rounded-full animate-float pointer-events-none" />
        <div className="absolute bottom-[-20%] left-[-10%] w-[50%] h-[50%] bg-brand-secondary/5 aura-bg rounded-full animate-float pointer-events-none" style={{ animationDelay: '-7s' }} />

        <TeacherSidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
        
        <div className="flex-1 flex flex-col overflow-hidden relative">
          {/* Top Bar - Only visible on mobile since Sidebar handles everything on desktop */}
          <div className="lg:hidden sticky top-0 z-50">
            <Navbar onMenuClick={() => setIsSidebarOpen(true)} />
          </div>
          
          <main className="flex-1 relative z-10 overflow-y-auto scrollbar-hide">
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
