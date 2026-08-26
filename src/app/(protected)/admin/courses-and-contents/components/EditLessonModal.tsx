'use client';

import React, { useRef, useState } from 'react';
import { Upload, X } from 'lucide-react';
import AppButton from '@/components/ui/AppButton';
import AppInput from '@/components/ui/AppInput';
import AppModal from '@/components/ui/AppModal';
import { CONTENT_TYPE_META, type LessonContentType } from '@/types/lesson-content.types';

export interface LessonToEdit {
  id: string;
  title: string;
  description?: string;
  contentType: LessonContentType;
  fileName?: string;
  fileSize?: string;
}

interface EditLessonModalProps {
  open: boolean;
  lesson: LessonToEdit | null;
  onClose: () => void;
  onSave: (data: {
    id: string;
    title: string;
    description?: string;
    fileName?: string;
    fileSize?: string;
    file?: File;
  }) => void;
}

const formatFileSize = (bytes: number) => `${(bytes / (1024 * 1024)).toFixed(1)} MB`;

const EditLessonModal: React.FC<EditLessonModalProps> = ({
  open,
  lesson,
  onClose,
  onSave,
}) => {

  const [title, setTitle] = useState(lesson?.title ?? '');
  const [description, setDescription] = useState(lesson?.description ?? '');
  const [fileName, setFileName] = useState<string | undefined>(lesson?.fileName);
  const [fileSize, setFileSize] = useState<string | undefined>(lesson?.fileSize);
  const [newFile, setNewFile] = useState<File | undefined>(undefined);

  const [initialTitle] = useState(lesson?.title ?? '');
  const [initialDescription] = useState(lesson?.description);
  const [initialFileName] = useState(lesson?.fileName);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!lesson) return null;

  const meta = CONTENT_TYPE_META[lesson.contentType];
  const isSaveDisabled = !title.trim();

  const isDirty =
    title.trim() !== initialTitle ||
    (description.trim() || undefined) !== initialDescription ||
    fileName !== initialFileName;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setNewFile(file);
    setFileName(file.name);
    setFileSize(formatFileSize(file.size));
    e.target.value = '';
  };

  const handleSave = () => {
    if (isSaveDisabled) return;
    
    if (!isDirty) {
      onClose();
      return;
    }

    onSave({
      id: lesson.id,
      title: title.trim(),
      description: description.trim() || undefined,
      fileName,
      fileSize,
      file: newFile,
    });
  };

  return (
    <AppModal
      open={open}
      onClose={onClose}
      maxWidth={560}
      showCloseButton={false}
      footer={
        <div className="flex justify-end gap-3">
          <AppButton
            variant="outlined"
            color="neutral"
            size="medium"
            radius="full"
            className="min-w-28"
            onClick={onClose}
          >
            Cancel
          </AppButton>
          <AppButton
            variant="contained"
            color="primary"
            size="medium"
            radius="full"
            className="min-w-28"
            disabled={isSaveDisabled}
            onClick={handleSave}
          >
            Save changes
          </AppButton>
        </div>
      }
    >
      <div className="flex flex-col">
        <div className="flex items-start justify-between border-b border-disabled px-6 py-5">
          <div className="flex flex-col gap-1">
            <h3 className="h6-b text-text">Edit Lesson</h3>
            <p className="b2-r text-text-secondary">
              Update the lesson information below.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1 text-text-secondary transition-colors hover:bg-disabled hover:text-text"
            aria-label="Close modal"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex flex-col gap-5 px-6 py-6">
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

          <div className="flex flex-col gap-2">
            <span className="b2-b text-text">
              Content / Resource <span className="text-error">*</span>
            </span>

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
              Replace content
            </AppButton>

            {fileName ? (
              <div className="flex items-center gap-3 rounded-input bg-disabled/40 px-3.5 py-2.5">
                <span
                  className={
                    'flex h-8 w-8 shrink-0 items-center justify-center rounded ' +
                    meta.tint
                  }
                >
                  {meta.icon}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="b2-m truncate text-text">{fileName}</p>
                  {fileSize && <p className="f1-r text-muted">{fileSize}</p>}
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setFileName(undefined);
                    setFileSize(undefined);
                    setNewFile(undefined);
                  }}
                  aria-label="Remove file"
                  className="shrink-0 text-muted hover:text-text"
                >
                  <X size={16} />
                </button>
              </div>
            ) : (
              <p className="f1-r text-muted">No content attached yet.</p>
            )}

            <p className="f1-r text-muted">
              Upload or attach the main content for this lesson. Supported
              formats: such as Video, Document/File, or Article.
            </p>
          </div>
        </div>
      </div>
    </AppModal>
  );
};

export default EditLessonModal;
