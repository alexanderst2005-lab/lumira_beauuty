'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ShoppingCart } from 'lucide-react';
import { Product } from '@/types';
import { useCart } from '@/context/CartContext';
import { formatPrice } from '@/utils/whatsapp';
import { useState } from 'react';
import { toast } from 'sonner';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useCart();
  const [isAdding, setIsAdding] = useState(false);
  const [quantity, setQuantity] = useState(1);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsAdding(true);
    addToCart(product, quantity);
    toast.success('Producto agregado al carrito ✅');
    setTimeout(() => {
      setIsAdding(false);
      setQuantity(1); // Reset after adding
    }, 600);
  };

  const handleDecrease = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setQuantity((prev) => Math.max(1, prev - 1));
  };

  const handleIncrease = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setQuantity((prev) => prev + 1);
  };

  return (
    <Link
      href={`/producto/${product.id}`}
      className="card-premium block group flex flex-col h-full"
      id={`product-${product.id}`}
    >
      {/* Imagen centrada y contenedor premium */}
      <div className="product-image-container aspect-square flex items-center justify-center p-4">
        <div className="relative w-full h-full">
          <Image
            src={product.image}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-contain transition-transform duration-500 group-hover:scale-110 drop-shadow-md"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
            }}
          />
          {/* Fallback decorativo */}
          <div className="absolute inset-0 flex items-center justify-center text-5xl opacity-10">
            ✨
          </div>
        </div>
      </div>

      {/* Contenido (Nombre, Descripción corta, Precio, Qty, Botón) */}
      <div className="p-5 sm:p-6 flex flex-col gap-5 bg-white z-10 relative flex-1">
        <div className="space-y-1.5 text-center flex-1">
          <h3 className="font-heading font-bold text-sm sm:text-base text-txt line-clamp-2 group-hover:text-primary transition-colors duration-200">
            {product.name}
          </h3>
          <p className="text-xs sm:text-sm text-txt-secondary/90 line-clamp-2 leading-relaxed">
            {product.description}
          </p>
        </div>
        
        <div className="text-lg sm:text-xl font-bold text-primary text-center">
          {formatPrice(product.price)}
        </div>

        <div className="flex flex-col gap-3 mt-auto">
          {/* Selector de cantidad siempre visible */}
          <div className="w-full flex items-center justify-between bg-secondary-100/40 rounded-full p-1 border border-primary/10">
            <button
              onClick={handleDecrease}
              className="w-8 h-8 flex items-center justify-center rounded-full bg-white text-txt shadow-sm hover:text-primary transition-colors"
              aria-label="Disminuir"
            >
              -
            </button>
            <span className="font-semibold text-txt w-8 text-center">{quantity}</span>
            <button
              onClick={handleIncrease}
              className="w-8 h-8 flex items-center justify-center rounded-full bg-white text-txt shadow-sm hover:text-primary transition-colors"
              aria-label="Aumentar"
            >
              +
            </button>
          </div>

          {/* Botón de agregar */}
          <button
            onClick={handleAddToCart}
            disabled={isAdding}
            className={`w-full py-2.5 rounded-full flex items-center justify-center gap-2 font-semibold text-sm transition-all duration-300 ${
              isAdding
                ? 'bg-green-500 text-white shadow-lg shadow-green-500/25 scale-95'
                : 'bg-primary text-white hover:bg-primary-dark hover:shadow-lg hover:shadow-primary/30 active:scale-95'
            }`}
            aria-label={`Agregar ${product.name} al carrito`}
          >
            <ShoppingCart className="w-4 h-4" />
            <span>{isAdding ? '¡Agregado!' : 'Agregar'}</span>
          </button>
        </div>
      </div>
    </Link>
  );
}
