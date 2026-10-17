'use client';

import { categories } from '@/data/products';

interface FiltersProps {
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  categoryCounts?: Record<string, number>;
}

export default function Filters({
  selectedCategory,
  onCategoryChange,
  categoryCounts = {},
}: FiltersProps) {
  return (
    <div className="relative mb-6">
      {/* Scrollable Category Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 pt-1 px-1 cart-scrollbar sm:flex-wrap sm:justify-center">
        {categories.map((cat) => {
          const isActive = selectedCategory === cat.slug;
          const count = categoryCounts[cat.slug];
          return (
            <button
              key={cat.id}
              onClick={() => onCategoryChange(cat.slug)}
              className={`flex-shrink-0 inline-flex items-center gap-2 px-4 py-2.5 rounded-full text-xs sm:text-sm font-medium transition-all duration-200 active:scale-95 ${
                isActive
                  ? 'bg-txt text-white shadow-sm ring-1 ring-txt'
                  : 'bg-white border border-[#E5E5E5] text-txt hover:border-black/30 hover:bg-[#FAF8F6]'
              }`}
            >
              <span className="text-sm">{cat.emoji}</span>
              <span>{cat.name}</span>
              {typeof count === 'number' && count > 0 && (
                <span
                  className={`text-[10px] sm:text-[11px] px-1.5 py-0.5 rounded-full font-semibold ${
                    isActive ? 'bg-white/20 text-white' : 'bg-black/5 text-txt-secondary'
                  }`}
                >
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
