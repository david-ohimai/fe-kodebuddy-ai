import type { Metadata } from 'next';
import LearnerEscalationDetail from './components/LearnerEscalationDetail';

export const metadata: Metadata = {
  title: 'Escalation details | KodeBuddy AI',
};

export default async function LearnerEscalationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <LearnerEscalationDetail escalationId={id} />;
}
