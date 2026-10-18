'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Sparkles, Gift, ArrowRight } from 'lucide-react';
import { useChristmas } from '@/context/ChristmasContext';

export default function ChristmasGiftSection() {
  const { isChristmasActive, activeConfig } = useChristmas();

  if (!isChristmasActive || !activeConfig.giftSection) {
    return null;
  }

  return (
    <section className="relative py-12 sm:py-16 md:py-20 overflow-hidden bg-gradient-to-b from-[#FFFDF9] via-[#FFF5F8] to-white border-y border-[#F7E6EC]">
      {/* Círculos de luz ambiental champagne y rosa */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#FFE4EE]/40 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[#FFF2D6]/40 rounded-full blur-3xl pointer-events-none" />

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.6 }}
          className="relative rounded-3xl p-8 sm:p-12 md:p-16 border border-[#F5DFE8] bg-white/80 backdrop-blur-md shadow-xl shadow-rose-900/5 overflow-hidden text-center"
        >
          {/* Acento decorativo festivo superior */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#FFF1F6] border border-[#FAD0E2] text-xs font-semibold text-[#C4437B] tracking-wider uppercase mb-6 shadow-sm">
            <Gift className="w-3.5 h-3.5 text-[#E5A852]" />
            <span>Temporada Especial</span>
            <Sparkles className="w-3.5 h-3.5 text-[#E5A852]" />
          </div>

          {/* Título de la sección */}
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-display font-medium text-txt tracking-tight max-w-3xl mx-auto leading-[1.15]">
            Esta Navidad, <span className="italic text-gradient bg-gradient-to-r from-[#D6336C] via-[#FF5C9D] to-[#E6A64C] bg-clip-text text-transparent">regala belleza</span>
          </h2>

          {/* Texto sugerido */}
          <p className="mt-4 sm:mt-5 text-txt-secondary text-base sm:text-lg md:text-xl max-w-2xl mx-auto font-sans leading-relaxed">
            Encuentra ese detalle especial y sorprende con fragancias y productos que enamoran.
          </p>

          {/* Botón principal */}
          <div className="mt-8 sm:mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/catalogo"
              className="inline-flex items-center justify-center gap-3 px-8 py-4 rounded-full bg-gradient-to-r from-[#E75480] via-[#FF5C9D] to-[#E6A64C] text-white font-medium text-base shadow-lg shadow-pink-500/25 hover:shadow-pink-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 group"
            >
              <span>Descubrir productos</span>
              <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
          </div>

          {/* Pequeños detalles de ambientación sutiles en las esquinas */}
          <div className="absolute top-4 left-6 text-sm opacity-40 select-none pointer-events-none text-[#E8B56A]">
            ✦
          </div>
          <div className="absolute bottom-4 right-6 text-sm opacity-40 select-none pointer-events-none text-[#E8B56A]">
            ✦
          </div>
        </motion.div>
      </div>
    </section>
  );
}
