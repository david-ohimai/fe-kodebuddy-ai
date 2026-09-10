import { apiFetch } from './client';
import { listMyCourses, type MyCourseRef } from './myCourses';
import { isFaqResourceType } from './faqs.api';
import {
  normaliseResourceType,
  type LearnerResource,
} from '@/types/resource.types';

interface ModuleResponseDto {
  id: number;
  course_id: number;
  title: string;
  description: string | null;
  order: number;
  is_active: boolean;
}

interface ResourceResponseDto {
  id: number;
  module_id: number;
  lesson_id?: number | null;
  title: string;
  description: string | null;
  type: string;
  url: string | null;
  content?: string | null;
  file_name?: string | null;
  mime_type?: string | null;

  // Written by the backend's background ingestion task
  // (app/agent/ingestion.py::sync_resource_embeddings) once it has tried to
  // turn this resource into embeddable text. Null until that task has run,
  // which is why the UI treats "no status yet" as pending rather than failed.
  content_extract_status?: string | null;
  content_extract_error?: string | null;

  created_by: number;
  created_at: string;
  updated_at: string;
  is_active: boolean;
}

function mapResource(
  dto: ResourceResponseDto,
  module: ModuleResponseDto,
  course: MyCourseRef,
): LearnerResource {
  return {
    id: dto.id,
    moduleId: dto.module_id,
    title: dto.title,
    description: dto.description,
    type: normaliseResourceType(dto.type),
    rawType: dto.type,
    url: dto.url,
    content: dto.content,
    isActive: dto.is_active,
    createdAt: dto.created_at,
    moduleTitle: module.title,
    courseId: course.courseId,
    courseTitle: course.courseTitle,
  };
}

export async function listLearnerResources(): Promise<LearnerResource[]> {
  const courses = await listMyCourses();
  if (courses.length === 0) return [];

  const moduleGroups = await Promise.all(
    courses.map(async (course) => {
      const modules = await apiFetch<ModuleResponseDto[]>(
        `/modules/course/${course.courseId}`,
        { method: 'GET', auth: true },
      );
      return { course, modules: modules ?? [] };
    }),
  );

  const resourceGroups = await Promise.all(
    moduleGroups.flatMap(({ course, modules }) =>
      modules.map(async (module) => {
        const [moduleResources, moduleLessons] = await Promise.all([
          apiFetch<ResourceResponseDto[]>(`/modules/${module.id}/resources`, {
            method: 'GET',
            auth: true,
          }).catch(() => []),
          apiFetch<{ id: number }[]>(`/lessons/module/${module.id}`, {
            method: 'GET',
            auth: true,
          }).catch(() => []),
        ]);

        const lessonResources = await Promise.all(
          (moduleLessons ?? []).map((lesson) =>
            apiFetch<ResourceResponseDto[]>(
              `/lessons/${lesson.id}/resources`,
              { method: 'GET', auth: true },
            ).catch(() => []),
          ),
        );

        const allDtos = [
          ...(moduleResources ?? []),
          ...lessonResources.flat(),
        ];

        const seen = new Set<number>();
        const uniqueDtos: ResourceResponseDto[] = [];
        for (const dto of allDtos) {
          if (!seen.has(dto.id)) {
            seen.add(dto.id);
            uniqueDtos.push(dto);
          }
        }

        return uniqueDtos.map((dto) => mapResource(dto, module, course));
      }),
    ),
  );

  return resourceGroups
    .flat()
    .filter((r) => r.isActive && !isFaqResourceType(r.rawType));
}

export async function getLearnerResource(
  id: number,
): Promise<LearnerResource | null> {
  const all = await listLearnerResources();
  return all.find((r) => r.id === id) ?? null;
}

export type ExtractionStatus = 'ok' | 'partial' | 'failed' | 'pending';

/**
 * `content_extract_status` is null until the backend's background ingestion
 * task has run for this resource, so a freshly created row legitimately has
 * no status yet — that reads as "pending", not as a failure.
 */
function mapExtractionStatus(raw: string | null | undefined): ExtractionStatus {
  const value = (raw ?? '').trim().toLowerCase();
  if (value === 'ok' || value === 'partial' || value === 'failed') return value;
  return 'pending';
}

export interface CourseResource {
  id: number;
  moduleId: number;
  lessonId?: number | null;
  title: string;
  description: string | null;
  type: string;
  url: string | null;
  content?: string | null;
  fileName?: string | null;
  mimeType?: string | null;
  extractionStatus: ExtractionStatus;
  extractionError: string | null;
  createdBy: number;
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
}

function mapCourseResource(dto: ResourceResponseDto): CourseResource {
  return {
    id: dto.id,
    moduleId: dto.module_id,
    lessonId: dto.lesson_id,
    title: dto.title,
    description: dto.description,
    type: dto.type,
    url: dto.url,
    content: dto.content,
    fileName: dto.file_name,
    mimeType: dto.mime_type,
    extractionStatus: mapExtractionStatus(dto.content_extract_status),
    extractionError: dto.content_extract_error ?? null,
    createdBy: dto.created_by,
    createdAt: dto.created_at,
    updatedAt: dto.updated_at,
    isActive: dto.is_active,
  };
}

