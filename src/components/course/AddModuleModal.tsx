'use client';

import React, { useState } from 'react';
import { X } from 'lucide-react';
import AppButton from '@/components/ui/AppButton';
import AppInput from '@/components/ui/AppInput';
import AppTextarea from '@/components/ui/AppTextarea';
import AppModal from '@/components/ui/AppModal';

interface AddModuleModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: { title: string; description?: string }) => void;
  initialTitle?: string;
  initialDescription?: string;
  submitLabel?: string;
}

const AddModuleModal: React.FC<AddModuleModalProps> = ({
  open,
  onClose,
  onSubmit,
  initialTitle = '',
  initialDescription = '',
  submitLabel = 'Add module',
}) => {
  const [title, setTitle] = useState(initialTitle);
  const [description, setDescription] = useState(initialDescription);

  const handleClose = () => {
    setTitle(initialTitle);
    setDescription(initialDescription);
    onClose();
  };

  const handleSubmit = () => {
    const trimmedTitle = title.trim();

    if (!trimmedTitle) {
      return;
    }

    onSubmit({
      title: trimmedTitle,
      description: description.trim() || undefined,
    });

    setTitle(initialTitle);
    setDescription(initialDescription);
  };

  const isSubmitDisabled = !title.trim();
  const isEdit = !!initialTitle;

  return (
    <AppModal
      open={open}
      onClose={handleClose}
      maxWidth={823}
      showCloseButton={false}
      footer={
        <div className="flex justify-end gap-3 px-6 pb-6">
          <AppButton
            variant="outlined"
            color="neutral"
            size="medium"
            radius="full"
            className="min-w-28"
            onClick={handleClose}
          >
            Cancel
          </AppButton>

          <AppButton
            variant="contained"
            color="primary"
            size="medium"
            radius="full"
            className="min-w-28"
            disabled={isSubmitDisabled}
            onClick={handleSubmit}
          >
            {submitLabel}
          </AppButton>
        </div>
      }
    >
      <div className="flex flex-col gap-6 p-6">
        <div className="flex items-start justify-between">
          <div className="flex flex-col gap-1">
            <h3 className="h6-b text-text">
              {isEdit ? 'Edit module' : 'Add module'}
            </h3>
            <p className="b2-r text-text-secondary">
              {isEdit
                ? 'Update this module\u2019s title and description.'
                : 'Create a new module to organise your course lessons.'}
            </p>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="rounded-full p-1 text-text-secondary transition-colors hover:bg-gray-100 hover:text-text"
            aria-label="Close modal"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex flex-col gap-5">
          <AppInput
            label={
              <div className="flex flex-col gap-0.5">
                <span className="b2-b text-text">
                  Module title <span className="text-error">*</span>
                </span>
                <span className="f1-r font-normal text-muted">
                  Give your module a clear and descriptive title.
                </span>
              </div>
            }
            placeholder="Enter module title"
            value={title}
            maxLength={100}
            showCharCount
            onChange={(e) => setTitle(e.target.value)}
          />

          <AppTextarea
            label={
              <div className="flex flex-col gap-0.5">
                <span className="b2-b text-text">
                  Module description (optional)
                </span>
                <span className="f1-r font-normal text-muted">
                  Provide a short description of what learners will learn in
                  this module.
                </span>
              </div>
            }
            placeholder="Enter module description"
            value={description}
            maxLength={300}
            showCharCount
            rows={3}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>
      </div>
    </AppModal>
  );
};

export default AddModuleModal;
