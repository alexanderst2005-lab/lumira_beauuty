'use client';

import { useState, useEffect, useRef } from 'react';
import { Product } from '@/types';
import ProductCard from './ProductCard';
import SkeletonProductCard from './SkeletonProductCard';
import { motion } from 'framer-motion';
import { preloadProductImages } from '@/utils/imagePreloader';

interface ProductGridProps {
  products: Product[];
  emptyMessage?: string;
}

const ITEMS_PER_PAGE = 16;

export default function ProductGrid({ products, emptyMessage = 'No se encontraron productos.' }: ProductGridProps) {
  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  // Reset visible count when products array changes (e.g., category change)
  useEffect(() => {
    setVisibleCount(ITEMS_PER_PAGE);
    // Precargar inmediatamente las primeras imágenes y el siguiente lote anticipado
    preloadProductImages(products, 0, ITEMS_PER_PAGE * 2, 400);
  }, [products]);

  // Precargar de forma continua las imágenes de los productos que vendrán más abajo
  useEffect(() => {
    preloadProductImages(products, visibleCount, ITEMS_PER_PAGE * 2, 400);
  }, [visibleCount, products]);

  useEffect(() => {
    const handleObserver = (entries: IntersectionObserverEntry[]) => {
      const target = entries[0];
      if (target.isIntersecting && visibleCount < products.length) {
        // Carga inmediata de los siguientes productos sin delay artificial
        setVisibleCount((prev) => Math.min(prev + ITEMS_PER_PAGE, products.length));
      }
    };

    observerRef.current = new IntersectionObserver(handleObserver, {
      root: null,
      rootMargin: '900px', // Precargar y mostrar mucho antes de que el cliente llegue al final
      threshold: 0.05,
    });

    if (loadMoreRef.current) {
      observerRef.current.observe(loadMoreRef.current);
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [visibleCount, products.length]);

  if (products.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="text-5xl mb-4">🔍</div>
        <p className="text-text-light text-base">{emptyMessage}</p>
      </div>
    );
  }

  const visibleProducts = products.slice(0, visibleCount);
  const hasMore = visibleCount < products.length;

  return (
    <>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
        {visibleProducts.map((product, index) => (
          <motion.div
            key={product.id}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, delay: (index % ITEMS_PER_PAGE) * 0.03 }}
          >
            <ProductCard product={product} priority={index < 4} />
          </motion.div>
        ))}
        
        {/* Skeletons como resguardo solo mientras se agregan nodos */}
        {hasMore && (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={`skeleton-${i}`}>
              <SkeletonProductCard />
            </div>
          ))
        )}
      </div>

      {/* Elemento centinela para scroll infinito anticipado */}
      {hasMore && (
        <div ref={loadMoreRef} className="h-10 w-full mt-4" aria-hidden="true" />
      )}
    </>
  );
}
