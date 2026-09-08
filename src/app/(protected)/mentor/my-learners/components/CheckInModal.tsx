'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined';
import AppModal from '@/components/ui/AppModal';
import AppConfirmModal from '@/components/ui/AppConfirmModal';
import AppButton from '@/components/ui/AppButton';
import AppTextarea from '@/components/ui/AppTextarea';

export interface CheckInModalProps {
  open: boolean;
  learnerName: string;
  learnerFirstName: string;
  inactiveDays: number;
  currentModuleTitle: string;
  saving: boolean;
  onClose: () => void;
  onSend: (message: string) => Promise<void>;
}

function suggestedMessage(firstName: string, moduleTitle: string) {
  return `Hi ${firstName}, noticed you've been away from ${moduleTitle} for a few days - everything okay? Let me know if you're stuck on anything, happy to help get you back on track.`;
}

export default function CheckInModal({
  open,
  learnerName,
  learnerFirstName,
  inactiveDays,
  currentModuleTitle,
  saving,
  onClose,
  onSend,
}: CheckInModalProps) {
  const router = useRouter();
  const [message, setMessage] = useState('');
  const [sentMessage, setSentMessage] = useState<string | null>(null);

  const reset = () => {
    setMessage('');
    setSentMessage(null);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleSend = async () => {
    const trimmed = message.trim();
    if (!trimmed) return;
    await onSend(trimmed);
    setSentMessage(trimmed);
  };

  const handleUseSuggested = () => {
    setMessage(suggestedMessage(learnerFirstName, currentModuleTitle));
  };

  if (sentMessage) {
    return (
      <AppConfirmModal
        open={open}
        onClose={handleClose}
        icon={
          <CheckCircleOutlinedIcon
            sx={{ fontSize: 64 }}
            className="text-success"
          />
        }
        title={`Check in sent to ${learnerFirstName}`}
        description={
          <>
            <span>
              Check in sent to {learnerFirstName}, you&apos;ll be notified when
              they respond.
            </span>
            <span className="mt-3 block rounded-card border border-disabled bg-surface px-3 py-2 text-left whitespace-pre-wrap text-text">
              {sentMessage}
            </span>
          </>
        }
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
      maxWidth={560}
      title={learnerName}
      description="Needs attention · Learner"
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
            disabled={!message.trim()}
            onClick={handleSend}
          >
            Send check in
          </AppButton>
        </div>
      }
    >
      <div className="flex flex-col gap-4 p-6">
        <div className="flex items-start gap-2 rounded-card bg-primary-light p-3">
          <InfoOutlinedIcon
            fontSize="small"
            className="mt-0.5 shrink-0 text-primary"
          />
          <p className="b2-r text-primary">
            This learner has been inactive for {inactiveDays} days on{' '}
            {currentModuleTitle} — a quick nudge could help them get back on
            track.
          </p>
        </div>

        <AppTextarea
          label={<span className="b2-b text-text">Your message</span>}
          placeholder="Type your check in message"
          value={message}
          maxLength={1000}
          showCharCount
          rows={5}
          onChange={(e) => setMessage(e.target.value)}
        />

        {!message && (
          <button
            type="button"
            onClick={handleUseSuggested}
            className="b2-b w-fit text-primary hover:underline"
          >
            Use suggested message
          </button>
        )}
      </div>
    </AppModal>
  );
}
