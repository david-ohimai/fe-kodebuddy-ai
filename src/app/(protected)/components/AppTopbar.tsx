'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  Search,
  Calendar,
  ChevronDown,
  Menu,
  Settings,
  LogOut,
} from 'lucide-react';
import AppButton from '@/components/ui/AppButton';
import ThemeToggle from '@/components/ui/ThemeToggle';
import NotificationsMenu from '@/components/notifications/NotificationsMenu';

export interface AppTopbarProps {
  userName: string;
  userEmail?: string;
  userRole?: string;
  avatarSrc?: string;
  settingsHref?: string;
  date?: Date;
  searchPlaceholder?: string;
  onSearch?: (value: string) => void;
  onMenuClick?: () => void;
  onLogoutClick?: () => void;
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
  settingsHref,
  date = new Date(),
  searchPlaceholder = 'Search KodeBuddy...',
  onSearch,
  onMenuClick,
  onLogoutClick,
  className,
}) => {
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

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

        <NotificationsMenu />

        <ThemeToggle />

        <div className="relative">
          <button
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            aria-haspopup="menu"
            aria-expanded={menuOpen}
            className="flex items-center gap-2 rounded-btn p-1 transition-colors hover:bg-primary-light"
          >
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
            <ChevronDown
              size={16}
              className={cx(
                'hidden text-muted transition-transform sm:block',
                menuOpen && 'rotate-180',
              )}
            />
          </button>

          {menuOpen && (
            <>
              <div
                role="presentation"
                onClick={() => setMenuOpen(false)}
                className="fixed inset-0 z-40"
              />
              <div
                role="menu"
                className="absolute right-0 top-full z-50 mt-2 w-52 overflow-hidden rounded-card border border-disabled bg-background py-1.5 shadow-lg"
              >
                {settingsHref && (
                  <Link
                    href={settingsHref}
                    role="menuitem"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-2.5 b2-m text-text-secondary transition-colors hover:bg-primary-light hover:text-primary"
                  >
                    <Settings size={17} />
                    Settings
                  </Link>
                )}
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => {
                    setMenuOpen(false);
                    onLogoutClick?.();
                  }}
                  className="flex w-full items-center gap-2.5 px-4 py-2.5 b2-m text-text-secondary transition-colors hover:bg-error-light hover:text-error"
                >
                  <LogOut size={17} />
                  Log out
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default AppTopbar;
