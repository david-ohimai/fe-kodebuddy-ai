'use client';

import React from 'react';
import { cx } from '@/lib/utils/cx';

export interface AppRadioCardProps {
  name: string;
  value: string;
  label: string;
  checked: boolean;
  onChange: (value: string) => void;
}

export default function AppRadioCard({
  name,
  value,
  label,
  checked,
  onChange,
}: AppRadioCardProps) {
  return (
    <label
      className={cx(
        'flex cursor-pointer items-center justify-between rounded-input border px-4 py-3 transition-colors',
        checked
          ? 'border-primary bg-primary-light'
          : 'border-disabled bg-background hover:border-muted',
      )}
    >
      <span className="b2-m text-text">{label}</span>

      <span className="relative flex h-4.5 w-4.5 shrink-0 items-center justify-center">
        <input
          type="radio"
          name={name}
          value={value}
          checked={checked}
          onChange={() => onChange(value)}
          className="sr-only"
        />
        <span
          className={cx(
            'flex h-4.5 w-4.5 items-center justify-center rounded-full border-2 transition-colors',
            checked ? 'border-primary' : 'border-disabled',
          )}
        >
          {checked && <span className="h-2.5 w-2.5 rounded-full bg-primary" />}
        </span>
      </span>
    </label>
  );
}
