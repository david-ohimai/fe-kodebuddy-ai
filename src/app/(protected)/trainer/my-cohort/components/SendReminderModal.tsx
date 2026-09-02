'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { X, CheckCircle2 } from 'lucide-react';
import AppModal from '@/components/ui/AppModal';
import AppButton from '@/components/ui/AppButton';
import AppInput from '@/components/ui/AppInput';
import AppTextarea from '@/components/ui/AppTextarea';
import { useToast } from '@/components/ui/ToastProvider';
import { getErrorMessage } from '@/lib/api/client';

export interface SendReminderModalProps {
  open: boolean;
  saving: boolean;
  onClose: () => void;
  onSend: (subject: string, message: string) => Promise<void>;
}

export default function SendReminderModal({
  open,
  saving,
  onClose,
  onSend,
}: SendReminderModalProps) {
  const router = useRouter();
  const { showError } = useToast();
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [sentAt, setSentAt] = useState<{
    subject: string;
    message: string;
  } | null>(null);

  const reset = () => {
    setSubject('');
    setMessage('');
    setSentAt(null);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const isSubmitDisabled = !subject.trim() || !message.trim();

  const handleSend = async () => {
    if (isSubmitDisabled) return;
    try {
      await onSend(subject.trim(), message.trim());
      setSentAt({ subject: subject.trim(), message: message.trim() });
    } catch (err) {
      showError(
        'Could not send reminder',
        getErrorMessage(err, 'Please try again.'),
      );
    }
  };

  if (sentAt) {
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
          <h3 className="h6-b text-text">Reminder sent to your Cohort</h3>

          <div className="w-full rounded-card border border-disabled p-4 text-left">
            <p className="b2-r whitespace-pre-wrap text-text">
              {sentAt.message}
            </p>
            <p className="f1-r mt-2 text-muted">Sent just now</p>
          </div>

          <div className="mt-2 flex w-full gap-3">
            <AppButton
              variant="outlined"
              color="neutral"
              radius="full"
              className="flex-1"
              onClick={handleClose}
            >
              Back to My Cohort
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
      maxWidth={600}
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
            onClick={handleSend}
          >
            Send reminder
          </AppButton>
        </div>
      }
    >
      <div className="flex flex-col gap-5 p-6">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="h6-b text-text">Reminder</h3>
            <p className="b2-r mt-1 text-text-secondary">
              Send a reminder to your Cohort
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
          label={<span className="b2-b text-text">Subject</span>}
          placeholder="Type your check in message"
          value={subject}
          maxLength={150}
          onChange={(e) => setSubject(e.target.value)}
        />

        <AppTextarea
          label={<span className="b2-b text-text">Your reminder</span>}
          placeholder="Type your message"
          value={message}
          maxLength={1000}
          showCharCount
          rows={5}
          onChange={(e) => setMessage(e.target.value)}
        />
      </div>
    </AppModal>
  );
}
