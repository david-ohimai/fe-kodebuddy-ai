import type { Metadata } from 'next';
import MyCohortPage from './components/MyCohortPage';

export const metadata: Metadata = {
  title: 'My Cohort | KodeBuddy AI',
};

export default function TrainerMyCohortPage() {
  return <MyCohortPage />;
}
