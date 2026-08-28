'use client';

import React, { forwardRef } from 'react';
import dayjs, { Dayjs } from 'dayjs';
import { Calendar } from 'lucide-react';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import AppInput, { type AppInputProps } from './AppInput';

export interface AppDatePickerProps {
  label?: string;
  placeholder?: string;
  value: Dayjs | null;
  onChange: (value: Dayjs | null) => void;
  minDate?: Dayjs;
  maxDate?: Dayjs;
  error?: string;
  disabled?: boolean;
  className?: string;
}

interface PickerFieldSlotProps {
  label?: React.ReactNode;
  id?: string;
  disabled?: boolean;
  value?: string;
  onChange?: React.ChangeEventHandler<HTMLInputElement>;
  onClick?: React.MouseEventHandler<HTMLInputElement>;
  onKeyDown?: React.KeyboardEventHandler<HTMLInputElement>;
  error?: boolean;
  helperText?: React.ReactNode;
  placeholder?: string;
}

const AppInputDateField = forwardRef<HTMLInputElement, PickerFieldSlotProps>(
  (
    {
      label,
      id,
      disabled,
      value,
      onChange,
      onClick,
      onKeyDown,
      error,
      helperText,
      placeholder,
    },
    ref,
  ) => {
    const resolvedError: AppInputProps['error'] = error
      ? (helperText as string) || 'Invalid date'
      : undefined;

    return (
      <AppInput
        ref={ref}
        id={id}
        label={label}
        icon={Calendar}
        placeholder={placeholder ?? 'Select date'}
        value={value ?? ''}
        onChange={onChange}
        onClick={onClick}
        onKeyDown={onKeyDown}
        disabled={disabled}
        readOnly
        className="cursor-pointer"
        error={resolvedError}
      />
    );
  },
);

AppInputDateField.displayName = 'AppInputDateField';

const AppDatePicker: React.FC<AppDatePickerProps> = ({
  label,
  placeholder,
  value,
  onChange,
  minDate = dayjs(),
  maxDate,
  error,
  disabled,
  className,
}) => {
  return (
    <div className={className}>
      <DatePicker
        label={label}
        value={value}
        onChange={onChange}
        minDate={minDate}
        maxDate={maxDate}
        disablePast
        disabled={disabled}
        slots={{ textField: AppInputDateField as React.ElementType }}
        slotProps={{
          textField: {
            placeholder: placeholder ?? 'Select date',
            error: !!error,
            helperText: error,
          } as Partial<PickerFieldSlotProps>,
          popper: {
            sx: {
              marginTop: '8px !important',
              '& .MuiPaper-root': {
                borderRadius: 'var(--radius-card)',
                fontFamily: 'var(--font-app-font)',
              },
              '& .MuiPickersDay-root.Mui-selected': {
                backgroundColor: 'var(--primary) !important',
              },
              '& .MuiPickersDay-root:hover': {
                backgroundColor: 'var(--primary-light)',
              },
            },
          },
        }}
      />
    </div>
  );
};

export default AppDatePicker;
