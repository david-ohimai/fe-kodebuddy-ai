'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, CalendarDays, Clock, Info, Sparkles } from 'lucide-react';
import { AppCard } from '@/components/ui/AppCard';
import AppPill from '@/components/ui/AppPill';
import AppSpinner from '@/components/ui/AppSpinner';
import KodeBuddyChatPanel from '@/components/chat/KodeBuddyChatPanel';
import { getLearnerAssignment } from '@/lib/api/assignments.api';
import { getErrorMessage } from '@/lib/api/client';
import {
  ASSIGNMENT_STATUS_COLOR,
  ASSIGNMENT_STATUS_LABEL,
  formatDueDate,
  formatModuleLabel,
  type LearnerAssignment,
} from '@/types/assignment.types';

export interface AssignmentDetailsProps {
  assignmentId: number;
}

/** Section card with the underlined heading used throughout the detail page. */
function DetailSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <AppCard padding="lg">
      <h2 className="h6-b text-text">{title}</h2>
      <hr className="mt-4 mb-6 border-disabled" />
      {children}
    </AppCard>
  );
}

export default function AssignmentDetails({
  assignmentId,
}: AssignmentDetailsProps) {
  const [assignment, setAssignment] = useState<LearnerAssignment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [chatOpen, setChatOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;

    getLearnerAssignment(assignmentId)
      .then((result) => {
        if (cancelled) return;
        setAssignment(result);
        if (!result) setError('This assignment could not be found.');
      })
      .catch((err) => {
        if (!cancelled) {
          setError(getErrorMessage(err, 'Could not load this assignment.'));
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [assignmentId]);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <AppSpinner />
      </div>
    );
  }

  if (error || !assignment) {
    return (
      <div className="flex flex-col gap-4">
        <Link
          href="/assignments"
          className="inline-flex items-center gap-2 b2-m text-text-secondary hover:text-primary"
        >
          <ArrowLeft size={16} />
          Back to assignments
        </Link>
        <AppCard padding="lg">
          <p className="b1-b text-text">Assignment unavailable</p>
          <p className="b2-r mt-1 text-text-secondary">{error}</p>
        </AppCard>
      </div>
    );
  }

  const moduleLabel = formatModuleLabel(assignment.moduleOrder);
  const paragraphs = (assignment.description ?? '')
    .split(/\n{2,}/)
    .filter(Boolean);

  return (
    <div className="flex gap-6">
      {/* Main column */}
      <div className="flex min-w-0 flex-1 flex-col gap-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="h5-b text-text">Assignment Details</h1>
            <p className="b2-r text-text-secondary">
              Review the brief, then submit your work before the due date.
            </p>
          </div>

          {!chatOpen && (
            <button
              type="button"
              onClick={() => setChatOpen(true)}
              className="inline-flex shrink-0 items-center gap-2 rounded-full bg-linear-to-r from-primary to-secondary px-6 py-3 b2-b text-white transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
            >
              <Sparkles size={18} />
              Ask KodeBuddy
            </button>
          )}
        </div>

        {/* Overview */}
        <AppCard padding="lg">
          <p className="f1-b tracking-widest text-text-secondary">
            {moduleLabel}
          </p>
          <h2 className="h4-b mt-3 text-text">{assignment.title}</h2>

          {assignment.description && (
            <p className="b1-r mt-3 max-w-2xl text-text-secondary">
              {paragraphs[0]}
            </p>
          )}

          <div className="mt-5 flex flex-wrap items-center gap-3">
            <AppPill
              label={ASSIGNMENT_STATUS_LABEL[assignment.status]}
              color={ASSIGNMENT_STATUS_COLOR[assignment.status]}
              icon={<Clock size={14} />}
            />
            <AppPill
              label={formatDueDate(assignment.dueDate)}
              color="warning"
              icon={<CalendarDays size={14} />}
            />
            {assignment.graded && assignment.score !== null && (
              <AppPill
                label={`${assignment.score} / ${assignment.maximumScore}`}
                color="success"
              />
            )}
          </div>
        </AppCard>

        {/* Description */}
        {paragraphs.length > 0 && (
          <DetailSection title="Description">
            <div className="flex flex-col gap-4">
              {paragraphs.map((paragraph, index) => (
                <p key={index} className="b1-r text-text">
                  {paragraph}
                </p>
              ))}
            </div>

            <div className="mt-6 flex items-start gap-3 rounded-btn bg-primary-light px-4 py-3.5">
              <Info size={18} className="mt-0.5 shrink-0 text-primary" />
              <p className="b2-r text-text-secondary">
                This builds directly on the {assignment.moduleTitle} live
                session. Missed it? The recording is linked in Resources.
              </p>
            </div>
          </DetailSection>
        )}

        {/* Instructions */}
        {assignment.instructions.length > 0 && (
          <DetailSection title="Instructions">
            <ol className="flex flex-col gap-5">
              {assignment.instructions.map((item, index) => (
                <li key={item.title} className="flex gap-4">
                  <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary-light f1-b text-primary">
                    {index + 1}
                  </span>
                  <div>
                    <p className="b1-b text-text">{item.title}</p>
                    <p className="b2-r mt-1 text-text-secondary">
                      {item.description}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </DetailSection>
        )}

        {/* Requirements */}
        {assignment.requirements.length > 0 && (
          <DetailSection title="Requirements">
            <ul className="flex flex-col gap-5">
              {assignment.requirements.map((item) => (
                <li key={item.title} className="flex gap-4">
                  <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-secondary" />
                  <div>
                    <p className="b1-b text-text">{item.title}</p>
                    <p className="b2-r mt-1 text-text-secondary">
                      {item.description}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </DetailSection>
        )}
      </div>

      {/* Assistant panel — docked beside the brief so the learner keeps context */}
      {chatOpen && (
        <>
          {/* Below lg the panel takes over the screen instead of vanishing. */}
          <div
            role="presentation"
            onClick={() => setChatOpen(false)}
            className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          />
          <aside className="fixed inset-x-4 top-4 bottom-4 z-50 lg:sticky lg:inset-auto lg:top-6 lg:z-auto lg:h-[calc(100vh-6rem)] lg:w-100 lg:shrink-0">
            <KodeBuddyChatPanel
              context={{
                courseId: assignment.courseId,
                moduleId: assignment.moduleId,
                assignmentId: assignment.id,
                label: moduleLabel,
              }}
              suggestions={[
                'Explain Auto-layout in simple terms',
                "I'm not sure where to start with Part A",
              ]}
              onClose={() => setChatOpen(false)}
            />
          </aside>
        </>
      )}
    </div>
  );
}
