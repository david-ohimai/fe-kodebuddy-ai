'use client';

import React from 'react';
import { Loader2 } from 'lucide-react';

export interface AppButtonProps {
  children?: React.ReactNode;
  label?: string;
  onClick?: () => void;
  variant?: 'contained' | 'outlined' | 'text';
  color?: 'primary' | 'secondary' | 'error' | 'success' | 'warning' | 'neutral';
  size?: 'small' | 'medium' | 'large' | 'icon';
  loading?: boolean;
  startIcon?: React.ReactNode;
  endIcon?: React.ReactNode;
  fullWidth?: boolean;
  disabled?: boolean;
  className?: string;
  type?: 'button' | 'submit' | 'reset';
  radius?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
  ariaLabel?: string;
}

function cx(...classes: Array<string | false | undefined>) {
  return classes.filter(Boolean).join(' ');
}

const COLOR_VARIANT_CLASSES: Record<
  NonNullable<AppButtonProps['color']>,
  Record<NonNullable<AppButtonProps['variant']>, string>
> = {
  primary: {
    contained: 'bg-primary text-white hover:bg-primary-dark',
    outlined: 'border border-primary text-primary hover:bg-primary-light',
    text: 'text-primary hover:bg-primary-light',
  },
  secondary: {
    contained: 'bg-secondary text-secondary-dark hover:brightness-95',
    outlined: 'border border-secondary text-secondary-dark hover:bg-secondary-light',
    text: 'text-secondary-dark hover:bg-secondary-light',
  },
  error: {
    contained: 'bg-error text-white hover:bg-error-dark',
    outlined: 'border border-error text-error hover:bg-error-light',
    text: 'text-error hover:bg-error-light',
  },
  success: {
    contained: 'bg-success text-success-dark hover:brightness-95',
    outlined: 'border border-success text-success-dark hover:bg-success-light',
    text: 'text-success-dark hover:bg-success-light',
  },
  warning: {
    contained: 'bg-warning text-[#3D2C00] hover:brightness-95',
    outlined: 'border border-warning text-[#8a5b00] hover:bg-warning/10',
    text: 'text-[#8a5b00] hover:bg-warning/10',
  },
  neutral: {
    contained: 'bg-gray-100 text-gray-800 hover:bg-gray-200',
    outlined: 'border border-gray-300 text-gray-700 hover:bg-gray-50',
    text: 'text-gray-700 hover:bg-gray-50',
  },
};

const SIZE_CLASSES: Record<NonNullable<AppButtonProps['size']>, string> = {
  small: 'text-sm px-5 py-1.5 min-h-[34px]',
  medium: 'text-sm px-7 py-2.5 min-h-[42px]',
  large: 'text-base px-8 py-3 min-h-[48px]',
  icon:  'p-0 w-10 h-10',
};

const SPINNER_SIZE: Record<NonNullable<AppButtonProps['size']>, number> = {
  small: 16,
  medium: 18,
  large: 20,
  icon: 18,
};
const RADIUS_CLASSES: Record<NonNullable<AppButtonProps['radius']>, string> = {
  none: 'rounded-none',
  sm: 'rounded-sm',
  md: 'rounded-btn',
  lg: 'rounded-lg',
  xl: 'rounded-xl',
  '2xl': 'rounded-2xl',
  full: 'rounded-full',
};

const AppButton: React.FC<AppButtonProps> = ({
  children,
  label,
  onClick,
  variant = 'contained',
  color = 'primary',
  size = 'medium',
  loading = false,
  startIcon,
  endIcon,
  fullWidth = false,
  disabled = false,
  className,
  type = 'button',
  radius = 'md',
  ariaLabel,
}) => {
  const isDisabled = disabled || loading;

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={isDisabled}
      aria-label={ariaLabel}
      aria-busy={loading}
      className={cx(
        'inline-flex items-center justify-center gap-2 font-primary font-semibold whitespace-nowrap transition-colors',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
        SIZE_CLASSES[size],
        RADIUS_CLASSES[radius],
        fullWidth && 'w-full',
        isDisabled
          ? 'bg-disabled text-muted border border-disabled cursor-not-allowed'
          : COLOR_VARIANT_CLASSES[color][variant],
        className,
      )}
    >
      {loading ? (
        <Loader2 size={SPINNER_SIZE[size]} className="animate-spin" aria-hidden="true" />
      ) : (
        <>
          {startIcon}
          {children || label}
          {endIcon}
        </>
      )}
    </button>
  );
};

export default AppButton;

