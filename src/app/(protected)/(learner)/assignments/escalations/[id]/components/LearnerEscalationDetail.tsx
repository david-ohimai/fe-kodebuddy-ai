'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, CheckCircle2, Clock, FileQuestion } from 'lucide-react';
import { AppCard } from '@/components/ui/AppCard';
import AppEmptyState from '@/components/ui/AppEmptyState';
import AppSpinner from '@/components/ui/AppSpinner';
import { cx } from '@/lib/utils/cx';
import { getMyEscalation } from '@/lib/api/escalations.api';
import { getErrorMessage } from '@/lib/api/client';
import { formatDueDate, formatModuleLabel } from '@/types/assignment.types';
import {
  escalationStatusLabel,
  ESCALATION_STATUS_CLASS,
  type Escalation,
} from '@/types/escalation.types';
import getUnstucked from '@/assets/images/get-unstucked.webp';

export interface LearnerEscalationDetailProps {
  escalationId: string;
}

/**
 * What the learner sees after tapping "Your trainer responded to your
 * escalation". Read-only — a learner never edits or answers an escalation,
 * so there is no write path here (the backend's PATCH is trainer-only).
 */
export default function LearnerEscalationDetail({
  escalationId,
}: LearnerEscalationDetailProps) {
  const [escalation, setEscalation] = useState<Escalation | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    getMyEscalation(escalationId)
      .then((result) => {
        if (cancelled) return;
        if (!result) {
          setNotFound(true);
          return;
        }
        setEscalation(result);
      })
      .catch((err) => {
        if (!cancelled) {
          setError(getErrorMessage(err, 'Could not load this escalation.'));
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [escalationId]);

  const backLink = (
    <Link
      href="/assignments"
      className="b2-b inline-flex w-fit items-center gap-1.5 text-primary hover:underline"
    >
      <ArrowLeft size={16} /> Back to assignments
    </Link>
  );

  if (loading) {
    return (
      <div className="flex flex-col gap-4">
        {backLink}
        <div className="flex min-h-[420px] items-center justify-center">
          <AppSpinner size={40} />
        </div>
      </div>
    );
  }

  if (notFound || error || !escalation) {
    return (
      <div className="flex flex-col gap-4">
        {backLink}
        <AppCard padding="none">
          <AppEmptyState
            image={getUnstucked}
            title={notFound ? 'Escalation not found' : 'Could not load this'}
            description={
              error ??
              'This escalation no longer exists, or it belongs to someone else.'
            }
            className="!min-h-[420px]"
          />
        </AppCard>
      </div>
    );
  }

  const answered = Boolean(escalation.response);

  return (
    <div className="flex flex-col gap-6">
      {backLink}

      <AppCard padding="none">
        <div className="flex items-start justify-between gap-4 border-b border-disabled px-6 py-5">
          <div>
            <h1 className="h5-b text-text">Escalation</h1>
            <p className="b2-r mt-1 text-muted">
              Asked {formatDueDate(escalation.createdAt)}
              {escalation.moduleOrder !== null
                ? ` · ${formatModuleLabel(escalation.moduleOrder)}`
                : ''}
            </p>
          </div>

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

        <div className="px-6 py-5">
          <p className="f1-b tracking-widest text-text-secondary">
            YOUR QUESTION
          </p>
          <p className="b1-r mt-2 whitespace-pre-line text-text">
            {escalation.message}
          </p>
        </div>

        <div className="border-t border-disabled px-6 py-5">
          <p className="f1-b tracking-widest text-text-secondary">
            TRAINER RESPONSE
          </p>

          {answered ? (
            <>
              {escalation.respondedAt && (
                <p className="f1-r mt-1 text-muted">
                  Replied {formatDueDate(escalation.respondedAt)}
                </p>
              )}
              <p className="b1-r mt-2 whitespace-pre-line text-text">
                {escalation.response}
              </p>
            </>
          ) : (
            <div className="mt-3 flex items-start gap-3 rounded-btn bg-warning-light px-4 py-3.5">
              <FileQuestion
                size={18}
                className="mt-0.5 shrink-0 text-warning-dark"
              />
              <p className="b2-r text-text-secondary">
                Your trainer hasn&apos;t replied yet. You&apos;ll get a
                notification as soon as they do.
              </p>
            </div>
          )}
        </div>
      </AppCard>
    </div>
  );
}
