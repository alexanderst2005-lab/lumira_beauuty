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
    
    // Doble verificación para ganarle a cualquier restauración tardía de Next.js
    const timer = setTimeout(resetScroll, 50);
    return () => clearTimeout(timer);
  }, []);

  return <>{children}</>;
}
