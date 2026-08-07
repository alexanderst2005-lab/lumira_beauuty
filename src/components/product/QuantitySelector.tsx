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
    <div className="flex items-center gap-2">
      <button
        onClick={() => onChange(Math.max(min, quantity - 1))}
        disabled={quantity <= min}
        className="w-7 h-7 rounded-full border border-border flex items-center justify-center hover:border-primary hover:text-primary disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200"
        aria-label="Disminuir cantidad"
      >
        <Minus className="w-3 h-3" />
      </button>
      <span className="w-8 text-center text-sm font-bold font-heading">{quantity}</span>
      <button
        onClick={() => onChange(Math.min(max, quantity + 1))}
        disabled={quantity >= max}
        className="w-7 h-7 rounded-full border border-border flex items-center justify-center hover:border-primary hover:text-primary disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200"
        aria-label="Aumentar cantidad"
      >
        <Plus className="w-3 h-3" />
      </button>
    </div>
  );
}
