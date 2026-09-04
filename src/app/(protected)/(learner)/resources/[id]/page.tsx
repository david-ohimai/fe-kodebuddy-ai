import ResourceDetails from '../components/ResourceDetails';

interface ResourceDetailsPageProps {
  params: Promise<{ id: string }>;
}

export default async function ResourceDetailsPage({
  params,
}: ResourceDetailsPageProps) {
  const { id } = await params;
  return <ResourceDetails resourceId={Number(id)} />;
}
