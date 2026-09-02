'use client';

import React, { useState } from 'react';
import { X } from 'lucide-react';
import AppModal from '@/components/ui/AppModal';
import AppButton from '@/components/ui/AppButton';
import AppInput from '@/components/ui/AppInput';
import AppDropdown from '@/components/ui/AppDropdown';
import { RESOURCE_TYPE_OPTIONS } from '@/lib/trainer/resourceTypeMeta';

export interface ResourceModalInitial {
  title: string;
  url: string;
  type: string;
}

export interface ResourceModalProps {
  open: boolean;
  initial?: ResourceModalInitial | null;
  saving?: boolean;
  onClose: () => void;
  onSubmit: (data: { title: string; url: string; type: string }) => void;
}

export default function ResourceModal({
  open,
  initial,
  saving = false,
  onClose,
  onSubmit,
}: ResourceModalProps) {
  const isEdit = !!initial;

  const [title, setTitle] = useState(initial?.title ?? '');
  const [url, setUrl] = useState(initial?.url ?? '');
  const [type, setType] = useState(initial?.type ?? '');

  const reset = () => {
    setTitle(initial?.title ?? '');
    setUrl(initial?.url ?? '');
    setType(initial?.type ?? '');
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const isSubmitDisabled = title.trim().length < 2 || !url.trim() || !type;

  const handleSubmit = () => {
    if (isSubmitDisabled) return;
    onSubmit({ title: title.trim(), url: url.trim(), type });
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
            {isEdit ? 'Save changes' : 'Add resource'}
          </AppButton>
        </div>
      }
    >
      <div className="flex flex-col gap-5 p-6">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="h6-b text-text">
              {isEdit ? 'Edit resource' : 'Add resource'}
            </h3>
            <p className="b2-r mt-1 text-text-secondary">
              {isEdit
                ? "Update this resource's details."
                : 'Add a learning resource for learners in this course.'}
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
              Title <span className="text-error">*</span>
            </span>
          }
          placeholder="Data Analysis Fundamentals Guide"
          value={title}
          maxLength={200}
          showCharCount
          onChange={(e) => setTitle(e.target.value)}
        />

        <AppInput
          label={
            <span className="b2-b text-text">
              Link <span className="text-error">*</span>
            </span>
          }
          type="url"
          inputMode="url"
          placeholder="https://example.com/resource"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
        />

        <div>
          <span className="b2-b text-text">
            Type <span className="text-error">*</span>
          </span>
          <AppDropdown
            className="mt-1.5 w-full"
            value={type}
            options={RESOURCE_TYPE_OPTIONS}
            onChange={setType}
            placeholder="Select a resource type"
            ariaLabel="Resource type"
          />
        </div>
      </div>
    </AppModal>
  );
}
