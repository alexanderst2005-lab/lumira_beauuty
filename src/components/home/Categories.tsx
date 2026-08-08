'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { categories } from '@/data/products';

export default function Categories() {
  return (
    <section className="py-16 sm:py-20 bg-white" id="categorias">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-heading font-bold text-text mb-3">
            Explora nuestras <span className="text-gradient">categorías</span>
          </h2>
          <p className="text-text-light text-sm sm:text-base max-w-md mx-auto">
            Encuentra todo lo que necesitas para tu rutina de belleza
          </p>
        </motion.div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {categories.map((cat, index) => (
            <motion.div
              key={cat.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.4, delay: index * 0.06 }}
              className="h-full"
            >
              <Link
                href={`/catalogo?categoria=${cat.slug}`}
                className="group h-full flex flex-col items-center justify-center p-6 sm:p-8 rounded-2xl bg-gradient-to-br from-secondary-100/50 to-white border border-border hover:border-primary/20 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 transform hover:-translate-y-1 text-center"
                id={`category-${cat.slug}`}
                onClick={() => {
                  window.scrollTo({ top: 0, behavior: 'instant' });
                }}
              >
                <div className="text-3xl sm:text-4xl mb-3 transition-transform duration-300 group-hover:scale-110">
                  {cat.emoji}
                </div>
                <h3 className="text-sm sm:text-base font-heading font-semibold text-text group-hover:text-primary transition-colors duration-200">
                  {cat.name}
                </h3>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
