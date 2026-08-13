'use client';

import { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { FavoritesProvider } from "@/context/FavoritesContext";
import { CartProvider } from "@/context/CartContext";
import MarqueeBanner from "@/components/layout/MarqueeBanner";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import CartDrawer from "@/components/cart/CartDrawer";
import FavoritesDrawer from "@/components/favorites/FavoritesDrawer";
import WhatsAppButton from "@/components/layout/WhatsAppButton";
import { Toaster } from "sonner";

import { getSavedScrollPosition } from '@/utils/scrollRestoration';

function ScrollRestorer({ isAdmin }: { isAdmin: boolean }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!isAdmin && typeof window !== 'undefined') {
      const savedY = getSavedScrollPosition();
      if (savedY === null || savedY === 0) {
        window.scrollTo(0, 0);
        document.body.scrollTop = 0;
        document.documentElement.scrollTop = 0;
      }
    }
  }, [pathname, searchParams, isAdmin]);

  return null;
}

export default function StoreLayoutWrapper({ children, config }: { children: React.ReactNode, config?: any }) {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith('/admin') ?? false;

  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.history.scrollRestoration = 'auto';
    }
  }, []);

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
        <Suspense fallback={null}><ScrollRestorer isAdmin={isAdmin} /></Suspense>
        {children}
        <Toaster {...toasterOptions} />
      </>
    );
  }

  return (
    <FavoritesProvider>
      <CartProvider>
        <Suspense fallback={null}><ScrollRestorer isAdmin={isAdmin} /></Suspense>
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
