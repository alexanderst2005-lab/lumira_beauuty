'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import SafeImage from '@/components/common/SafeImage';
import { ShoppingBag, Heart } from 'lucide-react';
import { Product } from '@/types';
import { useCart } from '@/context/CartContext';
import { useFavorites } from '@/context/FavoritesContext';
import { useCampaignPromotions } from '@/context/CampaignPromotionsContext';
import { useChristmas } from '@/context/ChristmasContext';
import { formatPrice } from '@/utils/whatsapp';
import { useState } from 'react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { saveCurrentScrollPosition } from '@/utils/scrollRestoration';

interface ProductCardProps {
  product: Product;
  priority?: boolean;
}

export default function ProductCard({ product, priority = false }: ProductCardProps) {
  const router = useRouter();
  const { addToCart, items } = useCart();
  const { toggleFavorite, isFavorite } = useFavorites();
  const { getProductDiscount } = useCampaignPromotions();
  const { isChristmasActive, activeConfig } = useChristmas();
  const [isAdding, setIsAdding] = useState(false);
  const [quantity, setQuantity] = useState(1);

  // Consultar descuento activo (campaña o individual con resolución de mejor oferta)
  const discountInfo = getProductDiscount(product.id, product.price, product.originalPrice);
  const effectivePrice = discountInfo.hasDiscount ? discountInfo.finalPrice : product.price;
  const originalPrice = discountInfo.hasDiscount ? discountInfo.originalPrice : undefined;

  const isOutOfStock = product.stock === 0;
  const isFav = isFavorite(product.id);

  const handleFavoriteToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleFavorite(product);
    if (!isFav) {
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
      saveCurrentScrollPosition();
      router.push(`/producto/${product.id}`);
      return;
    }

    setIsAdding(true);
    addToCart({
      ...product,
      price: effectivePrice,
      originalPrice,
      discountPercent: discountInfo.discountPercent,
      hasDiscount: discountInfo.hasDiscount,
      savings: discountInfo.savings
    }, quantity);

    toast.success('Producto agregado al carrito ✅');
    setTimeout(() => {
      setIsAdding(false);
      setQuantity(1);
    }, 600);
  };

  return (
    <Link
      href={`/producto/${product.id}`}
      scroll={false}
      className="block group flex flex-col h-full bg-white rounded-2xl border border-border-light shadow-[0_2px_12px_rgba(122,31,77,0.04)] overflow-hidden transition-all duration-300 hover:shadow-[0_12px_32px_rgba(122,31,77,0.10)] hover:-translate-y-0.5 hover:border-primary/20"
      id={`product-${product.id}`}
      onClick={() => {
        saveCurrentScrollPosition();
      }}
    >
      {/* Imagen: contenedor uniforme, el producto se muestra completo sin recortes */}
      <div className="product-image-container aspect-square relative !bg-white overflow-hidden [&>div]:!bg-transparent">
        <SafeImage
          src={product.image}
          alt={product.name}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          loading={priority ? 'eager' : 'lazy'}
          priority={priority}
          unoptimized={true}
          optimizeWidth={400}
          className={`object-contain object-center p-2 sm:p-3 transition-transform duration-500 ${!isOutOfStock ? 'group-hover:scale-105' : ''} ${isOutOfStock ? 'grayscale opacity-60' : ''}`}
        />

        {/* Agotado */}
        {isOutOfStock && (
          <div className="absolute inset-0 z-20 flex items-center justify-center bg-white/40">
            <span className="bg-txt/85 text-white px-4 py-1.5 rounded-full text-[11px] sm:text-xs font-semibold tracking-[0.18em] uppercase">
              Agotado
            </span>
          </div>
        )}

        {/* Badge de Oferta si tiene descuento activo */}
        {discountInfo.hasDiscount && !isOutOfStock && (
          <span className="absolute top-2.5 left-2.5 sm:top-3 sm:left-3 z-20 bg-rose-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider shadow-sm flex items-center gap-1">
            <span>Oferta</span>
            <span>-{discountInfo.discountPercent}%</span>
          </span>
        )}

        {/* Nuevo (solo si el producto está marcado como nuevo y no tiene oferta activa para no sobrecargar) */}
        {product.isNew && !isOutOfStock && !discountInfo.hasDiscount && (
          <span className="absolute top-2.5 left-2.5 sm:top-3 sm:left-3 z-20 bg-primary text-white text-[10px] font-semibold px-2.5 py-1 rounded-full uppercase tracking-[0.14em] shadow-sm">
            Nuevo
          </span>
        )}

        {/* Detalle Navideño Especial */}
        {isChristmasActive && activeConfig?.extraDecor && !isOutOfStock && !discountInfo.hasDiscount && !product.isNew && (
          <span className="absolute top-2.5 left-2.5 sm:top-3 sm:left-3 z-20 bg-gradient-to-r from-rose-500/90 to-amber-500/90 text-white text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider shadow-sm flex items-center gap-1">
            <span>🎁 Regalo</span>
          </span>
        )}

        {/* Favoritos */}
        <button
          onClick={handleFavoriteToggle}
          className={`absolute top-2 right-2 sm:top-3 sm:right-3 z-20 w-9 h-9 flex items-center justify-center rounded-full shadow-sm backdrop-blur-md border transition-all duration-300 hover:scale-110 ${
            isFav
              ? 'bg-primary/10 border-primary/30'
              : 'bg-white/80 border-white/60 hover:bg-white'
          }`}
          aria-label={isFav ? 'Quitar de favoritos' : 'Agregar a favoritos'}
          aria-pressed={isFav}
        >
          <motion.div
            animate={isFav ? { scale: [1, 1.25, 1] } : { scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <Heart
              strokeWidth={1.6}
              className={`w-[18px] h-[18px] transition-colors duration-300 ${
                isFav ? 'fill-primary text-primary' : 'text-txt-secondary'
              }`}
            />
          </motion.div>
        </button>
      </div>

      {/* Información */}
      <div className="p-3 sm:p-4 flex flex-col gap-2 flex-1">
        <div className="flex-1 space-y-1">
          <h3 className="font-sans font-semibold text-[13px] sm:text-sm text-txt line-clamp-2 min-h-[2.5rem] group-hover:text-primary transition-colors duration-200 leading-snug">
            {product.name}
          </h3>
          <p className="text-[11px] sm:text-xs text-txt-secondary/70 line-clamp-1 min-h-[1rem]">
            {product.description}
          </p>
        </div>

        <div className="flex items-center justify-between gap-2 pt-2 border-t border-border-light">
          <div className="flex flex-col">
            <div className="flex items-baseline gap-1.5 flex-wrap">
              <span className={`text-[15px] sm:text-base font-bold tracking-tight ${discountInfo.hasDiscount ? 'text-rose-600' : 'text-txt'}`}>
                {formatPrice(effectivePrice)}
              </span>
              {discountInfo.hasDiscount && (
                <span className="text-xs text-txt-secondary line-through">
                  {formatPrice(originalPrice!)}
                </span>
              )}
            </div>
          </div>

          <button
            onClick={isOutOfStock ? (e) => { e.preventDefault(); e.stopPropagation(); } : handleAddToCart}
            disabled={isAdding || isOutOfStock}
            className={`relative h-8 sm:h-9 px-3 sm:px-3.5 rounded-full flex items-center justify-center gap-1.5 text-xs font-semibold transition-all duration-300 ${
              isOutOfStock
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-primary hover:bg-primary-dark text-white shadow-sm hover:shadow-md active:scale-95'
            }`}
            aria-label={
              isOutOfStock
                ? 'Producto agotado'
                : `Agregar ${product.name} al carrito`
            }
          >
            {isOutOfStock ? (
              <span className="text-[10px] uppercase tracking-wider">Agotado</span>
            ) : (
              <>
                <ShoppingBag className="w-3.5 h-3.5 stroke-[2]" />
                <span>Agregar</span>
              </>
            )}
          </button>
        </div>
      </div>
    </Link>
  );
}
