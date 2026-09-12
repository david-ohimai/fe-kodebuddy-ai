'use client';

import React, { useEffect, useState } from 'react';
import AppSidebar from './AppSidebar';
import AppTopbar from './AppTopbar';
import { useLogout } from '@/lib/auth/useLogout';
import {
  ROLE_LABEL,
  ROLE_SETTINGS_HREF,
  type DashboardRole,
  type DashboardUser,
} from '@/types/dashboard.types';

export interface DashboardShellProps {
  role: DashboardRole;
  user: DashboardUser;
  children: React.ReactNode;
}

export default function DashboardShell({
  role,
  user,
  children,
}: DashboardShellProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { logout } = useLogout();

  useEffect(() => {
    const root = document.documentElement;
    const previousRoot = root.style.overflow;
    const previousBody = document.body.style.overflow;

    root.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';

    return () => {
      root.style.overflow = previousRoot;
      document.body.style.overflow = previousBody;
    };
  }, []);

  return (
    <div className="flex h-dvh w-full overflow-hidden bg-disabled">
      <AppSidebar
        role={role}
        collapsed={collapsed}
        onToggleCollapsed={() => setCollapsed((v) => !v)}
        isOpen={mobileOpen}
        onClose={() => setMobileOpen(false)}
      />

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <AppTopbar
          userName={user.name}
          userEmail={user.email}
          userRole={ROLE_LABEL[role]}
          avatarSrc={user.avatarSrc}
          settingsHref={ROLE_SETTINGS_HREF[role]}
          onMenuClick={() => setMobileOpen(true)}
          onLogoutClick={logout}
        />

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
