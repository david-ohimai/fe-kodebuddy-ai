'use client';

import React from 'react';
import { ChevronDown } from 'lucide-react';

export interface AppDropdownOption {
  label: string;
  value: string;
}

export interface AppDropdownProps {
  value: string;
  options: AppDropdownOption[];
  onChange: (value: string) => void;
  ariaLabel?: string;
  className?: string;
}

function cx(...classes: Array<string | false | undefined>) {
  return classes.filter(Boolean).join(' ');
}

const AppDropdown: React.FC<AppDropdownProps> = ({
  value,
  options,
  onChange,
  ariaLabel,
  className,
}) => {
  return (
    <div className={cx('relative', className)}>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-label={ariaLabel}
        className="b2-m appearance-none rounded-input border border-disabled bg-background py-2 pl-3 pr-8 text-[#1f2937] focus:outline-none"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <ChevronDown
        size={18}
        className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-muted"
      />
    </div>
  );
};

export default AppDropdown;
