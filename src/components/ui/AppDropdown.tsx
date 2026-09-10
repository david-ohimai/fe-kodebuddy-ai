'use client';

import React, { useCallback, useEffect, useId, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { ChevronDown } from 'lucide-react';

export interface AppDropdownOption {
  label: string;
  value: string;
}

export interface AppDropdownProps {
  value: string;
  options: AppDropdownOption[];
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  ariaLabel?: string;
  className?: string;
}

function cx(...classes: Array<string | false | undefined>) {
  return classes.filter(Boolean).join(' ');
}

const MENU_Z_INDEX = 1400;

interface MenuRect {
  top: number;
  left: number;
  width: number;
}

export default function AppDropdown({
  value,
  options,
  onChange,
  placeholder = 'Select...',
  disabled = false,
  ariaLabel,
  className,
}: AppDropdownProps) {
  const [open, setOpen] = useState(false);
  const [menuRect, setMenuRect] = useState<MenuRect | null>(null);
  const listboxId = useId();
  const triggerRef = useRef<HTMLButtonElement>(null);

  const selected = options.find((option) => option.value === value);

  const updatePosition = useCallback(() => {
    const rect = triggerRef.current?.getBoundingClientRect();
    if (!rect) return;
    setMenuRect({ top: rect.bottom + 6, left: rect.left, width: rect.width });
  }, []);

  useEffect(() => {
    if (!open) return;
    updatePosition();
    window.addEventListener('scroll', updatePosition, true);
    window.addEventListener('resize', updatePosition);
    return () => {
      window.removeEventListener('scroll', updatePosition, true);
      window.removeEventListener('resize', updatePosition);
    };
  }, [open, updatePosition]);

  return (
    <div className={cx('relative', className)}>
      <button
        ref={triggerRef}
        type="button"
        disabled={disabled}
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={ariaLabel}
        className={cx(
          'b2-m flex w-full min-w-[130px] items-center justify-between gap-2 rounded-input border border-disabled bg-background px-3 py-2 text-left text-text transition-colors',
          disabled
            ? 'cursor-not-allowed opacity-60'
            : 'hover:border-muted focus:outline-none focus-visible:border-primary',
        )}
      >
        <span className={cx('truncate', !selected && 'text-muted')}>
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

      {open &&
        menuRect &&
        typeof document !== 'undefined' &&
        createPortal(
          <>
            <div
              role="presentation"
              onClick={() => setOpen(false)}
              className="fixed inset-0"
              style={{ zIndex: MENU_Z_INDEX }}
            />
            <ul
              id={listboxId}
              role="listbox"
              aria-label={ariaLabel}
              style={{
                position: 'fixed',
                top: menuRect.top,
                left: menuRect.left,
                width: menuRect.width,
                zIndex: MENU_Z_INDEX + 1,
              }}
              className="max-h-64 overflow-auto rounded-card border border-disabled bg-background py-1.5 shadow-lg"
            >
              {options.map((option) => {
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
                        setOpen(false);
                      }}
                      className={cx(
                        'b2-m block w-full px-4 py-2.5 text-left transition-colors',
                        isSelected
                          ? 'bg-primary text-white'
                          : 'text-text-secondary hover:bg-primary-light hover:text-primary',
                      )}
                    >
                      {option.label}
                    </button>
                  </li>
                );
              })}
            </ul>
          </>,
          document.body,
        )}
    </div>
  );
}
