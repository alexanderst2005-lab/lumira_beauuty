'use client';

import { useEffect } from 'react';

export default function Template({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Scroll instantáneo al tope en cada cambio de ruta.
    // Template se monta de nuevo en cada navegación en App Router.
    const resetScroll = () => {
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
      document.body.scrollTop = 0;
      document.documentElement.scrollTop = 0;
    };
    
    resetScroll();
    
    // Aniquilar cualquier intento de Next.js de restaurar el scroll
    requestAnimationFrame(() => {
      resetScroll();
      setTimeout(resetScroll, 10);
      setTimeout(resetScroll, 50);
      setTimeout(resetScroll, 100);
      setTimeout(resetScroll, 300);
      setTimeout(resetScroll, 500);
    });
  }, []);

  return <>{children}</>;
}
