'use client';

import React, { useState } from 'react';
import { ArrowLeft, Pencil, Trash2, XCircle } from 'lucide-react';
import { AppCard } from '@/components/ui/AppCard';
import AppButton from '@/components/ui/AppButton';
import AppConfirmModal from '@/components/ui/AppConfirmModal';
import { useToast } from '@/components/ui/ToastProvider';
import { getErrorMessage } from '@/lib/api/client';
import FaqModal from './FaqModal';
import type { Faq } from '@/lib/api/faqs.api';

export interface FaqDetailViewProps {
  courseName: string;
  cohortName: string;
  faq: Faq;
  saving: boolean;
  editFaq: (
    faq: Faq,
    data: { question: string; answer?: string },
  ) => Promise<Faq>;
  deleteFaq: (faq: Faq) => Promise<void>;
  onBack: () => void;
}

export default function FaqDetailView({
  courseName,
  cohortName,
  faq,
  saving,
  editFaq,
  deleteFaq,
  onBack,
}: FaqDetailViewProps) {
  const { showError } = useToast();
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const handleEdit = async (data: { question: string; answer: string }) => {
    try {
      await editFaq(faq, data);
      setIsEditOpen(false);
    } catch (err) {
      showError(
        'Could not update FAQ',
        getErrorMessage(err, 'Please try again.'),
      );
    }
  };

  const handleDelete = async () => {
    try {
      await deleteFaq(faq);
      setIsDeleteOpen(false);
      onBack();
    } catch (err) {
      showError(
        'Could not delete FAQ',
        getErrorMessage(err, 'Please try again.'),
      );
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <button
        type="button"
        onClick={onBack}
        className="b2-b inline-flex w-fit items-center gap-1.5 text-primary hover:underline"
      >
        <ArrowLeft size={16} /> Back to FAQ
      </button>

      <div className="flex flex-wrap items-start justify-between gap-3">
        <h1 className="h5-b text-text">FAQ details</h1>
        <div className="flex flex-wrap gap-3">
          <AppButton
            variant="outlined"
            color="error"
            size="small"
            radius="full"
            startIcon={<Trash2 size={14} />}
            onClick={() => setIsDeleteOpen(true)}
          >
            Delete FAQ
          </AppButton>
          <AppButton
            size="small"
            radius="full"
            startIcon={<Pencil size={14} />}
            onClick={() => setIsEditOpen(true)}
          >
            Edit FAQ
          </AppButton>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 rounded-input bg-primary-light px-4 py-2.5">
        <p className="f1-r text-primary-dark">
          <span className="b2-b text-text">Course:</span> {courseName}
        </p>
        <p className="f1-r text-primary-dark">
          <span className="b2-b text-text">Assigned Cohort:</span> {cohortName}
        </p>
      </div>

      <AppCard padding="lg">
        <div className="flex flex-col gap-4">
          <div>
            <p className="f1-r text-muted">Question</p>
            <p className="b1-b mt-1 text-text">{faq.question}</p>
          </div>
          <div>
            <p className="f1-r text-muted">Answer</p>
            <p className="b1-r mt-1 whitespace-pre-wrap text-text">
              {faq.answer || 'No answer added yet.'}
            </p>
          </div>
        </div>
      </AppCard>

      <FaqModal
        open={isEditOpen}
        saving={saving}
        initial={{ question: faq.question, answer: faq.answer ?? '' }}
        onClose={() => setIsEditOpen(false)}
        onSubmit={handleEdit}
      />

      <AppConfirmModal
        open={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        hideCloseOnBackdrop={saving}
        icon={<XCircle size={64} className="text-error" />}
        title="Delete FAQ?"
        description="Are you sure you want to delete this FAQ? This action cannot be undone."
        secondaryButton={{
          label: 'Cancel',
          onClick: () => setIsDeleteOpen(false),
          disabled: saving,
        }}
        primaryButton={{
          label: 'Delete',
          color: 'error',
          loading: saving,
          onClick: handleDelete,
        }}
      />
    </div>
  );
}
