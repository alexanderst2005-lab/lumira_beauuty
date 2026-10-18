'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Sparkles, Gift, ArrowRight, Truck, Heart } from 'lucide-react';
import { useChristmas } from '@/context/ChristmasContext';

export default function ChristmasGiftSection() {
  const { isChristmasActive, activeConfig } = useChristmas();

  if (!isChristmasActive || !activeConfig.giftSection) {
    return null;
  }

  const benefits = [
    {
      icon: Gift,
      title: 'Detalles & Regalos Especiales',
      desc: 'Maquillaje, skincare y fragancias listas para sorprender y enamorar.'
    },
    {
      icon: Truck,
      title: 'Envíos a Todo Colombia',
      desc: 'Entregas seguras y rápidas para que tu detalle llegue a tiempo esta Navidad.'
    },
    {
      icon: Heart,
      title: 'Calidad Premium Seleccionada',
      desc: 'Cosméticos y marcas prémium escogidos para consentir y realzar la belleza.'
    }
  ];

  return (
    <section className="relative py-14 sm:py-20 overflow-hidden bg-gradient-to-b from-[#FFFDF9] via-[#FFF2F6] to-white border-y border-[#F7E1EA]">
      {/* Luces ambientales en tonos rosa y dorado champán */}
      <div className="absolute top-0 left-1/4 w-[28rem] h-[28rem] bg-[#FFE0EC]/50 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[28rem] h-[28rem] bg-[#FFF0D4]/40 rounded-full blur-3xl pointer-events-none" />

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.6 }}
          className="relative rounded-3xl p-8 sm:p-12 md:p-16 border border-[#F5DFE8] bg-white/85 backdrop-blur-md shadow-2xl shadow-rose-900/10 overflow-hidden text-center"
        >
          {/* Badge festivo superior */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#FFF0F6] border border-[#FAD0E2] text-xs font-bold text-[#C4437B] tracking-wider uppercase mb-6 shadow-sm">
            <Gift className="w-3.5 h-3.5 text-[#E5A852]" />
            <span>Navidad Lumira Beauty</span>
            <Sparkles className="w-3.5 h-3.5 text-[#E5A852]" />
          </div>

          {/* Título principal */}
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-display font-medium text-txt tracking-tight max-w-3xl mx-auto leading-[1.15]">
            Esta Navidad, <span className="italic text-gradient bg-gradient-to-r from-[#D6336C] via-[#FF5C9D] to-[#E6A64C] bg-clip-text text-transparent">regala belleza</span>
          </h2>

          {/* Mensaje descriptivo */}
          <p className="mt-4 sm:mt-5 text-txt-secondary text-base sm:text-lg md:text-xl max-w-2xl mx-auto font-sans leading-relaxed">
            Encuentra ese detalle especial y sorprende con fragancias y productos que enamoran.
          </p>

          {/* 3 Tarjetas de Beneficios Festivos */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 mt-10 sm:mt-12 text-left">
            {benefits.map((item, idx) => (
              <div
                key={idx}
                className="p-5 sm:p-6 rounded-2xl bg-white/90 border border-[#F7E4EC] shadow-sm hover:border-pink-300 transition-all hover:shadow-md"
              >
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#FFE5EE] to-[#FFF4DE] flex items-center justify-center text-[#D6336C] mb-3.5 border border-[#FBD6E5]">
                  <item.icon className="w-5 h-5" />
                </div>
                <h3 className="font-semibold text-sm sm:text-base text-gray-900 mb-1">
                  {item.title}
                </h3>
                <p className="text-xs sm:text-sm text-txt-secondary leading-relaxed font-sans">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>

          {/* Botón principal de acción hacia el catálogo */}
          <div className="mt-10 sm:mt-12 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/catalogo"
              className="inline-flex items-center justify-center gap-3 px-9 py-4 rounded-full bg-gradient-to-r from-[#E75480] via-[#FF5C9D] to-[#E6A64C] text-white font-semibold text-base shadow-lg shadow-pink-500/25 hover:shadow-pink-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 group"
            >
              <span>Descubrir productos</span>
              <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
          </div>

          {/* Estrellitas en las esquinas */}
          <div className="absolute top-4 left-6 text-sm opacity-50 select-none pointer-events-none text-[#E8B56A]">
            ✦
          </div>
          <div className="absolute bottom-4 right-6 text-sm opacity-50 select-none pointer-events-none text-[#E8B56A]">
            ✦
          </div>
        </motion.div>
      </div>
    </section>
  );
}
