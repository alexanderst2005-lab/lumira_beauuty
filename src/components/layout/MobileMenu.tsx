'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { X, MessageCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

const menuItems = [
  { href: '/', label: 'Inicio' },
  { href: '/catalogo', label: 'Catálogo' },
  { href: '/contacto', label: 'Contacto' },
  { href: 'https://wa.me/573011675661', label: 'WhatsApp', external: true },
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
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.98 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className="fixed inset-0 w-full h-full bg-white z-[80] flex flex-col justify-between overflow-y-auto px-6 py-8 sm:px-12 sm:py-10"
        >
          {/* Top Bar with Logo and Close Button */}
          <div className="w-full flex items-center justify-between">
            <Link href="/" onClick={onClose} className="inline-block">
              <Image
                src="/images/logo-transparent.png"
                alt="Lumira Beauty"
                width={140}
                height={50}
                className="h-10 sm:h-12 w-auto object-contain"
              />
            </Link>

            <button
              onClick={onClose}
              className="w-11 h-11 rounded-full bg-neutral-100 hover:bg-neutral-200 text-txt flex items-center justify-center transition-all duration-200 active:scale-95"
              aria-label="Cerrar menú"
            >
              <X className="w-5 h-5 stroke-[2]" />
            </button>
          </div>

          {/* Centered Navigation Links */}
          <nav className="my-auto py-10 flex flex-col items-center justify-center text-center gap-7 sm:gap-9">
            {menuItems.map((item, index) => {
              const props = item.external
                ? { target: '_blank', rel: 'noopener noreferrer' }
                : {};

              return (
                <motion.div
                  key={item.href}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.05 + index * 0.06, duration: 0.3 }}
                >
                  <Link
                    href={item.href}
                    onClick={onClose}
                    className="group relative inline-block font-display text-3xl sm:text-4xl md:text-5xl font-medium tracking-tight text-txt hover:text-primary transition-all duration-300"
                    {...props}
                  >
                    <span>{item.label}</span>
                    <span className="block h-[2px] w-0 bg-primary mx-auto transition-all duration-300 group-hover:w-full mt-1 rounded-full" />
                  </Link>
                </motion.div>
              );
            })}
          </nav>

          {/* Bottom Info & Contact */}
          <div className="w-full pt-6 border-t border-[#F0E6DE] flex flex-col items-center text-center gap-3">
            <a
              href="https://wa.me/573011675661?text=Hola%20Lumira%20Beauty,%20quisiera%20asesor%C3%ADa%20personalizada"
              target="_blank"
              rel="noopener noreferrer"
              onClick={onClose}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-primary/10 text-primary hover:bg-primary hover:text-white transition-all duration-300 text-xs sm:text-sm font-sans font-semibold tracking-wide"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Chatear con una asesora</span>
            </a>

            <p className="text-xs text-txt-secondary/70 font-sans tracking-wide">
              © 2026 Lumira Beauty. Todos los derechos reservados.
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
