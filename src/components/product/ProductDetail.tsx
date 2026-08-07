'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Heart, ShoppingCart, ArrowLeft, Check } from 'lucide-react';
import { motion } from 'framer-motion';
import { Product, Tone } from '@/types';
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
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const [selectedTone, setSelectedTone] = useState<Tone | null>(null);

  const isOutOfStock = product.stock === 0;

  // Swipe logic
  const minSwipeDistance = 50;
  
  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEndHandler = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    const displayImages = product.images || [product.image];
    if (isLeftSwipe && currentImageIndex < displayImages.length - 1) {
      setCurrentImageIndex(prev => prev + 1);
    }
    if (isRightSwipe && currentImageIndex > 0) {
      setCurrentImageIndex(prev => prev - 1);
    }
  };

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
    if (isOutOfStock) return;
    
    if (product.tones && product.tones.length > 0 && !selectedTone) {
      toast.error('Selecciona un tono antes de agregar este producto al carrito.', { icon: '🎨' });
      return;
    }
    addToCart(product, quantity, selectedTone || undefined);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2000);
  };

  const displayImages = product.images || [product.image];

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
          {/* Galería del Producto */}
          <div className="flex flex-col gap-4">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="relative aspect-[4/5] sm:aspect-square w-full rounded-2xl overflow-hidden bg-white border border-border-light shadow-sm touch-pan-y"
              onTouchStart={onTouchStart}
              onTouchMove={onTouchMove}
              onTouchEnd={onTouchEndHandler}
            >
              <Image
                src={displayImages[currentImageIndex]}
                alt={product.name}
                fill
                className={`object-contain p-8 sm:p-12 mix-blend-multiply transition-opacity duration-300 ${isOutOfStock ? 'grayscale opacity-60' : ''}`}
                priority
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
              {/* Fallback decorativo */}
              <div className="absolute inset-0 flex items-center justify-center text-9xl opacity-10 pointer-events-none">
                ✨
              </div>

              {/* Capa oscura si está agotado */}
              {isOutOfStock && (
                <div className="absolute inset-0 bg-black/20 z-10 pointer-events-none" />
              )}

              {/* Agotado Badge (GIGANTE) */}
              {isOutOfStock && (
                <div className="absolute inset-0 z-30 flex items-center justify-center pointer-events-none">
                  <div className="bg-black/80 backdrop-blur-sm text-white px-8 py-3 rounded-xl -rotate-12 border border-white/20 shadow-2xl">
                    <span className="text-2xl sm:text-4xl font-bold tracking-widest uppercase">
                      Agotado
                    </span>
                  </div>
                </div>
              )}
              
              {/* Indicadores de swipe */}
              {displayImages.length > 1 && (
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10 md:hidden">
                  {displayImages.map((_, idx) => (
                    <div 
                      key={idx} 
                      className={`h-1.5 rounded-full transition-all duration-300 ${currentImageIndex === idx ? 'w-4 bg-primary' : 'w-1.5 bg-border-light'}`}
                    />
                  ))}
                </div>
              )}

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

            {/* Thumbnails */}
            {displayImages.length > 1 && (
              <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
                {displayImages.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentImageIndex(idx)}
                    className={`relative w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 border-2 transition-all duration-200 ${
                      currentImageIndex === idx ? 'border-primary' : 'border-transparent opacity-60 hover:opacity-100'
                    }`}
                  >
                    <Image
                      src={img}
                      alt={`Vista ${idx + 1}`}
                      fill
                      className="object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

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

          <div className="bg-white rounded-3xl p-6 border border-border-light shadow-lg shadow-primary/5 flex flex-col gap-6">
            
            {/* Opciones de Tonos */}
            {product.tones && product.tones.length > 0 && (
              <div className="w-full">
                <label className="block text-xs font-bold text-txt-secondary mb-3 uppercase tracking-wider">
                  Tono seleccionado: <span className="text-txt font-semibold">{selectedTone ? selectedTone.name : 'Ninguno'}</span>
                </label>
                <div className="flex flex-wrap gap-3">
                  {product.tones.map((tone) => (
                    <button
                      key={tone.name}
                      onClick={() => setSelectedTone(tone)}
                      className={`w-10 h-10 rounded-full border-2 transition-all duration-200 shadow-sm hover:scale-110 ${
                        selectedTone?.name === tone.name
                          ? 'border-primary ring-2 ring-primary/20 scale-110'
                          : 'border-border hover:border-txt-secondary'
                      }`}
                      style={{ backgroundColor: tone.hex }}
                      aria-label={`Seleccionar tono ${tone.name}`}
                      title={tone.name}
                    />
                  ))}
                </div>
              </div>
            )}

            <div className="flex flex-col sm:flex-row items-center gap-6">
              {/* Selector de Cantidad */}
            <div className="w-full sm:w-auto">
              <label className="block text-xs font-bold text-txt-secondary mb-3 uppercase tracking-wider text-center sm:text-left">
                Cantidad
              </label>
              <QuantitySelector quantity={quantity} onChange={setQuantity} />
            </div>

            {/* Botón Agregar al Carrito */}
            <button
              onClick={isOutOfStock ? (e) => e.preventDefault() : handleAddToCart}
              disabled={isAdded || isOutOfStock}
              className={`w-full py-4 px-8 rounded-full font-semibold text-base transition-all duration-300 flex items-center justify-center gap-3 ${
                isOutOfStock
                  ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                  : isAdded
                  ? 'bg-green-500 text-white shadow-lg shadow-green-500/25 scale-95'
                  : 'btn-primary flex-1'
              }`}
              id="add-to-cart"
            >
              {isOutOfStock ? (
                <span className="font-bold tracking-widest uppercase">Agotado - No Disponible</span>
              ) : isAdded ? (
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
