'use client';

import React, { useState } from 'react';
import AppSidebar from './AppSidebar';
import AppTopbar from './AppTopbar';
import { useLogout } from '@/lib/auth/useLogout';
import type { DashboardRole, DashboardUser } from '@/types/dashboard.types';

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

  const settingsHref = role === 'learner' ? '/settings' : '/admin/settings';

  return (
    <div className="flex h-screen w-full overflow-hidden bg-gray-50">
      <AppSidebar
        role={role}
        collapsed={collapsed}
        onToggleCollapsed={() => setCollapsed((v) => !v)}
        isOpen={mobileOpen}
        onClose={() => setMobileOpen(false)}
        onLogoutClick={logout}
      />

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <AppTopbar
          userName={user.name}
          userEmail={user.email}
          userRole={role === 'admin' ? 'Admin' : 'Learner'}
          avatarSrc={user.avatarSrc}
          settingsHref={settingsHref}
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
