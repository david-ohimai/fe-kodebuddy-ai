'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import AppLogo from '@/components/layout/AppLogo';
import AppButton from '@/components/ui/AppButton';
import {
  ROLE_HOME_HREF,
  ROLE_SETTINGS_HREF,
  type DashboardRole,
} from '@/types/dashboard.types';
import {
  LayoutDashboard,
  BookOpen,
  ClipboardList,
  Lightbulb,
  BarChart3,
  Users,
  FileText,
  GraduationCap,
  Flag,
  Bell,
  Settings,
  PanelLeft,
  X,
} from 'lucide-react';

export interface AppSidebarProps {
  role?: DashboardRole;
  collapsed?: boolean;
  onToggleCollapsed?: () => void;
  isOpen?: boolean;
  onClose?: () => void;
  className?: string;
}

function cx(...classes: Array<string | false | undefined>) {
  return classes.filter(Boolean).join(' ');
}

const NAV_ITEMS_BY_ROLE: Record<
  DashboardRole,
  ReadonlyArray<{ label: string; href: string; icon: React.ElementType }>
> = {
  learner: [
    { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { label: 'Learn', href: '/learn', icon: BookOpen },
    { label: 'Assignments', href: '/assignments', icon: ClipboardList },
    { label: 'Resources', href: '/resources', icon: Lightbulb },
    { label: 'Progress', href: '/progress', icon: BarChart3 },
  ],
  admin: [
    { label: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
    { label: 'Users', href: '/admin/users', icon: Users },
    { label: 'Cohorts', href: '/admin/cohorts', icon: GraduationCap },
    {
      label: 'Courses & Contents',
      href: '/admin/courses-and-contents',
      icon: FileText,
    },
  ],
  trainer: [
    { label: 'Dashboard', href: '/trainer/dashboard', icon: LayoutDashboard },
    { label: 'My Course', href: '/trainer/my-course', icon: BookOpen },
    { label: 'My Cohort', href: '/trainer/my-cohort', icon: GraduationCap },
    { label: 'Escalations', href: '/trainer/escalations', icon: Flag },
  ],
  mentor: [
    { label: 'Dashboard', href: '/mentor/dashboard', icon: LayoutDashboard },
    { label: 'My Learners', href: '/mentor/my-learners', icon: Users },
    { label: 'Notifications', href: '/mentor/notifications', icon: Bell },
  ],
};

const AppSidebar: React.FC<AppSidebarProps> = ({
  role = 'learner',
  collapsed = false,
  onToggleCollapsed,
  isOpen = false,
  onClose,
  className,
}) => {
  const pathname = usePathname();
  const navItems = NAV_ITEMS_BY_ROLE[role];
  const homeHref = ROLE_HOME_HREF[role];
  const settingsHref = ROLE_SETTINGS_HREF[role];
  const isSettingsActive =
    pathname === settingsHref || pathname?.startsWith(`${settingsHref}/`);

  return (
    <>
      {isOpen && (
        <div
          role="presentation"
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
        />
      )}

      <aside
        className={cx(
          'fixed inset-y-0 left-0 z-50 flex h-screen shrink-0 flex-col justify-between',
          'border-r border-disabled bg-background px-4 py-5 transition-[width,transform] duration-200 ease-in-out',
          'w-72 lg:sticky lg:top-0 lg:z-auto',
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
          collapsed ? 'lg:w-20' : 'lg:w-60',
          className,
        )}
      >
        <div>
          <div
            className={cx(
              'mb-8 flex items-center px-1',
              collapsed ? 'lg:justify-center' : 'justify-between',
            )}
          >
            {!collapsed && <AppLogo withTitle height={28} href={homeHref} />}
            {collapsed && (
              <span className="hidden lg:block">
                <AppLogo href={homeHref} width={28} height={28} />
              </span>
            )}

            <AppButton
              variant="text"
              color="neutral"
              size="icon"
              onClick={onToggleCollapsed}
              ariaLabel={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              className="hidden h-8! w-8! text-muted! hover:!bg-primary-light! hover:!text-primary! lg:inline-flex"
            >
              <PanelLeft size={18} />
            </AppButton>

            <AppButton
              variant="text"
              color="neutral"
              size="icon"
              onClick={onClose}
              ariaLabel="Close sidebar"
              className="h-8! w-8! text-muted! hover:!bg-primary-light! hover:!text-primary! lg:hidden"
            >
              <X size={18} />
            </AppButton>
          </div>

          <nav className="flex flex-col gap-1">
            {navItems.map(({ label, href, icon: Icon }) => {
              const isActive =
                pathname === href || pathname?.startsWith(`${href}/`);
              return (
                <Link
                  key={href}
                  href={href}
                  onClick={onClose}
                  title={collapsed ? label : undefined}
                  className={cx(
                    'flex items-center gap-3 rounded-btn px-3 py-2.5 b2-m transition-colors',
                    collapsed && 'lg:justify-center lg:px-2',
                    isActive
                      ? 'bg-primary-light text-primary'
                      : 'text-text-secondary hover:bg-primary-light hover:text-primary',
                  )}
                >
                  <Icon size={18} className="shrink-0" />
                  <span className={cx(collapsed && 'lg:hidden')}>{label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="border-t border-disabled pt-3">
          <Link
            href={settingsHref}
            onClick={onClose}
            title={collapsed ? 'Settings' : undefined}
            className={cx(
              'flex items-center gap-3 rounded-btn px-3 py-2.5 b2-m transition-colors',
              collapsed && 'lg:justify-center lg:px-2',
              isSettingsActive
                ? 'bg-primary-light text-primary'
                : 'text-text-secondary hover:bg-primary-light hover:text-primary',
            )}
          >
            <Settings size={18} className="shrink-0" />
            <span className={cx(collapsed && 'lg:hidden')}>Settings</span>
          </Link>
        </div>
      </aside>
    </>
  );
};

export default AppSidebar;
