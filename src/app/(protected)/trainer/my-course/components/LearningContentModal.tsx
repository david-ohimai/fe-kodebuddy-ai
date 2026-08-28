'use client';

import React, { useState } from 'react';
import { X } from 'lucide-react';
import AppModal from '@/components/ui/AppModal';
import AppButton from '@/components/ui/AppButton';
import AppInput from '@/components/ui/AppInput';
import AppTextarea from '@/components/ui/AppTextarea';

export interface LearningContentInitial {
  id: number;
  title: string;
  content: string;
}

export interface LearningContentModalProps {
  open: boolean;
  courseName: string;
  moduleName: string;
  /** When provided, edits this item instead of creating a new one. */
  initial?: LearningContentInitial | null;
  saving?: boolean;
  onClose: () => void;
  onSubmit: (data: { title: string; content: string }) => void;
}

export default function LearningContentModal({
  open,
  courseName,
  moduleName,
  initial,
  saving = false,
  onClose,
  onSubmit,
}: LearningContentModalProps) {
  const isEdit = !!initial;

  const [title, setTitle] = useState(initial?.title ?? '');
  const [content, setContent] = useState(initial?.content ?? '');

  const reset = () => {
    setTitle(initial?.title ?? '');
    setContent(initial?.content ?? '');
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const isSubmitDisabled = !title.trim() || !content.trim();

  const handleSubmit = () => {
    if (isSubmitDisabled) return;
    onSubmit({ title: title.trim(), content: content.trim() });
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
            {isEdit ? 'Save changes' : 'Add learning content'}
          </AppButton>
        </div>
      }
    >
      <div className="flex flex-col gap-5 p-6">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="h6-b text-text">
              {isEdit ? 'Edit Learning Content' : 'Add Learning Content'}
            </h3>
            <p className="b2-r mt-1 text-text-secondary">
              {isEdit
                ? 'Update the learning content in this module.'
                : 'Add new learning content to this module.'}
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

        <div className="flex flex-wrap items-center justify-between gap-2 rounded-input bg-primary-light px-4 py-2.5">
          <p className="f1-r text-primary-dark">
            <span className="b2-b text-text">Course:</span> {courseName}
          </p>
          <p className="f1-r text-primary-dark">
            <span className="b2-b text-text">Module:</span> {moduleName}
          </p>
        </div>

        <AppInput
          label={
            <span className="b2-b text-text">
              Title <span className="text-error">*</span>
            </span>
          }
          hint="Enter a clear and descriptive title."
          placeholder="e.g. Understanding Data Types"
          value={title}
          maxLength={100}
          showCharCount
          onChange={(e) => setTitle(e.target.value)}
        />

        <AppTextarea
          label={
            <span className="b2-b text-text">
              Content <span className="text-error">*</span>
            </span>
          }
          hint="Enter the content for this learning lesson."
          placeholder="Type or paste the learning content here."
          value={content}
          maxLength={5000}
          showCharCount
          rows={8}
          onChange={(e) => setContent(e.target.value)}
        />
      </div>
    </AppModal>
  );
}
