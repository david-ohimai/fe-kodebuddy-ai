'use client';

import React from 'react';
import PageHeader from '@/components/ui/AppPageHeader';
import { AppCard } from '@/components/ui/AppCard';
import AppButton from '@/components/ui/AppButton';
import AppEmptyState from '@/components/ui/AppEmptyState';
import AppSpinner from '@/components/ui/AppSpinner';
import { useEscalations } from '@/lib/trainer/useEscalations';
import getUnstucked from '@/assets/images/get-unstucked.webp';

export default function EscalationsPage() {
  const { escalations, loading } = useEscalations();

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Escalations"
        subtitle="Review and respond to learner escalations."
      />

      <AppCard padding="none">
        {loading ? (
          <div className="flex min-h-[300px] items-center justify-center">
            <AppSpinner size={40} />
          </div>
        ) : escalations.length === 0 ? (
          <AppEmptyState
            image={getUnstucked}
            title="No open escalations"
            description="You have no open learner escalations that need your attention. When a learner needs human support, their escalation will appear here."
            className="!min-h-[420px]"
          />
        ) : (
          <ul className="divide-y divide-disabled">
            {escalations.map((escalation) => (
              <li
                key={escalation.id}
                className="flex items-center gap-4 p-5 sm:p-6"
              >
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary-light b1-b text-primary">
                  {(escalation.learnerName || '?').charAt(0).toUpperCase()}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="b2-b text-text">
                    {escalation.learnerName || 'Unknown learner'}
                  </p>
                  <p className="f1-r truncate text-muted">
                    {escalation.question}
                  </p>
                </div>
                <AppButton
                  href={`/trainer/escalations/${escalation.id}`}
                  variant="outlined"
                  radius="full"
                  size="small"
                >
                  View
                </AppButton>
              </li>
            ))}
          </ul>
        )}
      </AppCard>
    </div>
  );
}
