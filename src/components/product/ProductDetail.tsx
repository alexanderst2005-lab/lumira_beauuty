'use client';

import { useState, useEffect } from 'react';
import SafeImage from '@/components/common/SafeImage';
import { useRouter } from 'next/navigation';
import { Heart, ShoppingBag, ArrowLeft, Check, Truck, ShieldCheck, Sparkles, MapPin } from 'lucide-react';
import { motion } from 'framer-motion';
import { Product, Tone, ProductOptionValue } from '@/types';
import { useCart } from '@/context/CartContext';
import { useFavorites } from '@/context/FavoritesContext';
import { useCampaignPromotions } from '@/context/CampaignPromotionsContext';
import { formatPrice } from '@/utils/whatsapp';
import QuantitySelector from './QuantitySelector';
import ProductCard from '@/components/catalog/ProductCard';
import { toast } from 'sonner';
import { preloadProductImages, preloadSingleImage } from '@/utils/imagePreloader';
import { getLastCatalogUrl } from '@/utils/scrollRestoration';

interface ProductDetailProps {
  product: Product;
  relatedProducts: Product[];
}

export default function ProductDetail({ product, relatedProducts }: ProductDetailProps) {
  const router = useRouter();
  const { addToCart, items } = useCart();
  const { toggleFavorite, isFavorite } = useFavorites();
  const { getProductDiscount } = useCampaignPromotions();
  const [quantity, setQuantity] = useState(1);
  const [isAdded, setIsAdded] = useState(false);
  const [isAdding, setIsAdding] = useState(false);

  // Consultar descuento activo (campaña o individual con resolución de mejor oferta)
  const discountInfo = getProductDiscount(product.id, product.price, product.originalPrice);
  const effectivePrice = discountInfo.hasDiscount ? discountInfo.finalPrice : product.price;
  const originalPrice = discountInfo.hasDiscount ? discountInfo.originalPrice : undefined;

  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const [selectedTone, setSelectedTone] = useState<Tone | null>(null);
  const [selectedOptions, setSelectedOptions] = useState<Record<string, ProductOptionValue>>({});
  const [overrideImage, setOverrideImage] = useState<string | null>(null);

  const isFav = isFavorite(product.id);
  const inCartQty = items
    .filter((item) => item.product.id === product.id)
    .reduce((sum, item) => sum + item.quantity, 0);

  const handleBack = (e: React.MouseEvent) => {
    e.preventDefault();
    const lastUrl = getLastCatalogUrl();
    if (lastUrl) {
      router.push(lastUrl);
    } else if (typeof window !== 'undefined' && window.history.length > 1) {
      router.back();
    } else {
      router.push('/catalogo');
    }
  };

  // Precargar las imágenes principales y los productos relacionados
  useEffect(() => {
    if (product) {
      const displayImgs = product.images || [product.image];
      displayImgs.forEach((img) => preloadSingleImage(img, 800));
    }
    if (relatedProducts && relatedProducts.length > 0) {
      preloadProductImages(relatedProducts, 0, relatedProducts.length, 400);
    }
  }, [product, relatedProducts]);

  // Auto-scroll al inicio al montar
  useEffect(() => {
    const scrollToTop = () => {
      window.scrollTo({ top: 0, behavior: 'instant' });
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    };
    scrollToTop();
    const timer = setTimeout(scrollToTop, 100);
    return () => clearTimeout(timer);
  }, [product.id]);

  const isOutOfStock = product.stock === 0;

  // Lógica táctil para galería
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
      setCurrentImageIndex((prev) => prev + 1);
    }
    if (isRightSwipe && currentImageIndex > 0) {
      setCurrentImageIndex((prev) => prev - 1);
    }
  };

  const handleFavoriteToggle = () => {
    toggleFavorite(product);
    if (!isFav) {
      toast.success('Agregado a tus favoritos ❤️', { icon: '❤️' });
    } else {
      toast('Eliminado de tus favoritos', { icon: '💔' });
    }
  };

  const handleAddToCart = () => {
    if (isOutOfStock || isAdding) return;

    if (product.tones && product.tones.length > 0 && !selectedTone) {
      toast.error('Selecciona un tono antes de agregar este producto al carrito.', { icon: '🎨' });
      return;
    }

    if (product.options && product.options.length > 0) {
      const missingOptions = product.options.filter((opt) => !selectedOptions[opt.name]);
      if (missingOptions.length > 0) {
        toast.error(`Selecciona ${missingOptions[0].name} antes de agregar al carrito.`, { icon: '⚠️' });
        return;
      }
    }

    setIsAdding(true);
    addToCart({
      ...product,
      price: effectivePrice,
      originalPrice,
      discountPercent: discountInfo.discountPercent,
      hasDiscount: discountInfo.hasDiscount,
      savings: discountInfo.savings
    }, quantity, selectedTone || undefined, selectedOptions);
    setIsAdded(true);
    toast.success('Producto agregado al carrito ✅');
    setTimeout(() => {
      setIsAdded(false);
      setIsAdding(false);
    }, 1200);
  };

  const handleBuyNow = () => {
    if (isOutOfStock) return;
    if (product.options && product.options.length > 0) {
      const missingOptions = product.options.filter((opt) => !selectedOptions[opt.name]);
      if (missingOptions.length > 0) {
        toast.error(`Selecciona ${missingOptions[0].name} antes de comprar.`, { icon: '⚠️' });
        return;
      }
    }
    addToCart({
      ...product,
      price: effectivePrice,
      originalPrice,
      discountPercent: discountInfo.discountPercent,
      hasDiscount: discountInfo.hasDiscount,
      savings: discountInfo.savings
    }, quantity, selectedTone || undefined, selectedOptions);
    const subtotal = effectivePrice * quantity;
    const formatNumber = (num: number) =>
      new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(num);

    let msg = `Hola Lumira Beauty ✨ Quisiera comprar ahora:\n\n`;
    msg += `• *${product.name}* x${quantity}`;
    if (selectedTone) msg += ` (Tono: ${selectedTone.name})`;
    if (selectedOptions && Object.keys(selectedOptions).length > 0) {
      const opts = Object.entries(selectedOptions)
        .map(([k, v]) => `${k}: ${v.name}`)
        .join(', ');
      msg += ` (${opts})`;
    }
    msg += ` - ${formatNumber(subtotal)}`;
    if (discountInfo.hasDiscount) {
      msg += ` (Descuento -${discountInfo.discountPercent}%)`;
    }
    msg += `\n\n*Total:* ${formatNumber(subtotal)}\n\n¿Tienen disponibilidad para despacho?`;


    window.open(`https://wa.me/573174503716?text=${encodeURIComponent(msg)}`, '_blank');
  };

  const handleOptionSelect = (optionName: string, value: ProductOptionValue) => {
    setSelectedOptions((prev) => ({ ...prev, [optionName]: value }));
    if (value.image) {
      setOverrideImage(value.image);
    }
  };

  const displayImages = product.images && product.images.length > 0 ? product.images : [product.image];
  const activeImage = overrideImage || displayImages[currentImageIndex] || product.image;

  // Filtrar productos relacionados: excluir el actual y evitar duplicados
  const filteredRelated = relatedProducts
    .filter((p) => p.id !== product.id)
    .slice(0, 10);

  return (
    <div className="min-h-screen bg-white">
      {/* Barra de navegación secundaria */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-4">
        <button
          onClick={handleBack}
          className="inline-flex items-center gap-2 text-txt-secondary hover:text-primary transition-colors text-sm font-medium font-sans group"
        >
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
          <span>Volver al catálogo</span>
        </button>
      </div>

      {/* Detalle principal */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 sm:pb-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          {/* Columna Izquierda: Galería */}
          <div className="lg:col-span-6 flex flex-col gap-3">
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="relative w-full aspect-[4/5] sm:aspect-square max-h-[560px] rounded-[2px] overflow-hidden bg-white border border-[#E5E5E5] touch-pan-y flex items-center justify-center"
              onTouchStart={onTouchStart}
              onTouchMove={onTouchMove}
              onTouchEnd={onTouchEndHandler}
            >
              <SafeImage
                src={activeImage}
                alt={product.name}
                fill
                priority={true}
                unoptimized={true}
                optimizeWidth={800}
                sizes="(max-width: 1024px) 100vw, 50vw"
                className={`object-contain transition-transform duration-500 hover:scale-105 ${
                  isOutOfStock ? 'grayscale opacity-60' : ''
                }`}
              />

              {/* Badges */}
              <div className="absolute top-4 left-4 z-20 flex flex-col gap-2">
                {product.isNew && !isOutOfStock && (
                  <span className="bg-primary text-white text-[10px] sm:text-xs font-semibold px-3 py-1 rounded-full uppercase tracking-[0.15em] font-sans shadow-sm">
                    Nuevo
                  </span>
                )}
                {isOutOfStock && (
                  <span className="bg-txt/85 text-white text-[10px] sm:text-xs font-semibold px-3 py-1 rounded-full uppercase tracking-[0.15em] font-sans shadow-sm">
                    Agotado
                  </span>
                )}
              </div>
            </motion.div>

            {/* Indicadores en móvil limpios, centrados y 100% redondos (NUNCA CORTADOS) */}
            {displayImages.length > 1 && (
              <div className="flex justify-center items-center gap-2 py-2 sm:hidden">
                {displayImages.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setCurrentImageIndex(idx);
                      setOverrideImage(null);
                    }}
                    className={`h-2 rounded-full transition-all duration-300 ${
                      currentImageIndex === idx ? 'w-6 bg-[#111111]' : 'w-2 bg-[#D4D4D8]'
                    }`}
                    aria-label={`Ver foto ${idx + 1}`}
                  />
                ))}
              </div>
            )}

            {/* Miniaturas */}
            {displayImages.length > 1 && (
              <div className="flex gap-2.5 overflow-x-auto pb-1 scrollbar-hide">
                {displayImages.map((img, idx) => {
                  const isSelected = currentImageIndex === idx && !overrideImage;
                  return (
                    <button
                      key={idx}
                      onClick={() => {
                        setCurrentImageIndex(idx);
                        setOverrideImage(null);
                      }}
                      className={`relative w-16 h-16 sm:w-20 sm:h-20 rounded-[2px] overflow-hidden flex-shrink-0 bg-white border transition-all duration-200 ${
                        isSelected
                          ? 'border-[#111111] ring-1 ring-[#111111]'
                          : 'border-[#E5E5E5] opacity-70 hover:opacity-100 hover:border-gray-400'
                      }`}
                      aria-label={`Ver foto ${idx + 1}`}
                    >
                      <SafeImage
                        src={img}
                        alt={`Miniatura ${idx + 1}`}
                        fill
                        optimizeWidth={160}
                        className="object-contain p-1"
                      />
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Columna Derecha: Información y Compra */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="lg:col-span-6 flex flex-col pt-1"
          >
            {/* Nombre con tipografía editorial */}
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-display font-medium text-txt mb-2 leading-tight tracking-tight">
              {product.name}
            </h1>

            {/* Precio y Descuento */}
            <div className="flex items-baseline gap-3 mb-5 flex-wrap">
              <span className={`text-2xl sm:text-3xl font-bold tracking-tight font-sans ${discountInfo.hasDiscount ? 'text-rose-600' : 'text-txt'}`}>
                {formatPrice(effectivePrice)}
              </span>
              {discountInfo.hasDiscount && (
                <>
                  <span className="text-base sm:text-lg text-txt-secondary line-through font-sans">
                    {formatPrice(originalPrice!)}
                  </span>
                  <span className="text-xs text-rose-700 bg-rose-50 border border-rose-200 px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider">
                    Oferta -{discountInfo.discountPercent}%
                  </span>
                  <span className="text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full font-semibold">
                    Ahorras {formatPrice(discountInfo.savings)}
                  </span>
                </>
              )}
            </div>


            {/* Descripción */}
            {(product.description || product.fullDescription) && (
              <div className="text-sm sm:text-base text-txt-secondary leading-relaxed mb-6 font-sans font-normal border-b border-[#F0E6DE] pb-6">
                <p>{product.description || product.fullDescription}</p>
              </div>
            )}

            {/* Caja de Opciones y Compra */}
            <div className="bg-white rounded-[2px] p-5 sm:p-6 border border-[#E5E5E5] flex flex-col gap-5">
              {/* Opciones de Tonos */}
              {product.tones && product.tones.length > 0 && (
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-txt-secondary mb-2.5 font-sans">
                    Tono:{' '}
                    <span className="text-txt font-bold">
                      {selectedTone ? selectedTone.name : 'Selecciona un tono'}
                    </span>
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {product.tones.map((tone) => {
                      const isSelected = selectedTone?.name === tone.name;
                      return (
                        <button
                          key={tone.name}
                          onClick={() => setSelectedTone(tone)}
                          className={`w-8 h-8 rounded-full border-2 transition-all duration-200 ${
                            isSelected
                              ? 'border-[#111111] ring-2 ring-black/20 scale-110'
                              : 'border-border hover:border-txt'
                          }`}
                          style={{ backgroundColor: tone.hex }}
                          aria-label={`Seleccionar tono ${tone.name}`}
                          title={tone.name}
                        />
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Opciones Dinámicas */}
              {product.options && product.options.length > 0 && (
                <div className="space-y-3.5">
                  {product.options.map((option) => (
                    <div key={option.name}>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-txt-secondary mb-2 font-sans">
                        {option.name}:{' '}
                        <span className="text-txt font-bold">
                          {selectedOptions[option.name]?.name || 'Seleccionar...'}
                        </span>
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {option.values.map((val) => {
                          const isSelected = selectedOptions[option.name]?.name === val.name;
                          return (
                            <button
                              key={val.name}
                              onClick={() => handleOptionSelect(option.name, val)}
                              className={`px-3 py-1.5 rounded-[2px] border text-xs font-medium transition-all duration-200 ${
                                isSelected
                                  ? 'border-[#111111] bg-[#111111] text-white'
                                  : 'border-[#D4D4D8] text-txt hover:border-black'
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

              {/* Fila 1: Cantidad (Idéntica a la imagen de referencia) */}
              <div>
                <QuantitySelector quantity={quantity} onChange={setQuantity} />
              </div>

              {/* Fila 2: AÑADIR AL CARRITO + Botón de Corazón (Idéntica a la imagen de referencia) */}
              <div className="flex items-center gap-2.5 w-full">
                <button
                  onClick={isOutOfStock ? (e) => e.preventDefault() : handleAddToCart}
                  disabled={isAdding || isOutOfStock}
                  className={`flex-1 h-12 border border-[#111111] bg-white text-[#111111] hover:bg-[#111111] hover:text-white rounded-[2px] transition-all duration-200 font-sans font-medium text-xs sm:text-sm uppercase tracking-[0.15em] flex items-center justify-center ${
                    isOutOfStock
                      ? 'opacity-40 cursor-not-allowed'
                      : isAdded
                      ? 'bg-emerald-700 text-white border-emerald-700'
                      : ''
                  }`}
                  id="add-to-cart"
                  aria-label={
                    isOutOfStock
                      ? 'Producto agotado'
                      : `Añadir ${product.name} al carrito`
                  }
                >
                  {isOutOfStock ? (
                    'Agotado'
                  ) : isAdded ? (
                    <span className="inline-flex items-center gap-2">
                      <Check className="w-4 h-4 stroke-[2.5]" />
                      <span>Añadido al carrito</span>
                    </span>
                  ) : (
                    <span>Añadir al carrito</span>
                  )}
                </button>

                <button
                  onClick={handleFavoriteToggle}
                  className={`w-12 h-12 border border-[#111111] bg-white hover:bg-gray-50 rounded-[2px] flex items-center justify-center shrink-0 transition-all duration-200 ${
                    isFav ? 'border-primary' : ''
                  }`}
                  aria-label={isFav ? 'Quitar de favoritos' : 'Añadir a favoritos'}
                  aria-pressed={isFav}
                >
                  <Heart
                    strokeWidth={1.5}
                    className={`w-5 h-5 transition-colors duration-200 ${
                      isFav ? 'fill-primary text-primary' : 'text-[#111111]'
                    }`}
                  />
                </button>
              </div>

              {/* Fila 3: COMPRAR AHORA (Idéntica a la imagen de referencia) */}
              <button
                onClick={handleBuyNow}
                disabled={isOutOfStock}
                className={`w-full h-12 bg-[#111111] hover:bg-black text-white rounded-[2px] font-sans font-medium text-xs sm:text-sm uppercase tracking-[0.15em] flex items-center justify-center transition-all duration-200 shadow-sm ${
                  isOutOfStock ? 'opacity-40 cursor-not-allowed' : 'active:scale-[0.99]'
                }`}
                id="buy-now"
                aria-label={`Comprar ahora ${product.name}`}
              >
                <span>Comprar ahora</span>
              </button>

              {/* Beneficios Destacados - Contra Entrega Cali & Envíos Nacionales (Logos en color fucsia de la marca) */}
              <div className="pt-2 grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div className="flex items-center gap-3 p-3 bg-white border border-[#E5E5E5] rounded-[2px] shadow-sm">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <MapPin className="w-4 h-4 text-primary" strokeWidth={2} />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-semibold uppercase tracking-wider text-txt font-sans">
                      Contra Entrega Cali
                    </span>
                    <span className="text-[11px] text-txt-secondary font-sans">
                      Pagas al recibir tu producto
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-white border border-[#E5E5E5] rounded-[2px] shadow-sm">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <Truck className="w-4 h-4 text-primary" strokeWidth={2} />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-semibold uppercase tracking-wider text-txt font-sans">
                      Envíos Nacionales Colombia
                    </span>
                    <span className="text-[11px] text-txt-secondary font-sans">
                      Despachos a todo el país
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Sección «También te puede interesar» (Grid de Varias Columnas) */}
      {filteredRelated.length > 0 && (
        <section className="border-t border-[#E5E5E5] bg-white py-14 sm:py-20" id="relacionados">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-8 sm:mb-12">
              <span className="text-[11px] uppercase tracking-[0.25em] font-semibold text-primary font-sans block mb-2">
                Recomendaciones
              </span>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-display font-medium text-txt tracking-tight">
                También te puede <span className="text-gradient italic">interesar</span>
              </h2>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-5 lg:gap-6">
              {filteredRelated.map((p) => (
                <div key={p.id} className="h-full">
                  <ProductCard product={p} />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
