import React, { useMemo } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  totalItems?: number;
  itemsPerPage?: number;
  itemName?: string;
  disabled?: boolean;
  className?: string;
  showItemCount?: boolean;
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  totalItems,
  itemsPerPage,
  itemName = 'orders',
  disabled = false,
  className = '',
  showItemCount = true,
}) => {
  const safeCurrentPage = Math.min(Math.max(1, currentPage), Math.max(1, totalPages));

  // Generate page numbers with ellipses for large page counts
  const pageNumbers = useMemo<(number | 'ellipsis-start' | 'ellipsis-end')[]>(() => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const pages: (number | 'ellipsis-start' | 'ellipsis-end')[] = [];
    const showLeftEllipsis = safeCurrentPage > 4;
    const showRightEllipsis = safeCurrentPage < totalPages - 3;

    pages.push(1);

    if (showLeftEllipsis) {
      pages.push('ellipsis-start');
    }

    const start = Math.max(2, safeCurrentPage - 1);
    const end = Math.min(totalPages - 1, safeCurrentPage + 1);

    for (let p = start; p <= end; p++) {
      if (p !== 1 && p !== totalPages) {
        pages.push(p);
      }
    }

    if (showRightEllipsis) {
      pages.push('ellipsis-end');
    }

    pages.push(totalPages);
    return pages;
  }, [totalPages, safeCurrentPage]);

  // Compute item count range text
  const countText = useMemo(() => {
    if (totalItems !== undefined && itemsPerPage !== undefined) {
      const from = (safeCurrentPage - 1) * itemsPerPage + 1;
      const to = Math.min(safeCurrentPage * itemsPerPage, totalItems);
      return (
        <>
          Showing <strong className="text-zinc-900 dark:text-white">{from}</strong> to{' '}
          <strong className="text-zinc-900 dark:text-white">{to}</strong> of{' '}
          <strong className="text-zinc-900 dark:text-white">{totalItems}</strong> {itemName}
        </>
      );
    }

    if (totalItems !== undefined) {
      return (
        <>
          Page <strong className="text-zinc-900 dark:text-white">{safeCurrentPage}</strong> of{' '}
          <strong className="text-zinc-900 dark:text-white">{totalPages}</strong> ({totalItems} total {itemName})
        </>
      );
    }

    return (
      <>
        Page <strong className="text-zinc-900 dark:text-white">{safeCurrentPage}</strong> of{' '}
        <strong className="text-zinc-900 dark:text-white">{totalPages}</strong>
      </>
    );
  }, [safeCurrentPage, totalPages, totalItems, itemsPerPage, itemName]);

  if (totalPages <= 1) return null;

  return (
    <nav
      aria-label="Pagination"
      className={`flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 select-none ${className}`}
    >
      {/* Information text */}
      {showItemCount && (
        <span className="text-xs text-zinc-500 dark:text-zinc-400">
          {countText}
        </span>
      )}

      {/* Page controls */}
      <div className="flex items-center gap-1.5 shrink-0">
        {/* Previous Button */}
        <button
          type="button"
          aria-label="Previous page"
          disabled={safeCurrentPage <= 1 || disabled}
          onClick={() => onPageChange(Math.max(1, safeCurrentPage - 1))}
          className="p-1.5 sm:p-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer shadow-2xs"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {/* Page buttons */}
        {pageNumbers.map((p, idx) => {
          if (p === 'ellipsis-start' || p === 'ellipsis-end') {
            return (
              <span
                key={`${p}-${idx}`}
                className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center text-xs font-bold text-zinc-400"
              >
                …
              </span>
            );
          }

          const isCurrent = p === safeCurrentPage;
          return (
            <button
              key={p}
              type="button"
              aria-label={`Page ${p}`}
              aria-current={isCurrent ? 'page' : undefined}
              disabled={disabled}
              onClick={() => onPageChange(p)}
              className={`w-7 h-7 sm:w-8 sm:h-8 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center ${
                isCurrent
                  ? 'bg-orange-500 text-white shadow-md shadow-orange-500/20 ring-1 ring-orange-500'
                  : 'border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-white'
              }`}
            >
              {p}
            </button>
          );
        })}

        {/* Next Button */}
        <button
          type="button"
          aria-label="Next page"
          disabled={safeCurrentPage >= totalPages || disabled}
          onClick={() => onPageChange(Math.min(totalPages, safeCurrentPage + 1))}
          className="p-1.5 sm:p-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer shadow-2xs"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </nav>
  );
};
