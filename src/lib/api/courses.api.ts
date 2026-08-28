import { apiFetch } from './client';

export interface Course {
  id: number;
  title: string;
  description: string | null;
  cohortId: number;
  createdBy: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface CourseResponseDto {
  id: number;
  title: string;
  description: string | null;
  cohort_id: number;
  created_by: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

function mapCourse(dto: CourseResponseDto): Course {
  return {
    id: dto.id,
    title: dto.title,
    description: dto.description,
    cohortId: dto.cohort_id,
    createdBy: dto.created_by,
    isActive: dto.is_active,
    createdAt: dto.created_at,
    updatedAt: dto.updated_at,
  };
}

export async function listCourses(): Promise<Course[]> {
  const dtos = await apiFetch<CourseResponseDto[]>('/courses', {
    method: 'GET',
    auth: true,
  });
  return dtos.map(mapCourse);
}

export async function assignCourseToCohort(
  courseId: number,
  cohortId: number,
): Promise<Course> {
  const dto = await apiFetch<CourseResponseDto>(`/courses/${courseId}`, {
    method: 'PATCH',
    auth: true,
    body: { cohort_id: cohortId },
  });
  return mapCourse(dto);
}
