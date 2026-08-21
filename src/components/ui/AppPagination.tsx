'use client';

import React, { useMemo } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import AppButton from './AppButton';

export interface AppPaginationProps {
  currentPage: number;
  totalPages: number;
  onChange: (page: number) => void;
  siblingCount?: number;
  scrollToTop?: boolean;
}

const DOTS = '...' as const;

function getPageRange(
  currentPage: number,
  totalPages: number,
  siblingCount: number,
): (number | typeof DOTS)[] {
  const totalNumbers = siblingCount * 2 + 5;

  if (totalNumbers >= totalPages) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  const leftSibling = Math.max(currentPage - siblingCount, 1);
  const rightSibling = Math.min(currentPage + siblingCount, totalPages);

  const showLeftDots = leftSibling > 2;
  const showRightDots = rightSibling < totalPages - 1;

  if (!showLeftDots && showRightDots) {
    const leftRange = Array.from({ length: 3 + siblingCount * 2 }, (_, i) => i + 1);
    return [...leftRange, DOTS, totalPages];
  }

  if (showLeftDots && !showRightDots) {
    const rightRange = Array.from(
      { length: 3 + siblingCount * 2 },
      (_, i) => totalPages - (3 + siblingCount * 2) + i + 1,
    );
    return [1, DOTS, ...rightRange];
  }

  const middleRange = Array.from(
    { length: rightSibling - leftSibling + 1 },
    (_, i) => leftSibling + i,
  );
  return [1, DOTS, ...middleRange, DOTS, totalPages];
}

export default function AppPagination({
  currentPage,
  totalPages,
  onChange,
  siblingCount = 1,
  scrollToTop = false,
}: AppPaginationProps) {
  const pageRange = useMemo(
    () => getPageRange(currentPage, totalPages, siblingCount),
    [currentPage, totalPages, siblingCount],
  );

  if (totalPages <= 1) return null;

  const isFirst = currentPage === 1;
  const isLast = currentPage === totalPages;

  const goToPage = (page: number) => {
    if (page < 1 || page > totalPages || page === currentPage) return;
    onChange(page);
    if (scrollToTop) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <nav aria-label="Pagination" className="flex items-center justify-center mt-10 mb-4">
      {/* ── Desktop ── */}
      <ul className="hidden md:flex items-center gap-2">
        <li>
          <AppButton
            size="icon"
            variant="outlined"
            color="neutral"
            radius="md"
            onClick={() => goToPage(currentPage - 1)}
            disabled={isFirst}
            ariaLabel="Previous page"
            startIcon={<ChevronLeft size={20} />}
          />
        </li>

        {pageRange.map((page, index) =>
          page === DOTS ? (
            <li key={`dots-${index}`}>
              <span className="flex items-center justify-center w-10 h-10 rounded-btn border border-muted text-muted cursor-default b1-b">
                {DOTS}
              </span>
            </li>
          ) : (
            <li key={page}>
              <AppButton
                size="icon"
                radius="md"
                variant={page === currentPage ? 'contained' : 'outlined'}
                color={page === currentPage ? 'primary' : 'neutral'}
                onClick={() => goToPage(page)}
                ariaLabel={`Go to page ${page}`}
                className="b1-b"
              >
                {page}
              </AppButton>
            </li>
          ),
        )}

        <li>
          <AppButton
            size="icon"
            variant="outlined"
            color="neutral"
            radius="md"
            onClick={() => goToPage(currentPage + 1)}
            disabled={isLast}
            ariaLabel="Next page"
            startIcon={<ChevronRight size={20} />}
          />
        </li>
      </ul>

      {/* ── Mobile ── */}
      <div className="flex md:hidden items-center gap-6">
        <AppButton
          size="icon"
          variant="outlined"
          color="neutral"
          radius="md"
          onClick={() => goToPage(currentPage - 1)}
          disabled={isFirst}
          ariaLabel="Previous page"
          startIcon={<ChevronLeft size={20} />}
        />

        <span className="b2-r text-text-secondary whitespace-nowrap underline underline-offset-4">
          Page <span className="b2-b text-text">{currentPage}</span> of{' '}
          <span className="b2-b text-text">{totalPages}</span>
        </span>

        <AppButton
          size="icon"
          variant="outlined"
          color="neutral"
          radius="md"
          onClick={() => goToPage(currentPage + 1)}
          disabled={isLast}
          ariaLabel="Next page"
          startIcon={<ChevronRight size={20} />}
        />
      </div>
    </nav>
  );
}
