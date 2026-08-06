'use client';

import { categories } from '@/data/products';
import { Sparkles } from 'lucide-react';

interface FiltersProps {
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
}

export default function Filters({
  selectedCategory,
  onCategoryChange,
}: FiltersProps) {
  return (
    <div className="sticky top-16 sm:top-20 z-40 bg-white/90 backdrop-blur-md py-4 -mx-4 px-4 sm:mx-0 sm:px-0 sm:rounded-2xl shadow-sm sm:shadow-none sm:border-b-0 border-b border-border/50 mb-10 transition-all duration-300">
      {/* Category Tabs/Pills */}
      <div className="flex flex-nowrap sm:flex-wrap overflow-x-auto sm:overflow-visible items-center justify-start sm:justify-center gap-2 sm:gap-3 pb-2 sm:pb-0 cart-scrollbar">
        {categories.map((cat) => {
          const isActive = selectedCategory === cat.slug;
          return (
            <button
              key={cat.id}
              onClick={() => onCategoryChange(cat.slug)}
              className={`flex-shrink-0 flex items-center gap-2.5 px-5 py-3 rounded-full text-sm font-semibold transition-all duration-300 ${
                isActive
                  ? 'bg-gradient-to-r from-primary to-primary-dark text-white shadow-lg shadow-primary/25 scale-[1.02]'
                  : 'bg-white border border-border-light text-txt hover:border-primary/40 hover:text-primary hover:shadow-md hover:-translate-y-0.5'
              }`}
            >
              <span className={`text-lg ${isActive ? 'opacity-100' : 'opacity-80 grayscale group-hover:grayscale-0 transition-all'}`}>
                {cat.emoji}
              </span>
              <span>{cat.name}</span>
              {isActive && cat.slug === 'todos' && <Sparkles className="w-4 h-4 ml-1 animate-pulse" />}
            </button>
          );
        })}
      </div>
    </div>
  );
}
