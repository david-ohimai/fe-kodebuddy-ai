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
 *
 * `pending` (not yet released to the learner) is in the union because the
 * Assignments tabs offer it, but nothing produces it today: the backend's
 * `AssignmentResponse` has no start/release date, only `due_date`. Until it
 * does, the Pending tab is correctly empty rather than guessing.
 */
export type AssignmentStatus =
  | 'pending'
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

  /**
   * When the assignment opens to learners. Optional here even though the API
   * declares it required, because older rows and the demo fixtures predate it.
   */
  startDate: string | null;
  /**
   * Display name of the trainer who set the assignment. Null when they have
   * not set a full name — the byline is hidden rather than left blank.
   */
  createdByName: string | null;

  status: AssignmentStatus;
  submitted: boolean;
  graded: boolean;
  score: number | null;
  isOverdue: boolean;

  /** From the learner's own submission, when one exists. */
  submittedAt: string | null;
  submissionContent: string | null;
  feedback: string | null;
}

export const ASSIGNMENT_STATUS_LABEL: Record<AssignmentStatus, string> = {
  pending: 'Pending',
  'in-progress': 'In-progress',
  submitted: 'Submitted',
  graded: 'Graded',
  overdue: 'Overdue',
};

export const ASSIGNMENT_STATUS_COLOR: Record<
  AssignmentStatus,
  'primary' | 'warning' | 'success' | 'error'
> = {
  pending: 'warning',
  'in-progress': 'primary',
  submitted: 'success',
  graded: 'success',
  overdue: 'error',
};

export function deriveAssignmentStatus(input: {
  submitted: boolean;
  graded: boolean;
  isOverdue: boolean;
  /** Absent for an assignment that carries no release date. */
  startDate?: string | null;
  now?: Date;
}): AssignmentStatus {
  // Work the learner has already handed in outranks the release date: an
  // assignment cannot be both submitted and not yet open, and if the two ever
  // disagree the submission is the fact.
  if (input.graded) return 'graded';
  if (input.submitted) return 'submitted';

  if (isNotYetOpen(input.startDate, input.now)) return 'pending';

  if (input.isOverdue) return 'overdue';
  return 'in-progress';
}

/** True while the assignment's release date is still in the future. */
export function isNotYetOpen(
  startDate: string | null | undefined,
  now: Date = new Date(),
): boolean {
  if (!startDate) return false;
  const start = new Date(startDate);
  if (Number.isNaN(start.getTime())) return false;
  return start.getTime() > now.getTime();
}

/** Whether the learner can still open and work on this assignment. */
export function isAssignmentLocked(status: AssignmentStatus): boolean {
  return status === 'pending';
}

/** "01-Feb-2026" — the date format used on cards and pills. */
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
