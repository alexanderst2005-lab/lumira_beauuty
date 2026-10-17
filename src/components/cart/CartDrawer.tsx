'use client';

import { useEffect, useState } from 'react';
import { X, ShoppingBag, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '@/context/CartContext';
import { formatPrice } from '@/utils/whatsapp';
import CartItemComponent from './CartItem';
import CheckoutModal from './CheckoutModal';

export default function CartDrawer() {
  const { items, itemCount, subtotal, total, isCartOpen, setIsCartOpen, clearCart } = useCart();
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  useEffect(() => {
    if (isCartOpen || isCheckoutOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isCartOpen, isCheckoutOpen]);

  const handleFinishOrder = () => {
    if (items.length === 0) return;
    setIsCheckoutOpen(true);
  };

  return (
    <>
      <AnimatePresence>
        {isCartOpen && (
          <>
            {/* Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black/50 z-[80] backdrop-blur-[2px]"
              onClick={() => setIsCartOpen(false)}
            />

            {/* Cart Panel */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 320 }}
              className="fixed top-0 right-0 h-full w-full sm:w-[400px] max-w-full bg-[#FFFDFB] z-[90] shadow-2xl flex flex-col border-l border-[#E5E5E5]"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-4 sm:p-5 border-b border-[#E5E5E5] bg-white">
                <div className="flex items-center gap-2.5">
                  <ShoppingBag className="w-4 h-4 text-txt stroke-[1.8]" />
                  <h2 className="text-xs sm:text-sm font-sans font-medium uppercase tracking-[0.2em] text-txt">
                    Tu Carrito {itemCount > 0 && `(${itemCount})`}
                  </h2>
                </div>
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="p-1.5 -mr-1.5 rounded-full text-txt hover:opacity-60 transition-opacity"
                  aria-label="Cerrar carrito"
                >
                  <X className="w-5 h-5 stroke-[1.5]" />
                </button>
              </div>

              {/* Items */}
              <div className="flex-1 overflow-y-auto p-4 space-y-2.5 cart-scrollbar">
                {items.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center py-16 px-4">
                    <div className="w-16 h-16 rounded-full bg-[#FAF6F3] border border-[#EFE8E2] flex items-center justify-center mb-4">
                      <ShoppingBag className="w-6 h-6 text-txt-secondary stroke-[1.5]" />
                    </div>
                    <p className="text-base font-display font-medium text-txt mb-1">
                      Tu carrito está vacío
                    </p>
                    <p className="text-xs text-txt-secondary font-sans mb-6">
                      Descubre nuestros productos y arma tu rutina de belleza.
                    </p>
                    <button
                      onClick={() => setIsCartOpen(false)}
                      className="px-6 py-2.5 bg-[#111111] text-white text-xs font-sans font-medium uppercase tracking-[0.15em] rounded-[2px] hover:bg-black transition-all"
                    >
                      Explorar productos
                    </button>
                  </div>
                ) : (
                  items.map((item) => (
                    <CartItemComponent key={item.id} item={item} />
                  ))
                )}
              </div>

              {/* Summary & Checkout Footer */}
              {items.length > 0 && (
                <div className="border-t border-[#E5E5E5] p-4 sm:p-5 space-y-3 bg-white">
                  <div className="space-y-1.5 pt-1">
                    <div className="flex justify-between text-xs font-sans">
                      <span className="text-txt-secondary">Subtotal</span>
                      <span className="font-medium text-txt font-sans">{formatPrice(subtotal)}</span>
                    </div>
                    <div className="flex justify-between items-baseline pt-1">
                      <span className="text-sm font-semibold uppercase tracking-wider text-txt font-sans">
                        Total
                      </span>
                      <span className="text-base sm:text-lg font-bold text-primary font-sans">
                        {formatPrice(total)}
                      </span>
                    </div>
                  </div>

                  <div className="pt-1 flex flex-col gap-2">
                    <button
                      onClick={handleFinishOrder}
                      className="w-full h-12 bg-primary hover:bg-primary-dark text-white font-sans font-semibold text-xs sm:text-sm uppercase tracking-[0.12em] rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-md shadow-primary/25 active:scale-[0.99]"
                      id="finish-order"
                    >
                      <span>Finalizar pedido</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => setIsCartOpen(false)}
                      className="w-full h-11 bg-white border border-[#E5E5E5] text-txt hover:border-primary hover:text-primary font-sans font-medium text-xs sm:text-sm uppercase tracking-[0.12em] rounded-xl transition-all duration-200 flex items-center justify-center"
                    >
                      Seguir comprando
                    </button>
                  </div>

                  <div className="text-center pt-1">
                    <button
                      onClick={clearCart}
                      className="text-[10px] text-txt-secondary/70 hover:text-red-600 font-sans uppercase tracking-[0.15em] transition-colors"
                    >
                      Vaciar carrito
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Modal de Checkout */}
      <CheckoutModal 
        isOpen={isCheckoutOpen} 
        onClose={() => setIsCheckoutOpen(false)} 
      />
    </>
  );
}
