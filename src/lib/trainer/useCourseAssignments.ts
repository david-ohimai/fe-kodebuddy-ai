'use client';

import { useEffect, useState } from 'react';
import { useToast } from '@/components/ui/ToastProvider';
import * as assignmentsApi from '@/lib/api/assignments.api';
import { getErrorMessage } from '@/lib/api/client';
import type { CourseAssignment } from '@/lib/api/assignments.api';
import type { AssignmentItem } from '@/types/assignment.types';
import type { CourseModule } from '@/lib/api/modules.api';

const DEFAULT_MAXIMUM_SCORE = 100;

function defaultDueDate(cohortEndDate?: string | null): string {
  if (cohortEndDate) return `${cohortEndDate}T23:59:59.000Z`;
  const fallback = new Date();
  fallback.setDate(fallback.getDate() + 14);
  return fallback.toISOString();
}

export interface AssignmentFormInput {
  title: string;
  description?: string;
  instructions?: AssignmentItem[];
  requirements?: AssignmentItem[];
}

export function useCourseAssignments(
  modules: CourseModule[],
  cohortEndDate?: string | null,
) {
  const { showSuccess, showError } = useToast();
  const [assignments, setAssignments] = useState<CourseAssignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const moduleIds = modules.map((m) => m.id).join(',');

  const loadAssignments = () => {
    if (modules.length === 0) {
      setAssignments([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    Promise.all(
      modules.map((m) =>
        assignmentsApi.listModuleAssignmentsFull(m.id).catch(() => []),
      ),
    )
      .then((lists) => setAssignments(lists.flat()))
      .catch((err) => {
        showError(
          'Could not load assignments',
          getErrorMessage(err, 'Please try again.'),
        );
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadAssignments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [moduleIds]);

  const defaultModuleId = modules[0]?.id ?? null;

  const addAssignment = async (data: AssignmentFormInput) => {
    if (!defaultModuleId) {
      throw new Error('Add a module to this course before adding assignments.');
    }
    setSaving(true);
    try {
      const created = await assignmentsApi.createModuleAssignment(
        defaultModuleId,
        {
          title: data.title,
          description: data.description,
          instructions: data.instructions,
          requirements: data.requirements,
          dueDate: defaultDueDate(cohortEndDate),
          maximumScore: DEFAULT_MAXIMUM_SCORE,
        },
      );
      setAssignments((prev) => [...prev, created]);
      showSuccess(
        'Assignment added successfully.',
        `"${data.title}" was added to this course.`,
      );
      return created;
    } finally {
      setSaving(false);
    }
  };

  const editAssignment = async (
    assignment: CourseAssignment,
    data: AssignmentFormInput,
  ) => {
    setSaving(true);
    try {
      const updated = await assignmentsApi.updateModuleAssignment(
        assignment.moduleId,
        assignment.id,
        {
          title: data.title,
          description: data.description,
          instructions: data.instructions,
          requirements: data.requirements,
        },
      );
      setAssignments((prev) =>
        prev.map((a) => (a.id === updated.id ? updated : a)),
      );
      showSuccess(
        'Assignment updated successfully.',
        `"${data.title}" has been saved.`,
      );
      return updated;
    } finally {
      setSaving(false);
    }
  };

  const deleteAssignment = async (assignment: CourseAssignment) => {
    setSaving(true);
    try {
      await assignmentsApi.deleteModuleAssignment(
        assignment.moduleId,
        assignment.id,
      );
      setAssignments((prev) => prev.filter((a) => a.id !== assignment.id));
      showSuccess('Assignment deleted.', `"${assignment.title}" was removed.`);
    } finally {
      setSaving(false);
    }
  };

  return {
    assignments,
    loading,
    saving,
    hasModules: modules.length > 0,
    addAssignment,
    editAssignment,
    deleteAssignment,
  };
}
