'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import AppLogo from '@/components/layout/AppLogo';
import {
  LayoutDashboard,
  GraduationCap,
  Users,
  BookOpen,
  Settings,
  X,
} from 'lucide-react';

export interface AppSidebarProps {
  user?: {
    name: string;
    email: string;
    avatarSrc?: string;
  };
  isOpen?: boolean;
  onClose?: () => void;
  className?: string;
}

function cx(...classes: Array<string | false | undefined>) {
  return classes.filter(Boolean).join(' ');
}

const NAV_ITEMS = [
  { label: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { label: 'Users', href: '/users', icon: Users },
  { label: 'Cohorts', href: '/cohorts', icon: GraduationCap },
  {
    label: 'Courses & Contents',
    href: '/courses-and-contents',
    icon: BookOpen,
  },
] as const;

const DEFAULT_USER: NonNullable<AppSidebarProps['user']> = {
  name: 'Ayomide Ben',
  email: 'learner3@example.com',
};

const AppSidebar: React.FC<AppSidebarProps> = ({
  user = DEFAULT_USER,
  isOpen = false,
  onClose,
  className,
}) => {
  const pathname = usePathname();

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside
        className={cx(
          'fixed inset-y-0 left-0 z-50 flex h-screen w-60 shrink-0 flex-col justify-between',
          'border-r border-disabled bg-background px-4 py-5 transition-transform duration-200',
          'lg:sticky lg:top-0 lg:translate-x-0',
          isOpen ? 'translate-x-0' : '-translate-x-full',
          className,
        )}
      >
        <div>
          <div className="mb-8 flex items-center justify-between px-1">
            <AppLogo withTitle height={28} href="/dashboard" />
            <button
              type="button"
              onClick={onClose}
              aria-label="Close sidebar"
              className="flex h-8 w-8 items-center justify-center rounded-btn text-muted hover:bg-primary-light hover:text-primary lg:hidden"
            >
              <X size={18} />
            </button>
          </div>

          {/* Nav items */}
          <nav className="flex flex-col gap-1">
            {NAV_ITEMS.map(({ label, href, icon: Icon }) => {
              const isActive =
                pathname === href || pathname?.startsWith(`${href}/`);
              return (
                <Link
                  key={href}
                  href={href}
                  onClick={onClose}
                  className={cx(
                    'flex items-center gap-3 rounded-btn px-3 py-2.5 b2-m transition-colors',
                    isActive
                      ? 'bg-primary-light text-primary'
                      : 'text-text-secondary hover:bg-primary-light hover:text-primary',
                  )}
                >
                  <Icon size={18} />
                  <span>{label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="flex flex-col gap-3 border-t border-disabled pt-4">
          <div className="flex items-center gap-3 px-1">
            {user.avatarSrc ? (
              <Image
                src={user.avatarSrc}
                alt={user.name}
                width={32}
                height={32}
                className="rounded-full object-cover"
              />
            ) : (
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-light b2-b text-primary">
                {user.name.charAt(0)}
              </span>
            )}
            <div className="flex flex-col leading-tight">
              <span className="b2-b text-[#1f2937]">{user.name}</span>
              <span className="f1-r text-muted">{user.email}</span>
            </div>
          </div>
          <Link
            href="/settings"
            className="flex items-center gap-3 rounded-btn px-3 py-2 b2-m text-text-secondary hover:bg-primary-light hover:text-primary"
          >
            <Settings size={18} />
            <span>Settings</span>
          </Link>
        </div>
      </aside>
    </>
  );
};

export default AppSidebar;
