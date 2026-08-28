import { apiFetch } from './client';
import type { LessonContentType } from '@/types/lesson-content.types';

export const DEFAULT_LESSON_CONTENT_TYPE: LessonContentType = 'article';

export interface Lesson {
  id: number;
  moduleId: number;
  title: string;
  contentBody: string | null;
  order: number;
  createdBy: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface LessonResponseDto {
  id: number;
  module_id: number;
  title: string;
  content_body: string | null;
  order: number;
  created_by: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

function mapLesson(dto: LessonResponseDto): Lesson {
  return {
    id: dto.id,
    moduleId: dto.module_id,
    title: dto.title,
    contentBody: dto.content_body,
    order: dto.order,
    createdBy: dto.created_by,
    isActive: dto.is_active,
    createdAt: dto.created_at,
    updatedAt: dto.updated_at,
  };
}

export async function listModuleLessons(moduleId: number): Promise<Lesson[]> {
  const dtos = await apiFetch<LessonResponseDto[]>(
    `/lessons/module/${moduleId}`,
    { method: 'GET', auth: true },
  );
  return dtos.map(mapLesson).sort((a, b) => a.order - b.order);
}

export async function createLesson(input: {
  moduleId: number;
  title: string;
  contentBody?: string;
  order?: number;
}): Promise<Lesson> {
  const dto = await apiFetch<LessonResponseDto>('/lessons', {
    method: 'POST',
    body: {
      module_id: input.moduleId,
      title: input.title,
      content_body: input.contentBody,
      order: input.order,
    },
    auth: true,
  });
  return mapLesson(dto);
}

export async function updateLesson(
  lessonId: number,
  input: { title?: string; contentBody?: string; order?: number },
): Promise<Lesson> {
  const dto = await apiFetch<LessonResponseDto>(`/lessons/${lessonId}`, {
    method: 'PATCH',
    body: {
      title: input.title,
      content_body: input.contentBody,
      order: input.order,
    },
    auth: true,
  });
  return mapLesson(dto);
}

export async function deleteLesson(lessonId: number): Promise<void> {
  await apiFetch<void>(`/lessons/${lessonId}`, {
    method: 'DELETE',
    auth: true,
  });
}
