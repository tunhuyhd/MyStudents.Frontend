'use client';

import { Navbar } from '@/components/Navbar';
import { usePathname } from 'next/navigation';

export function MainLayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // Pages that handle their own structural layouts (e.g., Sidebar)
  const isTeacherPage = pathname.startsWith('/teacher');
  const isAdminPage = pathname.startsWith('/admin');
  const isAuthPage = pathname.startsWith('/auth');

  // If it's a teacher or admin page, just render children.
  // Those directories have their own layout.tsx for structural elements.
  if (isTeacherPage || isAdminPage) {
    return <>{children}</>;
  }

  // Default layout for Landing and Auth pages
  return (
    <div className="min-h-screen flex flex-col">
      {!isAuthPage && <Navbar />}
      <div className="flex-1">
        {children}
      </div>
    </div>
  );
}
