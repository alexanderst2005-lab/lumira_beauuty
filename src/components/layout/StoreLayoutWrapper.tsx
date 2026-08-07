'use client';

import { usePathname } from 'next/navigation';
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
  const isAdmin = pathname?.startsWith('/admin');

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
