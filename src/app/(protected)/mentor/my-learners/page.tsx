import type { Metadata } from 'next';
import MyLearnersPage from './components/MyLearnersPage';

export const metadata: Metadata = {
  title: 'My Learners | KodeBuddy AI',
};

export default function MentorMyLearnersPage() {
  return <MyLearnersPage />;
}
