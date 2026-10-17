'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

// Devuelve los números de página a mostrar, con "…" cuando hay saltos.
function getPageItems(current: number, total: number): (number | 'ellipsis-start' | 'ellipsis-end')[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);

  const items: (number | 'ellipsis-start' | 'ellipsis-end')[] = [1];
  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);

  if (start > 2) items.push('ellipsis-start');
  for (let p = start; p <= end; p++) items.push(p);
  if (end < total - 1) items.push('ellipsis-end');
  items.push(total);
  return items;
}

export default function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
  if (totalPages <= 1) return null;

  const isFirst = currentPage === 1;
  const isLast = currentPage === totalPages;
  const items = getPageItems(currentPage, totalPages);

  const navBase =
    'inline-flex items-center justify-center gap-1 h-10 px-3 sm:px-4 rounded-full text-sm font-medium border transition-all duration-200';
  const navEnabled =
    'bg-white border-border text-txt hover:border-primary/50 hover:text-primary hover:shadow-sm';
  const navDisabled = 'bg-white/60 border-border-light text-txt-secondary/40 cursor-not-allowed';

  return (
    <nav
      aria-label="Paginación de productos"
      className="mt-10 sm:mt-14 flex flex-wrap items-center justify-center gap-2 sm:gap-3"
    >
      <button
        type="button"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={isFirst}
        aria-label="Página anterior"
        className={`${navBase} ${isFirst ? navDisabled : navEnabled}`}
      >
        <ChevronLeft className="w-4 h-4" />
        <span className="hidden sm:inline">Anterior</span>
      </button>

      <ul className="flex items-center gap-1 sm:gap-1.5">
        {items.map((item) =>
          typeof item === 'number' ? (
            <li key={item}>
              <button
                type="button"
                onClick={() => onPageChange(item)}
                aria-label={`Ir a la página ${item}`}
                aria-current={item === currentPage ? 'page' : undefined}
                className={`w-10 h-10 rounded-full text-sm font-semibold transition-all duration-200 ${
                  item === currentPage
                    ? 'bg-gradient-to-r from-primary to-primary-dark text-white shadow-md shadow-primary/25'
                    : 'bg-white border border-border-light text-txt hover:border-primary/40 hover:text-primary'
                }`}
              >
                {item}
              </button>
            </li>
          ) : (
            <li key={item} aria-hidden="true" className="w-6 text-center text-txt-secondary/60 select-none">
              …
            </li>
          )
        )}
      </ul>

      <button
        type="button"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={isLast}
        aria-label="Página siguiente"
        className={`${navBase} ${isLast ? navDisabled : navEnabled}`}
      >
        <span className="hidden sm:inline">Siguiente</span>
        <ChevronRight className="w-4 h-4" />
      </button>
    </nav>
  );
}
