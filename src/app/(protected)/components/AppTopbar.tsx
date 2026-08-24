'use client';

import React from 'react';
import Image from 'next/image';
import SearchIcon from '@mui/icons-material/Search';
import CalendarTodayOutlinedIcon from '@mui/icons-material/CalendarTodayOutlined';
import NotificationsNoneOutlinedIcon from '@mui/icons-material/NotificationsNoneOutlined';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import { Menu } from 'lucide-react';

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
  userRole = 'Admin',
  avatarSrc,
  date = new Date(),
  searchPlaceholder = 'Search KodeBuddy...',
  onSearch,
  onNotificationsClick,
  onMenuClick,
  className,
}) => {
  return (
    <header
      className={cx(
        'flex items-center justify-between gap-3 border-b border-disabled bg-background px-4 py-3 sm:px-6',
        className,
      )}
    >
      <button
        type="button"
        onClick={onMenuClick}
        aria-label="Open menu"
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-input border border-disabled text-text-secondary hover:bg-primary-light hover:text-primary lg:hidden"
      >
        <Menu size={18} />
      </button>

      {/* Search */}
      <div className="flex min-w-0 flex-1 items-center gap-2 rounded-input border border-disabled px-3 py-2 sm:max-w-md">
        <SearchIcon fontSize="small" className="shrink-0 text-muted" />
        <input
          type="text"
          placeholder={searchPlaceholder}
          onChange={(e) => onSearch?.(e.target.value)}
          className="b2-r w-full min-w-0 bg-transparent text-text placeholder:text-muted focus:outline-none"
        />
      </div>

    
      <div className="flex shrink-0 items-center gap-2 sm:gap-4">
        <div className="hidden items-center gap-2 rounded-input border border-disabled px-3 py-2 text-text-secondary sm:flex">
          <CalendarTodayOutlinedIcon sx={{ fontSize: 16 }} />
          <span className="b2-m">{formatOrdinalDate(date)}</span>
        </div>

        <button
          type="button"
          onClick={onNotificationsClick}
          aria-label="Notifications"
          className="flex h-9 w-9 items-center justify-center rounded-input border border-disabled text-text-secondary hover:bg-primary-light hover:text-primary"
        >
          <NotificationsNoneOutlinedIcon fontSize="small" />
        </button>

        <button type="button" className="flex items-center gap-2">
          {avatarSrc ? (
            <Image
              src={avatarSrc}
              alt={userName}
              width={36}
              height={36}
              className="h-9 w-9 rounded-full object-cover"
            />
          ) : (
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-light b2-b text-primary">
              {userName.charAt(0)}
            </span>
          )}
          <span className="hidden flex-col items-start leading-tight sm:flex">
            <span className="b2-b text-text">{userName}</span>
            <span className="f1-r text-muted">{userRole}</span>
          </span>
          <KeyboardArrowDownIcon fontSize="small" className="text-muted" />
        </button>
      </div>
    </header>
  );
};

export default AppTopbar;
