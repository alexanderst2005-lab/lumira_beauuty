'use client';

import { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { getProductsByCategory, searchProducts } from '@/data/products';
import Filters from '@/components/catalog/Filters';
import ProductGrid from '@/components/catalog/ProductGrid';
import { Search } from 'lucide-react';

export default function CatalogoPage() {
  const searchParams = useSearchParams();
  const [selectedCategory, setSelectedCategory] = useState('todos');
  const [searchQuery, setSearchQuery] = useState('');

  // Leer parámetros de URL al montar el componente
  useEffect(() => {
    const categoria = searchParams.get('categoria');
    const buscar = searchParams.get('buscar');
    
    if (categoria) setSelectedCategory(categoria);
    if (buscar) setSearchQuery(buscar);
  }, [searchParams]);

  // Filtrar productos por categoría o búsqueda
  const filteredProducts = useMemo(() => {
    if (searchQuery.trim() !== '') {
      return searchProducts(searchQuery.trim());
    }
    return getProductsByCategory(selectedCategory);
  }, [selectedCategory, searchQuery]);

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    setSearchQuery(''); // Limpiar búsqueda al cambiar categoría
    
    // Smooth scroll a la grilla de productos
    setTimeout(() => {
      document.getElementById('productos-grid')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
      {/* Header del Catálogo */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-8"
      >
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-display font-bold text-txt mb-4">
          Nuestro <span className="text-gradient">catálogo</span>
        </h1>
        <p className="text-txt-secondary text-base sm:text-lg max-w-2xl mx-auto mb-8">
          Explora la mejor selección de maquillaje, skincare y accesorios pensados para ti.
        </p>

        {/* Buscador en tiempo real */}
        <div className="max-w-xl mx-auto relative group">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-primary/50 transition-colors group-focus-within:text-primary" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar en todo el catálogo en tiempo real..."
            className="w-full pl-14 pr-4 py-4 rounded-full bg-white border-2 border-border focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/10 shadow-sm transition-all text-txt placeholder-txt-secondary/60 text-base font-medium"
          />
        </div>
      </motion.div>

      {/* Pestañas de Categorías */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <Filters
          selectedCategory={selectedCategory}
          onCategoryChange={handleCategoryChange}
        />
      </motion.div>

      {/* Grid de Productos */}
      <motion.div
        id="productos-grid"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="scroll-mt-32 pt-4 min-h-[50vh]"
      >
        {filteredProducts.length > 0 ? (
          <ProductGrid products={filteredProducts} />
        ) : (
          <div className="text-center py-20 bg-white rounded-3xl border border-border mt-8">
            <p className="text-txt-secondary text-lg">No encontramos productos que coincidan con tu búsqueda.</p>
            <button 
              onClick={() => { setSearchQuery(''); setSelectedCategory('todos'); }}
              className="mt-4 text-primary font-medium hover:underline"
            >
              Ver todos los productos
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
}
