'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, ShoppingCart, Check, Heart } from 'lucide-react';
import { motion } from 'framer-motion';
import { Product } from '@/types';
import { useCart } from '@/context/CartContext';
import { useFavorites } from '@/context/FavoritesContext';
import { formatPrice } from '@/utils/whatsapp';
import QuantitySelector from './QuantitySelector';
import ProductCard from '@/components/catalog/ProductCard';
import { toast } from 'sonner';

interface ProductDetailProps {
  product: Product;
  relatedProducts: Product[];
}

export default function ProductDetail({ product, relatedProducts }: ProductDetailProps) {
  const { addToCart } = useCart();
  const { toggleFavorite } = useFavorites();
  const [quantity, setQuantity] = useState(1);
  const [isAdded, setIsAdded] = useState(false);
  const [isLocalFav, setIsLocalFav] = useState(false);

  const handleFavoriteToggle = () => {
    toggleFavorite(product);
    setIsLocalFav(!isLocalFav);
    if (!isLocalFav) {
      toast.success('Agregado a tus favoritos ❤️', { icon: '❤️' });
    } else {
      toast('Eliminado de tus favoritos', { icon: '💔' });
    }
  };

  const handleAddToCart = () => {
    addToCart(product, quantity);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2000);
  };

  return (
    <div className="min-h-screen bg-bg">
      {/* Botón de retroceso */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        <Link 
          href="/catalogo" 
          className="inline-flex items-center gap-2 text-txt-secondary hover:text-primary transition-colors text-sm font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver al catálogo
        </Link>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 sm:pb-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-start">
          {/* Imagen del Producto */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative aspect-[4/5] sm:aspect-square w-full rounded-2xl overflow-hidden bg-white border border-border-light shadow-sm"
          >
            <Image
              src={product.image}
              alt={product.name}
              fill
              className="object-contain p-8 sm:p-12 mix-blend-multiply"
              priority
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
            {/* Fallback decorativo */}
            <div className="absolute inset-0 flex items-center justify-center text-9xl opacity-10 pointer-events-none">
              ✨
            </div>

            {/* Favorite Button Minimalista */}
            <button
              onClick={handleFavoriteToggle}
              className="absolute top-6 right-6 z-20 p-2 bg-transparent transition-transform duration-300 hover:scale-110"
              aria-label={isLocalFav ? "Quitar de favoritos" : "Agregar a favoritos"}
            >
              <motion.div
                animate={isLocalFav ? { scale: [1, 1.2, 1] } : { scale: 1 }}
                transition={{ duration: 0.3 }}
              >
                <Heart 
                  strokeWidth={1.5}
                  className={`w-6 h-6 sm:w-7 sm:h-7 transition-colors duration-300 ${
                    isLocalFav ? 'fill-primary text-primary' : 'text-txt-secondary hover:text-txt'
                  }`} 
                />
              </motion.div>
            </button>
          </motion.div>

        {/* Información del Producto */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2, ease: 'easeOut' }}
          className="flex flex-col justify-center"
        >
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-display font-bold text-txt mb-4 leading-tight">
            {product.name}
          </h1>

          <p className="text-lg text-txt-secondary leading-relaxed mb-8">
            {product.fullDescription}
          </p>

          <div className="text-4xl sm:text-5xl font-display font-extrabold text-primary mb-10 drop-shadow-sm">
            {formatPrice(product.price)}
          </div>

          <div className="bg-white rounded-3xl p-6 border border-border-light shadow-lg shadow-primary/5 flex flex-col sm:flex-row items-center gap-6">
            {/* Selector de Cantidad */}
            <div className="w-full sm:w-auto">
              <label className="block text-xs font-bold text-txt-secondary mb-3 uppercase tracking-wider text-center sm:text-left">
                Cantidad
              </label>
              <QuantitySelector quantity={quantity} onChange={setQuantity} />
            </div>

            {/* Botón Agregar al Carrito */}
            <button
              onClick={handleAddToCart}
              disabled={isAdded}
              className={`w-full py-4 px-8 rounded-full font-semibold text-base transition-all duration-300 flex items-center justify-center gap-3 ${
                isAdded
                  ? 'bg-green-500 text-white shadow-lg shadow-green-500/25 scale-95'
                  : 'btn-primary flex-1'
              }`}
              id="add-to-cart"
            >
              {isAdded ? (
                <>
                  <Check className="w-5 h-5" />
                  ¡Agregado al carrito!
                </>
              ) : (
                <>
                  <ShoppingCart className="w-5 h-5" />
                  Agregar al carrito
                </>
              )}
            </button>
          </div>
        </motion.div>
        </div>
      </div>

      {/* Productos Relacionados */}
      {relatedProducts.length > 0 && (
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6 }}
        >
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-display font-bold text-txt">
              También te podría <span className="text-gradient">interesar</span>
            </h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {relatedProducts.slice(0, 4).map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </motion.section>
      )}
    </div>
  );
}
