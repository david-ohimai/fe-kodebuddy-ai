'use client';

import React, { useEffect, useState } from 'react';
import { AlertTriangle, ArrowLeft } from 'lucide-react';
import AppButton from '@/components/ui/AppButton';
import { AppCard } from '@/components/ui/AppCard';
import AppConfirmModal from '@/components/ui/AppConfirmModal';
import AppRadioCard from '@/components/ui/AppRadioCard';
import AppSpinner from '@/components/ui/AppSpinner';
import { useToast } from '@/components/ui/ToastProvider';
import { getErrorMessage } from '@/lib/api/client';
import * as cohortsApi from '@/lib/api/cohorts.api';
import * as profileApi from '@/lib/api/profile.api';
import type { AuthUser } from '@/types/auth.types';
import type { CohortDetails } from '@/app/(protected)/admin/cohorts/components/CohortDetails';

interface ChangeTrainerPageProps {
  cohortId: number;
  cohort: CohortDetails;
  onBack: () => void;
  onAssigned: (trainer: AuthUser) => void;
}

export default function ChangeTrainerPage({
  cohortId,
  cohort,
  onBack,
  onAssigned,
}: ChangeTrainerPageProps) {
  const { showError, showSuccess } = useToast();
  const [trainers, setTrainers] = useState<AuthUser[]>([]);
  const [currentTrainer, setCurrentTrainer] = useState<AuthUser | null>(null);
  const [selectedId, setSelectedId] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      profileApi.listUsers(),
      cohortsApi.listCohortTrainers(cohortId),
    ])
      .then(([users, assignments]) => {
        if (cancelled) return;
        const available = users.filter((user) => user.role === 'trainer');
        const activeAssignment = assignments.find((item) => !item.removedAt);
        const assigned = available.find(
          (user) => user.id === activeAssignment?.trainerId,
        );
        setTrainers(available);
        setCurrentTrainer(assigned ?? null);
        setSelectedId(assigned ? String(assigned.id) : '');
      })
      .catch((error) => {
        if (!cancelled) {
          showError(
            'Could not load trainers',
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

  const selectedTrainer = trainers.find(
    (trainer) => String(trainer.id) === selectedId,
  );
  const canAssign = Boolean(selectedTrainer && selectedTrainer.id !== currentTrainer?.id);

  const assignTrainer = async () => {
    if (!selectedTrainer) return;
    setSaving(true);
    try {
      await cohortsApi.assignCohortTrainer(cohortId, selectedTrainer.id);
      onAssigned(selectedTrainer);
      showSuccess('Trainer assigned successfully.', `${selectedTrainer.fullName || selectedTrainer.email} is now assigned to ${cohort.name}.`);
      onBack();
    } catch (error) {
      showError(
        'Could not assign trainer',
        getErrorMessage(error, 'Please try again.'),
      );
    } finally {
      setSaving(false);
      setConfirmOpen(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <AppSpinner size={40} />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <button
        type="button"
        onClick={onBack}
        className="flex w-fit items-center gap-2 b2-b text-primary"
      >
        <ArrowLeft size={16} />
        Back to cohorts details
      </button>

      <AppCard padding="none">
        <div className="border-b border-disabled px-6 py-5">
          <h1 className="h5-b text-text">Change trainer</h1>
          <p className="b2-r mt-1 text-muted">Select a new trainer to assign to this cohort.</p>
        </div>
        <div className="px-6 py-5">
          <div className="rounded-card border border-disabled p-5">
            <div className="flex items-center gap-3">
              <h2 className="h6-b text-text">{cohort.name}</h2>
              <span className="b2-m rounded-full bg-success-light px-3 py-1 text-success-dark">
                {cohort.status === 'active' ? 'Active' : 'Inactive'}
              </span>
            </div>
            <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-3">
              <div><p className="f1-r text-muted">Start date</p><p className="b1-b mt-1 text-text">{cohort.startDate}</p></div>
              <div><p className="f1-r text-muted">End date</p><p className="b1-b mt-1 text-text">{cohort.endDate}</p></div>
              <div><p className="f1-r text-muted">Total learners</p><p className="b1-b mt-1 text-text">{cohort.totalLearners}</p></div>
            </div>
          </div>
        </div>
      </AppCard>

      <div>
        <h2 className="h6-b text-text">Current assigned trainer</h2>
        {currentTrainer ? (
          <div className="mt-3 flex items-center gap-3 px-3">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-light h5-b text-primary">{(currentTrainer.fullName || currentTrainer.email).charAt(0).toUpperCase()}</span>
            <div><p className="b2-b text-text">{currentTrainer.fullName || '—'}</p><p className="f1-r text-muted">{currentTrainer.email}</p></div>
          </div>
        ) : <p className="b2-r mt-3 text-muted">No trainer assigned yet.</p>}
      </div>

      <div className="flex justify-end gap-3">
        <AppButton variant="outlined" color="neutral" radius="full" onClick={onBack}>Cancel</AppButton>
        <AppButton radius="full" disabled={!canAssign || saving} loading={saving} onClick={() => setConfirmOpen(true)}>Assign trainer?</AppButton>
      </div>

      <AppCard padding="none">
        <div className="border-b border-disabled px-6 py-5"><h2 className="h6-b text-text">Select new trainer</h2></div>
        <div className="flex flex-col gap-2 px-3 py-3">
          {trainers.map((trainer) => (
            <AppRadioCard
              key={trainer.id}
              name="cohort-trainer"
              value={String(trainer.id)}
              label={`${trainer.fullName || '—'} (${trainer.email})`}
              checked={selectedId === String(trainer.id)}
              onChange={setSelectedId}
            />
          ))}
        </div>
      </AppCard>

      <AppConfirmModal
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        icon={<span className="flex h-16 w-16 items-center justify-center rounded-full bg-warning/15"><AlertTriangle size={30} className="text-warning" /></span>}
        title={`Assign ${selectedTrainer?.fullName || selectedTrainer?.email} as trainer?`}
        description={`This will replace ${currentTrainer?.fullName || 'the current trainer'} for ${cohort.name}.`}
        secondaryButton={{ label: 'Cancel', onClick: () => setConfirmOpen(false) }}
        primaryButton={{ label: 'Assign trainer?', loading: saving, onClick: assignTrainer }}
      />
    </div>
  );
}
