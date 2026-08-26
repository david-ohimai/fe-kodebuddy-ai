'use client';

import React, { useRef, useState } from 'react';
import { X, Upload, Check } from 'lucide-react';
import AppButton from '@/components/ui/AppButton';
import AppInput from '@/components/ui/AppInput';
import AppModal from '@/components/ui/AppModal';
import { CONTENT_TYPES, CONTENT_TYPE_META, type LessonContentType } from '@/types/lesson-content.types';

interface AddLessonModalProps {
  open: boolean;
  moduleTitle: string;
  onClose: () => void;
  onSubmit: (data: {
    title: string;
    description?: string;
    contentType: LessonContentType;
    file?: File;
    fileName?: string;
    fileSize?: string;
  }) => void;
}

const formatFileSize = (bytes: number) => `${(bytes / (1024 * 1024)).toFixed(1)} MB`;

const AddLessonModal: React.FC<AddLessonModalProps> = ({
  open,
  moduleTitle,
  onClose,
  onSubmit,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [contentType, setContentType] = useState<LessonContentType>('video');
  const [file, setFile] = useState<File | undefined>(undefined);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const reset = () => {
    setTitle('');
    setDescription('');
    setContentType('video');
    setFile(undefined);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) setFile(selected);
    e.target.value = '';
  };

  const handleSubmit = () => {
    const trimmedTitle = title.trim();
    if (!trimmedTitle) return;

    onSubmit({
      title: trimmedTitle,
      description: description.trim() || undefined,
      contentType,
      file,
      fileName: file?.name,
      fileSize: file ? formatFileSize(file.size) : undefined,
    });
    reset();
  };

  const isSubmitDisabled = !title.trim();
  const activeMeta = CONTENT_TYPE_META[contentType];

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
            Add lesson
          </AppButton>
        </div>
      }
    >
      <div className="flex flex-col gap-6 p-6">
        <div className="flex items-start justify-between">
          <div className="flex flex-col gap-1">
            <h3 className="h6-b text-text">Add lesson</h3>
            <p className="b2-r text-text-secondary">
              Create a new lesson under &quot;{moduleTitle}&quot;.
            </p>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="rounded-full p-1 text-text-secondary transition-colors hover:bg-disabled hover:text-text"
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
                    Lesson title <span className="text-error">*</span>
                  </span>
                  <span className="f1-r font-normal text-muted">
                    Give your lesson a clear and descriptive title.
                  </span>
                </div>
              }
              placeholder="Enter lesson title"
              value={title}
              maxLength={100}
              onChange={(e) => setTitle(e.target.value)}
            />
            <div className="mt-1 flex justify-end">
              <span className="f2-r text-muted">{title.length}/100</span>
            </div>
          </div>

          <div className="flex flex-col">
            <AppInput
              label={
                <div className="flex flex-col gap-0.5">
                  <span className="b2-b text-text">Description</span>
                  <span className="f1-r font-normal text-muted">
                    Provide a short description of what this lesson covers.
                  </span>
                </div>
              }
              placeholder="Enter lesson description"
              value={description}
              maxLength={100}
              onChange={(e) => setDescription(e.target.value)}
            />
            <div className="mt-1 flex justify-end">
              <span className="f2-r text-muted">{description.length}/100</span>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <div className="flex flex-col gap-0.5">
              <span className="b2-b text-text">
                Content / resource <span className="text-error">*</span>
              </span>
              <span className="f1-r text-muted">
                Choose the type of content you want to add for this lesson.
              </span>
            </div>

            {file ? (
              <div className="flex items-center gap-3 rounded-input bg-disabled/40 px-3.5 py-2.5">
                <span
                  className={
                    'flex h-8 w-8 shrink-0 items-center justify-center rounded ' +
                    activeMeta.tint
                  }
                >
                  {activeMeta.icon}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="b2-m truncate text-text">{file.name}</p>
                  <p className="f1-r text-muted">{formatFileSize(file.size)}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setFile(undefined)}
                  aria-label="Remove file"
                  className="shrink-0 text-muted hover:text-text"
                >
                  <X size={16} />
                </button>
              </div>
            ) : (
              <>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="video/*,application/pdf,.doc,.docx,.ppt,.pptx"
                  className="hidden"
                  onChange={handleFileChange}
                />
                <AppButton
                  variant="outlined"
                  size="small"
                  radius="full"
                  startIcon={<Upload size={14} />}
                  className="w-fit"
                  onClick={() => fileInputRef.current?.click()}
                >
                  Upload content
                </AppButton>
              </>
            )}

            <div className="mt-2 grid grid-cols-1 gap-3 sm:grid-cols-2">
              {CONTENT_TYPES.map((option) => {
                const isSelected = contentType === option.type;
                return (
                  <button
                    key={option.type}
                    type="button"
                    onClick={() => setContentType(option.type)}
                    className={
                      'relative flex items-start gap-3 rounded-input border p-3.5 text-left transition-colors ' +
                      (isSelected
                        ? 'border-primary bg-primary-light'
                        : 'border-disabled hover:border-muted')
                    }
                  >
                    <span
                      className={
                        'absolute right-3 top-3 flex h-4 w-4 items-center justify-center rounded border ' +
                        (isSelected
                          ? 'border-primary bg-primary text-background'
                          : 'border-disabled bg-background')
                      }
                    >
                      {isSelected && <Check size={12} strokeWidth={3} />}
                    </span>

                    <span
                      className={
                        'flex h-9 w-9 shrink-0 items-center justify-center rounded-full ' +
                        option.tint
                      }
                    >
                      {option.icon}
                    </span>

                    <span className="flex flex-col gap-0.5 pr-4">
                      <span className="b2-b text-text">{option.label}</span>
                      <span className="f1-r text-muted">{option.description}</span>
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <p className="f1-r text-muted">
            You can add or update the content after saving the lesson.
          </p>
        </div>
      </div>
    </AppModal>
  );
};

export default AddLessonModal;
