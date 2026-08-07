'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';

const slides = [
  {
    id: 1,
    badge: '✨ Tu belleza, tu momento',
    title: 'Descubre tu belleza con Lumira Beauty ✨',
    desc: 'Encuentra maquillaje, skincare, pestañas y accesorios en un solo lugar.',
    btnText: 'Comprar ahora',
    btnHref: '/catalogo',
    bg: 'linear-gradient(135deg, #FFFFFF 0%, #FFF5F9 50%, #FFE6F0 100%)',
    emoji: '💖',
    decorEmoji: '✨',
  },
  {
    id: 2,
    badge: '💖 Calidad seleccionada para ti',
    title: 'Cuida tu piel todos los días 🧴',
    desc: 'Descubre Bioaqua, Bloomshell y todos nuestros productos para una rutina facial completa.',
    btnText: 'Ver Skincare',
    btnHref: '/catalogo?categoria=skincare',
    bg: 'linear-gradient(135deg, #FAFAFA 0%, #FFF5F9 50%, #FFEDF4 100%)',
    emoji: '🧴',
    decorEmoji: '🌸',
  },
  {
    id: 3,
    badge: '🌸 Descubre las últimas novedades',
    title: 'La mirada perfecta empieza aquí 👁️',
    desc: 'Pestañas punto a punto, volumen, ojo de gato y mucho más.',
    btnText: 'Ver Pestañas',
    btnHref: '/catalogo?categoria=pestanas-enteras',
    bg: 'linear-gradient(135deg, #FFFFFF 0%, #FFEDF4 40%, #FFF5F9 100%)',
    emoji: '👁️',
    decorEmoji: '💫',
  },
  {
    id: 4,
    badge: '🛍️ Compra fácil y rápida',
    title: 'Resalta tu belleza 💄',
    desc: 'Correctores, rubores, gloss, polvos, tintas y mucho más para completar tu maquillaje.',
    btnText: 'Ver Makeup',
    btnHref: '/catalogo?categoria=makeup',
    bg: 'linear-gradient(135deg, #FAFAFA 0%, #FFF5F9 60%, #FFEDF4 100%)',
    emoji: '💄',
    decorEmoji: '💋',
  },
  {
    id: 5,
    badge: '🚚 Envíos a toda Colombia',
    title: 'Trabajamos con tus marcas favoritas ✨',
    desc: 'Productos originales y de excelente calidad para realzar tu belleza.',
    btnText: 'Explorar catálogo',
    btnHref: '/catalogo',
    bg: 'linear-gradient(135deg, #FFFFFF 0%, #FFF5F9 30%, #FFEDF4 100%)',
    emoji: '🛍️',
    decorEmoji: '🌟',
    isBrandSlide: true,
  },
];

const brands = ['BLOOMSHELL', 'BIOAQUA', 'ANIK', 'TRENDY', 'PURPURE'];

