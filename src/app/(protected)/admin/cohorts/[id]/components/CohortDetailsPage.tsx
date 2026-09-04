'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import CohortDetailsView, {
  type CohortDetails,
} from '@/app/(protected)/admin/cohorts/components/CohortDetails';
import ChangeTrainerPage from './ChangeTrainerPage';
import ChangeCoursePage from './ChangeCoursePage';
import EditCohortModal from '@/app/(protected)/admin/cohorts/components/EditCohortModal';
import type { AuthUser } from '@/types/auth.types';
import { AppCard } from '@/components/ui/AppCard';
import AppSpinner from '@/components/ui/AppSpinner';
import AppConfirmModal from '@/components/ui/AppConfirmModal';
import { RefreshCw } from 'lucide-react';
import { useToast } from '@/components/ui/ToastProvider';
import { getErrorMessage } from '@/lib/api/client';
import * as cohortsApi from '@/lib/api/cohorts.api';
import type { Cohort } from '@/lib/api/cohorts.api';
import * as profileApi from '@/lib/api/profile.api';
import * as coursesApi from '@/lib/api/courses.api';

interface CohortDetailsPageProps {
  cohortId: number;
}

export default function CohortDetailsPage({
  cohortId,
}: CohortDetailsPageProps) {
  const router = useRouter();
  const { showError, showSuccess } = useToast();
  const [cohort, setCohort] = useState<CohortDetails | null>(null);
  const [rawCohort, setRawCohort] = useState<Cohort | null>(null);
  const [loading, setLoading] = useState(true);
  const [changingTrainer, setChangingTrainer] = useState(false);
  const [changingCourse, setChangingCourse] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isStatusConfirmOpen, setIsStatusConfirmOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      cohortsApi.getCohortById(cohortId),
      cohortsApi.listCohortLearners(cohortId),
      cohortsApi.listCohortTrainers(cohortId),
      profileApi.listUsers(),
      coursesApi.listCourses(),
    ])
      .then(([value, learners, assignments, users, courses]) => {
        if (!cancelled) {
          const activeAssignment = assignments.find((item) => !item.removedAt);
          const trainer = users.find(
            (user) => user.id === activeAssignment?.trainerId,
          );
          setRawCohort(value);
          setCohort({
            id: String(value.id),
            name: value.name,
            status: value.isOpen ? 'active' : 'inactive',
            startDate: value.startDate,
            endDate: value.endDate,
            totalLearners: learners.length,
            trainer: trainer?.fullName || trainer?.email,
            trainerEmail: trainer?.email,
            course: courses.find((course) => course.cohortId === cohortId)?.title,
          });
        }
      })
      .catch((error) => {
        if (!cancelled) {
          showError(
            'Could not load cohort',
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

  if (!cohort) {
    return (
      <AppCard padding="lg" className="text-center">
        <p className="b1-b text-text">Cohort not found</p>
        <button
          type="button"
          onClick={() => router.push('/admin/cohorts')}
          className="b2-b mt-3 text-primary hover:underline"
        >
          Back to cohorts
        </button>
      </AppCard>
    );
  }

  if (changingTrainer) {
    return (
      <ChangeTrainerPage
        cohortId={cohortId}
        cohort={cohort}
        onBack={() => setChangingTrainer(false)}
        onAssigned={(trainer: AuthUser) => {
          setCohort((current) =>
            current
              ? {
                  ...current,
                  trainer: trainer.fullName || trainer.email,
                  trainerEmail: trainer.email,
                }
              : current,
          );
        }}
      />
    );
  }

  if (changingCourse) {
    return (
      <ChangeCoursePage
        cohortId={cohortId}
        cohort={cohort}
        onBack={() => setChangingCourse(false)}
        onAssigned={(course) => {
          setCohort((current) =>
            current ? { ...current, course: course.title } : current,
          );
        }}
      />
    );
  }

  const handleSaveEdit = async (data: {
    name: string;
    description?: string;
    startDate: string;
    endDate: string;
  }) => {
    setSaving(true);
    try {
      const updated = await cohortsApi.updateCohort(cohortId, data);
      setRawCohort(updated);
      setCohort((current) =>
        current
          ? {
              ...current,
              name: updated.name,
              startDate: updated.startDate,
              endDate: updated.endDate,
            }
          : current,
      );
      showSuccess('Cohort updated.', `"${updated.name}" has been saved.`);
      setIsEditOpen(false);
    } catch (error) {
      showError(
        'Could not update cohort',
        getErrorMessage(error, 'Please try again.'),
      );
    } finally {
      setSaving(false);
    }
  };

  const handleConfirmStatusChange = async () => {
    if (!rawCohort) return;
    setSaving(true);
    try {
      const updated = await cohortsApi.updateCohort(cohortId, {
        isOpen: !rawCohort.isOpen,
      });
      setRawCohort(updated);
      setCohort((current) =>
        current
          ? { ...current, status: updated.isOpen ? 'active' : 'inactive' }
          : current,
      );
      showSuccess(
        'Cohort status updated.',
        `${updated.name} is now ${updated.isOpen ? 'active' : 'inactive'}.`,
      );
      setIsStatusConfirmOpen(false);
    } catch (error) {
      showError(
        'Could not update cohort status',
        getErrorMessage(error, 'Please try again.'),
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <CohortDetailsView
        cohort={cohort}
        onBack={() => router.push('/admin/cohorts')}
        onViewLearners={() =>
          router.push(`/admin/cohorts/${cohortId}/learners`)
        }
        onAddLearners={() =>
          router.push(`/admin/cohorts/${cohortId}/learners/assign`)
        }
        onChangeTrainer={() => setChangingTrainer(true)}
        onChangeCourse={() => setChangingCourse(true)}
        onEditCohort={() => setIsEditOpen(true)}
        onChangeStatus={() => setIsStatusConfirmOpen(true)}
      />

      {rawCohort && (
        <EditCohortModal
          open={isEditOpen}
          cohort={rawCohort}
          saving={saving}
          onClose={() => setIsEditOpen(false)}
          onSave={handleSaveEdit}
        />
      )}

      <AppConfirmModal
        open={isStatusConfirmOpen}
        onClose={() => setIsStatusConfirmOpen(false)}
        icon={
          <span className="flex h-16 w-16 items-center justify-center rounded-full bg-warning/15">
            <RefreshCw size={28} className="text-warning" />
          </span>
        }
        title={
          rawCohort?.isOpen ? 'Mark cohort inactive?' : 'Mark cohort active?'
        }
        description={
          rawCohort?.isOpen
            ? `Learners in ${cohort.name} will no longer be able to access course content or resources.`
            : `Learners in ${cohort.name} will regain access to course content and resources.`
        }
        secondaryButton={{
          label: 'Cancel',
          onClick: () => setIsStatusConfirmOpen(false),
        }}
        primaryButton={{
          label: 'Confirm',
          loading: saving,
          onClick: handleConfirmStatusChange,
        }}
      />
    </>
  );
}
