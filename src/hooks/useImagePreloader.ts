'use client';

import { useEffect } from 'react';
import { Product } from '@/types';
import { preloadProductImages, preloadSingleImage } from '@/utils/imagePreloader';

/**
 * Hook para precargar automáticamente imágenes de productos antes de que se muestren en el viewport.
 */
export function useImagePreloader(
  products: Product[],
  startIndex: number = 0,
  count: number = 12,
  width: number = 400
) {
  useEffect(() => {
    if (typeof window === 'undefined') return;
    preloadProductImages(products, startIndex, count, width);
  }, [products, startIndex, count, width]);
}

export { preloadSingleImage, preloadProductImages };
