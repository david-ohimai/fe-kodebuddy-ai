'use client';

import React from 'react';
import { cx } from '@/lib/utils/cx';

export interface AppChipToggleProps {
  label: string;
  selected: boolean;
  onToggle: () => void;
}

export default function AppChipToggle({
  label,
  selected,
  onToggle,
}: AppChipToggleProps) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-pressed={selected}
      className={cx(
        'f1-r rounded-full border px-3.5 py-2 transition-colors',
        selected
          ? 'border-primary bg-primary-light text-primary'
          : 'border-disabled text-text-secondary hover:border-muted',
      )}
    >
      {label}
    </button>
  );
}
