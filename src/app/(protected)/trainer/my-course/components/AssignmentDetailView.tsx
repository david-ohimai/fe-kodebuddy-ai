'use client';

import React, { useState } from 'react';
import { ArrowLeft, Pencil, Trash2 } from 'lucide-react';
import { AppCard } from '@/components/ui/AppCard';
import AppButton from '@/components/ui/AppButton';
import AppPill from '@/components/ui/AppPill';
import AppSpinner from '@/components/ui/AppSpinner';
import AppEmptyState from '@/components/ui/AppEmptyState';
import { useToast } from '@/components/ui/ToastProvider';
import { getErrorMessage } from '@/lib/api/client';
import { useAssignmentSubmissions } from '@/lib/trainer/useAssignmentSubmissions';
import GradeSubmissionModal from './GradeSubmissionModal';
import type { CourseAssignment } from '@/lib/api/assignments.api';
import type { SubmissionWithLearner } from '@/lib/trainer/useAssignmentSubmissions';

export interface AssignmentDetailViewProps {
  courseId: number;
  courseName: string;
  assignment: CourseAssignment;
  onBack: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

function formatDate(iso: string) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export default function AssignmentDetailView({
  courseId,
  courseName,
  assignment,
  onBack,
  onEdit,
  onDelete,
}: AssignmentDetailViewProps) {
  const { showError } = useToast();
  const { submissions, loading, grading, gradeSubmission } =
    useAssignmentSubmissions(assignment.id, courseId);
  const [gradingSubmission, setGradingSubmission] =
    useState<SubmissionWithLearner | null>(null);

  const instructionsText = assignment.instructions[0]?.description?.trim();
  const requirementLines = assignment.requirements
    .map((r) => r.title.trim())
    .filter(Boolean);

  const handleGrade = async (data: { score: number; feedback?: string }) => {
    if (!gradingSubmission) return;
    try {
      await gradeSubmission(gradingSubmission, data);
      setGradingSubmission(null);
    } catch (err) {
      showError(
        'Could not save grade',
        getErrorMessage(err, 'Please try again.'),
      );
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <button
        type="button"
        onClick={onBack}
        className="b2-b inline-flex w-fit items-center gap-1.5 text-primary hover:underline"
      >
        <ArrowLeft size={16} /> Back to assignments
      </button>

      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="h5-b text-text">Assignment Details</h1>
          <p className="b2-r text-text-secondary">
            Review the assignment&apos;s details, or edit them below.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <AppButton
            variant="outlined"
            color="error"
            size="small"
            radius="full"
            startIcon={<Trash2 size={14} />}
            onClick={onDelete}
          >
            Delete
          </AppButton>
          <AppButton
            variant="outlined"
            size="small"
            radius="full"
            startIcon={<Pencil size={14} />}
            onClick={onEdit}
          >
            Edit assignment
          </AppButton>
        </div>
      </div>

      <AppCard padding="lg">
        <p className="f1-b text-muted">TITLE</p>
        <h2 className="h5-b mt-1 text-text">{assignment.title}</h2>
        <p className="f1-b mt-4 text-muted">COURSE</p>
        <h3 className="h6-b mt-1 text-text">{courseName}</h3>

        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div>
            <p className="f1-b text-muted">START DATE</p>
            <p className="b2-m mt-1 text-text">
              {formatDate(assignment.startDate)}
            </p>
          </div>
          <div>
            <p className="f1-b text-muted">DUE DATE</p>
            <p className="b2-m mt-1 text-text">
              {formatDate(assignment.dueDate)}
            </p>
          </div>
          <div>
            <p className="f1-b text-muted">MAXIMUM SCORE</p>
            <p className="b2-m mt-1 text-text">{assignment.maximumScore}</p>
          </div>
        </div>
      </AppCard>

      <AppCard padding="lg">
        <h3 className="h6-b text-text">Description</h3>
        <hr className="mt-4 mb-6 border-disabled" />
        {assignment.description ? (
          <p className="b1-r whitespace-pre-wrap text-text">
            {assignment.description}
          </p>
        ) : (
          <p className="b2-r text-muted">No description added yet.</p>
        )}
      </AppCard>

      {instructionsText && (
        <AppCard padding="lg">
          <div className="rounded-btn bg-primary-light px-4 py-3">
            <p className="b1-m text-text">Instructions</p>
          </div>
          <p className="b1-r mt-4 whitespace-pre-wrap text-text">
            {instructionsText}
          </p>
        </AppCard>
      )}

      {requirementLines.length > 0 && (
        <AppCard padding="lg">
          <div className="rounded-btn bg-primary-light px-4 py-3">
            <p className="b1-m text-text">Requirements</p>
          </div>
          <ol className="mt-4 flex list-decimal flex-col gap-2 pl-5">
            {requirementLines.map((line, index) => (
              <li key={index} className="b1-r text-text">
                {line}
              </li>
            ))}
          </ol>
        </AppCard>
      )}

      <AppCard padding="none">
        <div className="border-b border-disabled p-5 sm:p-6">
          <p className="b2-b text-text">Submissions</p>
          <p className="f1-r text-muted">
            {loading
              ? 'Loading submissions…'
              : `${submissions.length} learner${submissions.length === 1 ? '' : 's'} submitted so far.`}
          </p>
        </div>

        {loading ? (
          <div className="flex min-h-[200px] items-center justify-center">
            <AppSpinner size={32} />
          </div>
        ) : submissions.length === 0 ? (
          <AppEmptyState
            title="No submissions yet"
            description="Submissions will show up here as learners turn in their work."
            className="!min-h-0 py-14"
          />
        ) : (
          <ul className="divide-y divide-disabled">
            {submissions.map((submission) => {
              const isGraded =
                submission.score !== null && submission.score !== undefined;
              return (
                <li
                  key={submission.id}
                  className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 sm:px-6"
                >
                  <div className="flex items-center gap-3">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary-light b2-b text-primary">
                      {(
                        submission.learnerName ||
                        submission.learnerEmail ||
                        '?'
                      )
                        .charAt(0)
                        .toUpperCase()}
                    </span>
                    <div className="min-w-0">
                      <p className="b2-m truncate text-text">
                        {submission.learnerName ||
                          submission.learnerEmail ||
                          'Unknown learner'}
                      </p>
                      <p className="f1-r text-muted">
                        Submitted {formatDate(submission.submittedAt)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {isGraded ? (
                      <AppPill
                        label={`${submission.score}/${assignment.maximumScore}`}
                        color="success"
                      />
                    ) : (
                      <AppPill label="Ungraded" color="warning" />
                    )}
                    <AppButton
                      variant={isGraded ? 'outlined' : 'contained'}
                      size="small"
                      radius="full"
                      onClick={() => setGradingSubmission(submission)}
                    >
                      {isGraded ? 'Edit grade' : 'Grade'}
                    </AppButton>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </AppCard>

      <GradeSubmissionModal
        open={!!gradingSubmission}
        submission={gradingSubmission}
        maximumScore={assignment.maximumScore}
        saving={grading}
        onClose={() => setGradingSubmission(null)}
        onSubmit={handleGrade}
      />
    </div>
  );
}
