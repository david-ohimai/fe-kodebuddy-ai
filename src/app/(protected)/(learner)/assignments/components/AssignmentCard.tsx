'use client';

import React from 'react';
import Link from 'next/link';
import { CheckCircle2, Clock } from 'lucide-react';
import { cx } from '@/lib/utils/cx';
import {
  ASSIGNMENT_STATUS_LABEL,
  formatDueDate,
  formatModuleLabel,
  isAssignmentLocked,
  type LearnerAssignment,
} from '@/types/assignment.types';

export interface AssignmentCardProps {
  assignment: LearnerAssignment;
}

const STATUS_PILL: Record<
  LearnerAssignment['status'],
  { className: string; icon: React.ElementType }
> = {
  pending: { className: 'bg-warning-light text-warning-dark', icon: Clock },
  'in-progress': { className: 'bg-primary-light text-primary', icon: Clock },
  submitted: {
    className: 'bg-secondary-light text-secondary-dark',
    icon: CheckCircle2,
  },
  graded: {
    className: 'bg-secondary-light text-secondary-dark',
    icon: CheckCircle2,
  },
  overdue: { className: 'bg-error-light text-error-dark', icon: Clock },
};

/**
 * The date line changes meaning with status, so it carries its own label:
 * a locked assignment shows when it opens, an open one when it is due, and a
 * finished one when it was handed in.
 */
function metaLine(assignment: LearnerAssignment): string {
  if (assignment.submittedAt) {
    return `Submitted: ${formatDueDate(assignment.submittedAt)}`;
  }
  if (isAssignmentLocked(assignment.status)) {
    // A locked card answers "when can I start", not "when is it due".
    return `Start: ${formatDueDate(assignment.startDate ?? assignment.dueDate)}`;
  }
  return `Due: ${formatDueDate(assignment.dueDate)}`;
}

function actionLabel(assignment: LearnerAssignment): string {
  if (isAssignmentLocked(assignment.status)) return 'Locked';
  if (assignment.submitted || assignment.graded) return 'View Results';
  return 'View Details';
}

export const AssignmentCard: React.FC<AssignmentCardProps> = ({
  assignment,
}) => {
  const locked = isAssignmentLocked(assignment.status);
  const pill = STATUS_PILL[assignment.status];
  const StatusIcon = pill.icon;

  return (
    <article className="flex flex-col rounded-card border border-disabled bg-background p-4">
      <div className="flex items-start justify-between gap-2">
        <span className="rounded-md bg-secondary-light px-2.5 py-1 f2-b tracking-wide text-text">
          {formatModuleLabel(assignment.moduleOrder)}
        </span>

        <span
          className={cx(
            'inline-flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1 f2-m',
            pill.className,
          )}
        >
          <StatusIcon size={12} aria-hidden="true" />
          {ASSIGNMENT_STATUS_LABEL[assignment.status]}
        </span>
      </div>

      <h3
        className="mt-4 line-clamp-2 b1-b text-text"
        title={assignment.title}
      >
        {assignment.title}
      </h3>

      <p className="mt-1.5 f1-r text-muted">{metaLine(assignment)}</p>

      <div className="mt-5">
        {locked ? (
          <span
            aria-disabled="true"
            className="inline-flex cursor-not-allowed items-center justify-center rounded-full border border-disabled px-5 py-2 b2-m text-muted"
          >
            {actionLabel(assignment)}
          </span>
        ) : (
          <Link
            href={`/assignments/${assignment.id}`}
            className="inline-flex items-center justify-center rounded-full border border-primary px-5 py-2 b2-m text-primary transition-colors hover:bg-primary-light focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
          >
            {actionLabel(assignment)}
          </Link>
        )}
      </div>
    </article>
  );
};

export default AssignmentCard;
