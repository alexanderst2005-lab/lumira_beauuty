'use client';

import { useEffect } from 'react';
import { X, SlidersHorizontal, Check, ArrowUpDown, Tag, DollarSign, RotateCcw } from 'lucide-react';
import { CategoryInfo } from '@/types';

interface FilterDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  categories: CategoryInfo[];
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
  sortOrder: 'asc' | 'desc' | 'recent' | 'name' | '';
  onSelectSortOrder: (order: 'asc' | 'desc' | 'recent' | 'name' | '') => void;
  priceRange: string;
  onSelectPriceRange: (range: string) => void;
  categoryCounts: Record<string, number>;
  totalProductsCount: number;
  onResetAll: () => void;
}

const SORT_OPTIONS: { id: 'recent' | 'asc' | 'desc' | 'name'; label: string; description: string }[] = [
  { id: 'recent', label: 'Más recientes / Destacados', description: 'Novedades añadidas primero' },
  { id: 'asc', label: 'Precio: Menor a Mayor', description: 'De menor precio a más costoso' },
  { id: 'desc', label: 'Precio: Mayor a Menor', description: 'De mayor precio a más económico' },
  { id: 'name', label: 'Nombre: A - Z', description: 'Alfabético por nombre de producto' },
];

const PRICE_RANGES = [
  { id: 'all', label: 'Cualquier precio' },
  { id: 'under_20k', label: 'Hasta $20.000' },
  { id: '20k_40k', label: '$20.000 - $40.000' },
  { id: 'above_40k', label: 'Más de $40.000' },
];

export default function FilterDrawer({
  isOpen,
  onClose,
  categories,
  selectedCategory,
  onSelectCategory,
  sortOrder,
  onSelectSortOrder,
  priceRange,
  onSelectPriceRange,
  categoryCounts,
  totalProductsCount,
  onResetAll,
}: FilterDrawerProps) {
  // Bloquear scroll de la página cuando el drawer está abierto
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

  if (!isOpen) return null;

  const hasActiveFilters = selectedCategory !== 'todos' || sortOrder !== '' || priceRange !== 'all';

  return (
    <div className="fixed inset-0 z-[100] flex justify-end">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300 animate-fadeIn"
      />

      {/* Drawer Panel */}
      <div className="relative w-full max-w-md bg-white h-full flex flex-col shadow-2xl z-10 animate-slideInRight overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-[#F0E6DE] bg-gradient-to-r from-secondary-50/50 to-white">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
              <SlidersHorizontal className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-display text-xl font-medium text-txt tracking-tight">Filtros y Orden</h2>
              <p className="text-xs text-txt-secondary font-sans">Personaliza tu búsqueda en el catálogo</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 -mr-2 text-txt-secondary hover:text-txt hover:bg-black/5 rounded-full transition-colors"
            aria-label="Cerrar filtros"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Scrollable */}
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-8 cart-scrollbar">
          {/* Ordenar por */}
          <div>
            <div className="flex items-center gap-2 mb-3.5">
              <ArrowUpDown className="w-4 h-4 text-primary" />
              <h3 className="text-xs font-semibold uppercase tracking-[0.15em] text-txt">Ordenar por precio y novedades</h3>
            </div>
            <div className="space-y-2">
              {SORT_OPTIONS.map((opt) => {
                const isSelected = (sortOrder === '' && opt.id === 'recent') || sortOrder === opt.id;
                return (
                  <button
                    key={opt.id}
                    onClick={() => onSelectSortOrder(opt.id === 'recent' ? '' : opt.id)}
                    className={`w-full flex items-center justify-between p-3.5 rounded-xl border text-left transition-all ${
                      isSelected
                        ? 'border-primary bg-primary/5 text-txt shadow-sm ring-1 ring-primary/20'
                        : 'border-[#E5E5E5] bg-white text-txt-secondary hover:border-black/20 hover:text-txt'
                    }`}
                  >
                    <div>
                      <p className={`text-sm font-medium ${isSelected ? 'text-primary font-semibold' : 'text-txt'}`}>
                        {opt.label}
                      </p>
                      <p className="text-xs text-txt-secondary/70 mt-0.5">{opt.description}</p>
                    </div>
                    {isSelected && (
                      <div className="w-5 h-5 rounded-full bg-primary text-white flex items-center justify-center flex-shrink-0">
                        <Check className="w-3 h-3 stroke-[3]" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Categorías */}
          <div>
            <div className="flex items-center justify-between mb-3.5">
              <div className="flex items-center gap-2">
                <Tag className="w-4 h-4 text-primary" />
                <h3 className="text-xs font-semibold uppercase tracking-[0.15em] text-txt">Todas las Categorías</h3>
              </div>
              <span className="text-[11px] text-txt-secondary/70 font-medium">
                {categories.length} disponibles
              </span>
            </div>
            <div className="space-y-1.5">
              {categories.map((cat) => {
                const isSelected = selectedCategory === cat.slug;
                const count = categoryCounts[cat.slug] ?? 0;
                return (
                  <button
                    key={cat.id}
                    onClick={() => onSelectCategory(cat.slug)}
                    className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl border text-left transition-all ${
                      isSelected
                        ? 'border-primary bg-primary text-white font-semibold shadow-sm'
                        : 'border-[#EFEFEF] bg-white text-txt hover:border-black/20 hover:bg-secondary-50/50'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="text-base">{cat.emoji}</span>
                      <span className="text-sm">{cat.name}</span>
                    </div>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        isSelected
                          ? 'bg-white/20 text-white'
                          : 'bg-black/5 text-txt-secondary'
                      }`}
                    >
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Rango de Precios */}
          <div>
            <div className="flex items-center gap-2 mb-3.5">
              <DollarSign className="w-4 h-4 text-primary" />
              <h3 className="text-xs font-semibold uppercase tracking-[0.15em] text-txt">Rango de Precio</h3>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {PRICE_RANGES.map((r) => {
                const isSelected = priceRange === r.id;
                return (
                  <button
                    key={r.id}
                    onClick={() => onSelectPriceRange(r.id)}
                    className={`py-2.5 px-3 rounded-xl border text-xs font-medium transition-all text-center ${
                      isSelected
                        ? 'border-primary bg-primary/10 text-primary font-semibold ring-1 ring-primary/30'
                        : 'border-[#E5E5E5] bg-white text-txt-secondary hover:border-black/20 hover:text-txt'
                    }`}
                  >
                    {r.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-5 border-t border-[#F0E6DE] bg-white flex items-center gap-3">
          {hasActiveFilters && (
            <button
              onClick={onResetAll}
              className="flex items-center justify-center gap-1.5 px-4 py-3 rounded-full border border-[#E5E5E5] text-txt-secondary hover:text-txt hover:bg-black/5 text-xs font-semibold transition-colors flex-shrink-0"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Limpiar</span>
            </button>
          )}
          <button
            onClick={onClose}
            className="flex-1 py-3 px-6 rounded-full bg-primary hover:bg-primary-dark active:scale-[0.99] text-white text-sm font-semibold tracking-wide shadow-md shadow-primary/20 transition-all text-center"
          >
            Ver {totalProductsCount} {totalProductsCount === 1 ? 'producto' : 'productos'}
          </button>
        </div>
      </div>
    </div>
  );
}
