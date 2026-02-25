import React from 'react';
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { useTheme } from "./ThemeContext";

export default function Pagination({ currentPage, totalPages, onPageChange, totalItems }) {
  const { isDarkMode } = useTheme();

  if (totalPages <= 1) return null;

  const getPages = () => {
    const pages = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (currentPage <= 3) {
        pages.push(1, 2, 3, 4, "...", totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1, "...", totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(1, "...", currentPage - 1, currentPage, currentPage + 1, "...", totalPages);
      }
    }
    return pages;
  };

  return (
    <div className="mt-12 flex flex-col items-center gap-6 animate-fade-in">
      <div className="flex items-center gap-3">
        {/* Botão Voltar */}
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className={`p-4 rounded-2xl border transition-all duration-300 shadow-sm
            ${currentPage === 1 
              ? "opacity-20 cursor-not-allowed border-gray-200 dark:border-white/5" 
              : "bg-white dark:bg-white/5 border-gray-200 dark:border-white/10 hover:border-[#e6b32a] text-gray-400 hover:text-[#e6b32a] active:scale-90"
            }`}
        >
          <FaChevronLeft size={14} />
        </button>

        {/* Números das Páginas */}
        <div className="flex items-center gap-2">
          {getPages().map((page, index) => (
            <button
              key={index}
              onClick={() => typeof page === "number" && onPageChange(page)}
              disabled={typeof page !== "number"}
              className={`w-12 h-12 rounded-2xl font-black text-xs transition-all duration-300
                ${currentPage === page
                  ? "bg-[#e6b32a] text-black shadow-lg shadow-[#e6b32a]/20 scale-110 z-10"
                  : page === "..."
                  ? "bg-transparent text-gray-400 cursor-default"
                  : "bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-500 hover:border-[#e6b32a] hover:text-[#e6b32a] active:scale-95 shadow-sm"
                }`}
            >
              {page}
            </button>
          ))}
        </div>

        {/* Botão Próximo */}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className={`p-4 rounded-2xl border transition-all duration-300 shadow-sm
            ${currentPage === totalPages 
              ? "opacity-20 cursor-not-allowed border-gray-200 dark:border-white/5" 
              : "bg-white dark:bg-white/5 border-gray-200 dark:border-white/10 hover:border-[#e6b32a] text-gray-400 hover:text-[#e6b32a] active:scale-90"
            }`}
        >
          <FaChevronRight size={14} />
        </button>
      </div>

      {/* Contador de Registros */}
      <div className="flex items-center gap-2">
        <div className="w-1 h-1 rounded-full bg-[#e6b32a]" />
        <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">
          total de {totalItems} registros encontrados
        </p>
        <div className="w-1 h-1 rounded-full bg-[#e6b32a]" />
      </div>
    </div>
  );
}