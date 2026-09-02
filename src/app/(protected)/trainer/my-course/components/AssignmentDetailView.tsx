import React from 'react';
import { ArrowLeft, Pencil } from 'lucide-react';
import { AppCard } from '@/components/ui/AppCard';
import AppButton from '@/components/ui/AppButton';
import type { CourseAssignment } from '@/lib/api/assignments.api';

export interface AssignmentDetailViewProps {
  courseName: string;
  assignment: CourseAssignment;
  onBack: () => void;
  onEdit: () => void;
}

export default function AssignmentDetailView({
  courseName,
  assignment,
  onBack,
  onEdit,
}: AssignmentDetailViewProps) {
  const instructionsText = assignment.instructions[0]?.description?.trim();
  const requirementLines = assignment.requirements
    .map((r) => r.title.trim())
    .filter(Boolean);

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

      <AppCard padding="lg">
        <p className="f1-b text-muted">TITLE</p>
        <h2 className="h5-b mt-1 text-text">{assignment.title}</h2>
        <p className="f1-b mt-4 text-muted">COURSE</p>
        <h3 className="h6-b mt-1 text-text">{courseName}</h3>
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
    </div>
  );
}
