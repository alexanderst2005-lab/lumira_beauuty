'use client';

import { useState, useMemo, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Product } from '@/types';
import { categories } from '@/data/products';
import Filters from '@/components/catalog/Filters';
import FilterDrawer from '@/components/catalog/FilterDrawer';
import ProductGrid from '@/components/catalog/ProductGrid';
import Pagination from '@/components/catalog/Pagination';
import { Search, ChevronDown, SlidersHorizontal, X, RotateCcw, Sparkles } from 'lucide-react';
import { preloadProductImages } from '@/utils/imagePreloader';
import { useCampaignPromotions } from '@/context/CampaignPromotionsContext';


const PRODUCTS_PER_PAGE = 15;

export default function CatalogoClient({ initialProducts }: { initialProducts: Product[] }) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { activeCampaign, activeDiscounts } = useCampaignPromotions();

  const [selectedCategory, setSelectedCategory] = useState('todos');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc' | 'recent' | 'name' | ''>('');
  const [priceRange, setPriceRange] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);
  const [onlyOffers, setOnlyOffers] = useState(false);

  const isOffersFilterActive = onlyOffers || searchParams.get('ofertas') === 'true' || Boolean(searchParams.get('campana'));


  // Calcula cantidad de productos por categoría
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { todos: initialProducts.length };
    initialProducts.forEach((p) => {
      counts[p.category] = (counts[p.category] || 0) + 1;
    });
    return counts;
  }, [initialProducts]);

  // Sincroniza página en la URL
  const syncPageToUrl = (page: number) => {
    if (typeof window === 'undefined') return;
    const url = new URL(window.location.href);
    if (page <= 1) url.searchParams.delete('pagina');
    else url.searchParams.set('pagina', String(page));
    window.history.replaceState(window.history.state, '', url.toString());
  };

  const resetPage = () => {
    setCurrentPage(1);
    syncPageToUrl(1);
  };

  // Leer parámetros de URL al montar
  useEffect(() => {
    const categoria = searchParams.get('categoria');
    const buscar = searchParams.get('buscar');
    const orden = searchParams.get('orden') as 'asc' | 'desc' | 'recent' | 'name' | null;
    const precio = searchParams.get('precio');
    const pagina = parseInt(searchParams.get('pagina') || '1', 10);

    if (categoria) setSelectedCategory(categoria);
    if (buscar) setSearchQuery(buscar);
    if (orden) setSortOrder(orden);
    if (precio) setPriceRange(precio);
    setCurrentPage(Number.isFinite(pagina) && pagina > 0 ? pagina : 1);
  }, [searchParams]);

  // Precargar imágenes
  useEffect(() => {
    if (initialProducts && initialProducts.length > 0) {
      preloadProductImages(initialProducts, 0, 30, 400);
    }
  }, [initialProducts]);

  // Filtrado y Ordenamiento
  const filteredProducts = useMemo(() => {
    let result = [...initialProducts];

    // Búsqueda por texto
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (p) => p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q)
      );
    }

    // Filtrar exclusivamente productos con oferta activa (campaña o descuento individual)
    if (isOffersFilterActive) {
      result = result.filter((p) => Boolean(activeDiscounts[p.id]) || Boolean(p.originalPrice && p.originalPrice > p.price));
    }

    // Categoría
    if (selectedCategory !== 'todos') {
      result = result.filter((p) => p.category === selectedCategory);
    }


    // Rango de precio
    if (priceRange === 'under_20k') {
      result = result.filter((p) => p.price <= 20000);
    } else if (priceRange === '20k_40k') {
      result = result.filter((p) => p.price >= 20000 && p.price <= 40000);
    } else if (priceRange === 'above_40k') {
      result = result.filter((p) => p.price > 40000);
    }

    // Ordenamiento
    if (sortOrder === 'asc') {
      result.sort((a, b) => a.price - b.price);
    } else if (sortOrder === 'desc') {
      result.sort((a, b) => b.price - a.price);
    } else if (sortOrder === 'name') {
      result.sort((a, b) => a.name.localeCompare(b.name));
    } else {
      // Default / 'recent': Nuevos de primero
      result.sort((a, b) => {
        if (a.isNew && !b.isNew) return -1;
        if (!a.isNew && b.isNew) return 1;
        return 0;
      });
    }

    return result;
  }, [initialProducts, selectedCategory, searchQuery, priceRange, sortOrder]);

  // Paginación
  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / PRODUCTS_PER_PAGE));
  const safePage = Math.min(Math.max(currentPage, 1), totalPages);
  const pageStart = (safePage - 1) * PRODUCTS_PER_PAGE;
  const pageProducts = useMemo(
    () => filteredProducts.slice(pageStart, pageStart + PRODUCTS_PER_PAGE),
    [filteredProducts, pageStart]
  );
  const nextPageProducts = useMemo(
    () => filteredProducts.slice(pageStart + PRODUCTS_PER_PAGE, pageStart + PRODUCTS_PER_PAGE * 2),
    [filteredProducts, pageStart]
  );

  const handlePageChange = (page: number) => {
    const target = Math.min(Math.max(page, 1), totalPages);
    if (target === safePage) return;
    setCurrentPage(target);
    syncPageToUrl(target);
    setTimeout(() => {
      document.getElementById('productos-grid')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 50);
  };

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    resetPage();
    const params = new URLSearchParams(searchParams.toString());
    if (category === 'todos') {
      params.delete('categoria');
    } else {
      params.set('categoria', category);
    }
    params.delete('pagina');
    router.replace(`/catalogo?${params.toString()}`, { scroll: false });
  };

  const handleSortChange = (order: 'asc' | 'desc' | 'recent' | 'name' | '') => {
    setSortOrder(order);
    resetPage();
    const params = new URLSearchParams(searchParams.toString());
    if (order === '' || order === 'recent') {
      params.delete('orden');
    } else {
      params.set('orden', order);
    }
    params.delete('pagina');
    router.replace(`/catalogo?${params.toString()}`, { scroll: false });
  };

  const handlePriceRangeChange = (range: string) => {
    setPriceRange(range);
    resetPage();
    const params = new URLSearchParams(searchParams.toString());
    if (range === 'all') {
      params.delete('precio');
    } else {
      params.set('precio', range);
    }
    params.delete('pagina');
    router.replace(`/catalogo?${params.toString()}`, { scroll: false });
  };

  const handleResetAll = () => {
    setSelectedCategory('todos');
    setSearchQuery('');
    setSortOrder('');
    setPriceRange('all');
    resetPage();
    router.replace('/catalogo', { scroll: false });
  };

  // Contar cuántos filtros activos hay para mostrar el badge
  const activeFiltersCount =
    (selectedCategory !== 'todos' ? 1 : 0) +
    (sortOrder !== '' && sortOrder !== 'recent' ? 1 : 0) +
    (priceRange !== 'all' ? 1 : 0) +
    (searchQuery.trim() !== '' ? 1 : 0);

  const currentCategoryObj = categories.find((c) => c.slug === selectedCategory);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-14">
      {/* Header del Catálogo */}
      <div className="text-center mb-8 sm:mb-10">
        <p className="text-[11px] sm:text-xs uppercase tracking-[0.25em] text-primary font-sans font-medium mb-2.5">
          Colección Oficial Lumira
        </p>
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-display font-medium text-txt tracking-tight mb-3">
          Nuestro <span className="text-gradient italic">catálogo</span>
        </h1>
        <p className="text-txt-secondary text-sm sm:text-base max-w-xl mx-auto font-sans">
          Explora la mejor selección de pestañas, maquillaje, skincare y accesorios de alta calidad.
        </p>

        {/* Buscador en tiempo real profesional */}
        <div className="max-w-xl mx-auto mt-6 relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-txt-secondary/60 group-focus-within:text-primary transition-colors" />
          <input
            id="catalog-search-input"
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              resetPage();
            }}
            placeholder="Buscar por nombre, tono o descripción..."
            className="w-full pl-11 sm:pl-12 pr-10 py-3.5 rounded-full bg-white border border-[#E5E5E5] focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/10 shadow-sm transition-all text-txt placeholder-txt-secondary/50 text-sm font-medium"
          />
          {searchQuery && (
            <button
              onClick={() => {
                setSearchQuery('');
                resetPage();
              }}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-1 text-txt-secondary hover:text-txt rounded-full hover:bg-black/5 transition-colors"
              aria-label="Limpiar búsqueda"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Banner de Campaña y Ofertas Activas */}
        {isOffersFilterActive && (
          <div className="max-w-xl mx-auto mt-4 p-3 sm:p-4 rounded-2xl bg-gradient-to-r from-rose-500/10 via-pink-50 to-rose-50 border border-rose-200/80 flex items-center justify-between gap-3 text-xs shadow-sm">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-rose-600 flex-shrink-0" />
              <div className="text-left">
                <span className="font-bold text-gray-900 block sm:inline">
                  {activeCampaign ? activeCampaign.title : 'Productos en Oferta'}
                </span>
                <span className="text-gray-600 sm:ml-2">
                  (Precios especiales por tiempo limitado)
                </span>
              </div>
            </div>
            <button
              onClick={() => {
                setOnlyOffers(false);
                router.replace('/catalogo', { scroll: false });
              }}
              className="text-rose-600 hover:text-rose-800 font-bold underline whitespace-nowrap"
            >
              Ver todo el catálogo
            </button>
          </div>
        )}
      </div>


      {/* Pestañas de Categorías (Pills completas) */}
      <Filters
        selectedCategory={selectedCategory}
        onCategoryChange={handleCategoryChange}
        categoryCounts={categoryCounts}
      />

      {/* Barra de Control y Filtros (Toolbar) */}
      <div
        id="productos-grid"
        className="scroll-mt-28 flex flex-wrap items-center justify-between gap-3 py-3 border-y border-[#F0E6DE] mb-6"
      >
        {/* Izquierda: Contador y Botón de Filtros */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsFilterDrawerOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-txt text-txt hover:bg-txt hover:text-white text-xs sm:text-sm font-semibold transition-all shadow-sm group"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 transition-transform group-hover:rotate-90" />
            <span>Filtros</span>
            {activeFiltersCount > 0 && (
              <span className="w-5 h-5 rounded-full bg-primary text-white text-[10px] font-bold flex items-center justify-center">
                {activeFiltersCount}
              </span>
            )}
          </button>

          <span className="text-xs sm:text-sm text-txt-secondary font-sans">
            <strong className="text-txt font-semibold">{filteredProducts.length}</strong>{' '}
            {filteredProducts.length === 1 ? 'producto' : 'productos'}
            {totalPages > 1 && (
              <span className="hidden sm:inline text-txt-secondary/60">
                {' '}
                · Pág. {safePage} de {totalPages}
              </span>
            )}
          </span>
        </div>

        {/* Derecha: Ordenamiento rápido */}
        <div className="flex items-center gap-2">
          <label htmlFor="quick-sort" className="hidden sm:inline text-xs font-medium text-txt-secondary">
            Ordenar:
          </label>
          <div className="relative">
            <select
              id="quick-sort"
              value={sortOrder}
              onChange={(e) =>
                handleSortChange(e.target.value as 'asc' | 'desc' | 'recent' | 'name' | '')
              }
              className="appearance-none bg-white border border-[#E5E5E5] hover:border-black/30 rounded-full pl-3.5 pr-8 py-2 text-xs font-semibold text-txt focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 cursor-pointer transition-all shadow-sm"
            >
              <option value="">Destacados</option>
              <option value="asc">Precio: Menor a Mayor</option>
              <option value="desc">Precio: Mayor a Menor</option>
              <option value="name">Nombre: A - Z</option>
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-txt-secondary pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Chips de Filtros Activos */}
      <AnimatePresence>
        {activeFiltersCount > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="flex flex-wrap items-center gap-2 mb-6"
          >
            <span className="text-xs text-txt-secondary font-medium mr-1">Filtros aplicados:</span>

            {selectedCategory !== 'todos' && currentCategoryObj && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-secondary-100 text-txt text-xs font-medium border border-[#E5E5E5]">
                <span>{currentCategoryObj.name}</span>
                <button
                  onClick={() => handleCategoryChange('todos')}
                  className="hover:text-primary transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {sortOrder && sortOrder !== 'recent' && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-secondary-100 text-txt text-xs font-medium border border-[#E5E5E5]">
                <span>
                  {sortOrder === 'asc'
                    ? 'Precio: Menor a Mayor'
                    : sortOrder === 'desc'
                    ? 'Precio: Mayor a Menor'
                    : 'Nombre: A - Z'}
                </span>
                <button
                  onClick={() => handleSortChange('')}
                  className="hover:text-primary transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {priceRange !== 'all' && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-secondary-100 text-txt text-xs font-medium border border-[#E5E5E5]">
                <span>
                  {priceRange === 'under_20k'
                    ? 'Hasta $20.000'
                    : priceRange === '20k_40k'
                    ? '$20.000 - $40.000'
                    : 'Más de $40.000'}
                </span>
                <button
                  onClick={() => handlePriceRangeChange('all')}
                  className="hover:text-primary transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {searchQuery && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-secondary-100 text-txt text-xs font-medium border border-[#E5E5E5]">
                <span>&ldquo;{searchQuery}&rdquo;</span>
                <button
                  onClick={() => setSearchQuery('')}
                  className="hover:text-primary transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            <button
              onClick={handleResetAll}
              className="inline-flex items-center gap-1 text-xs text-primary hover:text-primary-dark font-medium underline underline-offset-2 ml-1"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Limpiar todo</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Grid de Productos */}
      <div className="min-h-[45vh]">
        {filteredProducts.length > 0 ? (
          <>
            <ProductGrid products={pageProducts} nextPageProducts={nextPageProducts} />
            <Pagination currentPage={safePage} totalPages={totalPages} onPageChange={handlePageChange} />
          </>
        ) : (
          <div className="text-center py-20 bg-white rounded-3xl border border-[#E5E5E5] shadow-xs px-4">
            <div className="w-16 h-16 rounded-full bg-secondary-100 flex items-center justify-center text-txt-secondary mx-auto mb-4">
              <Search className="w-7 h-7 stroke-[1.5]" />
            </div>
            <h3 className="font-display text-xl font-medium text-txt mb-2">
              No encontramos productos que coincidan
            </h3>
            <p className="text-txt-secondary text-sm max-w-md mx-auto mb-6">
              Prueba cambiando la categoría, limpiando la búsqueda o ajustando el orden de precios.
            </p>
            <button
              onClick={handleResetAll}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-primary text-white text-xs sm:text-sm font-semibold hover:bg-primary-dark transition-all shadow-sm"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Restablecer todos los filtros</span>
            </button>
          </div>
        )}
      </div>

      {/* Drawer Lateral de Filtros */}
      <FilterDrawer
        isOpen={isFilterDrawerOpen}
        onClose={() => setIsFilterDrawerOpen(false)}
        categories={categories}
        selectedCategory={selectedCategory}
        onSelectCategory={handleCategoryChange}
        sortOrder={sortOrder}
        onSelectSortOrder={handleSortChange}
        priceRange={priceRange}
        onSelectPriceRange={handlePriceRangeChange}
        categoryCounts={categoryCounts}
        totalProductsCount={filteredProducts.length}
        onResetAll={handleResetAll}
      />
    </div>
  );
}
