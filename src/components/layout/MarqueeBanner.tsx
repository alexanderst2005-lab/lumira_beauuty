'use client';

import { usePathname } from 'next/navigation';
import { useChristmas } from '@/context/ChristmasContext';

export default function MarqueeBanner() {
  const pathname = usePathname();
  const { isChristmasActive, activeConfig } = useChristmas();
  const isHome = !pathname || pathname === '/' || pathname === '';

  // La barra tipo marquesina es exclusiva de la portada principal sobre el Hero
  if (!isHome) {
    return null;
  }

  const defaultMessages = [
    "ENVÍOS A TODO EL PAÍS",
    "PAGO CONTRA ENTREGA",
    "CALIDAD PREMIUM",
    "ATENCIÓN PERSONALIZADA"
  ];

  const christmasMessages = [
    "🎄 EDICIÓN NAVIDEÑA LUMIRA",
    "✨ ESTA NAVIDAD, REGALA BELLEZA",
    "🎁 EL REGALO PERFECTO ESTÁ AQUÍ",
    "💖 ENVÍOS A TODO EL PAÍS",
    "✨ ATENCIÓN PERSONALIZADA"
  ];

  const messages = isChristmasActive && activeConfig?.extraDecor ? christmasMessages : defaultMessages;

  // Double the messages for seamless loop
  const allMessages = [...messages, ...messages, ...messages, ...messages];

  return (
    <div className="absolute top-0 inset-x-0 z-[60] h-[2.1rem] pointer-events-none">
      <div className="marquee-container absolute inset-x-0 top-0 h-[2.1rem] flex items-center bg-transparent pointer-events-none">
        <div className="marquee-content">
          {allMessages.map((msg, index) => (
            <span
              key={index}
              className="inline-flex items-center gap-6 mx-6 text-[11px] sm:text-xs font-semibold text-white tracking-[0.2em]"
            >
              <span>{msg}</span>
              <span className="text-white/60 text-[8px]">•</span>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

