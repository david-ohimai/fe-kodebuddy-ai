'use client';

import React, { useState } from 'react';
import { Calendar, X } from 'lucide-react';
import AppModal from '@/components/ui/AppModal';
import AppButton from '@/components/ui/AppButton';
import AppInput from '@/components/ui/AppInput';
import AppTextarea from '@/components/ui/AppTextarea';

export interface AssignmentModalInitial {
  title: string;
  description: string;
  instructionsText: string;
  requirementsText: string;
  startDate: string;
  dueDate: string;
  maximumScore: number;
}

export interface AssignmentModalSubmit {
  title: string;
  description: string;
  instructionsText?: string;
  requirementsText?: string;
  startDate: string;
  dueDate: string;
  maximumScore: number;
}

export interface AssignmentModalProps {
  open: boolean;
  mode: 'add' | 'edit';
  initial?: AssignmentModalInitial;
  saving?: boolean;
  onClose: () => void;
  onSubmit: (data: AssignmentModalSubmit) => void;
}

function today() {
  return new Date().toISOString().split('T')[0];
}

function toStartOfDayIso(dateOnly: string): string {
  return new Date(`${dateOnly}T00:00:00`).toISOString();
}

function toEndOfDayIso(dateOnly: string): string {
  return new Date(`${dateOnly}T23:59:59`).toISOString();
}

export default function AssignmentModal({
  open,
  mode,
  initial,
  saving = false,
  onClose,
  onSubmit,
}: AssignmentModalProps) {
  const isEdit = mode === 'edit';

  const [title, setTitle] = useState(initial?.title ?? '');
  const [description, setDescription] = useState(initial?.description ?? '');
  const [instructionsText, setInstructionsText] = useState(
    initial?.instructionsText ?? '',
  );
  const [requirementsText, setRequirementsText] = useState(
    initial?.requirementsText ?? '',
  );
  const [startDate, setStartDate] = useState(initial?.startDate ?? today());
  const [dueDate, setDueDate] = useState(initial?.dueDate ?? '');
  const [maximumScore, setMaximumScore] = useState(
    initial?.maximumScore !== undefined ? String(initial.maximumScore) : '100',
  );

  const reset = () => {
    setTitle(initial?.title ?? '');
    setDescription(initial?.description ?? '');
    setInstructionsText(initial?.instructionsText ?? '');
    setRequirementsText(initial?.requirementsText ?? '');
    setStartDate(initial?.startDate ?? today());
    setDueDate(initial?.dueDate ?? '');
    setMaximumScore(
      initial?.maximumScore !== undefined
        ? String(initial.maximumScore)
        : '100',
    );
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setStartDate(value);
    if (dueDate && value && dueDate < value) {
      setDueDate('');
    }
  };

  const maximumScoreValue = Number(maximumScore);
  const isMaximumScoreValid =
    maximumScore.trim().length > 0 &&
    Number.isFinite(maximumScoreValue) &&
    maximumScoreValue > 0;

  const isSubmitDisabled =
    !title.trim() ||
    !startDate ||
    !dueDate ||
    !isMaximumScoreValid ||
    (isEdit &&
      (!description.trim() ||
        !instructionsText.trim() ||
        !requirementsText.trim()));

  const handleSubmit = () => {
    if (isSubmitDisabled) return;
    onSubmit({
      title: title.trim(),
      description: description.trim(),
      startDate: toStartOfDayIso(startDate),
      dueDate: toEndOfDayIso(dueDate),
      maximumScore: maximumScoreValue,
      ...(isEdit
        ? {
            instructionsText: instructionsText.trim(),
            requirementsText: requirementsText.trim(),
          }
        : {}),
    });
  };

  return (
    <AppModal
      open={open}
      onClose={handleClose}
      maxWidth={640}
      showCloseButton={false}
      footer={
        <div className="flex justify-end gap-3">
          <AppButton
            variant="outlined"
            color="neutral"
            radius="full"
            onClick={handleClose}
          >
            Cancel
          </AppButton>
          <AppButton
            radius="full"
            loading={saving}
            disabled={isSubmitDisabled}
            onClick={handleSubmit}
          >
            {isEdit ? 'Save changes' : 'Add assignment'}
          </AppButton>
        </div>
      }
    >
      <div className="flex flex-col gap-5 p-6">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="h6-b text-text">
              {isEdit ? 'Edit assignment' : 'Add assignment'}
            </h3>
            <p className="b2-r mt-1 text-text-secondary">
              {isEdit
                ? 'Update the details of this assignment.'
                : 'Create a new assignment for this course.'}
            </p>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="rounded-full p-1 text-text-secondary hover:bg-disabled hover:text-text"
            aria-label="Close modal"
          >
            <X size={20} />
          </button>
        </div>

        <AppInput
          label={
            <span className="b2-b text-text">
              Assignment title <span className="text-error">*</span>
            </span>
          }
          hint="Give your module a clear and descriptive title."
          placeholder="e.g. Data types and their examples"
          value={title}
          maxLength={200}
          showCharCount
          onChange={(e) => setTitle(e.target.value)}
        />

        <AppTextarea
          label={
            <span className="b2-b text-text">
              Assignment description{' '}
              {isEdit ? (
                <span className="text-error">*</span>
              ) : (
                <span className="f1-r font-normal text-muted">(optional)</span>
              )}
            </span>
          }
          hint="Provide a brief description of the assignment."
          placeholder="Enter assignment description"
          value={description}
          maxLength={500}
          showCharCount
          rows={3}
          onChange={(e) => setDescription(e.target.value)}
        />

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <AppInput
            label={
              <span className="b2-b text-text">
                Start date <span className="text-error">*</span>
              </span>
            }
            hint="When this opens up to learners."
            type="date"
            icon={Calendar}
            value={startDate}
            onChange={handleStartDateChange}
          />

          <AppInput
            label={
              <span className="b2-b text-text">
                Due date <span className="text-error">*</span>
              </span>
            }
            hint="Last day learners can submit."
            type="date"
            icon={Calendar}
            min={startDate || today()}
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
          />
        </div>

        <AppInput
          label={
            <span className="b2-b text-text">
              Maximum score <span className="text-error">*</span>
            </span>
          }
          hint="The score a fully correct submission earns."
          type="number"
          min={1}
          step={1}
          placeholder="100"
          value={maximumScore}
          containerClassName="max-w-[200px]"
          onChange={(e) => setMaximumScore(e.target.value)}
        />

        {isEdit && (
          <>
            <AppTextarea
              label={
                <span className="b2-b text-text">
                  Instructions <span className="text-error">*</span>
                </span>
              }
              hint="Walk learners through what to do, step by step."
              placeholder="Enter assignment instructions"
              value={instructionsText}
              maxLength={2000}
              showCharCount
              rows={5}
              onChange={(e) => setInstructionsText(e.target.value)}
            />

            <AppTextarea
              label={
                <span className="b2-b text-text">
                  Requirements <span className="text-error">*</span>
                </span>
              }
              hint="One requirement per line."
              placeholder="Enter assignment requirements"
              value={requirementsText}
              maxLength={1000}
              showCharCount
              rows={4}
              onChange={(e) => setRequirementsText(e.target.value)}
            />
          </>
        )}
      </div>
    </AppModal>
  );
}
