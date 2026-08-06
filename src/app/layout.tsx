import type { Metadata } from "next";
import { Playfair_Display, Nunito } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/context/CartContext";
import MarqueeBanner from "@/components/layout/MarqueeBanner";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import CartDrawer from "@/components/cart/CartDrawer";
import WhatsAppButton from "@/components/layout/WhatsAppButton";
import { Toaster } from "sonner";

const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-heading",
  display: "swap",
});

const nunito = Nunito({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Lumira Beauty | Maquillaje, Skincare & Pestañas",
  description:
    "Tu tienda de belleza online. Encuentra maquillaje, skincare, pestañas y accesorios de las mejores marcas al mejor precio. Envíos a todo Colombia.",
  keywords: [
    "maquillaje",
    "skincare",
    "pestañas",
    "belleza",
    "Lumira Beauty",
    "cosméticos",
    "cuidado de la piel",
    "accesorios de belleza",
  ],
  openGraph: {
    title: "Lumira Beauty | Maquillaje, Skincare & Pestañas",
    description:
      "Tu tienda de belleza online. Encuentra maquillaje, skincare, pestañas y accesorios de las mejores marcas al mejor precio.",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`${playfair.variable} ${nunito.variable}`}>
      <body className="font-body antialiased">
        <CartProvider>
          <MarqueeBanner />
          <Header />
          <main className="min-h-screen">{children}</main>
          <Footer />
          <CartDrawer />
          <WhatsAppButton />
          <Toaster 
            position="bottom-center"
            toastOptions={{
              style: {
                background: 'white',
                color: '#1A1A2E',
                border: '1px solid #F0E4EA',
                borderRadius: '9999px',
                padding: '12px 24px',
                fontWeight: '500',
                boxShadow: '0 10px 30px rgba(255, 92, 157, 0.1)',
              },
            }}
          />
        </CartProvider>
      </body>
    </html>
  );
}
