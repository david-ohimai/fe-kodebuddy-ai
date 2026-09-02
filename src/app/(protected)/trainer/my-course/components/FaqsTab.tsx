'use client';

import React, { useState } from 'react';
import { ChevronRight, MessageCircleQuestion, Plus } from 'lucide-react';
import AppButton from '@/components/ui/AppButton';
import AppEmptyState from '@/components/ui/AppEmptyState';
import AppSpinner from '@/components/ui/AppSpinner';
import { useToast } from '@/components/ui/ToastProvider';
import { getErrorMessage } from '@/lib/api/client';
import FaqModal from './FaqModal';
import type { Faq } from '@/lib/api/faqs.api';

export interface FaqsTabProps {
  faqs: Faq[];
  loading: boolean;
  saving: boolean;
  hasModules: boolean;
  addFaq: (data: { question: string; answer?: string }) => Promise<Faq>;
  onSelectFaq: (faq: Faq) => void;
}

export default function FaqsTab({
  faqs,
  loading,
  saving,
  hasModules,
  addFaq,
  onSelectFaq,
}: FaqsTabProps) {
  const { showError } = useToast();
  const [isAddOpen, setIsAddOpen] = useState(false);

  const handleAdd = async (data: { question: string; answer: string }) => {
    try {
      await addFaq(data);
      setIsAddOpen(false);
    } catch (err) {
      showError('Could not add FAQ', getErrorMessage(err, 'Please try again.'));
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[300px] items-center justify-center">
        <AppSpinner size={40} />
      </div>
    );
  }

  if (faqs.length === 0) {
    return (
      <>
        <AppEmptyState
          icon={<MessageCircleQuestion />}
          title="No FAQs yet"
          description={
            hasModules
              ? 'Add FAQs to help learners quickly find answers to common questions.'
              : 'Add a module to this course before adding FAQs.'
          }
          actionLabel={hasModules ? 'Add FAQs' : undefined}
          actionIcon={<Plus size={16} />}
          onAction={hasModules ? () => setIsAddOpen(true) : undefined}
        />
        <FaqModal
          open={isAddOpen}
          saving={saving}
          onClose={() => setIsAddOpen(false)}
          onSubmit={handleAdd}
        />
      </>
    );
  }

  return (
    <div className="p-5 sm:p-6">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <p className="b2-b text-text">FAQs</p>
          <p className="f1-r text-muted">
            Manage all FAQs learners see for this course.
          </p>
        </div>
        <AppButton
          startIcon={<Plus size={16} />}
          radius="full"
          size="small"
          onClick={() => setIsAddOpen(true)}
        >
          Add FAQs
        </AppButton>
      </div>

      <ul className="divide-y divide-disabled rounded-input border border-disabled">
        {faqs.map((faq, index) => (
          <li key={faq.id}>
            <button
              type="button"
              onClick={() => onSelectFaq(faq)}
              className="flex w-full items-center gap-4 px-4 py-4 text-left transition-colors hover:bg-primary-light/40"
            >
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary-light b2-b text-primary">
                {index + 1}
              </span>
              <p className="b2-m min-w-0 flex-1 text-text">{faq.question}</p>
              <ChevronRight size={18} className="shrink-0 text-muted" />
            </button>
          </li>
        ))}
      </ul>

      <FaqModal
        open={isAddOpen}
        saving={saving}
        onClose={() => setIsAddOpen(false)}
        onSubmit={handleAdd}
      />
    </div>
  );
}
