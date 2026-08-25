'use client';

import React, { useState } from 'react';
import { X } from 'lucide-react';
import AppButton from '@/components/ui/AppButton';
import AppInput from '@/components/ui/AppInput';
import AppModal from '@/components/ui/AppModal';

interface AddModuleModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: { title: string; description?: string }) => void;
}

const AddModuleModal: React.FC<AddModuleModalProps> = ({
  open,
  onClose,
  onSubmit,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  const handleClose = () => {
    setTitle('');
    setDescription('');
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

    setTitle('');
    setDescription('');
  };

  const isSubmitDisabled = !title.trim();

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
            Add module
          </AppButton>
        </div>
      }
    >
      <div className="flex flex-col gap-6 p-6">
        <div className="flex items-start justify-between">
          <div className="flex flex-col gap-1">
            <h3 className="h6-b text-text">Add module</h3>
            <p className="b2-r text-text-secondary">
              Create a new module to organise your course lessons.
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
          <div className="flex flex-col">
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
              onChange={(e) => setTitle(e.target.value)}
            />
            <div className="mt-1 flex justify-end">
              <span className="f2-r text-muted">{title.length}/100</span>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="module-description" className="b2-b text-text">
              Module description (optional)
            </label>
            <p className="f1-r text-muted">
              Provide a short description of what learners will learn in this
              module.
            </p>

            <textarea
              id="module-description"
              value={description}
              maxLength={100}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter module description"
              rows={3}
              className="b2-r w-full resize-none rounded-input border border-disabled bg-background px-4 py-3 text-text outline-none transition-colors placeholder:text-muted focus:border-primary"
            />
            <div className="flex justify-end">
              <span className="f2-r text-muted">{description.length}/100</span>
            </div>
          </div>
        </div>
      </div>
    </AppModal>
  );
};

export default AddModuleModal;
