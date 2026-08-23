import React from 'react';
import { cx } from '@/lib/utils/cx';

export interface AuthStatusScreenProps {
  children: React.ReactNode;
  className?: string;
}

export default function AuthStatusScreen({
  children,
  className,
}: AuthStatusScreenProps) {
  return (
    <div className="relative flex min-h-screen w-full items-center justify-center bg-background px-6">
      <div className={cx('flex flex-col items-center text-center', className)}>
        {children}
      </div>

      <p className="f1-r absolute bottom-5 left-5 text-muted sm:left-8">
        © KodeBuddy {new Date().getFullYear()}
      </p>
    </div>
  );
}
