'use client';

import React, { useRef, useState } from 'react';
import { Paperclip, X } from 'lucide-react';
import AppModal from '@/components/ui/AppModal';
import AppButton from '@/components/ui/AppButton';
import AppInput from '@/components/ui/AppInput';
import AppTextarea from '@/components/ui/AppTextarea';
import AppDropdown from '@/components/ui/AppDropdown';
import { RESOURCE_TYPE_OPTIONS } from '@/lib/trainer/resourceTypeMeta';

export interface ResourceModalInitial {
  title: string;
  url: string;
  /** A backend enum value: 'article' | 'link' | 'file'. */
  type: string;
  description?: string;
  content?: string;
  fileName?: string | null;
}

export interface ResourceModalSubmit {
  title: string;
  type: string;
  url?: string;
  description?: string;
  content?: string;
  file?: File | null;
}

export interface ResourceModalProps {
  open: boolean;
  initial?: ResourceModalInitial | null;
  saving?: boolean;
  onClose: () => void;
  onSubmit: (data: ResourceModalSubmit) => void;
}

const ACCEPTED_FILE_TYPES = '.pdf,.doc,.docx,.txt,.md';

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
  const [description, setDescription] = useState(initial?.description ?? '');
  const [content, setContent] = useState(initial?.content ?? '');
  const [file, setFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const reset = () => {
    setTitle(initial?.title ?? '');
    setUrl(initial?.url ?? '');
    setType(initial?.type ?? '');
    setDescription(initial?.description ?? '');
    setContent(initial?.content ?? '');
    setFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  // Each type carries its own required payload, matching what the backend
  // does with it: a link is fetched, an article's `content` is embedded
  // directly, a file is uploaded and parsed. On edit, an existing file may be
  // kept as-is, so a new upload is optional there.
  const hasRequiredPayload =
    type === 'link'
      ? url.trim().length > 0
      : type === 'article'
        ? content.trim().length > 0
        : type === 'file'
          ? file !== null || Boolean(initial?.fileName)
          : false;

  const isSubmitDisabled =
    title.trim().length < 2 || !type || !hasRequiredPayload;

  const handleSubmit = () => {
    if (isSubmitDisabled) return;
    onSubmit({
      title: title.trim(),
      type,
      url: type === 'link' ? url.trim() : undefined,
      content: type === 'article' ? content.trim() : undefined,
      description: description.trim() || undefined,
      file: type === 'file' ? file : undefined,
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
                : 'Add a learning resource for learners in this course. KodeBuddy will read it and use it to answer their questions.'}
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

        {type === 'link' && (
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
            hint="The page is fetched and read so KodeBuddy can cite it."
            onChange={(e) => setUrl(e.target.value)}
          />
        )}

        {type === 'article' && (
          <AppTextarea
            label={
              <span className="b2-b text-text">
                Content <span className="text-error">*</span>
              </span>
            }
            placeholder="Paste or write the article text here."
            value={content}
            rows={8}
            hint="This text is what KodeBuddy reads — write it as you want it understood."
            onChange={(e) => setContent(e.target.value)}
          />
        )}

        {type === 'file' && (
          <div className="flex flex-col gap-1.5">
            <span className="b2-b text-text">
              File {!isEdit && <span className="text-error">*</span>}
            </span>
            <input
              ref={fileInputRef}
              type="file"
              accept={ACCEPTED_FILE_TYPES}
              className="hidden"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            />
            <div className="flex items-center gap-3">
              <AppButton
                variant="outlined"
                color="neutral"
                size="small"
                radius="full"
                startIcon={<Paperclip size={14} />}
                onClick={() => fileInputRef.current?.click()}
              >
                {file || initial?.fileName ? 'Replace file' : 'Choose file'}
              </AppButton>
              <span className="f1-r min-w-0 truncate text-text-secondary">
                {file?.name ?? initial?.fileName ?? 'No file selected'}
              </span>
            </div>
            <span className="f1-r text-muted">
              PDF, Word, or text. The contents are parsed so KodeBuddy can
              answer from them.
            </span>
          </div>
        )}

        <AppTextarea
          label={<span className="b2-b text-text">Description</span>}
          placeholder="A short summary of what this resource covers."
          value={description}
          rows={2}
          maxLength={500}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>
    </AppModal>
  );
}
