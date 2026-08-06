'use client';

import { motion } from 'framer-motion';
import { products } from '@/data/products';
import ProductCard from '@/components/catalog/ProductCard';

export default function FeaturedProducts() {
  // Show first 8 products as featured
  const featured = products.slice(0, 8);

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
              <ProductCard product={product} />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
