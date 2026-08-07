'use client';

import { useState, useMemo, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Product } from '@/types';
import Filters from '@/components/catalog/Filters';
import ProductGrid from '@/components/catalog/ProductGrid';
import { Search, ChevronDown } from 'lucide-react';

export default function CatalogoClient({ initialProducts }: { initialProducts: Product[] }) {
  const searchParams = useSearchParams();
  const [selectedCategory, setSelectedCategory] = useState('todos');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc' | ''>('');

  // Leer parámetros de URL al montar el componente
  useEffect(() => {
    const categoria = searchParams.get('categoria');
    const buscar = searchParams.get('buscar');
    
    if (categoria) setSelectedCategory(categoria);
    if (buscar) setSearchQuery(buscar);
  }, [searchParams]);

  // Filtrar y ordenar productos
  const filteredProducts = useMemo(() => {
    let result = initialProducts;
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      result = result.filter(p => p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q));
    } else if (selectedCategory !== 'todos') {
      result = result.filter(p => p.category === selectedCategory);
    }

    if (sortOrder === 'asc') {
      result = [...result].sort((a, b) => a.price - b.price);
    } else if (sortOrder === 'desc') {
      result = [...result].sort((a, b) => b.price - a.price);
    }

    return result;
  }, [selectedCategory, searchQuery, sortOrder]);

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

      {/* Grid de Productos y Ordenamiento */}
      <motion.div
        id="productos-grid"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="scroll-mt-32 pt-4 min-h-[50vh]"
      >
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6 px-2">
          <p className="text-txt-secondary text-sm font-medium mb-4 sm:mb-0">
            {filteredProducts.length} productos
          </p>
          
          <div className="relative group">
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value as 'asc' | 'desc' | '')}
              className="appearance-none bg-white border border-border hover:border-primary/50 rounded-full pl-5 pr-12 py-2.5 text-sm font-medium text-txt focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 cursor-pointer shadow-sm transition-all"
            >
              <option value="">Ordenar por</option>
              <option value="asc">Precio: menor a mayor</option>
              <option value="desc">Precio: mayor a menor</option>
            </select>
            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-txt-secondary pointer-events-none transition-transform group-hover:text-primary" />
          </div>
        </div>
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
