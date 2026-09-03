'use client';

import React, { useState } from 'react';
import { X } from 'lucide-react';
import AppModal from '@/components/ui/AppModal';
import AppButton from '@/components/ui/AppButton';
import AppInput from '@/components/ui/AppInput';
import AppTextarea from '@/components/ui/AppTextarea';
import { FEEDBACK_MAX_LENGTH } from '@/lib/api/submissions.api';
import type { SubmissionWithLearner } from '@/lib/trainer/useAssignmentSubmissions';

export interface GradeSubmissionModalProps {
  open: boolean;
  submission: SubmissionWithLearner | null;
  maximumScore: number;
  saving?: boolean;
  onClose: () => void;
  onSubmit: (data: { score: number; feedback?: string }) => void;
}

export default function GradeSubmissionModal({
  open,
  submission,
  maximumScore,
  saving = false,
  onClose,
  onSubmit,
}: GradeSubmissionModalProps) {
  const isRegrade =
    submission?.score !== null && submission?.score !== undefined;

  const [score, setScore] = useState(submission?.score?.toString() ?? '');
  const [feedback, setFeedback] = useState(submission?.feedback ?? '');

  const reset = () => {
    setScore(submission?.score?.toString() ?? '');
    setFeedback(submission?.feedback ?? '');
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const numericScore = Number(score);
  const isScoreValid =
    score.trim() !== '' &&
    !Number.isNaN(numericScore) &&
    numericScore >= 0 &&
    numericScore <= maximumScore;

  const handleSubmit = () => {
    if (!isScoreValid) return;
    onSubmit({ score: numericScore, feedback: feedback.trim() || undefined });
  };

  if (!submission) return null;

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
            disabled={!isScoreValid}
            onClick={handleSubmit}
          >
            {isRegrade ? 'Save changes' : 'Save grade'}
          </AppButton>
        </div>
      }
    >
      <div className="flex flex-col gap-5 p-6">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="h6-b text-text">
              {isRegrade ? 'Edit grade' : 'Grade submission'}
            </h3>
            <p className="b2-r mt-1 text-text-secondary">
              To{' '}
              {submission.learnerName ||
                submission.learnerEmail ||
                'this learner'}
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
          <p className="b2-m mb-1.5 text-text">Submission</p>
          <div className="max-h-40 overflow-y-auto rounded-card bg-disabled/60 px-4 py-3">
            <p className="b2-r whitespace-pre-wrap text-text">
              {submission.content}
            </p>
          </div>
        </div>

        <AppInput
          label={
            <span className="b2-b text-text">
              Score <span className="text-error">*</span>
            </span>
          }
          type="number"
          min={0}
          max={maximumScore}
          step="any"
          placeholder={`Out of ${maximumScore}`}
          hint={`Enter a score between 0 and ${maximumScore}.`}
          value={score}
          onChange={(e) => setScore(e.target.value)}
        />

        <AppTextarea
          label={
            <span className="b2-b text-text">
              Feedback{' '}
              <span className="f1-r font-normal text-muted">(optional)</span>
            </span>
          }
          placeholder="Let the learner know what they did well and what to improve."
          value={feedback}
          maxLength={FEEDBACK_MAX_LENGTH}
          showCharCount
          rows={4}
          onChange={(e) => setFeedback(e.target.value)}
        />
      </div>
    </AppModal>
  );
}
