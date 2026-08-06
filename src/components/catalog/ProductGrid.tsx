'use client';

import { useState, useEffect, useRef } from 'react';
import { Product } from '@/types';
import ProductCard from './ProductCard';
import SkeletonProductCard from './SkeletonProductCard';
import { motion } from 'framer-motion';

interface ProductGridProps {
  products: Product[];
  emptyMessage?: string;
}

const ITEMS_PER_PAGE = 12;

export default function ProductGrid({ products, emptyMessage = 'No se encontraron productos.' }: ProductGridProps) {
  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  // Reset visible count when products array changes (e.g., category change)
  useEffect(() => {
    setVisibleCount(ITEMS_PER_PAGE);
  }, [products]);

  useEffect(() => {
    const handleObserver = (entries: IntersectionObserverEntry[]) => {
      const target = entries[0];
      if (target.isIntersecting && visibleCount < products.length) {
        // Increment visible count when reaching the bottom Sentinel
        setTimeout(() => {
          setVisibleCount((prev) => Math.min(prev + ITEMS_PER_PAGE, products.length));
        }, 150); // slight artificial delay for smooth skeleton transition
      }
    };

    observerRef.current = new IntersectionObserver(handleObserver, {
      root: null,
      rootMargin: '200px', // start loading before the user hits the absolute bottom
      threshold: 0.1,
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
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: (index % ITEMS_PER_PAGE) * 0.05 }}
          >
            <ProductCard product={product} priority={index < 4} />
          </motion.div>
        ))}
        
        {/* Render skeletons if there are more products to load */}
        {hasMore && (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={`skeleton-${i}`}>
              <SkeletonProductCard />
            </div>
          ))
        )}
      </div>

      {/* Invisible sentinel element for infinite scrolling */}
      {hasMore && (
        <div ref={loadMoreRef} className="h-10 w-full mt-4" aria-hidden="true" />
      )}
    </>
  );
}
