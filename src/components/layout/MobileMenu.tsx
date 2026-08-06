'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { X, Home, ShoppingBag, MessageCircle, Phone } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

const menuItems = [
  { href: '/', label: 'Inicio', icon: Home },
  { href: '/catalogo', label: 'Catálogo', icon: ShoppingBag },
  { href: '/contacto', label: 'Contacto', icon: MessageCircle },
  { href: 'https://wa.me/573000000000', label: 'WhatsApp', icon: Phone, external: true },
];

export default function MobileMenu({ isOpen, onClose }: MobileMenuProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/40 z-[60] backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Menu Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed top-0 right-0 h-full w-80 max-w-[85vw] bg-white z-[70] shadow-2xl"
          >
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-border">
                <h2 className="text-lg font-heading font-semibold text-gradient">Menú</h2>
                <button
                  onClick={onClose}
                  className="p-2 rounded-full hover:bg-secondary-100 transition-colors"
                  aria-label="Cerrar menú"
                >
                  <X className="w-5 h-5 text-text" />
                </button>
              </div>

              {/* Navigation */}
              <nav className="flex-1 py-6">
                {menuItems.map((item, index) => {
                  const Icon = item.icon;
                  const props = item.external
                    ? { target: '_blank', rel: 'noopener noreferrer' }
                    : {};

                  return (
                    <motion.div
                      key={item.href}
                      initial={{ opacity: 0, x: 30 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.08 }}
                    >
                      <Link
                        href={item.href}
                        onClick={onClose}
                        className="flex items-center gap-4 px-6 py-4 text-text hover:bg-secondary-100 hover:text-primary transition-all duration-200 group"
                        {...props}
                      >
                        <Icon className="w-5 h-5 text-primary/60 group-hover:text-primary transition-colors" />
                        <span className="font-medium text-base">{item.label}</span>
                      </Link>
                    </motion.div>
                  );
                })}
              </nav>

              {/* Footer */}
              <div className="p-6 border-t border-border">
                <p className="text-xs text-text-light text-center">
                  © 2024 Lumira Beauty
                </p>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
