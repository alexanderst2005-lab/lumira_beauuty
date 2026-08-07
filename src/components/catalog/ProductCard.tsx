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

    if (product.tones && product.tones.length > 0) {
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
      className="card-premium block group flex flex-col h-full bg-white"
      id={`product-${product.id}`}
    >
      {/* Imagen limpia */}
      <div className="product-image-container aspect-square flex items-center justify-center p-6 relative bg-white">
        <div className="relative w-full h-full">
          <Image
            src={product.image}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            priority={priority}
            className="object-contain transition-transform duration-700 group-hover:scale-105 mix-blend-multiply"
            unoptimized={product.image.startsWith('http')}
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
            }}
          />
        </div>

        {/* Favorite Button Minimalista */}
        <button
          onClick={handleFavoriteToggle}
          className="absolute top-4 right-4 z-20 p-2 bg-transparent transition-transform duration-300 hover:scale-110"
          aria-label={isLocalFav ? "Quitar de favoritos" : "Agregar a favoritos"}
        >
          <motion.div
            animate={isLocalFav ? { scale: [1, 1.2, 1] } : { scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <Heart 
              strokeWidth={1.5}
              className={`w-5 h-5 transition-colors duration-300 ${
                isLocalFav ? 'fill-primary text-primary' : 'text-txt-secondary hover:text-txt'
              }`} 
            />
          </motion.div>
        </button>
      </div>

      {/* Contenido Minimalista */}
      <div className="p-4 sm:p-5 flex flex-col gap-4 bg-white z-10 flex-1 border-t border-border-light">
        <div className="space-y-1 flex-1">
          <h3 className="font-sans font-medium text-sm sm:text-base text-txt line-clamp-2 group-hover:text-primary transition-colors duration-200">
            {product.name}
          </h3>
          <p className="text-xs text-txt-secondary/70 line-clamp-1">
            {product.description}
          </p>
        </div>
        
        <div className="flex items-center justify-between mt-auto">
          <div className="text-base sm:text-lg font-semibold text-txt">
            {formatPrice(product.price)}
          </div>
          
          <button
            onClick={handleAddToCart}
            disabled={isAdding}
            className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
              isAdding
                ? 'bg-green-500 text-white scale-95'
                : 'bg-txt text-white hover:bg-txt-secondary hover:shadow-md active:scale-95'
            }`}
            aria-label={`Agregar ${product.name} al carrito`}
          >
            <ShoppingCart className="w-4 h-4" />
          </button>
        </div>
      </div>
    </Link>
  );
}
