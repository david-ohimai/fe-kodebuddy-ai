'use client';

import { useEffect, useState } from 'react';
import { useToast } from '@/components/ui/ToastProvider';
import * as faqsApi from '@/lib/api/faqs.api';
import { getErrorMessage } from '@/lib/api/client';
import type { Faq } from '@/lib/api/faqs.api';
import type { CourseModule } from '@/lib/api/modules.api';

export interface FaqFormInput {
  question: string;
  answer?: string;
}

export function useCourseFaqs(modules: CourseModule[]) {
  const { showSuccess, showError } = useToast();
  const [faqs, setFaqs] = useState<Faq[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const moduleIds = modules.map((m) => m.id).join(',');

  const loadFaqs = () => {
    if (modules.length === 0) {
      setFaqs([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    Promise.all(
      modules.map((m) => faqsApi.listModuleFaqs(m.id).catch(() => [])),
    )
      .then((lists) => setFaqs(lists.flat()))
      .catch((err) => {
        showError(
          'Could not load FAQs',
          getErrorMessage(err, 'Please try again.'),
        );
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadFaqs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [moduleIds]);

  const defaultModuleId = modules[0]?.id ?? null;

  const addFaq = async (data: FaqFormInput) => {
    if (!defaultModuleId) {
      throw new Error('Add a module to this course before adding FAQs.');
    }
    setSaving(true);
    try {
      const created = await faqsApi.createFaq(defaultModuleId, data);
      setFaqs((prev) => [...prev, created]);
      showSuccess(
        'FAQ added successfully.',
        `"${data.question}" was added to this course.`,
      );
      return created;
    } finally {
      setSaving(false);
    }
  };

  const editFaq = async (faq: Faq, data: FaqFormInput) => {
    setSaving(true);
    try {
      const updated = await faqsApi.updateFaq(faq.moduleId, faq.id, data);
      setFaqs((prev) => prev.map((f) => (f.id === updated.id ? updated : f)));
      showSuccess(
        'FAQ updated successfully.',
        `"${data.question}" has been saved.`,
      );
      return updated;
    } finally {
      setSaving(false);
    }
  };

  const deleteFaq = async (faq: Faq) => {
    setSaving(true);
    try {
      await faqsApi.deleteFaq(faq.moduleId, faq.id);
      setFaqs((prev) => prev.filter((f) => f.id !== faq.id));
      showSuccess('FAQ deleted.', `"${faq.question}" was removed.`);
    } finally {
      setSaving(false);
    }
  };

  return {
    faqs,
    loading,
    saving,
    hasModules: modules.length > 0,
    addFaq,
    editFaq,
    deleteFaq,
  };
}
