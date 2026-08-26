'use client';

import React from 'react';
import Image, { type StaticImageData } from 'next/image';
import { Plus } from 'lucide-react';
import AppButton from './AppButton';

export interface AppEmptyStateProps {
  image: StaticImageData | string;
  title: string;
  description?: string;
  actionLabel?: string;
  actionIcon?: React.ReactNode;
  onAction?: () => void;
  actionRadius?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
  className?: string;
}

function cx(...classes: Array<string | false | undefined | null>) {
  return classes.filter(Boolean).join(' ');
}

const AppEmptyState: React.FC<AppEmptyStateProps> = ({
  image,
  title,
  description,
  actionLabel,
  actionIcon = <Plus size={16} />,
  onAction,
  actionRadius = 'full',
  className,
}) => {
  return (
    <div
      className={cx(
        'flex min-h-[420px] flex-col items-center justify-center px-6 py-14 text-center',
        className,
      )}
    >
      <Image src={image} alt="" width={160} height={120} className="mb-4" />
      <p className="b1-b text-text">{title}</p>
      {description && <p className="b2-r mt-1 max-w-sm text-muted">{description}</p>}
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
