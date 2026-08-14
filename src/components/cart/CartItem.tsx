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
    <div className="flex gap-2.5 p-2.5 rounded-xl bg-secondary-100/30 border border-border">
      {/* Image */}
      <div className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-lg overflow-hidden bg-secondary-100 flex-shrink-0">
        <SafeImage
          src={item.product.image}
          alt={item.product.name}
          fill
          sizes="80px"
          className="object-cover"
        />
        <div className="absolute inset-0 flex items-center justify-center text-2xl opacity-20">
          💄
        </div>
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <h4 className="text-[11px] font-bold uppercase text-text line-clamp-1">
          {item.product.name}
        </h4>
        {item.selectedTone && (
          <p className="text-[10px] text-txt-secondary mt-0.5">
            Tono: <span className="font-medium text-txt">{item.selectedTone.name}</span>
          </p>
        )}
        {item.selectedOptions && Object.entries(item.selectedOptions).map(([optName, optVal]) => (
          <p key={optName} className="text-[10px] text-txt-secondary mt-0.5">
            {optName}: <span className="font-medium text-txt">{optVal.name}</span>
          </p>
        ))}
        <p className="text-xs font-bold text-primary mt-0.5">
          {formatPrice(item.product.price)}
        </p>

        <div className="flex items-center justify-between mt-1.5">
          {/* Quantity Controls */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => updateQuantity(item.id, item.quantity - 1)}
              className="w-6 h-6 rounded-full bg-white border border-border flex items-center justify-center hover:border-primary/30 hover:text-primary transition-colors"
              aria-label="Disminuir cantidad"
            >
              <Minus className="w-3 h-3" />
            </button>
            <span className="w-6 text-center text-[11px] font-semibold">{item.quantity}</span>
            <button
              onClick={() => updateQuantity(item.id, item.quantity + 1)}
              className="w-6 h-6 rounded-full bg-white border border-border flex items-center justify-center hover:border-primary/30 hover:text-primary transition-colors"
              aria-label="Aumentar cantidad"
            >
              <Plus className="w-3 h-3" />
            </button>
          </div>

          {/* Remove */}
          <button
            onClick={() => removeFromCart(item.id)}
            className="p-1.5 rounded-full hover:bg-red-50 text-text-light hover:text-red-500 transition-colors"
            aria-label={`Eliminar ${item.product.name}`}
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
