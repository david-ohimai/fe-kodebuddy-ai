import DashboardShell from '../components/DashboardShell';
import type { DashboardUser } from '@/types/dashboard.types';

const ADMIN_USER: DashboardUser = {
  name: 'Ayomide Ben',
  email: 'learner3@example.com',
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <DashboardShell role="admin" user={ADMIN_USER}>
      {children}
    </DashboardShell>
  );
}
