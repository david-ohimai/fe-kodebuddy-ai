'use client';

import React from 'react';
import Image, { type StaticImageData } from 'next/image';
import { Plus } from 'lucide-react';
import AppButton from './AppButton';

export interface AppEmptyStateProps {
  image?: StaticImageData | string;
  icon?: React.ReactNode;
  title: string;
  description?: string;
  actionLabel?: string;
  actionIcon?: React.ReactNode;
  onAction?: () => void;
  actionRadius?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
  size?: 'default' | 'compact';
  className?: string;
}

function cx(...classes: Array<string | false | undefined | null>) {
  return classes.filter(Boolean).join(' ');
}

const AppEmptyState: React.FC<AppEmptyStateProps> = ({
  image,
  icon,
  title,
  description,
  actionLabel,
  actionIcon = <Plus size={16} />,
  onAction,
  actionRadius = 'full',
  size = 'default',
  className,
}) => {
  const isCompact = size === 'compact';

  return (
    <div
      className={cx(
        'flex flex-col items-center justify-center text-center',
        isCompact ? 'px-4 py-8' : 'min-h-[420px] px-6 py-14',
        className,
      )}
    >
      {icon ? (
        <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-full bg-disabled text-muted [&_svg]:h-4 [&_svg]:w-4">
          {icon}
        </div>
      ) : (
        image && (
          <Image src={image} alt="" width={160} height={120} className="mb-4" />
        )
      )}
      <p className={cx(isCompact ? 'b2-m' : 'b1-b', 'text-text')}>{title}</p>
      {description && (
        <p
          className={cx(
            'b2-r mt-1 text-muted',
            isCompact ? 'max-w-xs' : 'max-w-sm',
          )}
        >
          {description}
        </p>
      )}
      {actionLabel && onAction && (
        <AppButton
          className="mt-6"
          radius={actionRadius}
          startIcon={actionIcon}
          onClick={onAction}
        >
          {actionLabel}
        </AppButton>
      )}
    </div>
  );
};

export default AppEmptyState;
