'use client';

import { motion } from 'framer-motion';
import { Product } from '@/types';
import ProductCard from '@/components/catalog/ProductCard';

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
    
    // Sort remaining randomly or keep them
    const shuffledRemaining = remainingProducts.sort(() => 0.5 - Math.random());
    result = [...result, ...shuffledRemaining];
  }

  // Si hay más del count requerido, cortamos
  return result.slice(0, count);
};

export default function FeaturedProducts({ initialProducts }: { initialProducts: Product[] }) {
  const featured = getFeaturedAndNewProducts(initialProducts, 8);

  return (
    <section className="py-16 sm:py-20 bg-gradient-to-b from-white to-secondary-100/30" id="featured">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-heading font-bold text-text mb-3">
            Productos <span className="text-gradient">destacados</span>
          </h2>
          <p className="text-text-light text-sm sm:text-base max-w-md mx-auto">
            Los favoritos de nuestras clientas
          </p>
        </motion.div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
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
