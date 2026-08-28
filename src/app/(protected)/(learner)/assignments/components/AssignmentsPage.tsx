'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { CalendarDays, ChevronRight, Clock } from 'lucide-react';
import PageHeader from '@/components/ui/AppPageHeader';
import TableHeader from '@/components/ui/AppTableHeader';
import AppPill from '@/components/ui/AppPill';
import AppSpinner from '@/components/ui/AppSpinner';
import AppEmptyState from '@/components/ui/AppEmptyState';
import { AppCard } from '@/components/ui/AppCard';
import { useToast } from '@/components/ui/ToastProvider';
import { listLearnerAssignments } from '@/lib/api/assignments.api';
import { getErrorMessage } from '@/lib/api/client';
import {
  ASSIGNMENT_STATUS_COLOR,
  ASSIGNMENT_STATUS_LABEL,
  formatDueDate,
  formatModuleLabel,
  type LearnerAssignment,
} from '@/types/assignment.types';
import emptyState from '@/assets/images/empty state.webp';

const STATUS_OPTIONS = [
  { label: 'All Status', value: '' },
  { label: 'In-progress', value: 'in-progress' },
  { label: 'Submitted', value: 'submitted' },
  { label: 'Graded', value: 'graded' },
  { label: 'Overdue', value: 'overdue' },
];

export default function AssignmentsPage() {
  const { showError } = useToast();

  const [assignments, setAssignments] = useState<LearnerAssignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');

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

  const visible = useMemo(() => {
    const term = search.trim().toLowerCase();
    return assignments.filter((assignment) => {
      const matchesStatus = !status || assignment.status === status;
      const matchesSearch =
        !term ||
        assignment.title.toLowerCase().includes(term) ||
        assignment.moduleTitle.toLowerCase().includes(term);
      return matchesStatus && matchesSearch;
    });
  }, [assignments, search, status]);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Assignments"
        subtitle="Track and submit your assignments."
      />

      <TableHeader
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search assignments"
        filters={[
          {
            id: 'status',
            value: status,
            options: STATUS_OPTIONS,
            onChange: setStatus,
            ariaLabel: 'Filter by status',
          },
        ]}
      />

      {loading ? (
        <div className="flex min-h-[50vh] items-center justify-center">
          <AppSpinner />
        </div>
      ) : visible.length === 0 ? (
        <AppEmptyState
          image={emptyState}
          title={
            assignments.length === 0
              ? 'No assignments yet'
              : 'No assignments match your filters'
          }
          description={
            assignments.length === 0
              ? 'Assignments appear here once your trainer publishes them.'
              : 'Try a different search term or status.'
          }
        />
      ) : (
        <div className="flex flex-col gap-4">
          {visible.map((assignment) => (
            <AppCard
              key={assignment.id}
              href={`/assignments/${assignment.id}`}
              interactive
              padding="md"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="f1-b tracking-widest text-text-secondary">
                    {formatModuleLabel(assignment.moduleOrder)}
                  </p>
                  <h2 className="b1-b mt-1.5 text-text">{assignment.title}</h2>

                  {assignment.description && (
                    <p className="b2-r mt-1.5 line-clamp-2 max-w-2xl text-text-secondary">
                      {assignment.description}
                    </p>
                  )}

                  <div className="mt-4 flex flex-wrap items-center gap-3">
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
                </div>

                <ChevronRight
                  size={20}
                  className="mt-1 shrink-0 text-muted"
                  aria-hidden="true"
                />
              </div>
            </AppCard>
          ))}
        </div>
      )}
    </div>
  );
}
