'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, ChevronRight } from 'lucide-react';
import { AppCard } from '@/components/ui/AppCard';
import AppPill from '@/components/ui/AppPill';
import AppSpinner from '@/components/ui/AppSpinner';
import { useToast } from '@/components/ui/ToastProvider';
import { getErrorMessage } from '@/lib/api/client';
import * as cohortsApi from '@/lib/api/cohorts.api';

interface CohortLearnersPageProps {
  cohortId: number;
}

function formatDate(value?: string) {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export default function CohortLearnersPage({
  cohortId,
}: CohortLearnersPageProps) {
  const { showError } = useToast();
  const [cohortName, setCohortName] = useState('Cohort');
  const [learners, setLearners] = useState<cohortsApi.CohortLearner[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      cohortsApi.getCohortById(cohortId),
      cohortsApi.listCohortLearners(cohortId),
    ])
      .then(([cohort, list]) => {
        if (cancelled) return;
        setCohortName(cohort.name);
        setLearners(list);
      })
      .catch((error) => {
        if (!cancelled) {
          showError(
            'Could not load cohort learners',
            getErrorMessage(error, 'Please try again.'),
          );
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [cohortId, showError]);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <AppSpinner size={40} />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <Link
        href={`/admin/cohorts/${cohortId}`}
        className="b2-b inline-flex w-fit items-center gap-2 text-primary hover:underline"
      >
        <ArrowLeft size={16} />
        Back to cohort details
      </Link>

      <AppCard padding="none">
        <div className="border-b border-disabled px-6 py-5">
          <h1 className="h5-b text-text">Learners in {cohortName}</h1>
          <p className="b2-r mt-1 text-muted">
            View all learners enrolled in this cohort.
          </p>
        </div>

        {learners.length === 0 ? (
          <p className="b2-r px-6 py-10 text-center text-muted">
            No learners are enrolled in this cohort yet.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-180 text-left">
              <thead>
                <tr className="border-b border-disabled">
                  <th className="f1-m px-4 py-3 text-muted">Learner</th>
                  <th className="f1-m px-4 py-3 text-muted">Email</th>
                  <th className="f1-m px-4 py-3 text-muted">Date Joined</th>
                  <th className="f1-m px-4 py-3 text-muted">Status</th>
                  <th className="f1-m px-4 py-3 text-right text-muted">Actions</th>
                </tr>
              </thead>
              <tbody>
                {learners.map((learner) => (
                  <tr key={learner.id} className="border-b border-disabled last:border-b-0">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-light b2-b text-primary">
                          {(learner.fullName || learner.email).charAt(0).toUpperCase()}
                        </span>
                        <span className="b2-m text-text">
                          {learner.fullName || '—'}
                        </span>
                      </div>
                    </td>
                    <td className="b2-r px-4 py-3 text-text-secondary">{learner.email}</td>
                    <td className="b2-r px-4 py-3 text-text-secondary">
                      {formatDate(learner.joinedAt)}
                    </td>
                    <td className="px-4 py-3">
                      <AppPill
                        label={learner.isActive ? 'Active' : 'Suspended'}
                        color={learner.isActive ? 'success' : 'error'}
                      />
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        href={`/admin/users/${learner.learnerId}`}
                        aria-label={`View details for ${learner.fullName || learner.email}`}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-full text-muted hover:bg-primary-light hover:text-primary"
                      >
                        <ChevronRight size={18} />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </AppCard>
    </div>
  );
}
