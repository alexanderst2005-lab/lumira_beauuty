'use client';

import React from 'react';
import { Sparkles } from 'lucide-react';

export default function ChristmasExtraDecor() {
  return (
    <div
      className="fixed bottom-4 left-4 pointer-events-none z-30 hidden md:flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/70 backdrop-blur-md border border-[#F3DEE7] shadow-sm select-none transition-opacity duration-300"
      aria-hidden="true"
    >
      <span className="text-xs">🎄</span>
      <span className="text-[11px] font-medium tracking-wide text-[#8C6D7C] flex items-center gap-1 font-sans">
        Edición Navideña
        <Sparkles className="w-3 h-3 text-[#E5A852]" />
      </span>
    </div>
  );
}
