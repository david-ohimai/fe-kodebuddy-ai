import { apiFetch } from './client';

export interface LearnerDashboardCourse {
  courseId: number;
  courseTitle: string;
}

export interface LearnerDashboardAssignmentStatus {
  assignmentId: number;
  title: string;
  dueDate: string;
  submitted: boolean;
  graded: boolean;
  score: number | null;
  isOverdue: boolean;
}

export interface LearnerDashboard {
  courses: LearnerDashboardCourse[];
  assignments: LearnerDashboardAssignmentStatus[];
}

interface LearnerDashboardDto {
  courses: { course_id: number; course_title: string }[];
  assignments: {
    assignment_id: number;
    title: string;
    due_date: string;
    submitted: boolean;
    graded: boolean;
    score: number | null;
    is_overdue: boolean;
  }[];
}

export async function getLearnerDashboard(): Promise<LearnerDashboard> {
  const dto = await apiFetch<LearnerDashboardDto>('/dashboard/learner', {
    method: 'GET',
    auth: true,
  });
  return {
    courses: (dto.courses ?? []).map((c) => ({
      courseId: c.course_id,
      courseTitle: c.course_title,
    })),
    assignments: (dto.assignments ?? []).map((a) => ({
      assignmentId: a.assignment_id,
      title: a.title,
      dueDate: a.due_date,
      submitted: a.submitted,
      graded: a.graded,
      score: a.score,
      isOverdue: a.is_overdue,
    })),
  };
}

export async function getTrainerDashboard(): Promise<unknown> {
  return apiFetch<unknown>('/dashboard/trainer', {
    method: 'GET',
    auth: true,
  });
}

export async function getMentorDashboard(): Promise<unknown> {
  return apiFetch<unknown>('/dashboard/mentor', { method: 'GET', auth: true });
}
