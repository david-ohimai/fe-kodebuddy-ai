'use client';

import React, { useRef, useState } from 'react';
import { X, Upload, Check } from 'lucide-react';
import AppButton from '@/components/ui/AppButton';
import AppInput from '@/components/ui/AppInput';
import AppModal from '@/components/ui/AppModal';
import AppTextarea from '@/components/ui/AppTextarea';
import {
  CONTENT_TYPES,
  CONTENT_TYPE_META,
  type LessonContentType,
} from '@/types/lesson-content.types';

export interface LessonToEdit {
  id: string;
  title: string;
  description?: string;
  contentType: LessonContentType;
  fileName?: string;
  fileSize?: string;
  resourceUrl?: string;
  articleContent?: string;
}

export interface LessonModalProps {
  open: boolean;
  moduleTitle: string;
  lesson?: LessonToEdit | null;
  onClose: () => void;
  onSubmit: (data: {
    title: string;
    description?: string;
    contentType: LessonContentType;
    file?: File;
    fileName?: string;
    fileSize?: string;
    resourceUrl?: string;
    articleContent?: string;
  }) => void;
}

const formatFileSize = (bytes: number) =>
  `${(bytes / (1024 * 1024)).toFixed(1)} MB`;

const LessonModal: React.FC<LessonModalProps> = ({
  open,
  moduleTitle,
  lesson,
  onClose,
  onSubmit,
}) => {
  const isEdit = !!lesson;

  const [title, setTitle] = useState(lesson?.title ?? '');
  const [description, setDescription] = useState(lesson?.description ?? '');
  const [contentType, setContentType] = useState<LessonContentType>(
    lesson?.contentType ?? 'document',
  );
  const [fileName, setFileName] = useState<string | undefined>(
    lesson?.fileName,
  );
  const [fileSize, setFileSize] = useState<string | undefined>(
    lesson?.fileSize,
  );
  const [file, setFile] = useState<File | undefined>(undefined);
  const [resourceUrl, setResourceUrl] = useState(lesson?.resourceUrl ?? '');
  const [articleContent, setArticleContent] = useState(
    lesson?.articleContent ?? '',
  );

  const [initialTitle] = useState(lesson?.title ?? '');
  const [initialDescription] = useState(lesson?.description);
  const [initialFileName] = useState(lesson?.fileName);
  const [initialContentType] = useState(lesson?.contentType);
  const [initialResourceUrl] = useState(lesson?.resourceUrl);
  const [initialArticleContent] = useState(lesson?.articleContent);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const reset = () => {
    setTitle(lesson?.title ?? '');
    setDescription(lesson?.description ?? '');
    setContentType(lesson?.contentType ?? 'document');
    setFileName(lesson?.fileName);
    setFileSize(lesson?.fileSize);
    setFile(undefined);
    setResourceUrl(lesson?.resourceUrl ?? '');
    setArticleContent(lesson?.articleContent ?? '');
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;
    setFile(selected);
    setFileName(selected.name);
    setFileSize(formatFileSize(selected.size));
    e.target.value = '';
  };

  const hasResource =
    isEdit ||
    (contentType === 'document'
      ? Boolean(file || fileName)
      : contentType === 'link'
        ? Boolean(resourceUrl.trim())
        : Boolean(articleContent.trim()));
  const isSubmitDisabled = !title.trim() || !hasResource;
  const isDirty =
    !isEdit ||
    title.trim() !== initialTitle ||
    (description.trim() || undefined) !== initialDescription ||
    fileName !== initialFileName ||
    contentType !== initialContentType ||
    resourceUrl.trim() !== (initialResourceUrl ?? '') ||
    articleContent.trim() !== (initialArticleContent ?? '');

  const handleSubmit = () => {
    if (isSubmitDisabled) return;

    if (isEdit && !isDirty) {
      onClose();
      return;
    }

    onSubmit({
      title: title.trim(),
      description: description.trim() || undefined,
      contentType,
      file,
      fileName,
      fileSize,
      resourceUrl: resourceUrl.trim() || undefined,
      articleContent: articleContent.trim() || undefined,
    });
    reset();
  };

  const activeMeta = CONTENT_TYPE_META[contentType];

  return (
    <AppModal
      open={open}
      onClose={handleClose}
      maxWidth={isEdit ? 560 : 640}
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
            {isEdit ? 'Save changes' : 'Add lesson'}
          </AppButton>
        </div>
      }
    >
      <div className="flex flex-col gap-6 p-6">
        <div className="flex items-start justify-between">
          <div className="flex flex-col gap-1">
            <h3 className="h6-b text-text">
              {isEdit ? 'Edit Lesson' : 'Add lesson'}
            </h3>
            <p className="b2-r text-text-secondary">
              {isEdit
                ? 'Update the lesson information below.'
                : `Create a new lesson under "${moduleTitle}".`}
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
            showCharCount
            onChange={(e) => setTitle(e.target.value)}
          />

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
            showCharCount
            onChange={(e) => setDescription(e.target.value)}
          />

          <div className="flex flex-col gap-1.5">
            <div className="flex flex-col gap-0.5">
              <span className="b2-b text-text">
                Content / resource <span className="text-error">*</span>
              </span>
              <span className="f1-r text-muted">
                Choose the type of resource for this lesson.
              </span>
            </div>

            <div className="mt-2 grid grid-cols-1 gap-3 sm:grid-cols-3">
              {CONTENT_TYPES.map((option) => {
                const isSelected = contentType === option.type;
                return (
                  <button
                    key={option.type}
                    type="button"
                    onClick={() => {
                      setContentType(option.type);
                      setFile(undefined);
                      setFileName(undefined);
                      setFileSize(undefined);
                      setResourceUrl('');
                      setArticleContent('');
                    }}
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
                      <span className="f1-r text-muted">
                        {option.description}
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {contentType === 'document' ? (
            <div className="flex flex-col gap-2">
              <input
                ref={fileInputRef}
                type="file"
                accept="application/pdf,.doc,.docx,.ppt,.pptx"
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
                {fileName ? 'Replace document' : 'Upload document'}
              </AppButton>

              {fileName ? (
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
                    <p className="b2-m truncate text-text">{fileName}</p>
                    {fileSize && <p className="f1-r text-muted">{fileSize}</p>}
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setFileName(undefined);
                      setFileSize(undefined);
                      setFile(undefined);
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
                Upload a PDF, Word document, or presentation for this lesson.
              </p>
            </div>
          ) : contentType === 'link' ? (
            <AppInput
              label="Resource link"
              placeholder="https://example.com/resource"
              type="url"
              value={resourceUrl}
              onChange={(e) => setResourceUrl(e.target.value)}
            />
          ) : (
            <AppTextarea
              label="Article content"
              placeholder="Write the article content for this lesson"
              value={articleContent}
              maxLength={5000}
              showCharCount
              onChange={(e) => setArticleContent(e.target.value)}
            />
          )}
        </div>
      </div>
    </AppModal>
  );
};

export default LessonModal;
