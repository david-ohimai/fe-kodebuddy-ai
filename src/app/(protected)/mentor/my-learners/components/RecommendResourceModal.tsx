'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { PlayCircle, FileText, File, CheckCircle2 } from 'lucide-react';
import AppModal from '@/components/ui/AppModal';
import AppConfirmModal from '@/components/ui/AppConfirmModal';
import AppButton from '@/components/ui/AppButton';
import AppTextarea from '@/components/ui/AppTextarea';
import type { RecommendableResource, ResourceType } from './ResourcePickerCard';

const TYPE_ICON: Record<ResourceType, React.ElementType> = {
  video: PlayCircle,
  article: FileText,
  document: File,
};

export interface RecommendResourceModalProps {
  open: boolean;
  learnerFirstName: string;
  resource: RecommendableResource | null;
  saving: boolean;
  onClose: () => void;
  onSend: (note: string) => Promise<void>;
}

export default function RecommendResourceModal({
  open,
  learnerFirstName,
  resource,
  saving,
  onClose,
  onSend,
}: RecommendResourceModalProps) {
  const router = useRouter();
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
    await onSend(note.trim());
    setSent(true);
  };

  if (!resource) return null;

  const Icon = TYPE_ICON[resource.type];

  if (sent) {
    return (
      <AppConfirmModal
        open={open}
        onClose={handleClose}
        icon={<CheckCircle2 size={64} className="text-success" />}
        title="Resource sent"
        description={`${learnerFirstName} has been notified about "${resource.title}".`}
        secondaryButton={{
          label: 'Back to Learner',
          onClick: handleClose,
        }}
        primaryButton={{
          label: 'Back to Dashboard',
          onClick: () => router.push('/mentor/dashboard'),
        }}
      />
    );
  }

  return (
    <AppModal
      open={open}
      onClose={handleClose}
      maxWidth={520}
      title="Recommend a resource"
      description={`To ${learnerFirstName}`}
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
            Send
          </AppButton>
        </div>
      }
    >
      <div className="flex flex-col gap-4 p-6">
        <div>
          <p className="b2-b mb-2 text-text">Selected resource</p>
          <div className="flex items-center gap-3 rounded-card border border-disabled p-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-btn bg-primary text-white">
              <Icon size={18} />
            </span>
            <div className="min-w-0">
              <p className="b2-b truncate text-text">{resource.title}</p>
              <p className="f1-r truncate text-muted">{resource.subtitle}</p>
            </div>
          </div>
        </div>

        <AppTextarea
          label={
            <span className="b2-b text-text">Write a note (optional)</span>
          }
          placeholder="Your personalized message"
          value={note}
          maxLength={500}
          showCharCount
          rows={4}
          onChange={(e) => setNote(e.target.value)}
        />
      </div>
    </AppModal>
  );
}
