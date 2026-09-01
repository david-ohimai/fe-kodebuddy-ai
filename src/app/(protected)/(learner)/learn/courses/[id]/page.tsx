import CourseDetailPage from './components/CourseDetailPage';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function LearnCourseDetail({ params }: PageProps) {
  const { id } = await params;
  return <CourseDetailPage courseId={Number(id)} />;
}
