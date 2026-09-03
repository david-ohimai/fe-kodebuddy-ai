'use client';

import React, { useEffect, useMemo, useState } from 'react';
import PageHeader from '@/components/ui/AppPageHeader';
import AppEmptyState from '@/components/ui/AppEmptyState';
import AppTab from '@/components/ui/AppTab';
import { useToast } from '@/components/ui/ToastProvider';
import { listLearnerAssignments } from '@/lib/api/assignments.api';
import { getErrorMessage } from '@/lib/api/client';
import type { LearnerAssignment } from '@/types/assignment.types';
import type { Escalation } from '@/types/escalation.types';
import { listMyEscalations } from '@/lib/api/escalations.api';
import AssignmentCard from './AssignmentCard';
import EscalationCard from './EscalationCard';
import emptyStateImage from '@/assets/images/empty state assign.webp';

type AssignmentTab =
  'all' | 'pending' | 'in-progress' | 'submitted' | 'escalations';

const TABS: ReadonlyArray<{ id: AssignmentTab; label: string }> = [
  { id: 'all', label: 'All' },
  { id: 'pending', label: 'Pending' },
  { id: 'in-progress', label: 'In-progress' },
  { id: 'submitted', label: 'Submitted' },
  { id: 'escalations', label: 'Escalations' },
];

const GRID =
  'grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4';

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
      return (
        assignment.status === 'submitted' || assignment.status === 'graded'
      );
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
  const [escalations, setEscalations] = useState<Escalation[]>([]);
  const [escalationsLoading, setEscalationsLoading] = useState(true);
  const [escalationsError, setEscalationsError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<AssignmentTab>('all');

  useEffect(() => {
    let cancelled = false;

    // Loaded alongside the assignments rather than on tab switch: the two are
    // independent, and a failure in one must not blank the other.
    listMyEscalations()
      .then((list) => {
        if (!cancelled) setEscalations(list);
      })
      .catch((err) => {
        if (!cancelled) {
          setEscalationsError(
            getErrorMessage(err, 'Could not load your escalations.'),
          );
        }
      })
      .finally(() => {
        if (!cancelled) setEscalationsLoading(false);
      });

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

      <AppTab
        tabs={TABS}
        activeTab={activeTab}
        onChange={(id) => setActiveTab(id as AssignmentTab)}
        variant="underline"
        ariaLabel="Filter assignments"
      />

      <div className="rounded-card bg-background p-5">
        {activeTab === 'escalations' ? (
          escalationsLoading ? (
            <LoadingGrid />
          ) : escalationsError ? (
            <AppEmptyState
              image={emptyStateImage}
              title="Could not load your escalations"
              description={escalationsError}
            />
          ) : escalations.length === 0 ? (
            <AppEmptyState
              image={emptyStateImage}
              title="No escalation"
              description="Questions you send to a trainer will appear here"
            />
          ) : (
            <div className="flex flex-col gap-4">
              {escalations.map((escalation) => (
                <EscalationCard key={escalation.id} escalation={escalation} />
              ))}
            </div>
          )
        ) : loading ? (
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
