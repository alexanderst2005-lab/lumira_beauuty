'use client';

import { motion } from 'framer-motion';
import { Product } from '@/types';
import ProductCard from '@/components/catalog/ProductCard';

const getDiverseFeaturedProducts = (productsList: Product[], count: number) => {
  const byCategory: Record<string, Product[]> = {};
  
  // Filter out incomplete products and group by category
  productsList
    .filter(p => p.name && p.price > 0 && p.category && p.image !== '/images/products/placeholder.webp')
    .forEach(p => {
      if (!byCategory[p.category]) byCategory[p.category] = [];
      byCategory[p.category].push(p);
    });

  const categories = Object.keys(byCategory);
  const featured: Product[] = [];
  const usedIds = new Set<string>();
  
  let lastCat = '';

  while (featured.length < count && categories.length > 0) {
    // Find next category different from the last one
    let catIndex = categories.findIndex(c => c !== lastCat);
    if (catIndex === -1) catIndex = 0; // fallback if only one category remains
    
    const cat = categories[catIndex];
    // Find first unused product in this category
    const available = byCategory[cat].filter(p => !usedIds.has(p.id));
    
    if (available.length > 0) {
      const p = available[0];
      featured.push(p);
      usedIds.add(p.id);
      lastCat = cat;
      // Rotate the used category to the end of the list
      categories.push(categories.splice(catIndex, 1)[0]);
    } else {
      // No more products in this category, remove it
      categories.splice(catIndex, 1);
    }
  }

  return featured;
};

export default function FeaturedProducts({ initialProducts }: { initialProducts: Product[] }) {
  const featured = getDiverseFeaturedProducts(initialProducts, 8);

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
