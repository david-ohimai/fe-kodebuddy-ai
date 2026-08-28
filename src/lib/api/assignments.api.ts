import { apiFetch } from './client';
import {
  deriveAssignmentStatus,
  type AssignmentItem,
  type LearnerAssignment,
} from '@/types/assignment.types';
import { DEMO_ASSIGNMENTS } from '@/lib/mocks/assignment.mocks';

// ---------------------------------------------------------------------------
// Trainer-facing listing (from dev — used by trainer/my-course)
// ---------------------------------------------------------------------------

// Minimal for now — only what's needed to show a real assignment count
// on the Overview tab. Full CRUD (create/edit/grade) will follow once
// the Assignments tab design is available.
export interface Assignment {
  id: number;
  moduleId: number;
  title: string;
}

interface AssignmentResponseDto {
  id: number;
  module_id: number;
  title: string;
  [key: string]: unknown;
}

/** GET /modules/{module_id}/assignments */
export async function listModuleAssignments(
  moduleId: number,
): Promise<Assignment[]> {
  const dtos = await apiFetch<AssignmentResponseDto[]>(
    `/modules/${moduleId}/assignments`,
    { method: 'GET', auth: true },
  );
  return dtos.map((dto) => ({
    id: dto.id,
    moduleId: dto.module_id,
    title: dto.title,
  }));
}

// ---------------------------------------------------------------------------
// Learner-facing listing
// ---------------------------------------------------------------------------
//
// Separate from `listModuleAssignments` above rather than replacing it: that
// one answers "how many assignments does this module have" for the trainer
// overview and is deliberately minimal. The learner screens need the full
// record plus this learner's own status, which no single endpoint returns.

interface AssignmentDetailDto {
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

/**
 * Whether to fall back to fixtures when the API yields nothing usable.
 *
 * Defaults to ON so a demo against an unseeded environment still shows the
 * screens. Set NEXT_PUBLIC_DEMO_FALLBACK=false to force real-data-only and see
 * the genuine empty state. Real data is always preferred — the fallback only
 * engages on error or an empty result, never over live rows.
 */
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

function mapLearnerAssignment(
  dto: AssignmentDetailDto,
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

/**
 * Every assignment visible to the signed-in learner, with module/course
 * context and per-learner status.
 *
 * PERFORMANCE CAVEAT — this fans out: 1 dashboard call, then one call per
 * enrolled course for its modules, then one call per module for its
 * assignments. That is N+1 by construction, because there is no
 * `GET /assignments/me` on the backend and `/dashboard/learner` returns
 * assignment *status* without the `module_id` needed to reach the full record
 * (`/modules/{module_id}/assignments/{id}`).
 *
 * Fine at current scale. The fix is one backend endpoint returning the joined
 * rows; until then this is the only way to assemble the screen. Requests at
 * each level run in parallel, so latency is ~3 round trips, not N.
 */
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

    // Level 2: modules per course, in parallel.
    const moduleGroups = await Promise.all(
      courses.map(async (course) => {
        const modules = await apiFetch<ModuleResponseDto[]>(
          `/modules/course/${course.course_id}`,
          { method: 'GET', auth: true },
        );
        return { course, modules: modules ?? [] };
      }),
    );

    // Level 3: assignments per module, in parallel across every course.
    const assignmentGroups = await Promise.all(
      moduleGroups.flatMap(({ course, modules }) =>
        modules.map(async (module) => {
          const assignments = await apiFetch<AssignmentDetailDto[]>(
            `/modules/${module.id}/assignments`,
            { method: 'GET', auth: true },
          );
          return (assignments ?? []).map((dto) =>
            mapLearnerAssignment(dto, module, course, statusById.get(dto.id)),
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

/**
 * One assignment by id.
 *
 * Goes through the same fan-out as the list because the detail endpoint is
 * keyed by `(module_id, assignment_id)` and the id in the URL carries no
 * module. Once the backend exposes the module on the dashboard payload — or a
 * flat `GET /assignments/{id}` — this collapses to a single request.
 */
export async function getLearnerAssignment(
  id: number,
): Promise<LearnerAssignment | null> {
  const all = await listLearnerAssignments();
  return all.find((a) => a.id === id) ?? null;
}
