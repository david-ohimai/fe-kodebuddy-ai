'use client';

import React, { useState } from 'react';
import AppSidebar from './AppSidebar';
import AppTopbar from './AppTopbar';
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

  return (
    <div className="flex h-screen w-full overflow-hidden bg-gray-50">
      <AppSidebar
        role={role}
        user={user}
        collapsed={collapsed}
        onToggleCollapsed={() => setCollapsed((v) => !v)}
        isOpen={mobileOpen}
        onClose={() => setMobileOpen(false)}
      />

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <AppTopbar
          userName={user.name}
          userEmail={user.email}
          userRole={role === 'admin' ? 'Admin' : 'Learner'}
          avatarSrc={user.avatarSrc}
          onMenuClick={() => setMobileOpen(true)}
        />

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
