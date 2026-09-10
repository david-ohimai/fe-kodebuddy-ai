'use client';

import React, { useState } from 'react';
import { ArrowLeft, ChevronRight, Plus } from 'lucide-react';
import { AppCard } from '@/components/ui/AppCard';
import AppButton from '@/components/ui/AppButton';
import AppConfirmModal from '@/components/ui/AppConfirmModal';
import AppEmptyState from '@/components/ui/AppEmptyState';
import AppSpinner from '@/components/ui/AppSpinner';
import { useToast } from '@/components/ui/ToastProvider';
import { getErrorMessage } from '@/lib/api/client';
import AssignmentModal, { type AssignmentModalSubmit } from './AssignmentModal';
import AssignmentDetailView from './AssignmentDetailView';
import emptyStateAssign from '@/assets/images/empty state assign.webp';
import type { CourseAssignment } from '@/lib/api/assignments.api';
import type { AssignmentFormInput } from '@/lib/trainer/useCourseAssignments';

function toDateInputValue(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  return date.toISOString().split('T')[0];
}

function today() {
  return new Date().toISOString().split('T')[0];
}

export interface AssignmentsTabProps {
  courseName: string;
  cohortName: string;
  assignments: CourseAssignment[];
  loading: boolean;
  saving: boolean;
  hasModules: boolean;
  suggestedDueDate?: string | null;
  addAssignment: (data: AssignmentFormInput) => Promise<CourseAssignment>;
  editAssignment: (
    assignment: CourseAssignment,
    data: AssignmentFormInput,
  ) => Promise<CourseAssignment>;
  deleteAssignment: (assignment: CourseAssignment) => Promise<void>;
  onBack: () => void;
}

function toInstructionItems(text: string) {
  const trimmed = text.trim();
  return trimmed ? [{ title: 'Instructions', description: trimmed }] : [];
}

function toRequirementItems(text: string) {
  return text
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => ({ title: line, description: '' }));
}

