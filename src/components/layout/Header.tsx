'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ShoppingCart, Menu, Search, X, Heart } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useFavorites } from '@/context/FavoritesContext';
import MobileMenu from './MobileMenu';

export default function Header() {
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
            {/* Logo */}
            <Link href="/" className="flex-shrink-0 transition-transform duration-300 hover:scale-105">
              <Image
                src="/images/logo.png"
                alt="Lumira Beauty"
                width={120}
                height={50}
                className="h-10 sm:h-12 w-auto"
                priority
              />
            </Link>

            {/* Search Bar - Desktop */}
            <form
              onSubmit={handleSearch}
              className={`hidden md:flex flex-1 max-w-xl mx-8 relative transition-all duration-300 ${
                isSearchFocused ? 'scale-[1.02]' : ''
              }`}
            >
              <div className="relative w-full">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-primary/50" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setIsSearchFocused(true)}
                  onBlur={() => setIsSearchFocused(false)}
                  placeholder="Buscar maquillaje, skincare, pestañas…"
                  className="w-full pl-12 pr-4 py-3 rounded-full bg-secondary-100/60 border-2 border-transparent focus:border-primary/30 focus:bg-white text-sm text-text placeholder-text-light/60 outline-none transition-all duration-300"
                  id="search-desktop"
                />
              </div>
            </form>

            {/* Right Actions */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Mobile Search Toggle */}
              <Link
                href="/catalogo"
                className="md:hidden p-2 rounded-full hover:bg-secondary-100 transition-colors duration-200"
                aria-label="Buscar"
              >
                <Search className="w-5 h-5 text-text" />
              </Link>

              {/* Favorites */}
              <button
                onClick={() => setIsFavoritesOpen(true)}
                className="relative p-2 rounded-full hover:bg-secondary-100 transition-all duration-200 group"
                aria-label="Favoritos"
                id="favorites-button"
              >
                <Heart className="w-5 h-5 sm:w-6 sm:h-6 text-text group-hover:text-primary transition-colors duration-200" />
                {favoritesCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-primary text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center animate-pulse-soft">
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
                <ShoppingCart className="w-5 h-5 sm:w-6 sm:h-6 text-text group-hover:text-primary transition-colors duration-200" />
                {itemCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-primary text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center animate-pulse-soft">
                    {itemCount}
                  </span>
                )}
              </button>

              {/* Menu Toggle */}
              <button
                onClick={() => setIsMenuOpen(true)}
                className="p-2 rounded-full hover:bg-secondary-100 transition-colors duration-200 group"
                aria-label="Menú"
                id="menu-button"
              >
                <Menu className="w-5 h-5 sm:w-6 sm:h-6 text-text group-hover:text-primary transition-colors duration-200" />
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
