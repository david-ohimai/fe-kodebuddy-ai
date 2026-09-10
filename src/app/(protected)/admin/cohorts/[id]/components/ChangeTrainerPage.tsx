'use client';

import React, { useEffect, useState } from 'react';
import { AlertTriangle, ArrowLeft } from 'lucide-react';
import AppButton from '@/components/ui/AppButton';
import { AppCard } from '@/components/ui/AppCard';
import AppConfirmModal from '@/components/ui/AppConfirmModal';
import AppCheckboxCard from '@/components/ui/AppCheckboxCard';
import AppSearchSelect from '@/components/ui/AppSearchSelect';
import AppSpinner from '@/components/ui/AppSpinner';
import { useToast } from '@/components/ui/ToastProvider';
import { ApiError, getErrorMessage } from '@/lib/api/client';
import * as cohortsApi from '@/lib/api/cohorts.api';
import * as coursesApi from '@/lib/api/courses.api';
import * as profileApi from '@/lib/api/profile.api';
import type { AuthUser } from '@/types/auth.types';
import type { Course } from '@/lib/api/courses.api';
import type { CohortDetails } from '@/app/(protected)/admin/cohorts/components/CohortDetails';

interface ChangeTrainerPageProps {
  cohortId: number;
  cohort: CohortDetails;
  onBack: () => void;
  onAssigned: (trainers: AuthUser[]) => void;
}

