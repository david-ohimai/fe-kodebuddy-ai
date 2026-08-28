'use client';

import React, { useEffect, useMemo, useState } from 'react';

import AppPageHeader from '@/components/ui/AppPageHeader';
import { useToast } from '@/components/ui/ToastProvider';
import { listLearnerAssignments } from '@/lib/api/assignments.api';
import { getErrorMessage } from '@/lib/api/client';
import {
  formatDueDate,
  formatModuleLabel,
  type LearnerAssignment,
} from '@/types/assignment.types';

import {
  AssignmentsList,
  type AssignmentItem,
} from './components/AssignmentsList';

/**
 * Maps the domain model onto the flat shape the card renders.
 *
 * The list deliberately stays presentational: formatting (due date, module
 * label, score) happens here so `AssignmentCard` keeps taking plain strings.
 */
function toAssignmentItem(assignment: LearnerAssignment): AssignmentItem {
  return {
    id: String(assignment.id),
    title: assignment.title,
    moduleName: formatModuleLabel(assignment.moduleOrder),
    dueDate: formatDueDate(assignment.dueDate),
    status: assignment.status,
    score:
      assignment.graded && assignment.score !== null
        ? `${assignment.score} / ${assignment.maximumScore}`
        : undefined,
  };
}

export default function AssignmentsPage() {
  const { showError } = useToast();

  const [assignments, setAssignments] = useState<LearnerAssignment[]>([]);
  const [loading, setLoading] = useState(true);

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

  const items = useMemo(
    () => assignments.map(toAssignmentItem),
    [assignments],
  );

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
      <AppPageHeader
        title="Assignments"
        subtitle="Here's what's happening on KodeBuddy today."
      />

      <AssignmentsList assignments={items} loading={loading} />
    </div>
  );
}
