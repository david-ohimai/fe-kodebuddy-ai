// Domain types for the Learner assignments feature.
//
// These are the camelCase shapes the UI works in. The snake_case DTOs they map
// from live next to their mappers in lib/api/assignments.api.ts, matching the
// convention in lib/api/courses.api.ts.

export interface AssignmentItem {
  title: string;
  description: string;
}

/**
 * Derived, not stored. The backend exposes `submitted` / `graded` /
 * `is_overdue` as independent booleans on the learner dashboard; the UI wants
 * one value to render a single pill from. Precedence is graded > submitted >
 * overdue > in-progress, so a graded-but-late assignment reads as graded.
 */
export type AssignmentStatus =
  | 'in-progress'
  | 'submitted'
  | 'graded'
  | 'overdue';

export interface Assignment {
  id: number;
  moduleId: number;
  title: string;
  description: string | null;
  instructions: AssignmentItem[];
  requirements: AssignmentItem[];
  dueDate: string;
  maximumScore: number;
  isActive: boolean;
}

/** An assignment joined to its module/course context and this learner's status. */
export interface LearnerAssignment extends Assignment {
  moduleTitle: string;
  moduleOrder: number;
  courseId: number;
  courseTitle: string;

  status: AssignmentStatus;
  submitted: boolean;
  graded: boolean;
  score: number | null;
  isOverdue: boolean;
}

export const ASSIGNMENT_STATUS_LABEL: Record<AssignmentStatus, string> = {
  'in-progress': 'In-progress',
  submitted: 'Submitted',
  graded: 'Graded',
  overdue: 'Overdue',
};

export const ASSIGNMENT_STATUS_COLOR: Record<
  AssignmentStatus,
  'primary' | 'secondary' | 'success' | 'error'
> = {
  'in-progress': 'primary',
  submitted: 'secondary',
  graded: 'success',
  overdue: 'error',
};

export function deriveAssignmentStatus(input: {
  submitted: boolean;
  graded: boolean;
  isOverdue: boolean;
}): AssignmentStatus {
  if (input.graded) return 'graded';
  if (input.submitted) return 'submitted';
  if (input.isOverdue) return 'overdue';
  return 'in-progress';
}

/** "01-Feb-2026" — the due-date pill format in the Figma. */
export function formatDueDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '—';
  const day = String(date.getDate()).padStart(2, '0');
  const month = date.toLocaleString('en-US', { month: 'short' });
  return `${day}-${month}-${date.getFullYear()}`;
}

/** "MODULE 2" — the eyebrow label above the assignment title. */
export function formatModuleLabel(order: number): string {
  return `MODULE ${order}`;
}
