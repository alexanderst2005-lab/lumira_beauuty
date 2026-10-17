'use client';

import { useEffect } from 'react';
import { Product } from '@/types';
import ProductCard from './ProductCard';
import { motion } from 'framer-motion';
import { preloadProductImages } from '@/utils/imagePreloader';
import { getSavedScrollPosition } from '@/utils/scrollRestoration';

interface ProductGridProps {
  /** Productos de la página actual (la paginación la controla el padre). */
  products: Product[];
  emptyMessage?: string;
  /** Productos de la página siguiente, para precargar sus imágenes. */
  nextPageProducts?: Product[];
}

export default function ProductGrid({
  products,
  emptyMessage = 'No se encontraron productos.',
  nextPageProducts = [],
}: ProductGridProps) {
  // Restaurar la posición de scroll al regresar desde el detalle de un producto
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const savedY = getSavedScrollPosition();
    if (savedY && savedY > 0) {
      const restore = () => {
        window.scrollTo({ top: savedY, behavior: 'instant' });
      };

      requestAnimationFrame(() => {
        restore();
        setTimeout(restore, 50);
        setTimeout(restore, 150);
      });
    }
  }, []);

  // Precargar las imágenes de la página siguiente
  useEffect(() => {
    if (nextPageProducts.length > 0) {
      preloadProductImages(nextPageProducts, 0, nextPageProducts.length, 400);
    }
  }, [nextPageProducts]);

  if (products.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="text-5xl mb-4">🔍</div>
        <p className="text-text-light text-base">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-5 lg:gap-6">
      {products.map((product, index) => (
        <motion.div
          key={product.id}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, delay: index * 0.02 }}
        >
          <ProductCard product={product} priority={index < 4} />
        </motion.div>
      ))}
    </div>
  );
}
