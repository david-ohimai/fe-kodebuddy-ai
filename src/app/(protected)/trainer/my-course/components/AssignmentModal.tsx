'use client';

import React, { useState } from 'react';
import { X } from 'lucide-react';
import AppModal from '@/components/ui/AppModal';
import AppButton from '@/components/ui/AppButton';
import AppInput from '@/components/ui/AppInput';
import AppTextarea from '@/components/ui/AppTextarea';

export interface AssignmentModalInitial {
  title: string;
  description: string;
  instructionsText: string;
  requirementsText: string;
}

export interface AssignmentModalSubmit {
  title: string;
  description: string;
  instructionsText?: string;
  requirementsText?: string;
}

export interface AssignmentModalProps {
  open: boolean;
  mode: 'add' | 'edit';
  initial?: AssignmentModalInitial;
  saving?: boolean;
  onClose: () => void;
  onSubmit: (data: AssignmentModalSubmit) => void;
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

  const reset = () => {
    setTitle(initial?.title ?? '');
    setDescription(initial?.description ?? '');
    setInstructionsText(initial?.instructionsText ?? '');
    setRequirementsText(initial?.requirementsText ?? '');
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const isSubmitDisabled = isEdit
    ? !title.trim() ||
      !description.trim() ||
      !instructionsText.trim() ||
      !requirementsText.trim()
    : !title.trim();

  const handleSubmit = () => {
    if (isSubmitDisabled) return;
    onSubmit({
      title: title.trim(),
      description: description.trim(),
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
