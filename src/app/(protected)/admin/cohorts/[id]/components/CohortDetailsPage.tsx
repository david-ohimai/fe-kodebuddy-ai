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
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { useToast } from '@/components/ui/ToastProvider';
import { getErrorMessage } from '@/lib/api/client';
import * as cohortsApi from '@/lib/api/cohorts.api';
import type { Cohort } from '@/lib/api/cohorts.api';
import * as profileApi from '@/lib/api/profile.api';
import * as coursesApi from '@/lib/api/courses.api';
import type { Course } from '@/lib/api/courses.api';

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
  const [assigningTrainer, setAssigningTrainer] = useState(false);
  const [courseSubview, setCourseSubview] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isStatusConfirmOpen, setIsStatusConfirmOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [deletingCohort, setDeletingCohort] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;

    Promise.allSettled([
      cohortsApi.getCohortById(cohortId),
      cohortsApi.listCohortLearners(cohortId),
      cohortsApi.listCohortTrainers(cohortId),
      profileApi.listUsers(),
      coursesApi.listCourses(),
    ]).then(
      ([
        cohortResult,
        learnersResult,
        trainersResult,
        usersResult,
        coursesResult,
      ]) => {
        if (cancelled) return;

        if (cohortResult.status === 'rejected') {
          showError(
            'Could not load cohort',
            getErrorMessage(cohortResult.reason, 'Please try again.'),
          );
          setLoading(false);
          return;
        }

        const learners =
          learnersResult.status === 'fulfilled' ? learnersResult.value : [];
        const assignments =
          trainersResult.status === 'fulfilled' ? trainersResult.value : [];
        const users =
          usersResult.status === 'fulfilled' ? usersResult.value : [];
        const courses =
          coursesResult.status === 'fulfilled' ? coursesResult.value : [];

        const activeTrainerIds = new Set(
          assignments.filter((a) => !a.removedAt).map((a) => a.trainerId),
        );

        const trainers = users
          .filter((u) => activeTrainerIds.has(u.id) && u.role === 'trainer')
          .map((u) => ({
            id: u.id,
            name: u.fullName || u.email,
            email: u.email,
          }));
        const cohortCourses = courses
          .filter((c) => c.cohortId === cohortId)
          .map((c) => ({ id: c.id, title: c.title }));

        const value = cohortResult.value;
        setRawCohort(value);
        setCohort({
          id: String(value.id),
          name: value.name,
          status: value.isOpen ? 'active' : 'inactive',
          startDate: value.startDate,
          endDate: value.endDate,
          totalLearners: learners.length,
          trainers,
          courses: cohortCourses,
        });

        const partialFailure = [
          learnersResult,
          trainersResult,
          usersResult,
          coursesResult,
        ].some((r) => r.status === 'rejected');
        if (partialFailure) {
          showError(
            'Some cohort details could not load',
            'The roster, trainer, or course lists may be incomplete. Try refreshing shortly.',
          );
        }

        setLoading(false);
      },
    );

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

  if (assigningTrainer) {
    return (
      <ChangeTrainerPage
        cohortId={cohortId}
        cohort={cohort}
        onBack={() => setAssigningTrainer(false)}
        onAssigned={(trainers: AuthUser[]) => {
          setCohort((current) =>
            current
              ? {
                  ...current,
                  trainers: trainers.map((t) => ({
                    id: t.id,
                    name: t.fullName || t.email,
                    email: t.email,
                  })),
                }
              : current,
          );
        }}
      />
    );
  }

  if (courseSubview) {
    return (
      <ChangeCoursePage
        cohortId={cohortId}
        cohort={cohort}
        onBack={() => setCourseSubview(false)}
        onCoursesChange={(courses: Course[]) => {
          setCohort((current) =>
            current
              ? {
                  ...current,
                  courses: courses.map((c) => ({ id: c.id, title: c.title })),
                }
              : current,
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
        onViewTrainers={() =>
          router.push(`/admin/cohorts/${cohortId}/trainers`)
        }
        onAssignTrainerToCourse={() => setAssigningTrainer(true)}
        onEditCourse={() => setCourseSubview(true)}
        onEditCohort={() => setIsEditOpen(true)}
        onDeleteCohort={() => setIsDeleteConfirmOpen(true)}
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

      <AppConfirmModal
        open={isDeleteConfirmOpen}
        onClose={() => setIsDeleteConfirmOpen(false)}
        icon={
          <span className="flex h-16 w-16 items-center justify-center rounded-full bg-error/15">
            <AlertTriangle size={28} className="text-error" />
          </span>
        }
        title={`Delete ${cohort.name}?`}
        description={`This permanently removes the cohort. Its ${cohort.totalLearners} learner${
          cohort.totalLearners === 1 ? '' : 's'
        } and ${cohort.courses.length} course${
          cohort.courses.length === 1 ? '' : 's'
        } will lose this cohort association. This action cannot be undone.`}
        secondaryButton={{
          label: 'Cancel',
          onClick: () => setIsDeleteConfirmOpen(false),
        }}
        primaryButton={{
          label: 'Yes, delete',
          color: 'error',
          loading: deletingCohort,
          onClick: async () => {
            setDeletingCohort(true);
            try {
              await cohortsApi.deleteCohort(cohortId);
              showSuccess(
                'Cohort deleted.',
                `"${cohort.name}" has been removed.`,
              );
              router.push('/admin/cohorts');
            } catch (error) {
              showError(
                'Could not delete cohort',
                getErrorMessage(error, 'Please try again.'),
              );
            } finally {
              setDeletingCohort(false);
              setIsDeleteConfirmOpen(false);
            }
          },
        }}
      />
    </>
  );
}
