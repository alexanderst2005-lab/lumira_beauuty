'use client';

import { useEffect } from 'react';
import { getSavedScrollPosition } from '@/utils/scrollRestoration';

export default function Template({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const savedY = getSavedScrollPosition();
    // Si NO hay posición guardada para esta URL, es una navegación nueva -> scroll al tope
    if (savedY === null || savedY === 0) {
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
      document.body.scrollTop = 0;
      document.documentElement.scrollTop = 0;
    }
  }, []);

  return <>{children}</>;
}
