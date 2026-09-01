import ModuleDetailPage from './components/ModuleDetailPage';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function LearnModuleDetail({ params }: PageProps) {
  const { id } = await params;
  return <ModuleDetailPage moduleId={Number(id)} />;
}