export default function ChangeTrainerPage({
  cohortId,
  cohort,
  onBack,
  onAssigned,
}: ChangeTrainerPageProps) {
  const { showError, showSuccess } = useToast();
  const [trainers, setTrainers] = useState<AuthUser[]>([]);
  const [assignedIds, setAssignedIds] = useState<Set<number>>(new Set());
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      profileApi.listUsers(),
      cohortsApi.listCohortTrainers(cohortId),
      coursesApi.listCourses(),
    ])
      .then(([users, assignments, allCourses]) => {
        if (cancelled) return;
        const available = users.filter((user) => user.role === 'trainer');
        const active = new Set(
          assignments.filter((a) => !a.removedAt).map((a) => a.trainerId),
        );
        setTrainers(available);
        setAssignedIds(active);
        setCourses(allCourses.filter((c) => c.cohortId === cohortId));
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

  const currentTrainers = trainers.filter((t) => assignedIds.has(t.id));

  /*
   * Every trainer is selectable, including ones already on the cohort.
   *
   * `assignedIds` reflects cohort membership (cohort_trainers). Course access
   * is a separate table (course_trainers), and the trainer dashboard reads
   * *that* one. Filtering the selectable list by cohort membership meant a
   * trainer already on the cohort could never be given course access — the
   * assign call below only ran over the filtered list — so they were assigned
   * in the UI's eyes but invisible to the trainer, with no error anywhere.
   */
  const selectableTrainers = trainers;
  const selected = trainers.filter((t) => selectedIds.has(t.id));
  const selectedCourse = courses.find((c) => c.id === selectedCourseId);
  const canAssign = selected.length > 0 && !!selectedCourseId;

  const toggleTrainer = (id: number, checked: boolean) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (checked) next.add(id);
      else next.delete(id);
      return next;
    });
  };

  const assignTrainers = async () => {
    if (selected.length === 0 || !selectedCourseId) return;
    setSaving(true);
    try {
      /*
       * Cohort and course assignment are independent writes, so they are no
       * longer driven off the same filtered list.
       *
       * A 409 means the pair already exists, which is the state we were
       * asking for — so it is swallowed rather than failing the whole
       * operation. Any other error still surfaces. There is no
       * GET /courses/{id}/trainers yet, so the client cannot know in advance
       * which pairs exist; once that lands this can skip them instead.
       */
      const assignIgnoringConflict = async (call: Promise<unknown>) => {
        try {
          await call;
        } catch (err) {
          if (err instanceof ApiError && err.status === 409) return;
          throw err;
        }
      };

      // Only trainers not already on the cohort need the cohort write.
      await Promise.all(
        selected
          .filter((t) => !assignedIds.has(t.id))
          .map((t) =>
            assignIgnoringConflict(
              cohortsApi.assignCohortTrainer(cohortId, t.id),
            ),
          ),
      );

      // Everyone selected gets the course write — this is the one the
      // trainer dashboard actually reads.
      await Promise.all(
        selected.map((t) =>
          assignIgnoringConflict(
            coursesApi.assignCourseTrainer(selectedCourseId, t.id),
          ),
        ),
      );

      const allAssigned = [
        ...currentTrainers,
        ...selected.filter((t) => !assignedIds.has(t.id)),
      ];
      onAssigned(allAssigned);
      showSuccess(
        selected.length === 1
          ? 'Trainer assigned successfully.'
          : 'Trainers assigned successfully.',
        `${selected.map((t) => t.fullName || t.email).join(', ')} ${
          selected.length === 1 ? 'is' : 'are'
        } now assigned to ${selectedCourse?.title}.`,
      );
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
        Back to cohort details
      </button>

      <AppCard padding="none">
        <div className="border-b border-disabled px-6 py-5">
          <h1 className="h5-b text-text">Assign trainers to course</h1>
          <p className="b2-r mt-1 text-muted">
            Choose a course, then select trainers to assign to it.
          </p>
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
              <div>
                <p className="f1-r text-muted">Start date</p>
                <p className="b1-b mt-1 text-text">{cohort.startDate}</p>
              </div>
              <div>
                <p className="f1-r text-muted">End date</p>
                <p className="b1-b mt-1 text-text">{cohort.endDate}</p>
              </div>
              <div>
                <p className="f1-r text-muted">Total learners</p>
                <p className="b1-b mt-1 text-text">{cohort.totalLearners}</p>
              </div>
            </div>
          </div>
        </div>
      </AppCard>

      <div className="flex flex-col gap-3">
        <span className="b2-b text-text">
          Course
          <span className="text-error"> *</span>
        </span>
        {courses.length === 0 ? (
          <div className="flex items-start gap-3 rounded-input bg-warning/10 p-4">
            <AlertTriangle size={18} className="mt-0.5 shrink-0 text-warning" />
            <p className="b2-r text-text-secondary">
              This cohort has no course yet. Add one first (via the Courses
              action on cohort details) before assigning a trainer to a course.
            </p>
          </div>
        ) : (
          <AppSearchSelect
            hideSearch
            value={selectedCourseId ? String(selectedCourseId) : ''}
            options={courses.map((c) => ({
              value: String(c.id),
              label: c.title,
              description: c.level ?? undefined,
            }))}
            onChange={(value) => setSelectedCourseId(Number(value))}
            placeholder="Select a course"
            ariaLabel="Select a course"
            className="w-full max-w-md"
          />
        )}
      </div>

      <div>
        <h2 className="h6-b text-text">Currently assigned trainers</h2>
        {currentTrainers.length > 0 ? (
          <ul className="mt-3 flex flex-col gap-3 px-3">
            {currentTrainers.map((trainer) => (
              <li key={trainer.id} className="flex items-center gap-3">
                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-light h5-b text-primary">
                  {(trainer.fullName || trainer.email).charAt(0).toUpperCase()}
                </span>
                <div>
                  <p className="b2-b text-text">{trainer.fullName || '—'}</p>
                  <p className="f1-r text-muted">{trainer.email}</p>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="b2-r mt-3 text-muted">No trainer assigned yet.</p>
        )}
      </div>

      {selectedCourseId && (
        <>
          <div className="flex justify-end gap-3">
            <AppButton
              variant="outlined"
              color="neutral"
              radius="full"
              onClick={onBack}
            >
              Cancel
            </AppButton>
            <AppButton
              radius="full"
              disabled={!canAssign || saving}
              loading={saving}
              onClick={() => setConfirmOpen(true)}
            >
              Assign trainer{selected.length !== 1 ? 's' : ''}
            </AppButton>
          </div>

          <AppCard padding="none">
            <div className="border-b border-disabled px-6 py-5">
              <h2 className="h6-b text-text">Select trainers</h2>
              <p className="f1-r mt-1 text-muted">
                Trainers already on this cohort can still be selected — course
                access is assigned separately.
              </p>
            </div>
            {selectableTrainers.length === 0 ? (
              <p className="b2-r px-6 py-8 text-center text-muted">
                No trainers exist yet.
              </p>
            ) : (
              <div className="flex flex-col gap-2.5 px-3 py-3">
                {selectableTrainers.map((trainer) => (
                  <AppCheckboxCard
                    key={trainer.id}
                    value={String(trainer.id)}
                    label={trainer.fullName || '—'}
                    description={trainer.email}
                    checked={selectedIds.has(trainer.id)}
                    onChange={(_, checked) =>
                      toggleTrainer(trainer.id, checked)
                    }
                  />
                ))}
              </div>
            )}
          </AppCard>
        </>
      )}

      <AppConfirmModal
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        icon={
          <span className="flex h-16 w-16 items-center justify-center rounded-full bg-warning/15">
            <AlertTriangle size={30} className="text-warning" />
          </span>
        }
        title={`Assign ${selected.length} trainer${selected.length !== 1 ? 's' : ''}?`}
        description={`${selected
          .map((t) => t.fullName || t.email)
          .join(
            ', ',
          )} will be added to ${cohort.name} and ${selectedCourse?.title}.`}
        secondaryButton={{
          label: 'Cancel',
          onClick: () => setConfirmOpen(false),
        }}
        primaryButton={{
          label: 'Assign',
          loading: saving,
          onClick: assignTrainers,
        }}
      />
    </div>
  );
}
