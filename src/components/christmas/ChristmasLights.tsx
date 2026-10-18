'use client';

import React from 'react';

export default function ChristmasLights() {
  // Colores sofisticados en la paleta Lumira: Champagne dorado, Rosa cálido, Blanco aperlado
  const lightColors = [
    { base: 'bg-[#FEEA9A]', glow: 'rgba(254, 234, 154, 0.75)', delay: '0s' },
    { base: 'bg-[#FFB7D5]', glow: 'rgba(255, 183, 213, 0.75)', delay: '0.8s' },
    { base: 'bg-[#FFF9E6]', glow: 'rgba(255, 249, 230, 0.85)', delay: '1.6s' },
    { base: 'bg-[#FAD082]', glow: 'rgba(250, 208, 130, 0.75)', delay: '0.4s' },
    { base: 'bg-[#FF94C2]', glow: 'rgba(255, 148, 194, 0.75)', delay: '1.2s' },
    { base: 'bg-[#FFF2B2]', glow: 'rgba(255, 242, 178, 0.8)', delay: '2.0s' }
  ];

  return (
    <div
      className="fixed top-0 inset-x-0 pointer-events-none z-[45] overflow-hidden select-none"
      aria-hidden="true"
    >
      {/* Hilo dorado sutil y elegante */}
      <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-[#E8C88B]/40 to-transparent" />

      {/* Cadena de luces delicadas distribuidas suavemente */}
      <div className="w-full flex items-center justify-between px-2 sm:px-6 py-1">
        {Array.from({ length: 28 }).map((_, idx) => {
          const color = lightColors[idx % lightColors.length];
          return (
            <div
              key={idx}
              className="flex flex-col items-center justify-start relative -top-[1px]"
            >
              {/* Casquillo micro de oro rosa/champán */}
              <div className="w-[3px] h-[3px] bg-[#CBB184] rounded-t-[1px]" />
              {/* Bombillita delicada */}
              <div
                className={`w-[6px] h-[8px] sm:w-[7px] sm:h-[9px] rounded-full ${color.base} transition-transform duration-700`}
                style={{
                  boxShadow: `0 0 8px 2px ${color.glow}, 0 0 16px 4px ${color.glow}`,
                  animation: `lumiraLightBreathe 2.8s ease-in-out infinite`,
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
            opacity: 0.55;
            transform: scale(0.92);
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
