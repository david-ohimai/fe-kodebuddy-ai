import LessonDetailPage from './components/LessonDetailPage';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function LearnLessonDetail({ params }: PageProps) {
  const { id } = await params;
  return <LessonDetailPage lessonId={Number(id)} />;
}
