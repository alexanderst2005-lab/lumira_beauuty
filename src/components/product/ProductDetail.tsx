'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Heart, ShoppingCart, ArrowLeft, Check, Truck, CreditCard } from 'lucide-react';
import { motion } from 'framer-motion';
import { Product, Tone, ProductOptionValue } from '@/types';
import { useCart } from '@/context/CartContext';
import { useFavorites } from '@/context/FavoritesContext';
import { formatPrice } from '@/utils/whatsapp';
import QuantitySelector from './QuantitySelector';
import ProductCard from '@/components/catalog/ProductCard';
import { toast } from 'sonner';
import { getOptimizedImageUrl } from '@/utils/image';

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
  const [selectedOptions, setSelectedOptions] = useState<Record<string, ProductOptionValue>>({});
  const [overrideImage, setOverrideImage] = useState<string | null>(null);

  // Auto-scroll to top on mount
  useEffect(() => {
    const scrollToTop = () => {
      window.scrollTo({ top: 0, behavior: 'instant' });
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    };
    
    scrollToTop();
    const timer = setTimeout(scrollToTop, 100);
    return () => clearTimeout(timer);
  }, []);

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
    
    // Legacy support
    if (product.tones && product.tones.length > 0 && !selectedTone) {
      toast.error('Selecciona un tono antes de agregar este producto al carrito.', { icon: '🎨' });
      return;
    }

    // New options support
    if (product.options && product.options.length > 0) {
      const missingOptions = product.options.filter(opt => !selectedOptions[opt.name]);
      if (missingOptions.length > 0) {
        toast.error(`Selecciona ${missingOptions[0].name} antes de agregar al carrito.`, { icon: '⚠️' });
        return;
      }
    }

    addToCart(product, quantity, selectedTone || undefined, selectedOptions);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2000);
  };

  const handleOptionSelect = (optionName: string, value: ProductOptionValue) => {
    setSelectedOptions(prev => ({ ...prev, [optionName]: value }));
    if (value.image) {
      setOverrideImage(value.image);
    }
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

      {/* Aumentamos pb-24 sm:pb-32 para que el botón de WhatsApp no tape contenido */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24 sm:pb-32">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 lg:gap-10 items-start">
          {/* Galería del Producto */}
          <div className="flex flex-col gap-4 max-w-[340px] sm:max-w-sm lg:max-w-md xl:max-w-lg mx-auto w-full">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="relative w-full aspect-square md:aspect-auto md:min-h-[400px] lg:min-h-[500px] rounded-2xl overflow-hidden bg-white border border-border-light shadow-sm touch-pan-y flex items-center justify-center"
              onTouchStart={onTouchStart}
              onTouchMove={onTouchMove}
              onTouchEnd={onTouchEndHandler}
            >
              <Image
                src={getOptimizedImageUrl(overrideImage || displayImages[currentImageIndex], 800)}
                alt={product.name}
                fill
                priority={true}
                unoptimized={true}
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                className={`object-contain p-2 sm:p-4 transition-opacity duration-300 ${isOutOfStock ? 'grayscale opacity-60' : ''}`}
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
                    onClick={() => {
                      setCurrentImageIndex(idx);
                      setOverrideImage(null);
                    }}
                    className={`relative w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 border-2 transition-all duration-200 ${
                      (currentImageIndex === idx && !overrideImage) ? 'border-primary' : 'border-transparent opacity-60 hover:opacity-100'
                    }`}
                  >
                    <Image
                      src={getOptimizedImageUrl(img, 150)}
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
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-display font-bold text-txt mb-1.5 lg:mb-2 leading-tight uppercase">
            {product.name}
          </h1>

          <p className="text-xs sm:text-sm text-txt-secondary leading-relaxed mb-4 max-w-prose line-clamp-[8]">
            {product.fullDescription}
          </p>

          <div className="text-lg sm:text-xl lg:text-2xl font-display font-extrabold text-primary mb-5 drop-shadow-sm">
            {formatPrice(product.price)}
          </div>

          <div className="bg-white rounded-3xl p-4 sm:p-5 border border-border-light shadow-sm flex flex-col gap-4">
            
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

            {/* Opciones Dinámicas */}
            {product.options && product.options.length > 0 && (
              <div className="w-full space-y-6">
                {product.options.map((option) => (
                  <div key={option.name}>
                    <label className="block text-xs font-bold text-txt-secondary mb-3 uppercase tracking-wider">
                      {option.name}: <span className="text-txt font-semibold">{selectedOptions[option.name] ? selectedOptions[option.name].name : 'Seleccionar...'}</span>
                    </label>
                    <div className="flex flex-wrap gap-3">
                      {option.values.map((val) => {
                        const isSelected = selectedOptions[option.name]?.name === val.name;
                        return (
                          <button
                            key={val.name}
                            onClick={() => handleOptionSelect(option.name, val)}
                            className={`px-4 py-2 rounded-xl border-2 transition-all duration-200 text-sm font-medium ${
                              isSelected
                                ? 'border-primary bg-primary/5 text-primary'
                                : 'border-border hover:border-txt-secondary text-txt-secondary hover:text-txt'
                            }`}
                          >
                            {val.name}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4 mt-1">
              {/* Selector de Cantidad */}
            <div className="w-full sm:w-auto">
              <label className="block text-[10px] sm:text-xs font-bold text-txt-secondary mb-2 uppercase tracking-wider text-center sm:text-left">
                Cantidad
              </label>
              <QuantitySelector quantity={quantity} onChange={setQuantity} />
            </div>

            {/* Botón Agregar al Carrito */}
            <button
              onClick={isOutOfStock ? (e) => e.preventDefault() : handleAddToCart}
              disabled={isAdded || isOutOfStock}
              className={`w-full py-2.5 px-5 rounded-full font-semibold text-xs sm:text-sm transition-all duration-300 flex items-center justify-center gap-2 ${
                isOutOfStock
                  ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                  : isAdded
                  ? 'bg-green-500 text-white shadow-sm scale-95'
                  : 'btn-primary flex-1'
              }`}
              id="add-to-cart"
            >
              {isOutOfStock ? (
                <span className="font-bold tracking-wider uppercase text-[10px] sm:text-xs">Agotado - No Disponible</span>
              ) : isAdded ? (
                <>
                  <Check className="w-4 h-4" />
                  ¡Agregado al carrito!
                </>
              ) : (
                <>
                  <ShoppingCart className="w-4 h-4" />
                  Agregar al carrito
                </>
              )}
            </button>
            </div>

            {/* Opciones de entrega */}
            <div className="mt-8 pt-6 border-t border-border/50">
              <h4 className="text-sm font-bold text-txt mb-4 font-sans">Opciones de entrega:</h4>
              <div className="space-y-3">
                <div className="flex items-center gap-3 bg-secondary-50/50 rounded-xl p-3 border border-border/30">
                  <div className="bg-gray-200/80 p-2.5 rounded-full flex-shrink-0">
                    <Truck className="w-5 h-5 text-txt" />
                  </div>
                  <div className="text-sm font-sans flex flex-wrap gap-2 items-center">
                    <span className="font-semibold text-txt">Contra Entrega</span>
                    <span className="text-txt-secondary">Cali</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 bg-secondary-50/50 rounded-xl p-3 border border-border/30">
                  <div className="bg-gray-200/80 p-2.5 rounded-full flex-shrink-0">
                    <CreditCard className="w-5 h-5 text-txt" />
                  </div>
                  <div className="text-sm font-sans flex flex-wrap gap-2 items-center">
                    <span className="font-semibold text-txt">Envíos Nacionales</span>
                    <span className="text-txt-secondary">Colombia</span>
                  </div>
                </div>
              </div>
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
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16"
        >
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-display font-bold text-txt">
              También te podría <span className="text-gradient">interesar</span>
            </h2>
          </div>
          <div className="flex overflow-x-auto gap-3 sm:gap-4 lg:gap-6 pb-6 pt-2 px-4 -mx-4 sm:mx-0 sm:px-0 snap-x snap-mandatory scroll-smooth scrollbar-hide">
            {relatedProducts.slice(0, 8).map((p) => (
              <div 
                key={p.id} 
                className="min-w-[55vw] sm:min-w-[calc(33.333%-0.66rem)] lg:min-w-[calc(25%-1.125rem)] xl:min-w-[calc(20%-1.2rem)] snap-center sm:snap-start flex-shrink-0 transition-transform duration-300 hover:-translate-y-1"
              >
                <ProductCard product={p} />
              </div>
            ))}
          </div>
        </motion.section>
      )}
    </div>
  );
}
