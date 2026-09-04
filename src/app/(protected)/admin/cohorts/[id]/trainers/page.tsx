import type { Metadata } from 'next';
import CohortTrainersPage from './components/CohortTrainersPage';

export const metadata: Metadata = {
  title: 'Cohort trainers | KodeBuddy AI',
};

export default async function AdminCohortTrainersPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <CohortTrainersPage cohortId={Number(id)} />;
}
