import type { Metadata } from 'next';
import TrainerSettings from './components/TrainerSettings';

export const metadata: Metadata = {
  title: 'Settings | KodeBuddy AI',
};

export default function TrainerSettingsPage() {
  return <TrainerSettings />;
}
