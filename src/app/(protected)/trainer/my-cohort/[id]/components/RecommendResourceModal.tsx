'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { X, CheckCircle2 } from 'lucide-react';
import AppModal from '@/components/ui/AppModal';
import AppButton from '@/components/ui/AppButton';
import AppTextarea from '@/components/ui/AppTextarea';
import { useToast } from '@/components/ui/ToastProvider';
import { getErrorMessage } from '@/lib/api/client';
import { getResourceDisplayMeta } from '@/lib/trainer/resourceTypeMeta';
import type { CourseResource } from '@/lib/api/resources.api';

export interface RecommendResourceModalProps {
  open: boolean;
  resource: CourseResource | null;
  moduleOrder: number | null;
  learnerFirstName: string;
  saving: boolean;
  onClose: () => void;
  onSend: (note: string) => Promise<void>;
}

export default function RecommendResourceModal({
  open,
  resource,
  moduleOrder,
  learnerFirstName,
  saving,
  onClose,
  onSend,
}: RecommendResourceModalProps) {
  const router = useRouter();
  const { showError } = useToast();
  const [note, setNote] = useState('');
  const [sent, setSent] = useState(false);

  const reset = () => {
    setNote('');
    setSent(false);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleSend = async () => {
    try {
      await onSend(note.trim());
      setSent(true);
    } catch (err) {
      showError(
        'Could not send recommendation',
        getErrorMessage(err, 'Please try again.'),
      );
    }
  };

  if (!resource) return null;
  const meta = getResourceDisplayMeta({
    type: resource.type,
    mimeType: resource.mimeType,
    url: resource.url,
    fileName: resource.fileName,
  });
  const Icon = meta.icon;
  const subtitle = `${meta.label}${moduleOrder ? ` · Module ${moduleOrder} live session` : ''}`;

  if (sent) {
    return (
      <AppModal
        open={open}
        onClose={handleClose}
        maxWidth={520}
        showCloseButton={false}
      >
        <div className="flex flex-col items-center gap-4 p-8 text-center">
          <span className="flex h-16 w-16 items-center justify-center rounded-full bg-success-light">
            <CheckCircle2 size={40} className="text-success-dark" />
          </span>
          <h3 className="h6-b text-text">
            Resource sent to {learnerFirstName}
          </h3>

          <div className="w-full rounded-card border border-disabled p-4 text-left">
            <div className="flex items-center gap-3">
              <span
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-md ${meta.bgClass} ${meta.textClass}`}
              >
                <Icon size={16} />
              </span>
              <div className="min-w-0">
                <p className="b2-b text-text">{resource.title}</p>
                <p className="f1-r text-muted">{subtitle}</p>
              </div>
            </div>
            {note && (
              <>
                <hr className="my-3 border-disabled" />
                <p className="b2-r text-text">{note}</p>
              </>
            )}
            <p className="f1-r mt-2 text-muted">
              Sent just now{moduleOrder ? ` · Module ${moduleOrder}` : ''}
            </p>
          </div>

          <div className="mt-2 flex w-full gap-3">
            <AppButton
              variant="outlined"
              color="neutral"
              radius="full"
              className="flex-1"
              onClick={handleClose}
            >
              Back to Learner
            </AppButton>
            <AppButton
              radius="full"
              className="flex-1"
              onClick={() => router.push('/dashboard')}
            >
              Back to Dashboard
            </AppButton>
          </div>
        </div>
      </AppModal>
    );
  }

  return (
    <AppModal
      open={open}
      onClose={handleClose}
      maxWidth={560}
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
          <AppButton radius="full" loading={saving} onClick={handleSend}>
            Send recommendation
          </AppButton>
        </div>
      }
    >
      <div className="flex flex-col gap-5 p-6">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="h6-b text-text">Recommend a resource</h3>
            <p className="b2-r mt-1 text-text-secondary">
              To {learnerFirstName}
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

        <div>
          <p className="b2-m mb-1.5 text-text">Selected resource</p>
          <div className="flex items-center gap-3 rounded-card bg-disabled/60 px-4 py-3">
            <span
              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-md ${meta.bgClass} ${meta.textClass}`}
            >
              <Icon size={16} />
            </span>
            <div className="min-w-0">
              <p className="b2-b text-text">{resource.title}</p>
              <p className="f1-r text-muted">{subtitle}</p>
            </div>
          </div>
        </div>

        <AppTextarea
          label={
            <span className="b2-b text-text">
              Leave a note{' '}
              <span className="f1-r font-normal text-muted">(Optional)</span>
            </span>
          }
          placeholder="Type your check in message"
          value={note}
          maxLength={1000}
          showCharCount
          rows={4}
          onChange={(e) => setNote(e.target.value)}
        />
      </div>
    </AppModal>
  );
}
