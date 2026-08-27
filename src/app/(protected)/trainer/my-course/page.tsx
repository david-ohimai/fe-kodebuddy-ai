import type { Metadata } from 'next';
import MyCoursePage from './components/MyCoursePage';

export const metadata: Metadata = {
  title: 'My Course | KodeBuddy AI',
};

export default function TrainerMyCoursePage() {
  return <MyCoursePage />;
}
