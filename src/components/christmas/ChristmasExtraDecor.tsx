'use client';

import React from 'react';
import { Sparkles } from 'lucide-react';

export default function ChristmasExtraDecor() {
  return (
    <div
      className="fixed bottom-5 left-4 pointer-events-none z-[60] flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/95 backdrop-blur-md border border-[#F5D8E4] shadow-lg shadow-pink-900/10 select-none transition-all duration-300"
      aria-hidden="true"
    >
      <span className="text-sm">🎄</span>
      <span className="text-[11px] font-semibold tracking-wider text-[#A84570] flex items-center gap-1 font-sans uppercase">
        Navidad Lumira
        <Sparkles className="w-3.5 h-3.5 text-[#E5A852] animate-pulse" />
      </span>
    </div>
  );
}
