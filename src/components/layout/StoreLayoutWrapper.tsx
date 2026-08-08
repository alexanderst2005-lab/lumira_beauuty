'use client';

import { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { FavoritesProvider } from "@/context/FavoritesContext";
import { CartProvider } from "@/context/CartContext";
import MarqueeBanner from "@/components/layout/MarqueeBanner";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import CartDrawer from "@/components/cart/CartDrawer";
import FavoritesDrawer from "@/components/favorites/FavoritesDrawer";
import WhatsAppButton from "@/components/layout/WhatsAppButton";
import { Toaster } from "sonner";

export default function StoreLayoutWrapper({ children, config }: { children: React.ReactNode, config?: any }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isAdmin = pathname?.startsWith('/admin');

  // Corrección general de scroll: Forzar siempre el inicio en cualquier cambio de página/categoría
  useEffect(() => {
    if (isAdmin) return;
    
    const forceScrollToTop = () => {
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
      
      // Reseteo extremo: cualquier contenedor interno que se haya quedado scrolleado
      document.querySelectorAll('*').forEach((el) => {
        if (el.scrollTop > 0) {
          el.scrollTop = 0;
        }
      });
    };
    
    forceScrollToTop();
    
    // Bombardear con reset de scroll para vencer al sistema automático de Next.js
    requestAnimationFrame(() => {
      forceScrollToTop();
      setTimeout(forceScrollToTop, 50);
      setTimeout(forceScrollToTop, 150);
      setTimeout(forceScrollToTop, 350);
      setTimeout(forceScrollToTop, 600);
    });
  }, [pathname, searchParams]);

  const toasterOptions = {
    position: "bottom-center" as const,
    toastOptions: {
      style: {
        background: 'white',
        color: '#1A1A2E',
        border: '1px solid #F0E4EA',
        borderRadius: '9999px',
        padding: '12px 24px',
        fontWeight: '500',
        boxShadow: '0 10px 30px rgba(255, 92, 157, 0.1)',
      },
    }
  };

  if (isAdmin) {
    return (
      <>
        {children}
        <Toaster {...toasterOptions} />
      </>
    );
  }

  return (
    <FavoritesProvider>
      <CartProvider>
        <MarqueeBanner />
        <Header config={config} />
        <main className="min-h-screen">{children}</main>
        <Footer config={config} />
        <CartDrawer />
        <FavoritesDrawer />
        <WhatsAppButton config={config} />
        <Toaster {...toasterOptions} />
      </CartProvider>
    </FavoritesProvider>
  );
}
