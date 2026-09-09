'use client';

import React, { useEffect, useRef, useState } from 'react';
import { X, Upload, Check } from 'lucide-react';
import AppModal from '@/components/ui/AppModal';
import AppButton from '@/components/ui/AppButton';
import AppInput from '@/components/ui/AppInput';
import AppTextarea from '@/components/ui/AppTextarea';
import {
  CONTENT_TYPES,
  CONTENT_TYPE_META,
  type LessonContentType,
} from '@/types/lesson-content.types';

export interface ResourceModalInitial {
  title: string;
  description?: string;
  type?: string;
  url?: string;
  content?: string;
  fileName?: string;
  fileSize?: string;
}

export interface ResourceModalSubmitData {
  title: string;
  description?: string;
  type: LessonContentType;
  url?: string;
  content?: string;
  file?: File;
  fileName?: string;
  fileSize?: string;
}

export interface ResourceModalProps {
  open: boolean;
  initial?: ResourceModalInitial | null;
  saving?: boolean;
  onClose: () => void;
  onSubmit: (data: ResourceModalSubmitData) => Promise<void> | void;
}

const formatFileSize = (bytes: number) =>
  `${(bytes / (1024 * 1024)).toFixed(1)} MB`;

function isValidLink(value: string): boolean {
  const trimmed = value.trim();
  if (!trimmed) return false;

  const hasValidPrefix =
    /^https?:\/\//i.test(trimmed) || /^www\./i.test(trimmed);
  if (!hasValidPrefix) return false;

  const urlToParse = /^https?:\/\//i.test(trimmed)
    ? trimmed
    : `https://${trimmed}`;

  try {
    const url = new URL(urlToParse);
    return Boolean(
      url.hostname &&
      url.hostname.includes('.') &&
      url.hostname.length > 3 &&
      !url.hostname.endsWith('.'),
    );
  } catch {
    return false;
  }
}

