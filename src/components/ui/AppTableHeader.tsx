'use client';

import React from 'react';
import { Search } from 'lucide-react';
import AppDropdown, { AppDropdownOption } from '@/components/ui/AppDropdown';

export interface TableHeaderFilter {
  id: string;
  value: string;
  options: AppDropdownOption[];
  onChange: (value: string) => void;
  ariaLabel?: string;
}

export interface TableHeaderProps {
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  searchPlaceholder?: string;
  filters?: TableHeaderFilter[];
  className?: string;
}

function cx(...classes: Array<string | false | undefined>) {
  return classes.filter(Boolean).join(' ');
}

const TableHeader: React.FC<TableHeaderProps> = ({
  searchValue,
  onSearchChange,
  searchPlaceholder = 'Search by name or email',
  filters = [],
  className,
}) => {
  return (
    <div
      className={cx(
        'flex flex-col gap-3 rounded-card bg-gray-50 p-3 sm:flex-row sm:items-center sm:justify-between',
        className,
      )}
    >
      <div className="flex w-full max-w-xs items-center gap-2 rounded-input border border-disabled bg-background px-3 py-2">
        <Search size={18} className="text-muted" />
        <input
          type="text"
          value={searchValue}
          placeholder={searchPlaceholder}
          onChange={(e) => onSearchChange?.(e.target.value)}
          className="b2-r w-full bg-transparent text-[#1f2937] placeholder:text-muted focus:outline-none"
        />
      </div>

      {filters.length > 0 && (
        <div className="flex items-center gap-3">
          {filters.map((filter) => (
            <AppDropdown
              key={filter.id}
              value={filter.value}
              options={filter.options}
              onChange={filter.onChange}
              ariaLabel={filter.ariaLabel}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default TableHeader;
