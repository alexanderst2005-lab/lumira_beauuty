'use client';

import SafeImage from '@/components/common/SafeImage';
import { Minus, Plus, Trash2 } from 'lucide-react';
import { CartItem as CartItemType } from '@/types';
import { useCart } from '@/context/CartContext';
import { formatPrice } from '@/utils/whatsapp';

interface CartItemProps {
  item: CartItemType;
}

export default function CartItem({ item }: CartItemProps) {
  const { updateQuantity, removeFromCart } = useCart();

  return (
    <div className="flex gap-3 p-3 rounded-[2px] bg-white border border-[#E5E5E5] transition-all hover:border-[#D4D4D8]">
      {/* Product Image */}
      <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-[2px] overflow-hidden bg-white border border-[#F0E6DE] flex-shrink-0">
        <SafeImage
          src={item.product.image}
          alt={item.product.name}
          fill
          sizes="80px"
          className="object-contain p-1"
        />
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0 flex flex-col justify-between">
        <div>
          <div className="flex items-start justify-between gap-2">
            <h4 className="text-xs sm:text-sm font-semibold uppercase tracking-wide text-txt line-clamp-1 font-sans">
              {item.product.name}
            </h4>
            <button
              onClick={() => removeFromCart(item.id)}
              className="text-txt-secondary hover:text-red-600 transition-colors p-0.5"
              aria-label={`Eliminar ${item.product.name}`}
              title="Eliminar producto"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>

          {item.selectedTone && (
            <p className="text-[11px] text-txt-secondary mt-0.5 font-sans">
              Tono: <span className="font-semibold text-txt">{item.selectedTone.name}</span>
            </p>
          )}

          {item.selectedOptions &&
            Object.entries(item.selectedOptions).map(([optName, optVal]) => (
              <p key={optName} className="text-[11px] text-txt-secondary font-sans">
                {optName}: <span className="font-semibold text-txt">{optVal.name}</span>
              </p>
            ))}

          <div className="flex items-baseline gap-1.5 mt-1 font-sans">
            <span className="text-xs sm:text-sm font-semibold text-rose-600">
              {formatPrice(item.product.price)}
            </span>
            {item.product.originalPrice && item.product.originalPrice > item.product.price && (
              <span className="text-[11px] text-txt-secondary line-through">
                {formatPrice(item.product.originalPrice)}
              </span>
            )}
          </div>

        </div>

        {/* Quantity Controls (Rectangular Minimalist Pill) */}
        <div className="flex items-center justify-between mt-2 pt-1 border-t border-[#F2E8E0]">
          <span className="text-[10px] uppercase tracking-wider text-txt-secondary font-semibold font-sans">
            Cant.
          </span>
          <div className="inline-flex items-center justify-between w-24 h-7 bg-white border border-[#D4D4D8] rounded-[2px] px-1.5 select-none">
            <button
              onClick={() => updateQuantity(item.id, item.quantity - 1)}
              className="w-5 h-5 flex items-center justify-center text-[#111111] hover:opacity-60 transition-opacity"
              aria-label="Disminuir cantidad"
            >
              <Minus className="w-3 h-3 stroke-[2]" />
            </button>
            <span className="text-xs font-semibold font-sans text-txt min-w-[16px] text-center">
              {item.quantity}
            </span>
            <button
              onClick={() => updateQuantity(item.id, item.quantity + 1)}
              className="w-5 h-5 flex items-center justify-center text-[#111111] hover:opacity-60 transition-opacity"
              aria-label="Aumentar cantidad"
            >
              <Plus className="w-3 h-3 stroke-[2]" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
