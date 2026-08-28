import { apiFetch } from './client';
import {
  deriveAssignmentStatus,
  type AssignmentItem,
  type LearnerAssignment,
} from '@/types/assignment.types';
import { DEMO_ASSIGNMENTS } from '@/lib/mocks/assignment.mocks';

interface AssignmentResponseDto {
  id: number;
  module_id: number;
  title: string;
  description: string | null;
  instructions: AssignmentItem[] | null;
  requirements: AssignmentItem[] | null;
  due_date: string;
  maximum_score: number;
  created_by: number;
  created_at: string;
  updated_at: string;
  is_active: boolean;
}

interface ModuleResponseDto {
  id: number;
  course_id: number;
  title: string;
  description: string | null;
  order: number;
  is_active: boolean;
}

interface LearnerCourseProgressDto {
  course_id: number;
  course_title: string;
}

interface LearnerAssignmentStatusDto {
  assignment_id: number;
  title: string;
  due_date: string;
  submitted: boolean;
  graded: boolean;
  score: number | null;
  is_overdue: boolean;
}

interface LearnerDashboardDto {
  courses: LearnerCourseProgressDto[];
  assignments: LearnerAssignmentStatusDto[];
}

function fallbackEnabled(): boolean {
  return process.env.NEXT_PUBLIC_DEMO_FALLBACK !== 'false';
}

function withFallback(
  live: LearnerAssignment[],
  context: string,
): LearnerAssignment[] {
  if (live.length > 0) return live;
  if (!fallbackEnabled()) return live;
  console.warn(
    `[assignments] ${context} — serving demo fixtures. ` +
      'Set NEXT_PUBLIC_DEMO_FALLBACK=false to disable.',
  );
  return DEMO_ASSIGNMENTS;
}

function mapAssignment(
  dto: AssignmentResponseDto,
  module: ModuleResponseDto,
  course: LearnerCourseProgressDto,
  status: LearnerAssignmentStatusDto | undefined,
): LearnerAssignment {
  const submitted = status?.submitted ?? false;
  const graded = status?.graded ?? false;
  const isOverdue = status?.is_overdue ?? false;

  return {
    id: dto.id,
    moduleId: dto.module_id,
    title: dto.title,
    description: dto.description,
    instructions: dto.instructions ?? [],
    requirements: dto.requirements ?? [],
    dueDate: dto.due_date,
    maximumScore: dto.maximum_score,
    isActive: dto.is_active,

    moduleTitle: module.title,
    moduleOrder: module.order,
    courseId: course.course_id,
    courseTitle: course.course_title,

    status: deriveAssignmentStatus({ submitted, graded, isOverdue }),
    submitted,
    graded,
    score: status?.score ?? null,
    isOverdue,
  };
}

export async function listLearnerAssignments(): Promise<LearnerAssignment[]> {
  try {
    const dashboard = await apiFetch<LearnerDashboardDto>(
      '/dashboard/learner',
      {
        method: 'GET',
        auth: true,
      },
    );

    const statusById = new Map(
      (dashboard.assignments ?? []).map((a) => [a.assignment_id, a]),
    );

    const courses = dashboard.courses ?? [];
    if (courses.length === 0) {
      return withFallback([], 'learner has no enrolled courses');
    }

    const moduleGroups = await Promise.all(
      courses.map(async (course) => {
        const modules = await apiFetch<ModuleResponseDto[]>(
          `/modules/course/${course.course_id}`,
          { method: 'GET', auth: true },
        );
        return { course, modules: modules ?? [] };
      }),
    );

    const assignmentGroups = await Promise.all(
      moduleGroups.flatMap(({ course, modules }) =>
        modules.map(async (module) => {
          const assignments = await apiFetch<AssignmentResponseDto[]>(
            `/modules/${module.id}/assignments`,
            { method: 'GET', auth: true },
          );
          return (assignments ?? []).map((dto) =>
            mapAssignment(dto, module, course, statusById.get(dto.id)),
          );
        }),
      ),
    );

    const live = assignmentGroups
      .flat()
      .sort((a, b) => a.moduleOrder - b.moduleOrder || a.id - b.id);

    return withFallback(live, 'API returned no assignments');
  } catch (err) {
    if (!fallbackEnabled()) throw err;
    console.warn('[assignments] request failed, serving demo fixtures:', err);
    return DEMO_ASSIGNMENTS;
  }
}

export async function getLearnerAssignment(
  id: number,
): Promise<LearnerAssignment | null> {
  const all = await listLearnerAssignments();
  return all.find((a) => a.id === id) ?? null;
}

export interface Assignment {
  id: string;
  title: string;
  moduleName: string;
  dueDate: string;
  status: 'pending' | 'submitted' | 'graded' | 'overdue';
}

interface ModuleAssignmentDto {
  id: string;
  title: string;
  module_name: string;
  due_date: string;
  status: 'pending' | 'submitted' | 'graded' | 'overdue';
}

function mapModuleAssignment(dto: ModuleAssignmentDto): Assignment {
  return {
    id: dto.id,
    title: dto.title,
    moduleName: dto.module_name,
    dueDate: dto.due_date,
    status: dto.status,
  };
}

export async function listAssignmentsByModule(
  moduleId: number,
): Promise<Assignment[]> {
  const response = await apiFetch<ModuleAssignmentDto[]>(
    `/modules/${moduleId}/assignments`,
    {
      method: 'GET',
      auth: true,
    },
  );

  return response.map(mapModuleAssignment);
}
