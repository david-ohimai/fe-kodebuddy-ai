'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Search, Calendar, Bell, ChevronDown, Menu } from 'lucide-react';
import AppButton from '@/components/ui/AppButton';

export interface AppTopbarProps {
  userName: string;
  userEmail?: string;
  userRole?: string;
  avatarSrc?: string;
  date?: Date;
  searchPlaceholder?: string;
  onSearch?: (value: string) => void;
  onNotificationsClick?: () => void;
  onMenuClick?: () => void;
  className?: string;
}

function cx(...classes: Array<string | false | undefined>) {
  return classes.filter(Boolean).join(' ');
}

function formatOrdinalDate(date: Date) {
  const day = date.getDate();
  const suffix =
    day % 10 === 1 && day !== 11
      ? 'st'
      : day % 10 === 2 && day !== 12
        ? 'nd'
        : day % 10 === 3 && day !== 13
          ? 'rd'
          : 'th';
  const month = date.toLocaleString('en-US', { month: 'short' });
  return `${day}${suffix} ${month}, ${date.getFullYear()}`;
}

const AppTopbar: React.FC<AppTopbarProps> = ({
  userName,
  userRole = 'Learner',
  avatarSrc,
  date = new Date(),
  searchPlaceholder = 'Search KodeBuddy...',
  onSearch,
  onNotificationsClick,
  onMenuClick,
  className,
}) => {
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);

  return (
    <header
      className={cx(
        'flex items-center justify-between gap-3 border-b border-disabled bg-background px-4 py-3 sm:px-6',
        className,
      )}
    >
      <AppButton
        variant="outlined"
        color="neutral"
        size="icon"
        onClick={onMenuClick}
        ariaLabel="Open sidebar"
        className="!h-9 !w-9 !rounded-input !border-disabled !text-text-secondary hover:!bg-primary-light hover:!text-primary lg:hidden"
      >
        <Menu size={18} />
      </AppButton>

      <div
        className={cx(
          'min-w-0 items-center gap-2 rounded-input border border-disabled px-3 py-2',
          'w-full flex-1 sm:max-w-md sm:flex-none',
          mobileSearchOpen ? 'flex' : 'hidden sm:flex',
        )}
      >
        <Search size={18} className="shrink-0 text-muted" />
        <input
          type="text"
          placeholder={searchPlaceholder}
          onChange={(e) => onSearch?.(e.target.value)}
          className="b2-r w-full min-w-0 bg-transparent text-text placeholder:text-muted focus:outline-none"
        />
      </div>

      <AppButton
        variant="outlined"
        color="neutral"
        size="icon"
        onClick={() => setMobileSearchOpen((v) => !v)}
        ariaLabel="Toggle search"
        className="!h-9 !w-9 !rounded-input !border-disabled !text-text-secondary hover:!bg-primary-light hover:!text-primary sm:hidden"
      >
        <Search size={18} />
      </AppButton>

      <div className="flex shrink-0 items-center gap-2 sm:gap-4">
        <div className="hidden items-center gap-2 rounded-input border border-disabled px-3 py-2 text-text-secondary lg:flex">
          <Calendar size={16} />
          <span className="b2-m whitespace-nowrap">
            {formatOrdinalDate(date)}
          </span>
        </div>

        <AppButton
          variant="outlined"
          color="neutral"
          size="icon"
          onClick={onNotificationsClick}
          ariaLabel="Notifications"
          className="!h-9 !w-9 !rounded-input !border-disabled !text-text-secondary hover:!bg-primary-light hover:!text-primary"
        >
          <Bell size={18} />
        </AppButton>

        <button type="button" className="flex items-center gap-2">
          {avatarSrc ? (
            <Image
              src={avatarSrc}
              alt={userName}
              width={36}
              height={36}
              className="h-9 w-9 shrink-0 rounded-full object-cover"
            />
          ) : (
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary-light b2-b text-primary">
              {userName.charAt(0)}
            </span>
          )}
          <span className="hidden flex-col items-start leading-tight sm:flex">
            <span className="b2-b text-text">{userName}</span>
            <span className="f1-r text-muted">{userRole}</span>
          </span>
          <ChevronDown size={16} className="hidden text-muted sm:block" />
        </button>
      </div>
    </header>
  );
};

export default AppTopbar;
