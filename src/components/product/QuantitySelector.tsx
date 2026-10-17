'use client';

import { Minus, Plus } from 'lucide-react';

interface QuantitySelectorProps {
  quantity: number;
  onChange: (quantity: number) => void;
  min?: number;
  max?: number;
}

export default function QuantitySelector({
  quantity,
  onChange,
  min = 1,
  max = 99,
}: QuantitySelectorProps) {
  return (
    <div className="inline-flex items-center justify-between w-32 h-11 bg-white border border-[#D4D4D8] rounded-[2px] px-3 select-none">
      <button
        type="button"
        onClick={() => onChange(Math.max(min, quantity - 1))}
        disabled={quantity <= min}
        className="w-7 h-7 flex items-center justify-center text-[#111111] hover:opacity-60 transition-opacity disabled:opacity-25 disabled:cursor-not-allowed"
        aria-label="Disminuir cantidad"
      >
        <Minus className="w-3.5 h-3.5 stroke-[2]" />
      </button>
      <span className="text-sm font-medium font-sans text-[#111111] min-w-[20px] text-center">
        {quantity}
      </span>
      <button
        type="button"
        onClick={() => onChange(Math.min(max, quantity + 1))}
        disabled={quantity >= max}
        className="w-7 h-7 flex items-center justify-center text-[#111111] hover:opacity-60 transition-opacity disabled:opacity-25 disabled:cursor-not-allowed"
        aria-label="Aumentar cantidad"
      >
        <Plus className="w-3.5 h-3.5 stroke-[2]" />
      </button>
    </div>
  );
}
