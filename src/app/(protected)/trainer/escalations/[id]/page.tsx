import type { Metadata } from 'next';
import EscalationDetailPage from './components/EscalationDetailPage';

export const metadata: Metadata = {
  title: 'Escalation details | KodeBuddy AI',
};

export default async function TrainerEscalationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <EscalationDetailPage escalationId={Number(id)} />;
}
