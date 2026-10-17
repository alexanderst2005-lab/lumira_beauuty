'use client';

import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export default function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
  if (totalPages <= 1) return null;

  const isFirst = currentPage === 1;
  const isLast = currentPage === totalPages;
  const progressPercent = Math.min(100, Math.max(0, (currentPage / totalPages) * 100));

  return (
    <nav
      aria-label="Paginación del catálogo"
      className="mt-12 sm:mt-16 flex flex-col items-center justify-center gap-3.5 select-none"
    >
      {/* Barra de Navegación Principal */}
      <div className="inline-flex items-center gap-2 sm:gap-3 p-1.5 sm:p-2 bg-white rounded-full border border-[#E5E5E5] shadow-sm">
        {/* Ir a la primera página */}
        <button
          type="button"
          onClick={() => onPageChange(1)}
          disabled={isFirst}
          aria-label="Ir a la primera página"
          title="Primera página"
          className="w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-txt hover:bg-secondary-100 hover:text-primary disabled:opacity-30 disabled:pointer-events-none transition-all duration-200"
        >
          <ChevronsLeft className="w-4 h-4" />
        </button>

        {/* Botón Anterior */}
        <button
          type="button"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={isFirst}
          aria-label="Página anterior"
          className="inline-flex items-center gap-1.5 h-9 sm:h-10 px-3.5 sm:px-4 rounded-full text-xs sm:text-sm font-semibold text-txt bg-[#FAF8F6] hover:bg-primary hover:text-white disabled:opacity-30 disabled:pointer-events-none transition-all duration-200 shadow-2xs"
        >
          <ChevronLeft className="w-4 h-4" />
          <span className="hidden sm:inline">Anterior</span>
        </button>

        {/* Contador Central Estilo 1 / 15 */}
        <div className="flex items-center px-4 sm:px-6 py-1 bg-white rounded-full">
          <div className="flex items-baseline gap-1.5">
            <span className="font-display text-xl sm:text-2xl font-bold text-txt tracking-tight leading-none">
              {currentPage}
            </span>
            <span className="text-primary/70 font-serif text-base sm:text-lg font-light leading-none">
              /
            </span>
            <span className="text-txt-secondary text-xs sm:text-sm font-medium leading-none">
              {totalPages}
            </span>
          </div>
        </div>

        {/* Botón Siguiente */}
        <button
          type="button"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={isLast}
          aria-label="Página siguiente"
          className="inline-flex items-center gap-1.5 h-9 sm:h-10 px-3.5 sm:px-4 rounded-full text-xs sm:text-sm font-semibold text-txt bg-[#FAF8F6] hover:bg-primary hover:text-white disabled:opacity-30 disabled:pointer-events-none transition-all duration-200 shadow-2xs"
        >
          <span className="hidden sm:inline">Siguiente</span>
          <ChevronRight className="w-4 h-4" />
        </button>

        {/* Ir a la última página */}
        <button
          type="button"
          onClick={() => onPageChange(totalPages)}
          disabled={isLast}
          aria-label="Ir a la última página"
          title="Última página"
          className="w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-txt hover:bg-secondary-100 hover:text-primary disabled:opacity-30 disabled:pointer-events-none transition-all duration-200"
        >
          <ChevronsRight className="w-4 h-4" />
        </button>
      </div>

      {/* Barra de Progreso Delicada Estilo Boutique */}
      <div className="w-36 sm:w-48 h-1 bg-[#F0E6DE] rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-primary to-primary-dark rounded-full transition-all duration-300 ease-out"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Subtexto sutil */}
      <p className="text-[11px] text-txt-secondary/60 font-sans tracking-wide">
        Página {currentPage} de {totalPages}
      </p>
    </nav>
  );
}
