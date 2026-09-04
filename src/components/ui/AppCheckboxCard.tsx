'use client';

import React from 'react';
import { Check } from 'lucide-react';
import { cx } from '@/lib/utils/cx';

export interface AppCheckboxCardProps {
  value: string;
  label: string;
  description?: string;
  checked: boolean;
  disabled?: boolean;
  onChange: (value: string, checked: boolean) => void;
}

/** Same bordered-row look as AppRadioCard, for multi-select lists instead of single-select. */
export default function AppCheckboxCard({
  value,
  label,
  description,
  checked,
  disabled = false,
  onChange,
}: AppCheckboxCardProps) {
  return (
    <label
      className={cx(
        'flex items-center justify-between gap-3 rounded-input border px-4 py-3 transition-colors',
        disabled ? 'cursor-not-allowed opacity-70' : 'cursor-pointer',
        checked
          ? 'border-primary bg-primary-light'
          : 'border-disabled bg-background hover:border-muted',
      )}
    >
      <div>
        <span className="b2-m text-text">{label}</span>
        {description && <p className="f1-r mt-0.5 text-muted">{description}</p>}
      </div>

      <span className="relative flex h-4.5 w-4.5 shrink-0 items-center justify-center">
        <input
          type="checkbox"
          value={value}
          checked={checked}
          disabled={disabled}
          onChange={(e) => onChange(value, e.target.checked)}
          className="sr-only"
        />
        <span
          className={cx(
            'flex h-4.5 w-4.5 items-center justify-center rounded-[5px] border-2 transition-colors',
            checked ? 'border-primary bg-primary' : 'border-disabled',
          )}
        >
          {checked && (
            <Check size={12} strokeWidth={3} className="text-white" />
          )}
        </span>
      </span>
    </label>
  );
}
