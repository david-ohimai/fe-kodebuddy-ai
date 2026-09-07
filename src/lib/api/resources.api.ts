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
  title: string;
  description: string | null;
  type: string;
  url: string | null;
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

export interface CourseResource {
  id: number;
  moduleId: number;
  title: string;
  description: string | null;
  type: string;
  url: string | null;
  createdBy: number;
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
}

function mapCourseResource(dto: ResourceResponseDto): CourseResource {
  return {
    id: dto.id,
    moduleId: dto.module_id,
    title: dto.title,
    description: dto.description,
    type: dto.type,
    url: dto.url,
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
      body: {
        title: input.title,
        type: input.type,
        url: input.url,
        description: input.description,
      },
    },
  );
  return mapCourseResource(dto);
}

export interface CourseResourceUpdateInput {
  title?: string;
  type?: string;
  url?: string;
  description?: string;
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
      body: {
        title: input.title,
        type: input.type,
        url: input.url,
        description: input.description,
      },
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
