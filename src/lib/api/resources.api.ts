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
  lesson_id: number | null;
  title: string;
  description: string | null;
  type: string;
  url: string | null;
  content: string | null;

  // Set when the resource was created by uploading a file.
  file_name: string | null;
  mime_type: string | null;

  // Written by the backend's background ingestion task
  // (app/agent/ingestion.py::sync_resource_embeddings) once it has tried to
  // turn this resource into embeddable text. Null until that task has run,
  // which is why the UI treats "no status yet" as pending rather than failed.
  content_extract_status: string | null;
  content_extract_error: string | null;

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
    type: normaliseResourceType(dto.type, {
      url: dto.url,
      mimeType: dto.mime_type,
      fileName: dto.file_name,
    }),
    rawType: dto.type,
    url: dto.url,
    fileName: dto.file_name ?? null,
    mimeType: dto.mime_type ?? null,
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
        const resources = await apiFetch<ResourceResponseDto[]>(
          `/modules/${module.id}/resources`,
          { method: 'GET', auth: true },
        );
        return (resources ?? []).map((dto) => mapResource(dto, module, course));
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
  lessonId: number | null;
  title: string;
  description: string | null;
  type: string;
  url: string | null;
  content: string | null;
  fileName: string | null;
  mimeType: string | null;
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
    lessonId: dto.lesson_id ?? null,
    title: dto.title,
    description: dto.description,
    type: dto.type,
    url: dto.url,
    content: dto.content ?? null,
    fileName: dto.file_name ?? null,
    mimeType: dto.mime_type ?? null,
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
  /** One of the backend enum values: 'article' | 'link' | 'file'. */
  type: string;
  url?: string;
  description?: string;
  /** Body text for `article` resources — this is what gets embedded. */
  content?: string;
  /** The upload for `file` resources. */
  file?: File | null;
}

/**
 * The resource endpoints take multipart/form-data (every field is a FastAPI
 * `Form(...)`, plus an optional `UploadFile`), so these bodies are FormData
 * rather than JSON — see the isFormData branch in client.ts.
 *
 * Only fields that are actually set are appended. On PATCH every field is
 * `Form(default=None)`, so an omitted key means "leave unchanged", whereas
 * appending an empty string would overwrite the stored value with "" and, for
 * `type`, fail enum validation outright.
 */
function buildResourceFormData(
  input: CourseResourceInput | CourseResourceUpdateInput,
): FormData {
  const form = new FormData();

  if (input.title !== undefined) form.append('title', input.title);
  if (input.type) form.append('type', input.type);
  if (input.url) form.append('url', input.url);
  if (input.description) form.append('description', input.description);
  if (input.content) form.append('content', input.content);
  if (input.file) form.append('file', input.file);

  return form;
}

export async function createModuleResource(
  moduleId: number,
  input: CourseResourceInput,
): Promise<CourseResource> {
  const dto = await apiFetch<ResourceResponseDto>(
    `/modules/${moduleId}/resources`,
    {
      method: 'POST',
      auth: true,
      body: buildResourceFormData(input),
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
  file?: File | null;
}

export async function updateModuleResource(
  moduleId: number,
  resourceId: number,
  input: CourseResourceUpdateInput,
): Promise<CourseResource> {
  const dto = await apiFetch<ResourceResponseDto>(
    `/modules/${moduleId}/resources/${resourceId}`,
    {
      method: 'PATCH',
      auth: true,
      body: buildResourceFormData(input),
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
