'use client';

import React, { useMemo, useState } from 'react';
import { ChevronDown, Search } from 'lucide-react';
import AppSpinner from './AppSpinner';

export interface AppSearchSelectOption {
  value: string;
  label: string;
  description?: string;
}

export interface AppSearchSelectProps {
  value: string;
  options: AppSearchSelectOption[];
  onChange: (value: string) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyMessage?: string;
  loading?: boolean;
  disabled?: boolean;
  ariaLabel?: string;
  className?: string;
}

function cx(...classes: Array<string | false | undefined>) {
  return classes.filter(Boolean).join(' ');
}

export default function AppSearchSelect({
  value,
  options,
  onChange,
  placeholder = 'Search and select...',
  searchPlaceholder = 'Type to search...',
  emptyMessage = 'No matches found.',
  loading = false,
  disabled = false,
  ariaLabel,
  className,
}: AppSearchSelectProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');

  const selected = options.find((option) => option.value === value);

  const filteredOptions = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return options;
    return options.filter(
      (option) =>
        option.label.toLowerCase().includes(q) ||
        option.description?.toLowerCase().includes(q),
    );
  }, [options, query]);

  const close = () => {
    setOpen(false);
    setQuery('');
  };

  return (
    <div className={cx('relative', className)}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={ariaLabel}
        className={cx(
          'b2-m flex w-full items-center justify-between gap-2 rounded-input border border-disabled bg-background px-3 py-2 text-left text-text transition-colors',
          disabled
            ? 'cursor-not-allowed opacity-60'
            : 'hover:border-muted focus:outline-none focus-visible:border-primary',
        )}
      >
        <span
          className={cx('min-w-0 flex-1 truncate', !selected && 'text-muted')}
        >
          {selected?.label ?? placeholder}
        </span>
        <ChevronDown
          size={16}
          className={cx(
            'shrink-0 text-muted transition-transform',
            open && 'rotate-180',
          )}
        />
      </button>

      {open && (
        <>
          <div
            role="presentation"
            onClick={close}
            className="fixed inset-0 z-40"
          />
          <div className="absolute left-0 top-full z-50 mt-1.5 w-full min-w-[260px] overflow-hidden rounded-card border border-disabled bg-background shadow-lg">
            <div className="flex items-center gap-2 border-b border-disabled px-3 py-2.5">
              <Search size={16} className="shrink-0 text-muted" />
              <input
                autoFocus
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={searchPlaceholder}
                aria-label={searchPlaceholder}
                className="b2-r w-full bg-transparent text-text placeholder:text-muted focus:outline-none"
              />
            </div>

            <ul
              role="listbox"
              aria-label={ariaLabel}
              className="max-h-64 overflow-auto py-1.5"
            >
              {loading ? (
                <li className="flex items-center justify-center py-6">
                  <AppSpinner size={24} />
                </li>
              ) : filteredOptions.length === 0 ? (
                <li className="b2-r px-4 py-6 text-center text-muted">
                  {emptyMessage}
                </li>
              ) : (
                filteredOptions.map((option) => {
                  const isSelected = option.value === value;
                  return (
                    <li
                      key={option.value}
                      role="option"
                      aria-selected={isSelected}
                    >
                      <button
                        type="button"
                        onClick={() => {
                          onChange(option.value);
                          close();
                        }}
                        className={cx(
                          'block w-full px-4 py-2.5 text-left transition-colors',
                          isSelected
                            ? 'bg-primary text-white'
                            : 'text-text hover:bg-primary-light hover:text-primary',
                        )}
                      >
                        <p className="b2-m">{option.label}</p>
                        {option.description && (
                          <p
                            className={cx(
                              'f1-r',
                              isSelected ? 'text-white/80' : 'text-muted',
                            )}
                          >
                            {option.description}
                          </p>
                        )}
                      </button>
                    </li>
                  );
                })
              )}
            </ul>
          </div>
        </>
      )}
    </div>
  );
}
