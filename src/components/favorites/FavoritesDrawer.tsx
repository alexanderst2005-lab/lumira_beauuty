'use client';

import { useEffect } from 'react';
import { X, Heart, ShoppingCart } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import SafeImage from '@/components/common/SafeImage';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useFavorites } from '@/context/FavoritesContext';
import { useCart } from '@/context/CartContext';
import { formatPrice } from '@/utils/whatsapp';
import { toast } from 'sonner';

export default function FavoritesDrawer() {
  const router = useRouter();
  const { favorites, isFavoritesOpen, setIsFavoritesOpen, toggleFavorite, clearFavorites } = useFavorites();
  const { addToCart } = useCart();

  useEffect(() => {
    if (isFavoritesOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isFavoritesOpen]);

  const handleAddToCart = (product: any) => {
    if ((product.tones && product.tones.length > 0) || (product.options && product.options.length > 0)) {
      setIsFavoritesOpen(false);
      router.push(`/producto/${product.id}`);
      return;
    }
    addToCart(product, 1);
    toast.success('Producto agregado al carrito ✅');
  };

  return (
    <AnimatePresence>
      {isFavoritesOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/40 z-[80] backdrop-blur-sm"
            onClick={() => setIsFavoritesOpen(false)}
          />

          {/* Favorites Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed top-0 right-0 h-full w-full sm:w-[420px] max-w-full bg-white z-[90] shadow-2xl flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-border">
              <div className="flex items-center gap-2">
                <Heart className="w-5 h-5 text-primary fill-primary" />
                <h2 className="text-lg font-heading font-semibold">
                  Tus Favoritos
                  {favorites.length > 0 && (
                    <span className="ml-2 text-sm font-normal text-txt-secondary">
                      ({favorites.length})
                    </span>
                  )}
                </h2>
              </div>
              <button
                onClick={() => setIsFavoritesOpen(false)}
                className="p-2 rounded-full hover:bg-secondary-100 transition-colors"
                aria-label="Cerrar favoritos"
              >
                <X className="w-5 h-5 text-txt" />
              </button>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 cart-scrollbar">
              {favorites.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center py-16">
                  <Heart className="w-16 h-16 text-txt-secondary/20 mb-4" />
                  <p className="text-txt font-medium mb-2">No tienes favoritos aún</p>
                  <p className="text-sm text-txt-secondary mb-6">¡Guarda los productos que más te gustan!</p>
                  <Link
                    href="/catalogo"
                    onClick={() => setIsFavoritesOpen(false)}
                    className="btn-primary"
                  >
                    Seguir explorando
                  </Link>
                </div>
              ) : (
                favorites.map((product) => (
                  <div key={product.id} className="flex gap-4 p-4 bg-white border border-border-light rounded-xl transition-all relative group">
                    <button
                      onClick={() => toggleFavorite(product)}
                      className="absolute top-3 right-3 p-1 rounded-full text-txt-secondary/60 hover:text-txt transition-colors"
                      aria-label="Eliminar de favoritos"
                    >
                      <X className="w-4 h-4" />
                    </button>
                    
                    <Link
                      href={`/producto/${product.id}`}
                      onClick={() => setIsFavoritesOpen(false)}
                      className="relative w-24 h-24 flex-shrink-0 bg-white rounded-lg overflow-hidden border border-border-light"
                    >
                      <SafeImage
                        src={product.image}
                        alt={product.name}
                        fill
                        className="object-contain p-2 mix-blend-multiply"
                      />
                    </Link>
                    
                    <div className="flex flex-col flex-1 py-1 pr-6">
                      <Link
                        href={`/producto/${product.id}`}
                        onClick={() => setIsFavoritesOpen(false)}
                        className="font-medium text-sm text-txt line-clamp-2 hover:text-primary transition-colors"
                      >
                        {product.name}
                      </Link>
                      <div className="font-semibold text-txt mt-1">
                        {formatPrice(product.price)}
                      </div>
                      
                      <button
                        onClick={() => {
                          handleAddToCart(product);
                          toggleFavorite(product);
                        }}
                        className="mt-auto self-start text-xs font-medium px-4 py-1.5 border border-txt text-txt hover:bg-txt hover:text-white rounded-full transition-colors flex items-center gap-1.5"
                      >
                        Mover al carrito
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer Actions */}
            {favorites.length > 0 && (
              <div className="border-t border-border-light p-4 bg-white flex flex-col gap-3">
                <Link
                  href="/catalogo"
                  onClick={() => setIsFavoritesOpen(false)}
                  className="w-full py-3 bg-txt text-white rounded-lg font-medium hover:bg-txt-secondary transition-colors text-center text-sm"
                >
                  Seguir explorando
                </Link>
                <button
                  onClick={clearFavorites}
                  className="w-full py-2 text-xs text-txt-secondary/70 hover:text-txt font-medium transition-colors"
                >
                  Vaciar lista de favoritos
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
