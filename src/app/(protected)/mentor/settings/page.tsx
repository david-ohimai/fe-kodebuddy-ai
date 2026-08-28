import type { Metadata } from 'next';
import MentorSettings from './components/MentorSettings';

export const metadata: Metadata = {
  title: 'Settings | KodeBuddy AI',
};

export default function MentorSettingsPage() {
  return <MentorSettings />;
}
