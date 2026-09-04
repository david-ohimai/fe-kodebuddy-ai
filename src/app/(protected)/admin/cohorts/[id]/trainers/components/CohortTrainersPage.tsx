'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { AlertTriangle, ArrowLeft, ChevronRight } from 'lucide-react';
import { AppCard } from '@/components/ui/AppCard';
import AppSpinner from '@/components/ui/AppSpinner';
import { useToast } from '@/components/ui/ToastProvider';
import { getErrorMessage } from '@/lib/api/client';
import * as cohortsApi from '@/lib/api/cohorts.api';
import * as profileApi from '@/lib/api/profile.api';

interface CohortTrainersPageProps {
  cohortId: number;
}

interface TrainerRow {
  trainerId: number;
  fullName: string | null;
  email: string;
  assignedAt: string;
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

export default function CohortTrainersPage({
  cohortId,
}: CohortTrainersPageProps) {
  const { showError } = useToast();
  const [cohortName, setCohortName] = useState('Cohort');
  const [trainers, setTrainers] = useState<TrainerRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      cohortsApi.getCohortById(cohortId),
      cohortsApi.listCohortTrainers(cohortId),
      profileApi.listUsers(),
    ])
      .then(([cohort, assignments, users]) => {
        if (cancelled) return;
        const usersById = new Map(users.map((u) => [u.id, u]));
        const rows = assignments
          .filter((a) => !a.removedAt)
          .map((a) => {
            const user = usersById.get(a.trainerId);
            return {
              trainerId: a.trainerId,
              fullName: user?.fullName ?? null,
              email: user?.email ?? '—',
              assignedAt: a.assignedAt,
              isCurrentTrainer: user?.role === 'trainer',
            };
          })
          .filter((row) => row.isCurrentTrainer);
        setCohortName(cohort.name);
        setTrainers(rows);
      })
      .catch((error) => {
        if (!cancelled) {
          showError(
            'Could not load cohort trainers',
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
          <h1 className="h5-b text-text">Trainers in {cohortName}</h1>
          <p className="b2-r mt-1 text-muted">
            View all trainers assigned to this cohort.
          </p>
        </div>

        <div className="flex items-start gap-3 border-b border-disabled bg-warning/10 px-6 py-4">
          <AlertTriangle size={16} className="mt-0.5 shrink-0 text-warning" />
          <p className="f1-r text-text-secondary">
            This shows cohort-level assignment only. Which specific course(s) a
            trainer is tied to isn&apos;t something the API currently exposes a
            way to look up — assigning is possible (via &quot;Assign trainers to
            course&quot;), reading it back isn&apos;t.
          </p>
        </div>

        {trainers.length === 0 ? (
          <p className="b2-r px-6 py-10 text-center text-muted">
            No trainers are assigned to this cohort yet.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-140 text-left">
              <thead>
                <tr className="border-b border-disabled">
                  <th className="f1-m px-4 py-3 text-muted">Trainer</th>
                  <th className="f1-m px-4 py-3 text-muted">Email</th>
                  <th className="f1-m px-4 py-3 text-muted">Assigned</th>
                  <th className="f1-m px-4 py-3 text-right text-muted">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {trainers.map((trainer) => (
                  <tr
                    key={trainer.trainerId}
                    className="border-b border-disabled last:border-b-0"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-light b2-b text-primary">
                          {(trainer.fullName || trainer.email)
                            .charAt(0)
                            .toUpperCase()}
                        </span>
                        <span className="b2-m text-text">
                          {trainer.fullName || '—'}
                        </span>
                      </div>
                    </td>
                    <td className="b2-r px-4 py-3 text-text-secondary">
                      {trainer.email}
                    </td>
                    <td className="b2-r px-4 py-3 text-text-secondary">
                      {formatDate(trainer.assignedAt)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        href={`/admin/users/${trainer.trainerId}`}
                        aria-label={`View details for ${trainer.fullName || trainer.email}`}
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
