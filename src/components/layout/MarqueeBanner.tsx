'use client';

export default function MarqueeBanner() {
  const messages = [
    "ENVÍOS A TODO EL PAÍS",
    "PAGO CONTRA ENTREGA",
    "CALIDAD PREMIUM",
    "ATENCIÓN PERSONALIZADA"
  ];

  // Double the messages for seamless loop
  const allMessages = [...messages, ...messages, ...messages, ...messages];

  return (
    <div className="bg-primary py-2 marquee-container">
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
  );
}
