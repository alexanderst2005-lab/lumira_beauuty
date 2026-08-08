'use client';

import { useRouter } from 'next/navigation';

import Link from 'next/link';
import Image from 'next/image';
import { ShoppingCart, Heart } from 'lucide-react';
import { Product } from '@/types';
import { useCart } from '@/context/CartContext';
import { useFavorites } from '@/context/FavoritesContext';
import { formatPrice } from '@/utils/whatsapp';
import { useState } from 'react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { getOptimizedImageUrl } from '@/utils/image';

interface ProductCardProps {
  product: Product;
  priority?: boolean;
}

export default function ProductCard({ product, priority = false }: ProductCardProps) {
  const router = useRouter();
  const { addToCart } = useCart();
  const { toggleFavorite } = useFavorites();
  const [isAdding, setIsAdding] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [isLocalFav, setIsLocalFav] = useState(false);

  const isOutOfStock = product.stock === 0;

  const handleFavoriteToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleFavorite(product);
    setIsLocalFav(!isLocalFav);
    if (!isLocalFav) {
      toast.success('Agregado a tus favoritos ❤️', {
        icon: '❤️'
      });
    } else {
      toast('Eliminado de tus favoritos', {
        icon: '💔'
      });
    }
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isOutOfStock) return;

    if ((product.tones && product.tones.length > 0) || (product.options && product.options.length > 0)) {
      router.push(`/producto/${product.id}`);
      return;
    }

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
      scroll={false}
      className="card-premium block group flex flex-col h-full bg-white"
      id={`product-${product.id}`}
      onClick={() => {
        window.scrollTo({ top: 0, behavior: 'instant' });
      }}
    >
      {/* Imagen tipo cover (sin espacios blancos) */}
      <div className="product-image-container aspect-square flex items-center justify-center relative bg-gray-50 overflow-hidden rounded-t-2xl">
        <div className="relative w-full h-full">
          <Image
            src={getOptimizedImageUrl(product.image, 400)}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            loading="eager"
            priority={priority}
            unoptimized={true}
            className={`object-cover object-center transition-all duration-700 ${!isOutOfStock ? 'group-hover:scale-105' : ''} ${isOutOfStock ? 'grayscale opacity-70' : ''}`}
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
            }}
          />
          {/* Capa oscura si está agotado */}
          {isOutOfStock && (
            <div className="absolute inset-0 bg-black/40 z-10" />
          )}
        </div>

        {/* Agotado Badge (GIGANTE) */}
        {isOutOfStock && (
          <div className="absolute inset-0 z-30 flex items-center justify-center">
            <div className="bg-black/80 backdrop-blur-sm text-white px-6 py-2 rounded-lg -rotate-12 border border-white/20 shadow-2xl">
              <span className="text-lg sm:text-xl font-bold tracking-widest uppercase">
                Agotado
              </span>
            </div>
          </div>
        )}

        {/* Nuevo Badge */}
        {product.isNew && !isOutOfStock && (
          <div className="absolute top-4 left-4 z-20">
            <span className="bg-pink-500 text-white text-[10px] sm:text-xs font-bold px-2 py-1 rounded-full uppercase tracking-wide shadow-sm">
              Nuevo
            </span>
          </div>
        )}

        {/* Favorite Button Minimalista */}
        <button
          onClick={handleFavoriteToggle}
          className="absolute top-4 right-4 z-20 p-2.5 bg-white/70 backdrop-blur-md rounded-full shadow-sm transition-all duration-300 hover:scale-110 hover:bg-white"
          aria-label={isLocalFav ? "Quitar de favoritos" : "Agregar a favoritos"}
        >
          <motion.div
            animate={isLocalFav ? { scale: [1, 1.2, 1] } : { scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <Heart 
              strokeWidth={1.5}
              className={`w-4 h-4 transition-colors duration-300 ${
                isLocalFav ? 'fill-primary text-primary' : 'text-txt-secondary hover:text-txt'
              }`} 
            />
          </motion.div>
        </button>
      </div>

      {/* Contenido Minimalista */}
      <div className="p-3 sm:p-4 flex flex-col gap-2 sm:gap-3 bg-white z-10 flex-1 border-t border-border-light rounded-b-2xl">
        <div className="space-y-0.5 flex-1">
          <h3 className="font-sans font-bold uppercase tracking-wide text-xs sm:text-sm text-txt line-clamp-2 group-hover:text-primary transition-colors duration-200 leading-snug">
            {product.name}
          </h3>
          <p className="text-[10px] sm:text-xs text-txt-secondary/70 line-clamp-1">
            {product.description}
          </p>
        </div>
        
        <div className="flex items-center justify-between mt-auto pt-1">
          <div className="text-sm sm:text-base font-semibold text-txt">
            {formatPrice(product.price)}
          </div>
          
          <button
            onClick={isOutOfStock ? (e) => { e.preventDefault(); e.stopPropagation(); } : handleAddToCart}
            disabled={isAdding || isOutOfStock}
            className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${
              isOutOfStock
                ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                : isAdding
                ? 'bg-green-500 text-white scale-95'
                : 'bg-txt text-white hover:bg-txt-secondary hover:shadow-md active:scale-95'
            }`}
            aria-label={isOutOfStock ? 'Producto Agotado' : `Agregar ${product.name} al carrito`}
          >
            {isOutOfStock ? (
              <span className="text-[10px] font-bold uppercase tracking-wider">Agotado</span>
            ) : (
              <ShoppingCart className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>
    </Link>
  );
}
