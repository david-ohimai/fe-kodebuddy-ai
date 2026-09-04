'use client';

import React, { useState } from 'react';
import { CheckCircle2, Info, X } from 'lucide-react';
import AppButton from '@/components/ui/AppButton';
import AppModal from '@/components/ui/AppModal';
import AppPill from '@/components/ui/AppPill';
import AppTextarea from '@/components/ui/AppTextarea';
import { useToast } from '@/components/ui/ToastProvider';
import { getErrorMessage } from '@/lib/api/client';
import * as mentorsApi from '@/lib/api/mentors.api';
import type { MentorNotification } from '@/types/notification.types';

interface MentorNotificationModalProps {
  notification: MentorNotification | null;
  open: boolean;
  onClose: () => void;
  onSent: () => void;
}

export default function MentorNotificationModal({
  notification,
  open,
  onClose,
  onSent,
}: MentorNotificationModalProps) {
  const { showError } = useToast();
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const learnerName = notification?.learnerName ?? 'learner';

  const handleClose = () => {
    setMessage('');
    setSent(false);
    onClose();
  };

  const handleSend = async () => {
    if (!notification || !message.trim()) return;
    setSending(true);
    try {
      await mentorsApi.createCheckIn({
        learnerId: notification.learnerId,
        scheduledTime: new Date().toISOString(),
        notes: message.trim(),
      });
      setSent(true);
      onSent();
    } catch (error) {
      showError(
        'Could not send check in',
        getErrorMessage(error, 'Please try again.'),
      );
    } finally {
      setSending(false);
    }
  };

  if (!notification) return null;

  return (
    <AppModal open={open} onClose={handleClose} maxWidth={500} showCloseButton={false}>
      {sent ? (
        <div className="flex flex-col items-center gap-4 p-8 text-center">
          <span className="flex h-16 w-16 items-center justify-center rounded-full bg-success-light">
            <CheckCircle2 size={40} className="text-success-dark" />
          </span>
          <h2 className="h6-b text-text">Check in sent to {learnerName}</h2>
          <div className="w-full rounded-card bg-disabled p-4 text-left">
            <p className="b2-r truncate text-text">“{message}”</p>
            <p className="f1-r mt-1 text-muted">Sent just now · Module 2</p>
          </div>
          <div className="flex w-full gap-3">
            <AppButton variant="outlined" color="neutral" radius="full" className="flex-1" onClick={handleClose}>
              Back to Learner
            </AppButton>
            <AppButton radius="full" className="flex-1" onClick={handleClose}>
              Done
            </AppButton>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-4 p-5 sm:p-6">
          <div className="flex items-start justify-between border-b border-disabled pb-4">
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-primary-light h6-b text-primary">
                {learnerName.charAt(0).toUpperCase()}
              </span>
              <div>
                <h2 className="b1-b text-text">{learnerName}</h2>
                <div className="mt-1 flex items-center gap-2">
                  <AppPill label="Needs attention" color="warning" />
                  <span className="f1-r text-muted">Learner</span>
                </div>
              </div>
            </div>
            <button type="button" onClick={handleClose} className="rounded-full p-1 text-text-secondary hover:bg-disabled" aria-label="Close modal">
              <X size={20} />
            </button>
          </div>

          <div className="flex gap-2 rounded-input bg-primary-light p-3 text-text-secondary">
            <Info size={17} className="mt-0.5 shrink-0 text-primary" />
            <p className="b2-r">{notification.subject || notification.title}</p>
          </div>

          <AppTextarea
            label={<span className="b2-b text-text">Your message</span>}
            placeholder="Type your check in message"
            value={message}
            maxLength={1000}
            rows={4}
            onChange={(event) => setMessage(event.target.value)}
          />

          <div className="flex justify-end gap-3">
            <AppButton variant="outlined" color="neutral" radius="full" onClick={handleClose}>
              Cancel
            </AppButton>
            <AppButton radius="full" loading={sending} disabled={!message.trim()} onClick={handleSend}>
              Send check in
            </AppButton>
          </div>
        </div>
      )}
    </AppModal>
  );
}
