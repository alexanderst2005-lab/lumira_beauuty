'use client';

import Image from 'next/image';
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
    <div className="flex gap-3 p-3 rounded-xl bg-secondary-100/30 border border-border">
      {/* Image */}
      <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-lg overflow-hidden bg-secondary-100 flex-shrink-0">
        <Image
          src={item.product.image}
          alt={item.product.name}
          fill
          sizes="80px"
          className="object-cover"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.style.display = 'none';
          }}
        />
        <div className="absolute inset-0 flex items-center justify-center text-2xl opacity-20">
          💄
        </div>
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-semibold text-text line-clamp-1">
          {item.product.name}
        </h4>
        <p className="text-sm font-bold text-primary mt-0.5">
          {formatPrice(item.product.price)}
        </p>

        <div className="flex items-center justify-between mt-2">
          {/* Quantity Controls */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
              className="w-7 h-7 rounded-full bg-white border border-border flex items-center justify-center hover:border-primary/30 hover:text-primary transition-colors"
              aria-label="Disminuir cantidad"
            >
              <Minus className="w-3 h-3" />
            </button>
            <span className="w-8 text-center text-sm font-semibold">{item.quantity}</span>
            <button
              onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
              className="w-7 h-7 rounded-full bg-white border border-border flex items-center justify-center hover:border-primary/30 hover:text-primary transition-colors"
              aria-label="Aumentar cantidad"
            >
              <Plus className="w-3 h-3" />
            </button>
          </div>

          {/* Remove */}
          <button
            onClick={() => removeFromCart(item.product.id)}
            className="p-1.5 rounded-full hover:bg-red-50 text-text-light hover:text-red-500 transition-colors"
            aria-label={`Eliminar ${item.product.name}`}
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
