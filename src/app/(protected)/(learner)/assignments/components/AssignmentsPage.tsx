'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { RotateCcw } from 'lucide-react';
import PageHeader from '@/components/ui/AppPageHeader';
import AppEmptyState from '@/components/ui/AppEmptyState';
import AppTab from '@/components/ui/AppTab';
import { listLearnerAssignments } from '@/lib/api/assignments.api';
import { getErrorMessage } from '@/lib/api/client';
import type { LearnerAssignment } from '@/types/assignment.types';
import type { Escalation } from '@/types/escalation.types';
import { listMyEscalations } from '@/lib/api/escalations.api';
import AssignmentCard from './AssignmentCard';
import EscalationCard from './EscalationCard';
import AskKodeBuddyFab from '@/components/chat/AskKodeBuddyFab';
import emptyStateImage from '@/assets/images/empty state assign.webp';

const ASSIGNMENTS_SUGGESTIONS = [
  'What assignments do I have due soon?',
  "I'm not sure where to start with an assignment",
];

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
  const [assignments, setAssignments] = useState<LearnerAssignment[]>([]);
  const [assignmentsError, setAssignmentsError] = useState<string | null>(null);
  const [escalations, setEscalations] = useState<Escalation[]>([]);
  const [escalationsLoading, setEscalationsLoading] = useState(true);
  const [escalationsError, setEscalationsError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<AssignmentTab>('all');
  const [reloadKey, setReloadKey] = useState(0);
  const retry = useCallback(() => setReloadKey((key) => key + 1), []);

  useEffect(() => {
    let cancelled = false;

    function loadEscalations() {
      setEscalationsLoading(true);
      setEscalationsError(null);
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
    }

    function loadAssignments() {
      setLoading(true);
      setAssignmentsError(null);
      listLearnerAssignments()
        .then((list) => {
          if (!cancelled) setAssignments(list);
        })
        .catch((err) => {
          if (!cancelled) {
            setAssignmentsError(
              getErrorMessage(err, 'Please try again in a moment.'),
            );
          }
        })
        .finally(() => {
          if (!cancelled) setLoading(false);
        });
    }

    loadEscalations();
    loadAssignments();

    return () => {
      cancelled = true;
    };
  }, [reloadKey]);

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
              actionLabel="Retry"
              actionIcon={<RotateCcw size={16} />}
              onAction={retry}
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
        ) : assignmentsError ? (
          <AppEmptyState
            image={emptyStateImage}
            title="Could not load assignments"
            description={assignmentsError}
            actionLabel="Retry"
            actionIcon={<RotateCcw size={16} />}
            onAction={retry}
          />
        ) : visible.length === 0 ? (
          <AppEmptyState
            image={emptyStateImage}
            title={
              assignments.length === 0 ? 'No assignments yet' : 'No assignment'
            }
            description={
              assignments.length === 0
                ? 'Your assignments will show up here once your trainer adds them.'
                : 'There are no assignments in this categories yet'
            }
          />
        ) : (
          <div className={GRID}>
            {visible.map((assignment) => (
              <AssignmentCard key={assignment.id} assignment={assignment} />
            ))}
          </div>
        )}
      </div>

      <AskKodeBuddyFab suggestions={ASSIGNMENTS_SUGGESTIONS} />
    </div>
  );
}
