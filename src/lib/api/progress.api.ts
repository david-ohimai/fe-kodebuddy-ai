import { apiFetch } from './client';

export interface LessonProgress {
  lessonId: number;
  isCompleted: boolean;
  completedAt: string | null;
}

interface LessonProgressDto {
  lesson_id: number;
  is_completed: boolean;
  completed_at: string | null;
}

function mapLessonProgress(dto: LessonProgressDto): LessonProgress {
  return {
    lessonId: dto.lesson_id,
    isCompleted: dto.is_completed,
    completedAt: dto.completed_at,
  };
}

export async function toggleLessonCompletion(
  lessonId: number,
): Promise<LessonProgress> {
  const dto = await apiFetch<LessonProgressDto>(
    `/progress/lessons/${lessonId}/toggle`,
    { method: 'POST', auth: true },
  );
  return mapLessonProgress(dto);
}

export interface ModuleProgress {
  moduleId: number;
  totalLessons: number;
  completedLessons: number;
  completionPercentage: number;
  lessons: LessonProgress[];
}

interface ModuleProgressDto {
  module_id: number;
  total_lessons: number;
  completed_lessons: number;
  completion_percentage: number;
  lessons: LessonProgressDto[];
}

export async function getModuleProgress(
  moduleId: number,
): Promise<ModuleProgress> {
  const dto = await apiFetch<ModuleProgressDto>(
    `/progress/modules/${moduleId}`,
    { method: 'GET', auth: true },
  );
  return {
    moduleId: dto.module_id,
    totalLessons: dto.total_lessons,
    completedLessons: dto.completed_lessons,
    completionPercentage: dto.completion_percentage,
    lessons: (dto.lessons ?? []).map(mapLessonProgress),
  };
}

export interface CourseProgress {
  courseId: number;
  totalModules: number;
  totalLessons: number;
  completedLessons: number;
  completionPercentage: number;
}

interface CourseProgressDto {
  course_id: number;
  total_modules: number;
  total_lessons: number;
  completed_lessons: number;
  completion_percentage: number;
}

export async function getCourseProgress(
  courseId: number,
): Promise<CourseProgress> {
  const dto = await apiFetch<CourseProgressDto>(
    `/progress/courses/${courseId}`,
    { method: 'GET', auth: true },
  );
  return {
    courseId: dto.course_id,
    totalModules: dto.total_modules,
    totalLessons: dto.total_lessons,
    completedLessons: dto.completed_lessons,
    completionPercentage: dto.completion_percentage,
  };
}
