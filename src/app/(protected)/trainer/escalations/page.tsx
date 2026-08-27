import type { Metadata } from 'next';
import EscalationsPage from './components/EscalationsPage';

export const metadata: Metadata = {
  title: 'Escalations | KodeBuddy AI',
};

export default function TrainerEscalationsPage() {
  return <EscalationsPage />;
}
