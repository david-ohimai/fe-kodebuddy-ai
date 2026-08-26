'use client';

import React, { useState } from 'react';
import AppPagination from './AppPagination';
import AppDropdown from './AppDropdown';
import AppButton from './AppButton';

export interface AppTablePaginationProps {
  currentPage: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  pageSizeOptions?: number[];
  itemLabel?: string;
  className?: string;
}

function cx(...classes: Array<string | false | undefined>) {
  return classes.filter(Boolean).join(' ');
}

export default function AppTablePagination({
  currentPage,
  totalItems,
  pageSize,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [10, 20, 50, 100],
  itemLabel = 'items',
  className,
}: AppTablePaginationProps) {
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const [jumpValue, setJumpValue] = useState('');

  const handleJump = (e: React.FormEvent) => {
    e.preventDefault();
    const page = Number(jumpValue);
    if (Number.isInteger(page) && page >= 1 && page <= totalPages) {
      onPageChange(page);
    }
    setJumpValue('');
  };

  return (
    <div
      className={cx(
        'flex flex-col gap-4 border-t border-disabled px-4 py-4 sm:flex-row sm:items-center sm:justify-between',
        className,
      )}
    >
      <div className="flex items-center gap-2">
        <span className="b2-r text-text-secondary">Showing</span>
        <AppDropdown
          value={String(pageSize)}
          options={pageSizeOptions.map((size) => ({
            label: String(size),
            value: String(size),
          }))}
          onChange={(value) => {
            onPageSizeChange(Number(value));
            onPageChange(1);
          }}
          ariaLabel={`Results per page`}
          className="min-w-0"
        />
        <span className="b2-r whitespace-nowrap text-text-secondary">
          out of {totalItems} {itemLabel}
        </span>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <AppPagination
          currentPage={currentPage}
          totalPages={totalPages}
          onChange={onPageChange}
          className="flex-wrap"
        />

        {totalPages > 1 && (
          <form
            onSubmit={handleJump}
            className="hidden items-center gap-2 md:flex"
          >
            <input
              type="number"
              min={1}
              max={totalPages}
              value={jumpValue}
              onChange={(e) => setJumpValue(e.target.value)}
              aria-label="Jump to page"
              placeholder=""
              className="b2-r h-10 w-14 rounded-btn border border-disabled bg-background text-center text-text focus:border-primary focus:outline-none"
            />
            <AppButton
              type="submit"
              variant="outlined"
              color="neutral"
              size="small"
              disabled={!jumpValue}
            >
              Go
            </AppButton>
          </form>
        )}
      </div>
    </div>
  );
}
