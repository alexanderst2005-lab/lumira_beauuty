'use client';

import React, { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';

export default function ChristmasLights() {
  const pathname = usePathname();
  const isHome = !pathname || pathname === '/' || pathname === '';
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Paleta oficial Lumira Beauty: Champagne dorado, Rosa cálido, Blanco aperlado
  const lightColors = [
    { base: 'bg-[#FFE27A]', glow: 'rgba(255, 226, 122, 0.95)', delay: '0s' },
    { base: 'bg-[#FF9EC5]', glow: 'rgba(255, 158, 197, 0.95)', delay: '0.8s' },
    { base: 'bg-[#FFFBF0]', glow: 'rgba(255, 251, 240, 0.95)', delay: '1.6s' },
    { base: 'bg-[#FBC462]', glow: 'rgba(251, 196, 98, 0.95)', delay: '0.4s' },
    { base: 'bg-[#FF75B0]', glow: 'rgba(255, 117, 176, 0.95)', delay: '1.2s' },
    { base: 'bg-[#FFF3B8]', glow: 'rgba(255, 243, 184, 0.95)', delay: '2.0s' }
  ];

  // Si está en la portada y arriba: cuelga justo debajo de la marquesina (top-[2.1rem])
  // Si hace scroll O está en otra página: sube inmediatamente al borde superior exacto (top-0) por encima del header
  const topClass = isHome && !isScrolled ? 'top-[2.05rem] sm:top-[2.1rem]' : 'top-0';

  return (
    <div
      className={`fixed inset-x-0 pointer-events-none z-[70] select-none transition-all duration-300 ${topClass}`}
      aria-hidden="true"
    >
      {/* Hilo festivo dorado sutil */}
      <div className="w-full h-[1.5px] bg-gradient-to-r from-transparent via-[#E5BF7D]/80 to-transparent shadow-sm" />

      {/* Cadena de luces delicadas distribuidas a lo ancho de la pantalla */}
      <div className="w-full flex items-start justify-between px-2 sm:px-6">
        {Array.from({ length: 32 }).map((_, idx) => {
          const color = lightColors[idx % lightColors.length];
          const isOffset = idx % 2 === 1;

          // Espaciar ligeramente en el centro para dejar libre el área del logo cuando se hace scroll
          const isCenter = idx >= 14 && idx <= 17;
          
          return (
            <div
              key={idx}
              className={`flex flex-col items-center justify-start transition-all duration-300 ${
                isOffset ? 'mt-0.5 sm:mt-1' : 'mt-0'
              } ${isCenter && isScrolled ? 'opacity-30 scale-75' : 'opacity-100'}`}
            >
              {/* Alambre micro de suspensión */}
              <div className="w-[1px] h-[3px] sm:h-[4px] bg-[#C8A970]" />
              {/* Casquillo de oro rosa/champán */}
              <div className="w-[4px] h-[2.5px] bg-[#9C7D47] rounded-t-[1px]" />
              {/* Bombillita navideña delicada */}
              <div
                className={`w-[7px] h-[10px] sm:w-[9px] sm:h-[12px] rounded-full ${color.base}`}
                style={{
                  boxShadow: `0 0 10px 3px ${color.glow}, 0 0 20px 5px ${color.glow}`,
                  animation: `lumiraLightBreathe 2.6s ease-in-out infinite`,
                  animationDelay: color.delay
                }}
              />
            </div>
          );
        })}
      </div>

      <style jsx>{`
        @keyframes lumiraLightBreathe {
          0%, 100% {
            opacity: 0.65;
            transform: scale(0.95);
          }
          50% {
            opacity: 1;
            transform: scale(1.08);
          }
        }
      `}</style>
    </div>
  );
}
