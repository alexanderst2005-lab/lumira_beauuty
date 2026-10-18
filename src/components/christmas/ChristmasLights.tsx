'use client';

import React from 'react';
import { usePathname } from 'next/navigation';

export default function ChristmasLights() {
  const pathname = usePathname();
  const isHome = !pathname || pathname === '/' || pathname === '';

  // Paleta oficial Lumira Beauty: Champagne dorado, Rosa cálido, Blanco aperlado
  const lightColors = [
    { base: 'bg-[#FFE27A]', glow: 'rgba(255, 226, 122, 0.9)', delay: '0s' },
    { base: 'bg-[#FF9EC5]', glow: 'rgba(255, 158, 197, 0.9)', delay: '0.8s' },
    { base: 'bg-[#FFFBF0]', glow: 'rgba(255, 251, 240, 0.95)', delay: '1.6s' },
    { base: 'bg-[#FBC462]', glow: 'rgba(251, 196, 98, 0.9)', delay: '0.4s' },
    { base: 'bg-[#FF75B0]', glow: 'rgba(255, 117, 176, 0.9)', delay: '1.2s' },
    { base: 'bg-[#FFF3B8]', glow: 'rgba(255, 243, 184, 0.95)', delay: '2.0s' }
  ];

  return (
    <div
      className={`fixed inset-x-0 pointer-events-none z-[70] select-none ${
        isHome ? 'top-[2.05rem] sm:top-[2.1rem]' : 'top-0'
      }`}
      aria-hidden="true"
    >
      {/* Hilo festivo dorado sutil */}
      <div className="w-full h-[1.5px] bg-gradient-to-r from-transparent via-[#E5BF7D]/70 to-transparent shadow-sm" />

      {/* Cadena de luces delicadas distribuidas a lo ancho de la pantalla */}
      <div className="w-full flex items-start justify-between px-2 sm:px-6">
        {Array.from({ length: 32 }).map((_, idx) => {
          const color = lightColors[idx % lightColors.length];
          const isOffset = idx % 2 === 1;
          return (
            <div
              key={idx}
              className={`flex flex-col items-center justify-start ${
                isOffset ? 'mt-1 sm:mt-1.5' : 'mt-0'
              }`}
            >
              {/* Alambre micro de suspensión */}
              <div className="w-[1px] h-[3px] sm:h-[4px] bg-[#C8A970]" />
              {/* Casquillo de oro rosa/champán */}
              <div className="w-[4px] h-[3px] bg-[#9C7D47] rounded-t-[1px]" />
              {/* Bombillita navideña delicada */}
              <div
                className={`w-[8px] h-[11px] sm:w-[9px] sm:h-[13px] rounded-full ${color.base}`}
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
            opacity: 0.6;
            transform: scale(0.94);
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
