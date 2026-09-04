'use client';

import React, { useState } from 'react';
import { X } from 'lucide-react';
import AppModal from '@/components/ui/AppModal';
import AppButton from '@/components/ui/AppButton';
import AppInput from '@/components/ui/AppInput';
import AppTextarea from '@/components/ui/AppTextarea';

export interface FaqModalInitial {
  question: string;
  answer: string;
}

export interface FaqModalProps {
  open: boolean;
  initial?: FaqModalInitial | null;
  saving?: boolean;
  onClose: () => void;
  onSubmit: (data: { question: string; answer: string }) => void;
}

export default function FaqModal({
  open,
  initial,
  saving = false,
  onClose,
  onSubmit,
}: FaqModalProps) {
  const isEdit = !!initial;

  const [question, setQuestion] = useState(initial?.question ?? '');
  const [answer, setAnswer] = useState(initial?.answer ?? '');

  const reset = () => {
    setQuestion(initial?.question ?? '');
    setAnswer(initial?.answer ?? '');
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const isSubmitDisabled = question.trim().length < 2 || !answer.trim();

  const handleSubmit = () => {
    if (isSubmitDisabled) return;
    onSubmit({ question: question.trim(), answer: answer.trim() });
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
            {isEdit ? 'Save changes' : 'Save FAQ'}
          </AppButton>
        </div>
      }
    >
      <div className="flex flex-col gap-5 p-6">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="h6-b text-text">
              {isEdit ? 'Edit FAQ' : 'Add FAQ'}
            </h3>
            <p className="b2-r mt-1 text-text-secondary">
              FAQs help learners get quick answers to common questions.
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
          label={<span className="b2-b text-text">Question</span>}
          placeholder="Enter the question learners might ask"
          value={question}
          maxLength={200}
          showCharCount
          onChange={(e) => setQuestion(e.target.value)}
        />

        <AppTextarea
          label={<span className="b2-b text-text">Answer</span>}
          placeholder="Write the answers learners will see"
          value={answer}
          maxLength={1000}
          showCharCount
          rows={3}
          onChange={(e) => setAnswer(e.target.value)}
        />
      </div>
    </AppModal>
  );
}