export async function listModuleResourcesFull(
  moduleId: number,
): Promise<CourseResource[]> {
  const dtos = await apiFetch<ResourceResponseDto[]>(
    `/modules/${moduleId}/resources`,
    { method: 'GET', auth: true },
  );
  return (dtos ?? [])
    .filter((dto) => !isFaqResourceType(dto.type))
    .map(mapCourseResource);
}

export interface CourseResourceInput {
  title: string;
  type: string;
  url?: string;
  description?: string;
  content?: string;
  file?: File;
}

export async function createModuleResource(
  moduleId: number,
  input: CourseResourceInput,
): Promise<CourseResource> {
  const formData = new FormData();
  formData.append('title', input.title);
  formData.append('type', input.type);
  if (input.description) formData.append('description', input.description);
  if (input.url) formData.append('url', input.url);
  if (input.content) formData.append('content', input.content);
  if (input.file) formData.append('file', input.file);

  const dto = await apiFetch<ResourceResponseDto>(
    `/modules/${moduleId}/resources`,
    {
      method: 'POST',
      auth: true,
      body: formData,
    },
  );
  return mapCourseResource(dto);
}

export interface CourseResourceUpdateInput {
  title?: string;
  type?: string;
  url?: string;
  description?: string;
  content?: string;
  file?: File;
  isActive?: boolean;
}

export async function updateModuleResource(
  moduleId: number,
  resourceId: number,
  input: CourseResourceUpdateInput,
): Promise<CourseResource> {
  const formData = new FormData();
  if (input.title !== undefined) formData.append('title', input.title);
  if (input.type !== undefined) {
    const normType = input.type === 'document' ? 'file' : input.type;
    formData.append('type', normType);
  }
  if (input.description !== undefined)
    formData.append('description', input.description ?? '');
  if (input.url !== undefined) formData.append('url', input.url ?? '');
  if (input.content !== undefined)
    formData.append('content', input.content ?? '');
  if (input.file) formData.append('file', input.file);
  formData.append('is_active', String(input.isActive ?? true));

  const dto = await apiFetch<ResourceResponseDto>(
    `/modules/${moduleId}/resources/${resourceId}`,
    {
      method: 'PATCH',
      auth: true,
      body: formData,
    },
  );
  return mapCourseResource(dto);
}

export async function deleteModuleResource(
  moduleId: number,
  resourceId: number,
): Promise<void> {
  await apiFetch<void>(`/modules/${moduleId}/resources/${resourceId}`, {
    method: 'DELETE',
    auth: true,
  });
}

export interface LessonResourceInput {
  title: string;
  type: string;
  description?: string;
  url?: string;
  content?: string;
  file?: File;
}

export async function listLessonResources(
  lessonId: number,
): Promise<CourseResource[]> {
  const dtos = await apiFetch<ResourceResponseDto[]>(
    `/lessons/${lessonId}/resources`,
    { method: 'GET', auth: true },
  );
  return (dtos ?? [])
    .filter((dto) => !isFaqResourceType(dto.type))
    .map(mapCourseResource);
}

export async function getLessonResource(
  lessonId: number,
  resourceId: number,
): Promise<CourseResource> {
  const dto = await apiFetch<ResourceResponseDto>(
    `/lessons/${lessonId}/resources/${resourceId}`,
    { method: 'GET', auth: true },
  );
  return mapCourseResource(dto);
}

export async function createLessonResource(
  lessonId: number,
  input: LessonResourceInput,
): Promise<CourseResource> {
  const formData = new FormData();
  formData.append('title', input.title);
  formData.append('type', input.type);
  if (input.description) formData.append('description', input.description);
  if (input.url) formData.append('url', input.url);
  if (input.content) formData.append('content', input.content);
  if (input.file) formData.append('file', input.file);

  const dto = await apiFetch<ResourceResponseDto>(
    `/lessons/${lessonId}/resources`,
    {
      method: 'POST',
      auth: true,
      body: formData,
    },
  );
  return mapCourseResource(dto);
}

export interface LessonResourceUpdateInput {
  title?: string;
  type?: string;
  description?: string;
  url?: string;
  content?: string;
  file?: File;
}

export async function updateLessonResource(
  lessonId: number,
  resourceId: number,
  input: LessonResourceUpdateInput,
): Promise<CourseResource> {
  const formData = new FormData();
  if (input.title !== undefined && input.title.trim()) {
    formData.append('title', input.title.trim());
  }
  if (input.description !== undefined) {
    formData.append('description', input.description ?? '');
  }

  if (input.file) {
    formData.append('file', input.file);
    formData.append('type', 'file');
  } else if (input.type === 'link') {
    formData.append('type', 'link');
    if (input.url !== undefined && input.url.trim()) {
      formData.append('url', input.url.trim());
    }
  } else if (input.type === 'article') {
    formData.append('type', 'article');
    if (input.content !== undefined) {
      formData.append('content', input.content ?? '');
    }
  } else if (input.type === 'file' || input.type === 'document') {
    formData.append('type', 'file');
  }

  formData.append('is_active', 'true');

  const dto = await apiFetch<ResourceResponseDto>(
    `/lessons/${lessonId}/resources/${resourceId}`,
    {
      method: 'PATCH',
      auth: true,
      body: formData,
    },
  );
  return mapCourseResource(dto);
}

export async function deleteLessonResource(
  lessonId: number,
  resourceId: number,
): Promise<void> {
  await apiFetch<void>(`/lessons/${lessonId}/resources/${resourceId}`, {
    method: 'DELETE',
    auth: true,
  });
}