export default function HeroBanner({ config }: { config?: any }) {
  const [current, setCurrent] = useState(0);

  // Override first slide with config if provided
  const dynamicSlides = [...slides];
  if (config && (config.bannerTitle || config.bannerText || config.bannerPromo)) {
    dynamicSlides[0] = {
      ...dynamicSlides[0],
      title: config.bannerTitle || dynamicSlides[0].title,
      desc: config.bannerText || dynamicSlides[0].desc,
      badge: '✨ Tu belleza, tu momento',
      bg: config.bannerImage ? `url(${config.bannerImage}) center/cover no-repeat, ${dynamicSlides[0].bg}` : dynamicSlides[0].bg
    };
  }

  const next = useCallback(() => {
    setCurrent((prev) => (prev + 1) % dynamicSlides.length);
  }, [dynamicSlides.length]);

  const prev = useCallback(() => {
    setCurrent((prev) => (prev - 1 + dynamicSlides.length) % dynamicSlides.length);
  }, [dynamicSlides.length]);

  useEffect(() => {
    const timer = setInterval(next, 5000);
    return () => clearInterval(timer);
  }, [next]);

  return (
    <section className="relative overflow-hidden w-full" id="hero-banner">
      <div className="relative min-h-[500px] sm:min-h-[540px] md:min-h-[600px] lg:min-h-[640px] w-full">
        <AnimatePresence mode="wait">
          <motion.div
            key={current}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: 'easeInOut' }}
            className="absolute inset-0 w-full"
            style={{ background: dynamicSlides[current].bg }}
          >
            {/* Decorative circles */}
            <div className="absolute -top-20 -right-20 w-80 h-80 rounded-full bg-white/20 blur-3xl" />
            <div className="absolute -bottom-32 -left-20 w-96 h-96 rounded-full bg-white/25 blur-3xl" />
            <div className="absolute top-1/4 right-1/4 w-40 h-40 rounded-full bg-primary/10 blur-2xl animate-float" />

            {/* Floating decorative emojis */}
            <motion.div
              className="absolute top-[15%] right-[5%] lg:right-[15%] text-7xl sm:text-8xl md:text-9xl opacity-30 select-none drop-shadow-xl"
              animate={{ y: [-15, 15, -15], rotate: [-4, 4, -4] }}
              transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
            >
              {dynamicSlides[current].emoji}
            </motion.div>
            <motion.div
              className="absolute bottom-[20%] right-[10%] lg:right-[20%] text-5xl sm:text-6xl opacity-20 select-none drop-shadow-md"
              animate={{ y: [10, -15, 10], rotate: [5, -5, 5] }}
              transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
            >
              {dynamicSlides[current].decorEmoji}
            </motion.div>

            {/* Content */}
            <div className="absolute inset-0 flex items-center">
              <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-12 w-full">
                <div className="max-w-2xl relative z-10">
                  {/* Badge */}
                  <motion.div
                    initial={{ opacity: 0, y: 16, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ delay: 0.2, duration: 0.5 }}
                    className="inline-flex items-center gap-2 mb-6 px-5 py-2 bg-white/80 backdrop-blur-md rounded-full border border-white/50 shadow-sm"
                  >
                    <span className="text-sm font-semibold text-primary-dark tracking-wide font-sans">
                      {dynamicSlides[current].badge}
                    </span>
                  </motion.div>

                  {/* Heading */}
                  <motion.h1
                    initial={{ opacity: 0, y: 28 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3, duration: 0.6 }}
                    className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-display font-bold leading-[1.15] mb-6 text-txt"
                  >
                    {dynamicSlides[current].title}
                  </motion.h1>

                  {/* Optional Brands for Slide 5 */}
                  {dynamicSlides[current].isBrandSlide && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4, duration: 0.6 }}
                      className="flex flex-wrap gap-2 mb-6"
                    >
                      {brands.map((brand) => (
                        <span 
                          key={brand}
                          className="px-4 py-1.5 bg-white/60 backdrop-blur-sm border border-white rounded-full text-xs sm:text-sm font-bold text-txt-secondary tracking-wider shadow-sm"
                        >
                          {brand}
                        </span>
                      ))}
                    </motion.div>
                  )}

                  {/* Subtitle */}
                  <motion.p
                    initial={{ opacity: 0, y: 28 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: dynamicSlides[current].isBrandSlide ? 0.5 : 0.4, duration: 0.6 }}
                    className="text-base sm:text-lg md:text-xl text-txt-secondary leading-relaxed mb-10 max-w-lg font-sans font-medium"
                  >
                    {dynamicSlides[current].desc}
                  </motion.p>

                  {/* CTA Button */}
                  <motion.div
                    initial={{ opacity: 0, y: 28 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: dynamicSlides[current].isBrandSlide ? 0.6 : 0.5, duration: 0.6 }}
                    className="flex flex-wrap gap-4 mt-4"
                  >
                    <Link href={dynamicSlides[current].btnHref} className="btn-primary text-lg font-bold px-10 py-4 shadow-primary/40 shadow-xl hover:shadow-primary/50 hover:scale-105 transition-all">
                      <span>{dynamicSlides[current].btnText}</span>
                      <ChevronRight className="w-5 h-5 ml-1" />
                    </Link>
                  </motion.div>
                </div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Navigation Arrows */}
        <button
          onClick={prev}
          className="absolute left-0 sm:left-6 top-1/2 -translate-y-1/2 p-4 sm:p-3 rounded-full bg-transparent sm:bg-white/20 backdrop-blur-none sm:backdrop-blur-md hover:bg-white/10 sm:hover:bg-white/50 shadow-none sm:shadow-sm hover:shadow-md transition-all duration-300 sm:hover:scale-110 z-20 border border-transparent sm:border-white/30"
          aria-label="Anterior"
        >
          <ChevronLeft className="w-6 h-6 sm:w-5 sm:h-5 text-txt/30 sm:text-txt/70 drop-shadow-sm" />
        </button>
        <button
          onClick={next}
          className="absolute right-0 sm:right-6 top-1/2 -translate-y-1/2 p-4 sm:p-3 rounded-full bg-transparent sm:bg-white/20 backdrop-blur-none sm:backdrop-blur-md hover:bg-white/10 sm:hover:bg-white/50 shadow-none sm:shadow-sm hover:shadow-md transition-all duration-300 sm:hover:scale-110 z-20 border border-transparent sm:border-white/30"
          aria-label="Siguiente"
        >
          <ChevronRight className="w-6 h-6 sm:w-5 sm:h-5 text-txt/30 sm:text-txt/70 drop-shadow-sm" />
        </button>

        {/* Dots */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-2.5 z-20">
          {dynamicSlides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrent(index)}
              className={`rounded-full transition-all duration-500 ${
                index === current
                  ? 'w-10 h-3 bg-gradient-to-r from-primary to-primary-dark shadow-md shadow-primary/30'
                  : 'w-3 h-3 bg-white/60 hover:bg-white border border-white/40'
              }`}
              aria-label={`Ir a slide ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
