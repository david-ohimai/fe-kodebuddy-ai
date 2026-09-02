import type { Metadata } from 'next';
import LearnerDetailPage from './components/LearnerDetailPage';

export const metadata: Metadata = {
  title: 'Learner details | KodeBuddy AI',
};

export default async function TrainerLearnerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <LearnerDetailPage learnerId={Number(id)} />;
}
