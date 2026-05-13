'use client';

import { PageTransition } from '@/components/PageTransition';
import { NatureCursor } from '@/components/NatureCursor';

export default function Template({ children }: { children: React.ReactNode }) {
  return (
    <>
      <NatureCursor />
      <PageTransition>
        {children}
      </PageTransition>
    </>
  );
}
