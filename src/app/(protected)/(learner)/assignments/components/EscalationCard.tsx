'use client';

import React from 'react';
import Link from 'next/link';
import { CheckCircle2, Clock } from 'lucide-react';
import { cx } from '@/lib/utils/cx';
import { formatDueDate, formatModuleLabel } from '@/types/assignment.types';
import {
  escalationStatusLabel,
  ESCALATION_STATUS_CLASS,
  type Escalation,
} from '@/types/escalation.types';

export interface EscalationCardProps {
  escalation: Escalation;
}

export const EscalationCard: React.FC<EscalationCardProps> = ({
  escalation,
}) => {
  const answered = Boolean(escalation.response);

  return (
    <Link
      href={`/assignments/escalations/${escalation.id}`}
      className="block rounded-card border border-disabled bg-background p-5 transition-colors hover:border-muted/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
    >
      <div className="flex items-start justify-between gap-3">
        {escalation.moduleOrder !== null ? (
          <span className="rounded-md bg-secondary-light px-2.5 py-1 f2-b tracking-wide text-text">
            {formatModuleLabel(escalation.moduleOrder)}
          </span>
        ) : (
          // Not every escalation is raised against a module — a general chat
          // question carries only a course.
          <span className="rounded-md bg-disabled px-2.5 py-1 f2-b tracking-wide text-text-secondary">
            GENERAL
          </span>
        )}

        <span
          className={cx(
            'inline-flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1 f2-m',
            ESCALATION_STATUS_CLASS[escalation.status],
          )}
        >
          {answered ? (
            <CheckCircle2 size={12} aria-hidden="true" />
          ) : (
            <Clock size={12} aria-hidden="true" />
          )}
          {escalationStatusLabel(escalation)}
        </span>
      </div>

      <p className="mt-4 b2-r text-text">{escalation.message}</p>

      {answered && (
        <div className="mt-4 rounded-btn bg-secondary-light px-4 py-3.5">
          <p className="f1-b tracking-wide text-secondary-dark">
            TRAINER RESPONSE
            {escalation.respondedAt
              ? ` · ${formatDueDate(escalation.respondedAt)}`
              : ''}
          </p>
          <p className="mt-1.5 b2-r whitespace-pre-line text-text">
            {escalation.response}
          </p>
        </div>
      )}

      <p className="mt-4 f1-r text-muted">
        Asked {formatDueDate(escalation.createdAt)}
      </p>
    </Link>
  );
};

export default EscalationCard;
