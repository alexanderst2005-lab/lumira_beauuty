'use client';

import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Product } from '@/types';
import ProductCard from '@/components/catalog/ProductCard';
import { preloadProductImages } from '@/utils/imagePreloader';
import { getSavedScrollPosition } from '@/utils/scrollRestoration';
import { useChristmas } from '@/context/ChristmasContext';

const getFeaturedAndNewProducts = (productsList: Product[], count: number) => {
  // Primero tomamos los que están marcados explícitamente como "Nuevo" o "Destacado"
  const priorityProducts = productsList.filter(p => 
    p.name && p.price > 0 && p.image !== '/images/products/placeholder.webp' &&
    (p.isNew || p.featured)
  );

  // Si no hay suficientes, rellenamos con otros productos de forma diversa
  let result = [...priorityProducts];

  if (result.length < count) {
    const remainingProducts = productsList.filter(p => 
      p.name && p.price > 0 && p.image !== '/images/products/placeholder.webp' &&
      !p.isNew && !p.featured
    );
    
    // Keep remaining in stable order to avoid SSR hydration mismatch
    result = [...result, ...remainingProducts];
  }

  // Si hay más del count requerido, cortamos
  return result.slice(0, count);
};

export default function FeaturedProducts({ initialProducts }: { initialProducts: Product[] }) {
  const { isChristmasActive } = useChristmas();
  const featured = getFeaturedAndNewProducts(initialProducts, 10);

  useEffect(() => {
    if (featured && featured.length > 0) {
      preloadProductImages(featured, 0, featured.length, 400);
    }
  }, [featured]);

  // Restaurar posición de scroll en la página de inicio
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const savedY = getSavedScrollPosition('/');
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

  return (
    <section className="py-16 sm:py-20 bg-white" id="featured">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-display font-medium text-txt mb-3">
            {isChristmasActive ? (
              <>Selección <span className="text-gradient italic">Navideña</span> ✨</>
            ) : (
              <>Productos <span className="text-gradient italic">destacados</span></>
            )}
          </h2>
          <p className="text-txt-secondary text-sm sm:text-base max-w-md mx-auto font-sans">
            {isChristmasActive
              ? 'Los consentidos y regalos ideales de esta mágica temporada'
              : 'Los favoritos de nuestras clientas'}
          </p>
        </motion.div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-5 lg:gap-6">
          {featured.map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.4, delay: index * 0.05 }}
            >
              <ProductCard product={product} priority={index < 4} />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