export default function AssignmentsTab({
  courseName,
  cohortName,
  assignments,
  loading,
  saving,
  hasModules,
  suggestedDueDate,
  addAssignment,
  editAssignment,
  deleteAssignment,
  onBack,
}: AssignmentsTabProps) {
  const { showError } = useToast();

  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingAssignment, setEditingAssignment] =
    useState<CourseAssignment | null>(null);
  const [deletingAssignment, setDeletingAssignment] =
    useState<CourseAssignment | null>(null);

  const selected = assignments.find((a) => a.id === selectedId) ?? null;

  const handleAdd = async (data: AssignmentModalSubmit) => {
    try {
      await addAssignment({
        title: data.title,
        description: data.description,
        startDate: data.startDate,
        dueDate: data.dueDate,
        maximumScore: data.maximumScore,
      });
      setIsAddOpen(false);
    } catch (err) {
      showError(
        'Could not add assignment',
        getErrorMessage(err, 'Please try again.'),
      );
    }
  };

  const handleEdit = async (data: AssignmentModalSubmit) => {
    if (!editingAssignment) return;
    try {
      await editAssignment(editingAssignment, {
        title: data.title,
        description: data.description,
        instructions: toInstructionItems(data.instructionsText ?? ''),
        requirements: toRequirementItems(data.requirementsText ?? ''),
        startDate: data.startDate,
        dueDate: data.dueDate,
        maximumScore: data.maximumScore,
      });
      setEditingAssignment(null);
    } catch (err) {
      showError(
        'Could not update assignment',
        getErrorMessage(err, 'Please try again.'),
      );
    }
  };

  const handleDelete = async () => {
    if (!deletingAssignment) return;
    try {
      await deleteAssignment(deletingAssignment);
      setDeletingAssignment(null);
      setSelectedId(null);
    } catch (err) {
      showError(
        'Could not delete assignment',
        getErrorMessage(err, 'Please try again.'),
      );
    }
  };

  if (selected) {
    return (
      <>
        <AssignmentDetailView
          courseName={courseName}
          assignment={selected}
          onBack={() => setSelectedId(null)}
          onEdit={() => setEditingAssignment(selected)}
          onDelete={() => setDeletingAssignment(selected)}
        />

        <AssignmentModal
          key={editingAssignment?.id}
          open={!!editingAssignment}
          mode="edit"
          saving={saving}
          initial={
            editingAssignment
              ? {
                  title: editingAssignment.title,
                  description: editingAssignment.description ?? '',
                  instructionsText:
                    editingAssignment.instructions[0]?.description ?? '',
                  requirementsText: editingAssignment.requirements
                    .map((r) => r.title)
                    .join('\n'),
                  startDate: toDateInputValue(editingAssignment.startDate),
                  dueDate: toDateInputValue(editingAssignment.dueDate),
                  maximumScore: editingAssignment.maximumScore,
                }
              : undefined
          }
          onClose={() => setEditingAssignment(null)}
          onSubmit={handleEdit}
        />

        <AppConfirmModal
          open={!!deletingAssignment}
          onClose={() => setDeletingAssignment(null)}
          title="Delete assignment?"
          description={`Are you sure you want to delete "${deletingAssignment?.title}"? This action cannot be undone.`}
          secondaryButton={{
            label: 'Cancel',
            onClick: () => setDeletingAssignment(null),
          }}
          primaryButton={{
            label: 'Yes, delete',
            color: 'error',
            loading: saving,
            onClick: handleDelete,
          }}
        />
      </>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <button
        type="button"
        onClick={onBack}
        className="b2-b inline-flex w-fit items-center gap-1.5 text-primary hover:underline"
      >
        <ArrowLeft size={16} /> Back to {courseName}
      </button>

      <AppCard padding="lg">
        <h1 className="h5-b text-text">Assignments</h1>
        <p className="b2-r mt-1 text-text-secondary">
          Create and manage assignments for this course.
        </p>

        <div className="mt-5 flex flex-wrap items-center justify-between gap-2 rounded-input bg-primary-light px-4 py-2.5">
          <p className="f1-r text-primary-dark">
            <span className="b2-b text-text">Course:</span> {courseName}
          </p>
          <p className="f1-r text-primary-dark">
            <span className="b2-b text-text">Assigned Cohort:</span>{' '}
            {cohortName}
          </p>
        </div>

        <div className="mt-5 rounded-card border border-disabled">
          <div className="flex items-center justify-between gap-3 border-b border-disabled p-5 sm:p-6">
            <div>
              <p className="b2-b text-text">Course assignments</p>
              <p className="f1-r text-muted">
                All assignments created for this course.
              </p>
            </div>
            <AppButton
              startIcon={<Plus size={16} />}
              radius="full"
              size="small"
              onClick={() => setIsAddOpen(true)}
            >
              Add assignments
            </AppButton>
          </div>

          {loading ? (
            <div className="flex min-h-[240px] items-center justify-center">
              <AppSpinner size={40} />
            </div>
          ) : assignments.length === 0 ? (
            <AppEmptyState
              image={emptyStateAssign}
              title="No assignments yet"
              description={
                hasModules
                  ? 'Create your first assignment for this course.'
                  : 'Add a module to this course before adding assignments.'
              }
              actionLabel={hasModules ? 'Add assignments' : undefined}
              actionIcon={<Plus size={16} />}
              onAction={hasModules ? () => setIsAddOpen(true) : undefined}
            />
          ) : (
            <ul className="divide-y divide-disabled">
              {assignments.map((assignment) => (
                <li key={assignment.id}>
                  <button
                    type="button"
                    onClick={() => setSelectedId(assignment.id)}
                    className="flex w-full items-center gap-4 px-5 py-4 text-left transition-colors hover:bg-primary-light/40 sm:px-6"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="b2-b text-text">{assignment.title}</p>
                      {assignment.description && (
                        <p className="f1-r mt-0.5 text-muted">
                          {assignment.description}
                        </p>
                      )}
                    </div>
                    <ChevronRight size={18} className="shrink-0 text-muted" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </AppCard>

      <AssignmentModal
        key={isAddOpen ? 'add-open' : 'add-closed'}
        open={isAddOpen}
        mode="add"
        saving={saving}
        initial={{
          title: '',
          description: '',
          instructionsText: '',
          requirementsText: '',
          startDate: today(),
          dueDate: suggestedDueDate ?? '',
          maximumScore: 100,
        }}
        onClose={() => setIsAddOpen(false)}
        onSubmit={handleAdd}
      />
    </div>
  );
}
