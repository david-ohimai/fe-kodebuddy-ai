import { apiFetch } from './client';
import { listMyCourses, type MyCourseRef } from './myCourses';
import {
  deriveAssignmentStatus,
  type AssignmentItem,
  type LearnerAssignment,
} from '@/types/assignment.types';
import { DEMO_ASSIGNMENTS } from '@/lib/mocks/assignment.mocks';
import { listMySubmissions, type Submission } from './submissions.api';

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

interface AssignmentDetailDto {
  id: number;
  module_id: number;
  title: string;
  description: string | null;
  instructions: AssignmentItem[] | null;
  requirements: AssignmentItem[] | null;
  start_date?: string | null;
  due_date: string;
  maximum_score: number;
  created_by: number;
  created_by_name?: string | null;
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
  course: MyCourseRef,
  submission: Submission | undefined,
): LearnerAssignment {
  const submitted = submission !== undefined;
  const graded = submission?.score != null;

  const isOverdue = !submitted && new Date(dto.due_date).getTime() < Date.now();

  const startDate = dto.start_date ?? null;

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
    courseId: course.courseId,
    courseTitle: course.courseTitle,

    startDate,
    createdByName: dto.created_by_name ?? null,

    status: deriveAssignmentStatus({
      submitted,
      graded,
      isOverdue,
      startDate,
    }),
    submitted,
    graded,
    score: submission?.score ?? null,
    isOverdue,

    submissionId: submission?.id ?? null,
    submittedAt: submission?.submittedAt ?? null,
    submissionContent: submission?.content ?? null,
    feedback: submission?.feedback ?? null,
  };
}

export async function listLearnerAssignments(): Promise<LearnerAssignment[]> {
  try {
    const [courses, submissions] = await Promise.all([
      listMyCourses(),
      listMySubmissions().catch(() => [] as Submission[]),
    ]);

    const submissionByAssignment = new Map<number, Submission>();
    for (const submission of submissions) {
      const existing = submissionByAssignment.get(submission.assignmentId);
      if (
        !existing ||
        new Date(submission.submittedAt) > new Date(existing.submittedAt)
      ) {
        submissionByAssignment.set(submission.assignmentId, submission);
      }
    }

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

    const assignmentGroups = await Promise.all(
      moduleGroups.flatMap(({ course, modules }) =>
        modules.map(async (module) => {
          const assignments = await apiFetch<AssignmentDetailDto[]>(
            `/modules/${module.id}/assignments`,
            { method: 'GET', auth: true },
          );
          return (assignments ?? []).map((dto) =>
            mapLearnerAssignment(
              dto,
              module,
              course,
              submissionByAssignment.get(dto.id),
            ),
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

export interface CourseAssignment {
  id: number;
  moduleId: number;
  title: string;
  description: string | null;
  instructions: AssignmentItem[];
  requirements: AssignmentItem[];
  dueDate: string;
  maximumScore: number;
  createdBy: number;
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
}

function mapCourseAssignment(dto: AssignmentDetailDto): CourseAssignment {
  return {
    id: dto.id,
    moduleId: dto.module_id,
    title: dto.title,
    description: dto.description,
    instructions: dto.instructions ?? [],
    requirements: dto.requirements ?? [],
    dueDate: dto.due_date,
    maximumScore: dto.maximum_score,
    createdBy: dto.created_by,
    createdAt: dto.created_at,
    updatedAt: dto.updated_at,
    isActive: dto.is_active,
  };
}

export async function listModuleAssignmentsFull(
  moduleId: number,
): Promise<CourseAssignment[]> {
  const dtos = await apiFetch<AssignmentDetailDto[]>(
    `/modules/${moduleId}/assignments`,
    { method: 'GET', auth: true },
  );
  return (dtos ?? []).map(mapCourseAssignment);
}

export async function getModuleAssignment(
  moduleId: number,
  assignmentId: number,
): Promise<CourseAssignment> {
  const dto = await apiFetch<AssignmentDetailDto>(
    `/modules/${moduleId}/assignments/${assignmentId}`,
    { method: 'GET', auth: true },
  );
  return mapCourseAssignment(dto);
}

export interface CourseAssignmentInput {
  title: string;
  description?: string;
  instructions?: AssignmentItem[];
  requirements?: AssignmentItem[];
  startDate: string;
  dueDate: string;
  maximumScore: number;
}

export async function createModuleAssignment(
  moduleId: number,
  input: CourseAssignmentInput,
): Promise<CourseAssignment> {
  const dto = await apiFetch<AssignmentDetailDto>(
    `/modules/${moduleId}/assignments`,
    {
      method: 'POST',
      auth: true,
      body: {
        title: input.title,
        description: input.description,
        instructions: input.instructions,
        requirements: input.requirements,
        start_date: input.startDate,
        due_date: input.dueDate,
        maximum_score: input.maximumScore,
      },
    },
  );
  return mapCourseAssignment(dto);
}

export interface CourseAssignmentUpdateInput {
  title?: string;
  description?: string;
  instructions?: AssignmentItem[];
  requirements?: AssignmentItem[];
  startDate?: string;
  dueDate?: string;
  maximumScore?: number;
}

export async function updateModuleAssignment(
  moduleId: number,
  assignmentId: number,
  input: CourseAssignmentUpdateInput,
): Promise<CourseAssignment> {
  const dto = await apiFetch<AssignmentDetailDto>(
    `/modules/${moduleId}/assignments/${assignmentId}`,
    {
      method: 'PATCH',
      auth: true,
      body: {
        title: input.title,
        description: input.description,
        instructions: input.instructions,
        requirements: input.requirements,
        start_date: input.startDate,
        due_date: input.dueDate,
        maximum_score: input.maximumScore,
      },
    },
  );
  return mapCourseAssignment(dto);
}

export async function deleteModuleAssignment(
  moduleId: number,
  assignmentId: number,
): Promise<void> {
  await apiFetch<void>(`/modules/${moduleId}/assignments/${assignmentId}`, {
    method: 'DELETE',
    auth: true,
  });
}
