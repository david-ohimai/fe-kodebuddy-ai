import type { Metadata } from 'next';
import CohortLearnersPage from './components/CohortLearnersPage';

export const metadata: Metadata = {
  title: 'Cohort learners | KodeBuddy AI',
};

export default async function AdminCohortLearnersPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <CohortLearnersPage cohortId={Number(id)} />;
}
