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
              className="fixed inset-0 bg-black/40 z-[80] backdrop-blur-sm"
              onClick={() => setIsCartOpen(false)}
            />

            {/* Cart Panel */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed top-0 right-0 h-full w-full sm:w-[380px] max-w-full bg-white z-[90] shadow-2xl flex flex-col"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-border">
                <div className="flex items-center gap-2">
                  <ShoppingBag className="w-5 h-5 text-primary" />
                  <h2 className="text-[15px] sm:text-base font-heading font-semibold uppercase tracking-wide">
                    Tu carrito
                  </h2>
                </div>
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="p-2 rounded-full hover:bg-secondary-100 transition-colors"
                  aria-label="Cerrar carrito"
                >
                  <X className="w-5 h-5 text-txt" />
                </button>
              </div>

              {/* Items */}
              <div className="flex-1 overflow-y-auto p-3 space-y-2 cart-scrollbar">
                {items.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center py-16">
                    <div className="text-5xl mb-4">🛒</div>
                    <p className="text-txt font-medium mb-2">Tu carrito está vacío</p>
                    <p className="text-sm text-txt-secondary">¡Agrega productos para comenzar!</p>
                  </div>
                ) : (
                  items.map((item) => (
                    <CartItemComponent key={item.id} item={item} />
                  ))
                )}
              </div>

              {/* Summary */}
              {items.length > 0 && (
                <div className="border-t border-border p-3 space-y-1.5 bg-secondary-100/20 shadow-[0_-4px_10px_rgba(0,0,0,0.02)]">
                  <div className="flex justify-between text-xs">
                    <span className="text-txt-secondary">Subtotal</span>
                    <span className="font-medium font-sans">{formatPrice(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-sm font-bold text-txt">
                    <span>Total</span>
                    <span className="text-primary font-sans">{formatPrice(total)}</span>
                  </div>

                  <div className="pt-1 flex flex-col gap-1.5">
                    <button
                      onClick={handleFinishOrder}
                      className="w-full py-2 bg-primary hover:bg-primary-dark text-white font-semibold rounded-xl transition-all duration-300 transform hover:scale-[1.02] active:scale-95 shadow-lg shadow-primary/25 flex items-center justify-center gap-2 text-sm font-sans"
                      id="finish-order"
                    >
                      Finalizar pedido
                      <ArrowRight className="w-4 h-4" />
                    </button>
                    
                    <button
                      onClick={() => setIsCartOpen(false)}
                      className="w-full py-1.5 bg-white border border-border hover:border-primary/50 text-txt-secondary hover:text-txt font-semibold rounded-xl transition-colors flex items-center justify-center font-sans text-[11px] sm:text-xs"
                    >
                      Seguir comprando
                    </button>
                  </div>

                  <button
                    onClick={clearCart}
                    className="w-full py-1 mt-0.5 text-[10px] text-txt-secondary/70 hover:text-red-500 font-medium transition-colors font-sans uppercase tracking-wider"
                  >
                    Vaciar carrito
                  </button>
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
