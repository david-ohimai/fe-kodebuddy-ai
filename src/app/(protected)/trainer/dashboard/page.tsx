import type { Metadata } from 'next';
import TrainerDashboard from './components/TrainerDashboard';

export const metadata: Metadata = {
  title: 'Dashboard | KodeBuddy AI',
};

export default function TrainerDashboardPage() {
  return <TrainerDashboard />;
}
