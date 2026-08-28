import type { Metadata } from 'next';
import NotificationsPage from './components/NotificationsPage';

export const metadata: Metadata = {
  title: 'Notifications | KodeBuddy AI',
};

export default function MentorNotificationsPage() {
  return <NotificationsPage />;
}
