'use client';

import React, { useState } from 'react';
import {
  ArrowLeft,
  AlertCircle,
  FileQuestion,
  RotateCcw,
  Send,
} from 'lucide-react';
import Link from 'next/link';
import { AppCard } from '@/components/ui/AppCard';
import AppButton from '@/components/ui/AppButton';
import AppTextarea from '@/components/ui/AppTextarea';
import AppEmptyState from '@/components/ui/AppEmptyState';
import AppSpinner from '@/components/ui/AppSpinner';
import { useToast } from '@/components/ui/ToastProvider';
import { useEscalationDetail } from '@/lib/trainer/useEscalationDetail';

export interface EscalationDetailPageProps {
  escalationId: number;
}

export default function EscalationDetailPage({
  escalationId,
}: EscalationDetailPageProps) {
  const { showSuccess } = useToast();
  const { escalation, loading, notFound, sending, sendError, sendResponse } =
    useEscalationDetail(escalationId);
  const [response, setResponse] = useState('');

  const handleSend = async () => {
    const ok = await sendResponse(response);
    if (ok) {
      showSuccess(
        'Response sent successfully.',
        `${escalation?.learnerName ?? 'The learner'} will see this in their conversation.`,
      );
    }
  };

  const backLink = (
    <Link
      href="/trainer/escalations"
      className="b2-b inline-flex w-fit items-center gap-1.5 text-primary hover:underline"
    >
      <ArrowLeft size={16} /> Back to escalations
    </Link>
  );

  if (loading) {
    return (
      <div className="flex flex-col gap-4">
        {backLink}
        <div className="flex min-h-[420px] items-center justify-center">
          <AppSpinner size={40} />
        </div>
      </div>
    );
  }

  if (notFound || !escalation) {
    return (
      <div className="flex flex-col gap-4">
        {backLink}
        <AppCard padding="lg">
          <AppEmptyState
            icon={<FileQuestion />}
            title="Escalation Not Found"
            description="This escalation is no longer available. Please refresh the list and try again."
            className="!min-h-[420px]"
          />
        </AppCard>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {backLink}

      <AppCard padding="lg">
        <h1 className="h5-b text-text">Escalation details</h1>
        <p className="b2-r mt-1 text-text-secondary">
          Review the learner&apos;s escalation and provide a response.
        </p>

        <div className="mt-5 rounded-card border border-disabled p-5">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary-light b1-b text-primary">
              {(escalation.learnerName || '?').charAt(0).toUpperCase()}
            </span>
            <div>
              <p className="b1-b text-text">
                {escalation.learnerName || 'Unknown learner'}
              </p>
              <p className="f1-r text-muted">Learner</p>
            </div>
          </div>

          <p className="b2-b mt-5 text-text">Escalation</p>
          <div className="mt-2 rounded-input bg-primary-light px-4 py-3">
            <p className="b2-r text-primary-dark">{escalation.question}</p>
          </div>
        </div>
      </AppCard>

      {escalation.status === 'resolved' && escalation.response ? (
        <AppCard padding="lg">
          <h2 className="b1-b text-text">Your response</h2>
          <div className="mt-4 rounded-input bg-secondary-light px-4 py-3">
            <p className="b2-r text-text">{escalation.response}</p>
          </div>
          {escalation.respondedAt && (
            <p className="f1-r mt-2 text-muted">
              Sent{' '}
              {new Date(escalation.respondedAt).toLocaleString('en-US', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
                hour: 'numeric',
                minute: '2-digit',
              })}
            </p>
          )}
        </AppCard>
      ) : (
        <AppCard padding="lg">
          <h2 className="b1-b text-text">Your response</h2>
          <p className="b2-r mt-1 text-text-secondary">
            Provide clear and helpful guidance to the learner. Be clear,
            supportive and professional.
          </p>

          <div className="mt-4">
            <AppTextarea
              placeholder="Type your response...."
              value={response}
              onChange={(e) => setResponse(e.target.value)}
              rows={7}
              maxLength={4000}
            />
          </div>

          <div className="mt-3 flex justify-end">
            <AppButton
              radius="full"
              startIcon={<Send size={16} />}
              loading={sending}
              disabled={!response.trim()}
              onClick={handleSend}
            >
              Send response
            </AppButton>
          </div>

          {sendError ? (
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-input bg-error-light px-4 py-3">
              <div className="flex items-center gap-2">
                <AlertCircle size={18} className="shrink-0 text-error" />
                <p className="b2-m text-error">{sendError}</p>
              </div>
              <AppButton
                variant="outlined"
                color="error"
                size="small"
                radius="full"
                startIcon={<RotateCcw size={14} />}
                loading={sending}
                onClick={handleSend}
              >
                Retry
              </AppButton>
            </div>
          ) : (
            <div className="mt-4 rounded-input bg-primary-light px-4 py-3">
              <p className="b2-r text-primary-dark">
                Your response will be sent to the learner and added to the
                conversation.
              </p>
            </div>
          )}
        </AppCard>
      )}
    </div>
  );
}
