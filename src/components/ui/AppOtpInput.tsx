'use client';

import React, { useRef } from 'react';
import { cx } from '@/lib/utils/cx';

export interface AppOtpInputProps {
  length?: number;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  disabled?: boolean;
  autoFocus?: boolean;
}

/**
 * A row of single-digit boxes that behave like one input: typing advances
 * focus, backspace retreats, and pasting a full code fills every box.
 */
export default function AppOtpInput({
  length = 6,
  value,
  onChange,
  error,
  disabled,
  autoFocus,
}: AppOtpInputProps) {
  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);
  const digits = Array.from({ length }, (_, i) => value[i] ?? '');

  const setDigit = (index: number, digit: string) => {
    const next = digits.slice();
    next[index] = digit;
    onChange(next.join(''));
  };

  const handleChange = (
    index: number,
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const raw = e.target.value.replace(/\D/g, '');
    if (!raw) {
      setDigit(index, '');
      return;
    }

    // Handles both single keystrokes and fast typing/paste-into-one-box.
    const chars = raw.split('');
    const next = digits.slice();
    let cursor = index;
    for (const char of chars) {
      if (cursor >= length) break;
      next[cursor] = char;
      cursor += 1;
    }
    onChange(next.join(''));
    const focusIndex = Math.min(cursor, length - 1);
    inputRefs.current[focusIndex]?.focus();
  };

  const handleKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>,
  ) => {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
      setDigit(index - 1, '');
    } else if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '');
    if (!pasted) return;
    e.preventDefault();
    onChange(pasted.slice(0, length));
    const focusIndex = Math.min(pasted.length, length - 1);
    inputRefs.current[focusIndex]?.focus();
  };

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="flex justify-center gap-2 sm:gap-3">
        {digits.map((digit, index) => (
          <input
            key={index}
            ref={(el) => {
              inputRefs.current[index] = el;
            }}
            value={digit}
            onChange={(e) => handleChange(index, e)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            onPaste={handlePaste}
            disabled={disabled}
            autoFocus={autoFocus && index === 0}
            inputMode="numeric"
            maxLength={1}
            aria-label={`Digit ${index + 1} of ${length}`}
            className={cx(
              'h-12 w-11 rounded-input border bg-background text-center text-lg font-semibold text-text outline-none transition-colors sm:h-14 sm:w-13 sm:text-xl',
              error
                ? 'border-error focus:border-error'
                : 'border-disabled focus:border-primary',
              disabled && 'cursor-not-allowed opacity-60',
            )}
          />
        ))}
      </div>
      {error && <p className="f1-r text-error">{error}</p>}
    </div>
  );
}
