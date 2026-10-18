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
import PromotionalPopup from "@/components/common/PromotionalPopup";
import { CampaignPromotionsProvider } from "@/context/CampaignPromotionsContext";
import { ChristmasProvider, useChristmas } from "@/context/ChristmasContext";
import ChristmasSeasonEffects from "@/components/christmas/ChristmasSeasonEffects";
import { Toaster } from "sonner";


import { getSavedScrollPosition } from '@/utils/scrollRestoration';

function ScrollRestorer({ isAdmin }: { isAdmin: boolean }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!isAdmin && typeof window !== 'undefined') {
      // En la página principal (/), SIEMPRE comenzar desde arriba en la Hero
      if (pathname === '/') {
        try {
          sessionStorage.removeItem('lumira_scroll_pos_/');
        } catch {}
        window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
        document.body.scrollTop = 0;
        document.documentElement.scrollTop = 0;
        return;
      }

      const savedY = getSavedScrollPosition();
      if (savedY !== null && savedY > 0) {
        const restore = () => {
          window.scrollTo({ top: savedY, behavior: 'instant' });
        };
        requestAnimationFrame(() => {
          restore();
          setTimeout(restore, 50);
        });
      } else {
        window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
        document.body.scrollTop = 0;
        document.documentElement.scrollTop = 0;
      }
    }
  }, [pathname, searchParams, isAdmin]);

  return null;
}

function StoreContentWrapper({
  children,
  isAdmin,
  isHome,
  config,
  toasterOptions,
}: {
  children: React.ReactNode;
  isAdmin: boolean;
  isHome: boolean;
  config?: any;
  toasterOptions: any;
}) {
  const { isChristmasActive } = useChristmas();

  return (
    <div className={`min-h-screen transition-colors duration-500 ${isChristmasActive ? 'christmas-mode' : ''}`}>
      <Suspense fallback={null}><ScrollRestorer isAdmin={isAdmin} /></Suspense>
      {isHome && <MarqueeBanner />}
      <Header config={config} />
      <ChristmasSeasonEffects />
      <main className={`min-h-screen overflow-x-clip ${!isHome ? 'pt-16 sm:pt-20' : ''}`}>{children}</main>
      <Footer config={config} />
      <CartDrawer />
      <FavoritesDrawer />
      <WhatsAppButton config={config} />
      <PromotionalPopup />
      <Toaster {...toasterOptions} />
    </div>
  );
}

export default function StoreLayoutWrapper({ children, config }: { children: React.ReactNode, config?: any }) {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith('/admin') ?? false;

  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.history.scrollRestoration = 'manual';
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

  const isHome = !pathname || pathname === '/' || pathname === '';

  return (
    <ChristmasProvider initialConfig={config?.christmasConfig}>
      <CampaignPromotionsProvider>
        <FavoritesProvider>
          <CartProvider>
            <StoreContentWrapper
              isAdmin={isAdmin}
              isHome={isHome}
              config={config}
              toasterOptions={toasterOptions}
            >
              {children}
            </StoreContentWrapper>
          </CartProvider>
        </FavoritesProvider>
      </CampaignPromotionsProvider>
    </ChristmasProvider>
  );
}
