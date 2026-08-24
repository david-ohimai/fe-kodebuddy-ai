'use client';

import React, { forwardRef, useId, useState } from 'react';
import { Eye, EyeOff, type LucideIcon } from 'lucide-react';
import { cx } from '@/lib/utils/cx';

export interface AppInputProps extends Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  'size'
> {
  label?: React.ReactNode;
  error?: string;
  hint?: string;
  icon?: LucideIcon;
  containerClassName?: string;
}

const AppInput = forwardRef<HTMLInputElement, AppInputProps>(
  (
    {
      label,
      error,
      hint,
      icon: Icon,
      type = 'text',
      id,
      className,
      containerClassName,
      ...rest
    },
    ref,
  ) => {
    const generatedId = useId();
    const inputId = id ?? generatedId;
    const isPassword = type === 'password';
    const [showPassword, setShowPassword] = useState(false);

    return (
      <div className={cx('flex flex-col gap-1.5', containerClassName)}>
        {label && (
          <label htmlFor={inputId} className="b2-m text-text">
            {label}
          </label>
        )}

        <div className="relative flex items-center">
          {Icon && (
            <Icon
              size={17}
              className="pointer-events-none absolute left-3.5 text-muted"
            />
          )}

          <input
            id={inputId}
            ref={ref}
            type={isPassword ? (showPassword ? 'text' : 'password') : type}
            aria-invalid={!!error}
            aria-describedby={error ? `${inputId}-error` : undefined}
            className={cx(
              'b2-r w-full rounded-input border bg-background py-2.5 text-text outline-none transition-colors placeholder:text-muted',
              Icon ? 'pl-10' : 'pl-3.5',
              isPassword ? 'pr-10' : 'pr-3.5',
              error
                ? 'border-error focus:border-error'
                : 'border-disabled focus:border-primary',
              className,
            )}
            {...rest}
          />

          {isPassword && (
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              className="absolute right-3.5 text-muted hover:text-text-secondary"
              tabIndex={-1}
            >
              {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
            </button>
          )}
        </div>

        {error ? (
          <p id={`${inputId}-error`} className="f1-r text-error">
            {error}
          </p>
        ) : (
          hint && <p className="f1-r text-muted">{hint}</p>
        )}
      </div>
    );
  },
);

AppInput.displayName = 'AppInput';

export default AppInput;
