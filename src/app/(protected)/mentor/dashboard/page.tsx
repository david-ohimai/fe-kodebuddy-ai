import type { Metadata } from 'next';
import MentorDashboard from './components/MentorDashboard';

export const metadata: Metadata = {
  title: 'Dashboard | KodeBuddy AI',
};

export default function MentorDashboardPage() {
  return <MentorDashboard />;
}
