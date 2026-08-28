'use client';

import React, { forwardRef, useId } from 'react';
import { cx } from '@/lib/utils/cx';

export interface AppTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: React.ReactNode;
  error?: string;
  hint?: string;
  containerClassName?: string;
  showCharCount?: boolean;
}

const AppTextarea = forwardRef<HTMLTextAreaElement, AppTextareaProps>(
  (
    {
      label,
      error,
      hint,
      id,
      className,
      containerClassName,
      showCharCount = false,
      maxLength,
      value,
      rows = 3,
      ...rest
    },
    ref,
  ) => {
    const generatedId = useId();
    const textareaId = id ?? generatedId;

    return (
      <div className={cx('flex flex-col gap-1.5', containerClassName)}>
        {label && (
          <label htmlFor={textareaId} className="b2-m text-text">
            {label}
          </label>
        )}

        <textarea
          id={textareaId}
          ref={ref}
          rows={rows}
          maxLength={maxLength}
          value={value}
          aria-invalid={!!error}
          aria-describedby={error ? `${textareaId}-error` : undefined}
          className={cx(
            'b2-r w-full resize-none rounded-input border bg-background px-4 py-3 text-text outline-none transition-colors placeholder:text-muted',
            error
              ? 'border-error focus:border-error'
              : 'border-disabled focus:border-primary',
            className,
          )}
          {...rest}
        />

        {(error || hint || (showCharCount && maxLength)) && (
          <div className="flex items-start justify-between gap-2">
            {error ? (
              <p id={`${textareaId}-error`} className="f1-r text-error">
                {error}
              </p>
            ) : hint ? (
              <p className="f1-r text-muted">{hint}</p>
            ) : (
              <span />
            )}

            {showCharCount && maxLength && (
              <span className="f2-r shrink-0 text-muted">
                {String(value ?? '').length}/{maxLength}
              </span>
            )}
          </div>
        )}
      </div>
    );
  },
);

AppTextarea.displayName = 'AppTextarea';

export default AppTextarea;
