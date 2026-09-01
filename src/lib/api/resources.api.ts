import { apiFetch } from './client';
import {
  getLearnerDashboard,
  type LearnerDashboardCourse,
} from './dashboard.api';
import { DEMO_RESOURCES } from '@/lib/mocks/resource.mocks';
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

function fallbackEnabled(): boolean {
  return process.env.NEXT_PUBLIC_DEMO_FALLBACK !== 'false';
}

function withFallback(
  live: LearnerResource[],
  context: string,
): LearnerResource[] {
  if (live.length > 0) return live;
  if (!fallbackEnabled()) return live;
  console.warn(
    `[resources] ${context} — serving demo fixtures. ` +
      'Set NEXT_PUBLIC_DEMO_FALLBACK=false to disable.',
  );
  return DEMO_RESOURCES;
}

function mapResource(
  dto: ResourceResponseDto,
  module: ModuleResponseDto,
  course: LearnerDashboardCourse,
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
  try {
    const dashboard = await getLearnerDashboard();
    const courses = dashboard.courses ?? [];
    if (courses.length === 0) {
      return withFallback([], 'learner has no enrolled courses');
    }

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
          return (resources ?? []).map((dto) =>
            mapResource(dto, module, course),
          );
        }),
      ),
    );

    const live = resourceGroups.flat().filter((r) => r.isActive);
    return withFallback(live, 'API returned no resources');
  } catch (err) {
    if (!fallbackEnabled()) throw err;
    console.warn('[resources] request failed, serving demo fixtures:', err);
    return DEMO_RESOURCES;
  }
}

export async function getLearnerResource(
  id: number,
): Promise<LearnerResource | null> {
  const all = await listLearnerResources();
  return all.find((r) => r.id === id) ?? null;
}
