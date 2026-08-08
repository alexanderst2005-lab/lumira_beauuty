import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import StoreLayoutWrapper from "@/components/layout/StoreLayoutWrapper";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
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

import { getStoreConfig } from "@/data/notion";

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const config = await getStoreConfig();

  return (
    <html lang="es" className={`${inter.variable}`}>
      <body className="font-sans antialiased text-txt bg-bg selection:bg-rose-200 selection:text-primary-darker">
        <StoreLayoutWrapper config={config}>
          {children}
        </StoreLayoutWrapper>
      </body>
    </html>
  );
}
