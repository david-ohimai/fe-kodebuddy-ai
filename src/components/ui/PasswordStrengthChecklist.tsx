'use client';

import React from 'react';
import { Check } from 'lucide-react';
import { cx } from '@/lib/utils/cx';
import { passwordRules } from '@/lib/validations/auth.schema';

export interface PasswordStrengthChecklistProps {
  password: string;
  className?: string;
}

export default function PasswordStrengthChecklist({
  password,
  className,
}: PasswordStrengthChecklistProps) {
  return (
    <ul className={cx('flex flex-col gap-1.5', className)}>
      {passwordRules.map((rule) => {
        const passed = password.length > 0 && rule.test(password);
        return (
          <li key={rule.id} className="flex items-center gap-2">
            <span
              className={cx(
                'flex h-4 w-4 shrink-0 items-center justify-center rounded-full transition-colors',
                passed ? 'bg-success text-white' : 'bg-disabled text-muted',
              )}
            >
              <Check size={11} strokeWidth={3} />
            </span>
            <span
              className={cx(
                'f1-r transition-colors',
                passed ? 'text-success-dark' : 'text-muted',
              )}
            >
              {rule.label}
            </span>
          </li>
        );
      })}
    </ul>
  );
}
