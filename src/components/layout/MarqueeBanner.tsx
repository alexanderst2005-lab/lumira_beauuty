'use client';

import { usePathname } from 'next/navigation';

export default function MarqueeBanner() {
  const isHome = usePathname() === '/';
  const messages = [
    "ENVÍOS A TODO EL PAÍS",
    "PAGO CONTRA ENTREGA",
    "CALIDAD PREMIUM",
    "ATENCIÓN PERSONALIZADA"
  ];

  // Double the messages for seamless loop
  const allMessages = [...messages, ...messages, ...messages, ...messages];

  return (
    <div className={isHome ? 'absolute top-0 inset-x-0 z-[60] h-[2.1rem]' : ''}>
    <div
      className={`marquee-container ${
        isHome
          ? 'absolute inset-x-0 top-0 h-[2.1rem] flex items-center bg-transparent'
          : 'py-2 bg-primary'
      }`}
    >
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
