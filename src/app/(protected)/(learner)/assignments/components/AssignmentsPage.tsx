'use client';

import React, { useEffect, useMemo, useState } from 'react';
import PageHeader from '@/components/ui/AppPageHeader';
import AppEmptyState from '@/components/ui/AppEmptyState';
import { useToast } from '@/components/ui/ToastProvider';
import { cx } from '@/lib/utils/cx';
import { listLearnerAssignments } from '@/lib/api/assignments.api';
import { getErrorMessage } from '@/lib/api/client';
import type { LearnerAssignment } from '@/types/assignment.types';
import AssignmentCard from './AssignmentCard';
import emptyStateImage from '@/assets/images/empty state assign.webp';

type AssignmentTab =
  | 'all'
  | 'pending'
  | 'in-progress'
  | 'submitted'
  | 'escalations';

const TABS: ReadonlyArray<{ id: AssignmentTab; label: string }> = [
  { id: 'all', label: 'All' },
  { id: 'pending', label: 'Pending' },
  { id: 'in-progress', label: 'In-progress' },
  { id: 'submitted', label: 'Submitted' },
  { id: 'escalations', label: 'Escalations' },
];

const GRID =
  'grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4';

/**
 * Which statuses each tab shows.
 *
 * Overdue work sits under In-progress rather than getting a tab of its own:
 * it is still outstanding and still actionable, and the design has no Overdue
 * tab, so anything else would leave it visible only under All.
 *
 * Escalations has no source yet — the backend records escalations the agent
 * raises but exposes no endpoint to read them — so it renders the empty state.
 */
function matchesTab(assignment: LearnerAssignment, tab: AssignmentTab) {
  switch (tab) {
    case 'all':
      return true;
    case 'pending':
      return assignment.status === 'pending';
    case 'in-progress':
      return (
        assignment.status === 'in-progress' || assignment.status === 'overdue'
      );
    case 'submitted':
      return assignment.status === 'submitted' || assignment.status === 'graded';
    case 'escalations':
      return false;
  }
}

function LoadingGrid() {
  return (
    <div className={GRID} aria-hidden="true">
      {Array.from({ length: 8 }).map((_, index) => (
        <div
          key={index}
          className="rounded-card border border-disabled bg-background p-4"
        >
          <div className="h-6 w-full animate-pulse rounded-md bg-disabled" />
          <div className="mt-3 h-6 w-full animate-pulse rounded-md bg-disabled" />
          <div className="mt-3 h-5 w-1/2 animate-pulse rounded-md bg-disabled" />
          <div className="mt-6 h-9 w-32 animate-pulse rounded-full bg-disabled" />
        </div>
      ))}
    </div>
  );
}

export default function AssignmentsPage() {
  const { showError } = useToast();

  const [assignments, setAssignments] = useState<LearnerAssignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<AssignmentTab>('all');

  useEffect(() => {
    let cancelled = false;

    listLearnerAssignments()
      .then((list) => {
        if (!cancelled) setAssignments(list);
      })
      .catch((err) => {
        if (!cancelled) {
          showError(
            'Could not load assignments',
            getErrorMessage(err, 'Please try again in a moment.'),
          );
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [showError]);

  const visible = useMemo(
    () => assignments.filter((a) => matchesTab(a, activeTab)),
    [assignments, activeTab],
  );

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Assignments"
        subtitle="Here's what's happening on KodeBuddy today."
      />

      {/* Underlined tabs, per the Assignments design. AppTab is a filled
          segmented control from md up, so it is not reused here. */}
      <div
        role="tablist"
        aria-label="Filter assignments"
        className="flex items-center gap-6 overflow-x-auto rounded-card bg-background px-5"
      >
        {TABS.map((tab) => {
          const isActive = tab.id === activeTab;
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => setActiveTab(tab.id)}
              className={cx(
                'relative shrink-0 py-3 b2-m transition-colors',
                isActive
                  ? 'text-primary'
                  : 'text-muted hover:text-text-secondary',
              )}
            >
              {tab.label}
              {isActive && (
                <span className="absolute inset-x-0 bottom-0 h-0.5 rounded-full bg-primary" />
              )}
            </button>
          );
        })}
      </div>

      <div className="rounded-card bg-background p-5">
        {loading ? (
          <LoadingGrid />
        ) : visible.length === 0 ? (
          <AppEmptyState
            image={emptyStateImage}
            title="No assignment"
            description="There are no assignments in this categories yet"
          />
        ) : (
          <div className={GRID}>
            {visible.map((assignment) => (
              <AssignmentCard key={assignment.id} assignment={assignment} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
