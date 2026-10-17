'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';

type SlideType = {
  id: number;
  badge: string;
  title: string;
  desc: string;
  btnText: string;
  btnHref: string;
  image: string;
  position?: string;
  isBrandSlide?: boolean;
};

// Cada diapositiva tiene su propia información y su propia fotografía de fondo real y responsive.
const slides: SlideType[] = [
  {
    id: 1,
    badge: '✨ Tu belleza, tu momento',
    title: 'Descubre tu belleza con Lumira Beauty ✨',
    desc: 'Encuentra maquillaje, skincare, pestañas y accesorios en un solo lugar.',
    btnText: 'Comprar ahora',
    btnHref: '/catalogo',
    image: '/images/hero/brands.png',
    position: 'object-center md:object-[center_35%]',
  },
  {
    id: 2,
    badge: '💖 Calidad seleccionada para ti',
    title: 'Cuida tu piel todos los días 🧴',
    desc: 'Descubre Bioaqua, Bloomshell y todos nuestros productos para una rutina facial completa.',
    btnText: 'Ver Skincare',
    btnHref: '/catalogo?categoria=skincare',
    image: '/images/hero/skincare.png',
    position: 'object-[center_bottom] md:object-[center_60%]',
  },
  {
    id: 3,
    badge: '🌸 Descubre las últimas novedades',
    title: 'La mirada perfecta empieza aquí 👁️',
    desc: 'Pestañas punto a punto, volumen, ojo de gato y mucho más.',
    btnText: 'Ver Pestañas',
    btnHref: '/catalogo?categoria=pestanas-enteras',
    image: '/images/hero/lashes.png',
    position: 'object-center',
  },
  {
    id: 4,
    badge: '🛍️ Compra fácil y rápida',
    title: 'Resalta tu belleza 💄',
    desc: 'Correctores, rubores, gloss, polvos, tintas y mucho más para completar tu maquillaje.',
    btnText: 'Ver Makeup',
    btnHref: '/catalogo?categoria=makeup',
    image: '/images/hero/makeup.jpg',
    position: 'object-center md:object-[center_40%]',
  },
  {
    id: 5,
    badge: '🚚 Envíos a toda Colombia',
    title: 'Trabajamos con tus marcas favoritas ✨',
    desc: 'Productos originales y de excelente calidad para realzar tu belleza.',
    btnText: 'Explorar catálogo',
    btnHref: '/catalogo',
    image: '/images/hero/brands.png',
    position: 'object-center md:object-[center_35%]',
    isBrandSlide: true,
  },
];

const brands = ['BLOOMSHELL', 'BIOAQUA', 'ANIK', 'TRENDY', 'PURPURE'];

const AUTOPLAY_MS = 5000;
const SWIPE_MIN_PX = 50;

