'use client';

import React, { forwardRef, useId } from 'react';
import { Check } from 'lucide-react';
import { cx } from '@/lib/utils/cx';

export interface AppCheckboxProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: React.ReactNode;
  error?: string;
}

const AppCheckbox = forwardRef<HTMLInputElement, AppCheckboxProps>(
  ({ label, error, id, className, checked, ...rest }, ref) => {
    const generatedId = useId();
    const inputId = id ?? generatedId;

    return (
      <div className="flex flex-col gap-1">
        <label
          htmlFor={inputId}
          className="flex cursor-pointer items-start gap-2.5"
        >
          <span className="relative mt-0.5 flex shrink-0 items-center justify-center">
            <input
              id={inputId}
              ref={ref}
              type="checkbox"
              checked={checked}
              className="peer sr-only"
              {...rest}
            />
            <span
              className={cx(
                'flex h-4.5 w-4.5 items-center justify-center rounded-[5px] border transition-colors',
                'peer-checked:border-primary peer-checked:bg-primary',
                'peer-focus-visible:ring-2 peer-focus-visible:ring-primary/40 peer-focus-visible:ring-offset-1',
                error ? 'border-error' : 'border-disabled',
                className,
              )}
            >
              <Check
                size={12}
                strokeWidth={3}
                className={cx(
                  'text-white transition-opacity',
                  checked ? 'opacity-100' : 'opacity-0',
                )}
              />
            </span>
          </span>

          {label && <span className="f1-r text-text-secondary">{label}</span>}
        </label>

        {error && <p className="f1-r ml-7 text-error">{error}</p>}
      </div>
    );
  },
);

AppCheckbox.displayName = 'AppCheckbox';

export default AppCheckbox;
