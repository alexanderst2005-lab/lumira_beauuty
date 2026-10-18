'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ShoppingCart, Menu, Search, X, Heart } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useFavorites } from '@/context/FavoritesContext';
import { usePathname, useRouter } from 'next/navigation';
import { useChristmas } from '@/context/ChristmasContext';
import MobileMenu from './MobileMenu';

export default function Header({ config }: { config?: any }) {
  const { itemCount, setIsCartOpen } = useCart();
  const { favoritesCount, setIsFavoritesOpen } = useFavorites();
  const { isChristmasActive, activeConfig } = useChristmas();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  const isHome = !pathname || pathname === '/' || pathname === '';

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/catalogo?buscar=${encodeURIComponent(searchQuery.trim())}`;
    }
  };

  // En la portada el header va transparente sobre la hero hasta hacer scroll.
  const overHero = isHome && !isScrolled;
  const iconClass = overHero
    ? 'text-white drop-shadow-md'
    : 'text-txt group-hover:text-primary';
  const btnHover = overHero ? 'hover:bg-white/20' : 'hover:bg-secondary-100';

  return (
    <>
      <header
        className={`${
          isHome
            ? `fixed inset-x-0 z-50 ${
                isScrolled
                  ? 'top-0 bg-white/95 backdrop-blur-md shadow-md border-b border-[#F0E6DE]'
                  : 'top-[2.1rem] !bg-transparent !shadow-none !border-transparent'
              }`
            : 'fixed inset-x-0 top-0 z-50 bg-white shadow-sm border-b border-[#E5E5E5]'
        } transition-all duration-300`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20 gap-4">
            {/* Left: Menu */}
            <div className="flex-1 flex items-center justify-start">
              <button
                onClick={() => setIsMenuOpen(true)}
                className={`p-2 -ml-2 rounded-full ${btnHover} transition-colors duration-200 group`}
                aria-label="Menú"
                id="menu-button"
              >
                <Menu className={`w-5 h-5 sm:w-6 sm:h-6 transition-colors duration-200 ${iconClass}`} />
              </button>
            </div>

            {/* Center: Logo */}
            <Link href="/" className="flex-none transition-transform duration-300 hover:scale-105 relative">
              <Image
                src="/images/logo-transparent.png"
                alt={config?.storeName || "Lumira Beauty"}
                width={160}
                height={60}
                className={`h-12 sm:h-14 w-auto object-contain ${
                  overHero ? 'drop-shadow-[0_2px_6px_rgba(90,10,50,0.45)]' : ''
                }`}
                priority
              />
              {isChristmasActive && (
                <>
                  <span className="absolute -top-3.5 sm:-top-4 -left-1.5 text-xl sm:text-2xl select-none pointer-events-none drop-shadow-md -rotate-12">
                    🎅
                  </span>
                  <span className="absolute -top-1 -right-2 text-xs select-none pointer-events-none drop-shadow-sm animate-pulse">
                    ✨
                  </span>
                </>
              )}
            </Link>

            {/* Right: Actions */}
            <div className="flex-1 flex items-center justify-end gap-1 sm:gap-2">
              {/* Search Toggle */}
              <button
                onClick={() => {
                  if (pathname === '/catalogo') {
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                    setTimeout(() => {
                      document.getElementById('catalog-search-input')?.focus();
                    }, 500);
                  } else {
                    router.push('/catalogo');
                  }
                }}
                className={`p-2 rounded-full ${btnHover} transition-colors duration-200 group`}
                aria-label="Buscar"
              >
                <Search className={`w-5 h-5 sm:w-6 sm:h-6 transition-colors duration-200 ${iconClass}`} />
              </button>

              {/* Favorites */}
              <button
                onClick={() => setIsFavoritesOpen(true)}
                className={`relative p-2 rounded-full ${btnHover} transition-all duration-200 group`}
                aria-label="Favoritos"
                id="favorites-button"
              >
                <Heart className={`w-5 h-5 sm:w-6 sm:h-6 transition-colors duration-200 ${iconClass}`} />
                {favoritesCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-primary text-white text-[10px] sm:text-xs font-bold w-4 h-4 sm:w-5 sm:h-5 rounded-full flex items-center justify-center animate-pulse-soft shadow-sm">
                    {favoritesCount}
                  </span>
                )}
              </button>

              {/* Cart */}
              <button
                onClick={() => setIsCartOpen(true)}
                className={`relative p-2 rounded-full ${btnHover} transition-all duration-200 group`}
                aria-label="Carrito de compras"
                id="cart-button"
              >
                <ShoppingCart className={`w-5 h-5 sm:w-6 sm:h-6 transition-colors duration-200 ${iconClass}`} />
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
