'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { X, CheckCircle2 } from 'lucide-react';
import AppModal from '@/components/ui/AppModal';
import AppButton from '@/components/ui/AppButton';
import AppTextarea from '@/components/ui/AppTextarea';
import { useToast } from '@/components/ui/ToastProvider';
import { getErrorMessage } from '@/lib/api/client';

export interface SendCheckInModalProps {
  open: boolean;
  learnerFirstName: string;
  saving: boolean;
  onClose: () => void;
  onSend: (message: string) => Promise<void>;
}

export default function SendCheckInModal({
  open,
  learnerFirstName,
  saving,
  onClose,
  onSend,
}: SendCheckInModalProps) {
  const router = useRouter();
  const { showError } = useToast();
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
    if (!message.trim()) return;
    try {
      await onSend(message.trim());
      setSentMessage(message.trim());
    } catch (err) {
      showError(
        'Could not send check in',
        getErrorMessage(err, 'Please try again.'),
      );
    }
  };

  if (sentMessage) {
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
            Check in sent to {learnerFirstName}
          </h3>

          <div className="w-full rounded-card border border-disabled p-4 text-left">
            <p className="b2-r whitespace-pre-wrap text-text">{sentMessage}</p>
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
      <div className="flex flex-col gap-5 p-6">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="h6-b text-text">Send a check in</h3>
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

        <AppTextarea
          label={<span className="b2-b text-text">Message</span>}
          placeholder="Type your check in message"
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
