'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ShoppingCart, Menu, Search, X, Heart } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useFavorites } from '@/context/FavoritesContext';
import MobileMenu from './MobileMenu';

export default function Header({ config }: { config?: any }) {
  const { itemCount, setIsCartOpen } = useCart();
  const { favoritesCount, setIsFavoritesOpen } = useFavorites();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/catalogo?buscar=${encodeURIComponent(searchQuery.trim())}`;
    }
  };

  return (
    <>
      <header
        className={`sticky top-0 z-50 transition-all duration-300 ${
          isScrolled
            ? 'glass shadow-lg shadow-primary/5 border-b border-border'
            : 'bg-white'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20 gap-4">
            {/* Left: Menu */}
            <div className="flex-1 flex items-center justify-start">
              <button
                onClick={() => setIsMenuOpen(true)}
                className="p-2 -ml-2 rounded-full hover:bg-secondary-100 transition-colors duration-200 group"
                aria-label="Menú"
                id="menu-button"
              >
                <Menu className="w-5 h-5 sm:w-6 sm:h-6 text-txt group-hover:text-primary transition-colors duration-200" />
              </button>
            </div>

            {/* Center: Logo */}
            <Link href="/" className="flex-none transition-transform duration-300 hover:scale-105">
              {config?.logo ? (
                <Image
                  src={config.logo}
                  alt={config.storeName || "Lumira Beauty"}
                  width={160}
                  height={60}
                  className="h-12 sm:h-14 w-auto object-contain"
                  priority
                />
              ) : (
                <Image
                  src="/images/logo.png"
                  alt={config?.storeName || "Lumira Beauty"}
                  width={160}
                  height={60}
                  className="h-12 sm:h-14 w-auto object-contain"
                  priority
                />
              )}
            </Link>

            {/* Right: Actions */}
            <div className="flex-1 flex items-center justify-end gap-1 sm:gap-2">
              {/* Search Toggle */}
              <Link
                href="/catalogo"
                className="p-2 rounded-full hover:bg-secondary-100 transition-colors duration-200 group"
                aria-label="Buscar"
              >
                <Search className="w-5 h-5 sm:w-6 sm:h-6 text-txt group-hover:text-primary transition-colors duration-200" />
              </Link>

              {/* Favorites */}
              <button
                onClick={() => setIsFavoritesOpen(true)}
                className="relative p-2 rounded-full hover:bg-secondary-100 transition-all duration-200 group"
                aria-label="Favoritos"
                id="favorites-button"
              >
                <Heart className="w-5 h-5 sm:w-6 sm:h-6 text-txt group-hover:text-primary transition-colors duration-200" />
                {favoritesCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-primary text-white text-[10px] sm:text-xs font-bold w-4 h-4 sm:w-5 sm:h-5 rounded-full flex items-center justify-center animate-pulse-soft shadow-sm">
                    {favoritesCount}
                  </span>
                )}
              </button>

              {/* Cart */}
              <button
                onClick={() => setIsCartOpen(true)}
                className="relative p-2 rounded-full hover:bg-secondary-100 transition-all duration-200 group"
                aria-label="Carrito de compras"
                id="cart-button"
              >
                <ShoppingCart className="w-5 h-5 sm:w-6 sm:h-6 text-txt group-hover:text-primary transition-colors duration-200" />
                {itemCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-primary text-white text-[10px] sm:text-xs font-bold w-4 h-4 sm:w-5 sm:h-5 rounded-full flex items-center justify-center animate-pulse-soft shadow-sm">
                    {itemCount}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      <MobileMenu isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
    </>
  );
}
