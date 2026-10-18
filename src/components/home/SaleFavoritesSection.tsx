'use client';

import { useMemo, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Sparkles, ArrowRight, Flame } from 'lucide-react';
import { Product } from '@/types';
import ProductCard from '@/components/catalog/ProductCard';
import { useCampaignPromotions } from '@/context/CampaignPromotionsContext';
import { preloadProductImages } from '@/utils/imagePreloader';

interface SaleFavoritesSectionProps {
  initialProducts: Product[];
}

export default function SaleFavoritesSection({ initialProducts }: SaleFavoritesSectionProps) {
  const { activeDiscounts, getProductDiscount } = useCampaignPromotions();

  // Filtrar exclusivamente productos que tienen un descuento real y vigente (campaña o individual)
  const saleProducts = useMemo(() => {
    if (!initialProducts || initialProducts.length === 0) return [];

    const seenIds = new Set<string>();
    const eligible: Product[] = [];

    for (const p of initialProducts) {
      if (!p || !p.id || p.stock === 0) continue;
      if (seenIds.has(p.id)) continue;

      const discountInfo = getProductDiscount(p.id, p.price, p.originalPrice);

      // Regla estricta: Solo productos con oferta válida vigente
      if (discountInfo.hasDiscount && discountInfo.finalPrice > 0 && discountInfo.finalPrice < discountInfo.originalPrice) {
        seenIds.add(p.id);
        eligible.push({
          ...p,
          price: discountInfo.finalPrice,
          originalPrice: discountInfo.originalPrice,
          discountPercent: discountInfo.discountPercent,
          hasDiscount: true,
          savings: discountInfo.savings
        });
      }
    }

    // Ordenar por mayor porcentaje de ahorro primero
    return eligible.sort((a, b) => (b.discountPercent || 0) - (a.discountPercent || 0));
  }, [initialProducts, activeDiscounts, getProductDiscount]);

  // Precargar imágenes de ofertas para máxima velocidad de renderizado
  useEffect(() => {
    if (saleProducts && saleProducts.length > 0) {
      preloadProductImages(saleProducts, 0, Math.min(10, saleProducts.length), 400);
    }
  }, [saleProducts]);

  // REGLA CRÍTICA 6: Si no existe ningún producto con oferta válida, OCULTAR COMPLETAMENTE la sección.
  // No mostrar título, ni espacio vacío, ni cuadrícula vacía, ni ningún mensaje.
  if (saleProducts.length === 0) {
    return null;
  }

  return (
    <section 
      id="ofertas-favoritos" 
      className="py-14 sm:py-20 bg-gradient-to-b from-[#FFF5F8]/70 via-white to-white relative overflow-hidden"
    >
      {/* Detalle decorativo sutil de fondo */}
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-pink-200/60 to-transparent pointer-events-none" />
      <div className="absolute -top-24 right-0 w-96 h-96 bg-pink-100/40 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 left-0 w-96 h-96 bg-rose-50/50 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Cabecera de la sección */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.5 }}
          className="text-center mb-10 sm:mb-14"
        >
          {/* Badge pill */}
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 mb-3.5 rounded-full bg-gradient-to-r from-rose-500/10 via-pink-500/10 to-rose-500/10 border border-rose-200/60 text-rose-600 text-[11px] sm:text-xs font-bold tracking-wider uppercase">
            <Flame className="w-3.5 h-3.5 text-rose-500 fill-rose-500 animate-pulse" />
            <span>Precios Especiales de Temporada</span>
          </div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-display font-medium text-txt mb-3 tracking-tight">
            Nuestros favoritos en <span className="text-gradient italic">oferta</span>
          </h2>
          
          <p className="text-txt-secondary text-sm sm:text-base max-w-lg mx-auto font-sans leading-relaxed">
            Aprovecha descuentos exclusivos por tiempo limitado en los productos más amados de nuestro catálogo.
          </p>
        </motion.div>

        {/* Cuadrícula responsive de productos en oferta */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-5 lg:gap-6">
          {saleProducts.map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.4, delay: Math.min(index * 0.05, 0.4) }}
            >
              <ProductCard product={product} priority={index < 5} />
            </motion.div>
          ))}
        </div>

        {/* Botón hacia el catálogo filtrado */}
        <div className="mt-10 sm:mt-14 text-center">
          <Link
            href="/catalogo?ofertas=true"
            className="inline-flex items-center gap-2 px-6 sm:px-8 py-3 rounded-full bg-txt hover:bg-black text-white text-xs sm:text-sm font-semibold tracking-wide uppercase transition-all duration-300 shadow-sm hover:shadow-lg hover:scale-105 active:scale-95"
          >
            <span>Ver todas las ofertas en el catálogo</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