function parseInitialType(raw?: string): LessonContentType {
  const lower = (raw ?? '').toLowerCase();
  if (lower === 'link' || lower.includes('link') || lower.includes('url')) {
    return 'link';
  }
  if (lower === 'article' || lower.includes('article')) {
    return 'article';
  }
  return 'document';
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
  const [description, setDescription] = useState(initial?.description ?? '');
  const [contentType, setContentType] = useState<LessonContentType>(
    parseInitialType(initial?.type),
  );
  const [file, setFile] = useState<File | undefined>(undefined);
  const [fileName, setFileName] = useState<string | undefined>(
    initial?.fileName,
  );
  const [fileSize, setFileSize] = useState<string | undefined>(
    initial?.fileSize,
  );
  const [url, setUrl] = useState(initial?.url ?? '');
  const [linkError, setLinkError] = useState<string | null>(null);
  const [content, setContent] = useState(initial?.content ?? '');

  const fileInputRef = useRef<HTMLInputElement>(null);

  const reset = () => {
    setTitle(initial?.title ?? '');
    setDescription(initial?.description ?? '');
    setContentType(parseInitialType(initial?.type));
    setFile(undefined);
    setFileName(initial?.fileName);
    setFileSize(initial?.fileSize);
    setUrl(initial?.url ?? '');
    setLinkError(null);
    setContent(initial?.content ?? '');
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (open) reset();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, initial]);

  const handleClose = () => {
    if (saving) return;
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

  const isResourceComplete =
    contentType === 'document'
      ? Boolean(file || fileName)
      : contentType === 'link'
        ? Boolean(url.trim())
        : Boolean(content.trim());

  const isSubmitDisabled = title.trim().length < 2 || !isResourceComplete;

  const handleSubmit = async () => {
    if (isSubmitDisabled || saving) return;

    if (contentType === 'link') {
      const trimmedUrl = url.trim();
      if (!isValidLink(trimmedUrl)) {
        setLinkError(
          'Please enter a valid link starting with https://, http://, or www.',
        );
        return;
      }
    }

    const finalUrl =
      contentType === 'link' && url.trim()
        ? /^https?:\/\//i.test(url.trim())
          ? url.trim()
          : `https://${url.trim()}`
        : undefined;

    await onSubmit({
      title: title.trim(),
      description: description.trim() || undefined,
      type: contentType,
      url: finalUrl,
      content:
        contentType === 'article' ? content.trim() || undefined : undefined,
      file: contentType === 'document' ? file : undefined,
      fileName: contentType === 'document' ? fileName : undefined,
      fileSize: contentType === 'document' ? fileSize : undefined,
    });
  };

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
            disabled={saving}
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
            disabled={isSubmitDisabled || saving}
            loading={saving}
            onClick={handleSubmit}
          >
            {isEdit ? 'Save changes' : 'Add resource'}
          </AppButton>
        </div>
      }
    >
      <div className="flex flex-col gap-6 p-6">
        <div className="flex items-start justify-between">
          <div className="flex flex-col gap-1">
            <h3 className="h6-b text-text">
              {isEdit ? 'Edit resource' : 'Add resource'}
            </h3>
            <p className="b2-r text-text-secondary">
              {isEdit
                ? "Update this resource's details."
                : 'Add a learning resource for learners in this course.'}
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
                  Resource title <span className="text-error">*</span>
                </span>
                <span className="f1-r font-normal text-muted">
                  Give your resource a clear and descriptive title.
                </span>
              </div>
            }
            placeholder="Enter resource title"
            value={title}
            maxLength={100}
            showCharCount
            disabled={saving}
            onChange={(e) => setTitle(e.target.value)}
          />

          <AppInput
            label={
              <div className="flex flex-col gap-0.5">
                <span className="b2-b text-text">Description</span>
                <span className="f1-r font-normal text-muted">
                  Provide a short description of what this resource covers.
                </span>
              </div>
            }
            placeholder="Enter resource description"
            value={description}
            maxLength={200}
            showCharCount
            disabled={saving}
            onChange={(e) => setDescription(e.target.value)}
          />

          <div className="flex flex-col gap-5 rounded-card border border-disabled bg-disabled/10 p-4.5">
            <div className="flex flex-col gap-1.5">
              <div className="flex flex-col gap-0.5">
                <span className="b2-b text-text">
                  Resource type <span className="text-error">*</span>
                </span>
                <span className="f1-r text-muted">
                  Choose the type of resource to attach.
                </span>
              </div>

              <div className="mt-2 grid grid-cols-1 gap-3 sm:grid-cols-3">
                {CONTENT_TYPES.map((option) => {
                  const isSelected = contentType === option.type;
                  return (
                    <button
                      key={option.type}
                      type="button"
                      disabled={saving}
                      onClick={() => {
                        setContentType(option.type);
                        setFile(undefined);
                        setFileName(undefined);
                        setFileSize(undefined);
                        setUrl('');
                        setLinkError(null);
                        setContent('');
                      }}
                      className={
                        'relative flex items-start gap-3 rounded-input border p-3.5 text-left transition-colors ' +
                        (isSelected
                          ? 'border-primary bg-primary-light'
                          : 'border-disabled bg-background hover:border-muted') +
                        (saving ? ' opacity-60 cursor-not-allowed' : '')
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
                  disabled={saving}
                  onChange={handleFileChange}
                />
                <AppButton
                  variant="outlined"
                  size="small"
                  radius="full"
                  startIcon={<Upload size={14} />}
                  className="w-fit"
                  disabled={saving}
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
                      {fileSize && (
                        <p className="f1-r text-muted">{fileSize}</p>
                      )}
                    </div>
                    <button
                      type="button"
                      disabled={saving}
                      onClick={() => {
                        setFileName(undefined);
                        setFileSize(undefined);
                        setFile(undefined);
                      }}
                      aria-label="Remove file"
                      className="shrink-0 text-muted hover:text-text disabled:opacity-50"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ) : (
                  <p className="f1-r text-muted">No content attached yet.</p>
                )}

                <p className="f1-r text-muted">
                  Upload a PDF, Word document, or presentation for this
                  resource.
                </p>
              </div>
            ) : contentType === 'link' ? (
              <AppInput
                label="Resource link"
                placeholder="https://example.com/resource"
                type="text"
                value={url}
                disabled={saving}
                error={linkError ?? undefined}
                onChange={(e) => {
                  setUrl(e.target.value);
                  if (linkError) setLinkError(null);
                }}
              />
            ) : (
              <AppTextarea
                label="Article content"
                placeholder="Write the article content for this resource"
                value={content}
                maxLength={5000}
                showCharCount
                disabled={saving}
                onChange={(e) => setContent(e.target.value)}
              />
            )}
          </div>
        </div>
      </div>
    </AppModal>
  );
}
