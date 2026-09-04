import AssignLearnersPage from './components/AssignLearnersPage';

export default async function AssignLearners({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <AssignLearnersPage cohortId={Number(id)} />;
}