export default function HeroBanner({ config }: { config?: any }) {
  // Primera diapositiva configurable desde el panel de administración.
  const dynamicSlides = [...slides];
  if (config && (config.bannerTitle || config.bannerText || config.bannerPromo || config.bannerImage)) {
    dynamicSlides[0] = {
      ...dynamicSlides[0],
      title: config.bannerTitle || dynamicSlides[0].title,
      desc: config.bannerText || dynamicSlides[0].desc,
      image: config.bannerImage || dynamicSlides[0].image,
    };
  }
  const total = dynamicSlides.length;
  const [current, setCurrent] = useState(0);
  const touchStart = useRef<{ x: number; y: number } | null>(null);

  const next = useCallback(() => setCurrent((p) => (p + 1) % total), [total]);
  const prev = useCallback(() => setCurrent((p) => (p - 1 + total) % total), [total]);

  // Reinicia el temporizador en cada cambio (manual o automático).
  useEffect(() => {
    const timer = setTimeout(next, AUTOPLAY_MS);
    return () => clearTimeout(timer);
  }, [current, next]);

  const slide = dynamicSlides[current];

  const onTouchStart = (e: React.TouchEvent) => {
    const t = e.touches[0];
    touchStart.current = { x: t.clientX, y: t.clientY };
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    if (!touchStart.current) return;
    const t = e.changedTouches[0];
    const dx = t.clientX - touchStart.current.x;
    const dy = t.clientY - touchStart.current.y;
    touchStart.current = null;
    if (Math.abs(dx) > SWIPE_MIN_PX && Math.abs(dx) > Math.abs(dy)) {
      dx < 0 ? next() : prev();
    }
  };

  return (
    <section
      id="hero-banner"
      className="relative w-full overflow-hidden bg-[#7a1f4d] min-h-[580px] h-[100svh] sm:h-[90vh] lg:h-[95vh]"
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      {/* Fondos con transición suave y centrado responsivo */}
      {dynamicSlides.map((s, i) => (
        <div
          key={`${s.image}-${i}`}
          className={`absolute inset-0 transition-opacity duration-[1200ms] ease-in-out ${
            i === current ? 'opacity-100' : 'opacity-0'
          }`}
          aria-hidden={i !== current}
        >
          <Image
            src={s.image}
            alt=""
            fill
            priority={i === 0}
            unoptimized
            sizes="100vw"
            className={`object-cover ${s.position || 'object-center'} transition-transform duration-[6000ms] ease-out ${
              i === current ? 'scale-105' : 'scale-100'
            }`}
          />
        </div>
      ))}

      {/* Capa de contraste con tonalidad rosa fucsia de la marca y oscurecimiento para legibilidad total */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#7a1f4d]/45 via-black/35 to-[#7a1f4d]/50" />
      <div className="absolute inset-x-0 top-0 h-36 bg-gradient-to-b from-black/50 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 h-44 bg-gradient-to-t from-black/70 to-transparent" />

      {/* Contenido */}
      <div className="relative z-10 h-full flex items-center justify-center px-6 sm:px-12 pt-24 sm:pt-28 pb-20 sm:pb-24">
        <AnimatePresence mode="wait">
          <motion.div
            key={slide.id}
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="w-full max-w-[21rem] sm:max-w-2xl lg:max-w-3xl text-center flex flex-col items-center"
          >
            <span className="inline-flex items-center px-4 py-1.5 mb-5 sm:mb-6 rounded-full bg-white/10 backdrop-blur-sm border border-white/35 text-[10px] sm:text-xs font-medium text-white uppercase tracking-[0.2em] font-sans">
              {slide.badge}
            </span>

            <h1 className="text-[2.1rem] leading-[1.12] tracking-[0.005em] sm:text-5xl lg:text-6xl font-display font-medium text-white mb-4 sm:mb-5 [text-wrap:balance] [text-shadow:0_2px_18px_rgba(74,15,46,0.45)]">
              {slide.title}
            </h1>

            {slide.isBrandSlide && (
              <div className="flex flex-wrap justify-center gap-1.5 sm:gap-2 mb-4 sm:mb-5">
                {brands.map((brand) => (
                  <span
                    key={brand}
                    className="px-3 py-1 rounded-full bg-white/90 text-[10px] sm:text-[11px] font-semibold text-primary-dark tracking-[0.18em] shadow-sm"
                  >
                    {brand}
                  </span>
                ))}
              </div>
            )}

            <p className="text-[0.95rem] sm:text-lg text-white/90 leading-relaxed mb-7 sm:mb-9 max-w-[19rem] sm:max-w-lg font-sans font-light tracking-[0.01em] [text-wrap:pretty] [text-shadow:0_1px_10px_rgba(74,15,46,0.5)]">
              {slide.desc}
            </p>

            <Link
              href={slide.btnHref}
              className="btn-primary inline-flex items-center justify-center text-[13px] sm:text-sm font-semibold uppercase tracking-[0.14em] px-8 sm:px-10 py-3.5 shadow-lg shadow-black/20 hover:scale-[1.03] transition-all"
            >
              <span>{slide.btnText}</span>
              <ChevronRight className="w-4 h-4 ml-2" />
            </Link>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Flechas (visibles desde tablet; en móvil se desliza) */}
      <button
        onClick={prev}
        aria-label="Anterior"
        className="hidden sm:flex absolute left-4 lg:left-8 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full bg-white/15 backdrop-blur-md border border-white/30 text-white hover:bg-white/30 transition-all"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>
      <button
        onClick={next}
        aria-label="Siguiente"
        className="hidden sm:flex absolute right-4 lg:right-8 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full bg-white/15 backdrop-blur-md border border-white/30 text-white hover:bg-white/30 transition-all"
      >
        <ChevronRight className="w-5 h-5" />
      </button>

      {/* Indicadores */}
      <div className="absolute bottom-6 sm:bottom-8 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2">
        {dynamicSlides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrent(index)}
            aria-label={`Ir a slide ${index + 1}`}
            aria-current={index === current}
            className="group py-3"
          >
            <span
              className={`block h-[3px] rounded-full transition-all duration-500 ${
                index === current ? 'w-8 bg-white' : 'w-4 bg-white/40 group-hover:bg-white/70'
              }`}
            />
          </button>
        ))}
      </div>
    </section>
  );
}
