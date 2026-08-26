'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import DashboardShell from './DashboardShell';
import AppSpinner from '@/components/ui/AppSpinner';
import { useCurrentUser } from '@/lib/auth/useCurrentUser';
import type { DashboardRole } from '@/types/dashboard.types';

export interface ProtectedShellProps {
  role: DashboardRole;
  children: React.ReactNode;
}

export default function ProtectedShell({
  role,
  children,
}: ProtectedShellProps) {
  const router = useRouter();
  const { user, loading } = useCurrentUser();

  const isAuthorized = !user || role !== 'admin' || user.role === 'admin';

  useEffect(() => {
    if (user && !isAuthorized) {
      router.replace('/dashboard');
    }
  }, [user, isAuthorized, router]);

  if (loading || !user || !isAuthorized) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-gray-50">
        <AppSpinner />
      </div>
    );
  }

  return (
    <DashboardShell
      role={role}
      user={{
        name: user.fullName || user.email,
        email: user.email,
      }}
    >
      {children}
    </DashboardShell>
  );
}
