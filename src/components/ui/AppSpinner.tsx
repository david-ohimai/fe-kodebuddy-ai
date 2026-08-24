import React from 'react';
import { cx } from '@/lib/utils/cx';

export interface AppSpinnerProps {
  size?: number;
  className?: string;
}

export default function AppSpinner({ size = 64, className }: AppSpinnerProps) {
  return (
    <span
      role="status"
      aria-label="Loading"
      className={cx(
        'inline-block animate-spin rounded-full border-4 border-secondary-light border-t-secondary',
        className,
      )}
      style={{ width: size, height: size }}
    />
  );
}
