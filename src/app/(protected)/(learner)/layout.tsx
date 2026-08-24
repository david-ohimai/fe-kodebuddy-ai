import DashboardShell from '../components/DashboardShell';
import type { DashboardUser } from '@/types/dashboard.types';

const LEARNER_USER: DashboardUser = {
  name: 'Emmanuel Ayomide',
  email: 'learner4@example.com',
};

export default function LearnerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <DashboardShell role="learner" user={LEARNER_USER}>
      {children}
    </DashboardShell>
  );
}
