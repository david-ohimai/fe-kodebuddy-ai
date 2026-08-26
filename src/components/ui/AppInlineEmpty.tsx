'use client';

import React from 'react';
import { cx } from '@/lib/utils/cx';

export interface AppInlineEmptyProps {
  icon: React.ReactNode;
  title: string;
  description?: string;
  className?: string;
}

export default function AppInlineEmpty({
  icon,
  title,
  description,
  className,
}: AppInlineEmptyProps) {
  return (
    <div
      className={cx(
        'flex flex-col items-center justify-center px-4 py-8 text-center',
        className,
      )}
    >
      <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-full bg-disabled text-muted [&_svg]:h-4 [&_svg]:w-4">
        {icon}
      </div>
      <p className="b2-m text-text">{title}</p>
      {description && (
        <p className="f1-r mt-1 max-w-xs text-muted">{description}</p>
      )}
    </div>
  );
}
