import { apiFetch } from './client';

export interface CourseModule {
  id: number;
  courseId: number;
  title: string;
  description: string | null;
  order: number;
  createdBy: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface ModuleResponseDto {
  id: number;
  course_id: number;
  title: string;
  description: string | null;
  order: number;
  created_by: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

function mapModule(dto: ModuleResponseDto): CourseModule {
  return {
    id: dto.id,
    courseId: dto.course_id,
    title: dto.title,
    description: dto.description,
    order: dto.order,
    createdBy: dto.created_by,
    isActive: dto.is_active,
    createdAt: dto.created_at,
    updatedAt: dto.updated_at,
  };
}

export async function listCourseModules(
  courseId: number,
): Promise<CourseModule[]> {
  const dtos = await apiFetch<ModuleResponseDto[]>(
    `/modules/course/${courseId}`,
    { method: 'GET', auth: true },
  );
  return dtos.map(mapModule).sort((a, b) => a.order - b.order);
}

export async function reorderModules(
  courseId: number,
  modules: { id: number; order: number }[],
): Promise<CourseModule[]> {
  const dtos = await apiFetch<ModuleResponseDto[]>('/modules/reorder', {
    method: 'PATCH',
    auth: true,
    body: {
      course_id: courseId,
      modules: modules.map((m) => ({ id: m.id, order: m.order })),
    },
  });
  return dtos.map(mapModule).sort((a, b) => a.order - b.order);
}

export async function getModule(moduleId: number): Promise<CourseModule> {
  const dto = await apiFetch<ModuleResponseDto>(`/modules/${moduleId}`, {
    method: 'GET',
    auth: true,
  });
  return mapModule(dto);
}

export async function createModule(input: {
  courseId: number;
  title: string;
  description?: string;
  order?: number;
}): Promise<CourseModule> {
  const dto = await apiFetch<ModuleResponseDto>('/modules', {
    method: 'POST',
    body: {
      course_id: input.courseId,
      title: input.title,
      description: input.description,
      order: input.order,
    },
    auth: true,
  });
  return mapModule(dto);
}

export async function updateModule(
  moduleId: number,
  input: { title?: string; description?: string; order?: number },
): Promise<CourseModule> {
  const dto = await apiFetch<ModuleResponseDto>(`/modules/${moduleId}`, {
    method: 'PATCH',
    body: {
      title: input.title,
      description: input.description,
      order: input.order,
    },
    auth: true,
  });
  return mapModule(dto);
}

export async function deleteModule(moduleId: number): Promise<void> {
  await apiFetch<void>(`/modules/${moduleId}`, {
    method: 'DELETE',
    auth: true,
  });
}
