'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';
import { categories } from '@/data/products';
import { useChristmas } from '@/context/ChristmasContext';

// Fotografía asociada a cada categoría (por slug). Si falta alguna, la tarjeta
// muestra un fondo suave con el nombre, sin romperse.
const categoryImages: Record<string, string> = {
  'pestanas-punto-a-punto': '/images/categories/pestanas-punto-a-punto.jpg',
  'pestanas-enteras': '/images/categories/pestanas-enteras.jpg',
  makeup: '/images/categories/makeup.jpg',
  skincare: '/images/categories/skincare.jpg',
  corporal: '/images/categories/corporal.jpg',
  'productos-cabello': '/images/categories/productos-cabello.jpg',
  accesorios: '/images/categories/accesorios.jpg',
  todos: '/images/categories/todos.jpg',
};

export default function Categories() {
  const { isChristmasActive } = useChristmas();

  return (
    <section className="py-14 sm:py-20 bg-white" id="categorias">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8 sm:mb-12"
        >
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-display font-medium text-txt mb-3 tracking-tight">
            Explora nuestras <span className="text-gradient italic">categorías</span>
          </h2>
          <p className="text-txt-secondary text-sm sm:text-base max-w-md mx-auto font-sans">
            {isChristmasActive
              ? 'Encuentra el regalo perfecto o consiéntete en esta mágica temporada 🎁'
              : 'Encuentra todo lo que necesitas para tu rutina de belleza'}
          </p>
        </motion.div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">
          {categories.map((cat, index) => {
            const image = categoryImages[cat.slug];
            return (
              <motion.div
                key={cat.id}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ duration: 0.4, delay: (index % 4) * 0.06 }}
              >
                <Link
                  href={`/catalogo?categoria=${cat.slug}`}
                  className="group relative block aspect-square lg:aspect-[4/5] overflow-hidden rounded-2xl bg-secondary-100 border border-border-light shadow-sm hover:shadow-xl hover:shadow-primary/10 transition-all duration-500"
                  id={`category-${cat.slug}`}
                  onClick={() => {
                    window.scrollTo({ top: 0, behavior: 'instant' });
                  }}
                >
                  {image && (
                    <Image
                      src={image}
                      alt={cat.name}
                      fill
                      sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                      className="object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105"
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#4a0f2e]/75 via-[#4a0f2e]/10 to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 p-3 sm:p-5 flex items-end justify-between gap-2">
                    <h3 className="text-white font-display text-lg sm:text-2xl font-medium leading-tight [text-wrap:balance] drop-shadow">
                      {cat.name}
                    </h3>
                    <span className="hidden sm:flex shrink-0 w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm border border-white/40 items-center justify-center text-white opacity-0 translate-y-1 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
                      <ArrowUpRight className="w-4 h-4" />
                    </span>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
