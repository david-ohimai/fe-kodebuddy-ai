import type { Metadata } from 'next';
import CohortDetailsPage from './components/CohortDetailsPage';

export const metadata: Metadata = {
  title: 'Cohort details | KodeBuddy AI',
};

export default async function AdminCohortDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <CohortDetailsPage cohortId={Number(id)} />;
}
