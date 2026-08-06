'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, ShoppingCart, Check } from 'lucide-react';
import { motion } from 'framer-motion';
import { Product } from '@/types';
import { useCart } from '@/context/CartContext';
import { formatPrice } from '@/utils/whatsapp';
import QuantitySelector from './QuantitySelector';
import ProductCard from '@/components/catalog/ProductCard';

interface ProductDetailProps {
  product: Product;
  relatedProducts: Product[];
}

export default function ProductDetail({ product, relatedProducts }: ProductDetailProps) {
  const { addToCart } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [isAdded, setIsAdded] = useState(false);

  const handleAddToCart = () => {
    addToCart(product, quantity);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
      {/* Botón Volver */}
      <Link
        href="/catalogo"
        className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-border-light text-sm text-txt-secondary hover:text-primary hover:border-primary/30 shadow-sm hover:shadow-md transition-all duration-300 mb-10 group"
      >
        <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
        Volver al catálogo
      </Link>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 lg:gap-16 mb-20 items-center">
        {/* Imagen del Producto */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="relative aspect-square rounded-[2rem] overflow-hidden bg-gradient-to-br from-[#FFF5F9] to-[#FFE6F0] border border-white shadow-xl shadow-primary/5"
        >
          <Image
            src={product.image}
            alt={product.name}
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-contain p-8 drop-shadow-2xl hover:scale-105 transition-transform duration-700"
            priority
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
            }}
          />
          <div className="absolute inset-0 flex items-center justify-center text-9xl opacity-10 pointer-events-none">
            ✨
          </div>
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
