'use client';
import * as React from 'react';
import Link from 'next/link';

function cx(...classes: Array<string | false | undefined | null>) {
  return classes.filter(Boolean).join(' ');
}

export type AppCardVariant =
  | 'default'
  | 'primary'
  | 'secondary'
  | 'success'
  | 'warning'
  | 'error';

const TINT: Record<AppCardVariant, string> = {
  default: 'bg-disabled text-text-secondary',
  primary: 'bg-primary-light text-primary',
  secondary: 'bg-secondary-light text-secondary-dark',
  success: 'bg-success-light text-success-dark',
  warning: 'bg-warning/15 text-warning',
  error: 'bg-error-light text-error',
};

const PADDING = {
  none: '',
  sm: 'p-4',
  md: 'p-5 sm:p-6',
  lg: 'p-6 sm:p-8',
};

interface AppCardProps {
  href?: string;
  interactive?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  className?: string;
  children?: React.ReactNode;
  onClick?: () => void;
}

function AppCardRoot({
  href,
  interactive,
  padding = 'md',
  className,
  children,
  onClick,
}: AppCardProps) {
  const classes = cx(
    'bg-background border border-disabled rounded-card',
    PADDING[padding],
    interactive &&
      'transition-all duration-150 hover:border-muted/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 cursor-pointer',
    className,
  );

  if (href) {
    return (
      <Link href={href} className={classes} onClick={onClick}>
        {children}
      </Link>
    );
  }

  return (
    <div className={classes} onClick={onClick}>
      {children}
    </div>
  );
}

interface AppCardIconProps {
  variant?: AppCardVariant;
  size?: 'sm' | 'md';
  className?: string;
  children?: React.ReactNode;
}

const ICON_SIZE = {
  sm: 'h-8 w-8 [&_svg]:h-4 [&_svg]:w-4',
  md: 'h-10 w-10 [&_svg]:h-5 [&_svg]:w-5',
};

function AppCardIcon({
  variant = 'default',
  size = 'md',
  className,
  children,
}: AppCardIconProps) {
  return (
    <div
      className={cx(
        'inline-flex shrink-0 items-center justify-center rounded-full',
        ICON_SIZE[size],
        TINT[variant],
        className,
      )}
    >
      {children}
    </div>
  );
}

export const AppCard = Object.assign(AppCardRoot, { Icon: AppCardIcon });
