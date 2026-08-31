'use client';

import React from 'react';
import { Clock } from 'lucide-react';
import { cx } from '@/lib/utils/cx';
import { formatModuleLabel } from '@/types/assignment.types';
import {
  ESCALATION_STATUS_CLASS,
  ESCALATION_STATUS_LABEL,
  type Escalation,
} from '@/types/escalation.types';

export interface EscalationCardProps {
  escalation: Escalation;
}

export const EscalationCard: React.FC<EscalationCardProps> = ({
  escalation,
}) => {
  return (
    <article className="rounded-card border border-disabled bg-background p-5">
      <div className="flex items-start justify-between gap-3">
        <span className="rounded-md bg-secondary-light px-2.5 py-1 f2-b tracking-wide text-text">
          {formatModuleLabel(escalation.moduleOrder)}
        </span>

        <span
          className={cx(
            'inline-flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1 f2-m',
            ESCALATION_STATUS_CLASS[escalation.status],
          )}
        >
          <Clock size={12} aria-hidden="true" />
          {ESCALATION_STATUS_LABEL[escalation.status]}
        </span>
      </div>

      <h3 className="mt-4 b1-b text-text">{escalation.assignmentTitle}</h3>

      <p className="mt-2 b2-r text-text-secondary">{escalation.message}</p>
    </article>
  );
};

export default EscalationCard;
