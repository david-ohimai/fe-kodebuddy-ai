'use client';

import React, { useEffect, useState } from 'react';
import { AlertTriangle, ArrowLeft } from 'lucide-react';
import AppButton from '@/components/ui/AppButton';
import { AppCard } from '@/components/ui/AppCard';
import AppConfirmModal from '@/components/ui/AppConfirmModal';
import AppDropdown from '@/components/ui/AppDropdown';
import AppPill from '@/components/ui/AppPill';
import AppSpinner from '@/components/ui/AppSpinner';
import { useToast } from '@/components/ui/ToastProvider';
import { getErrorMessage } from '@/lib/api/client';
import * as coursesApi from '@/lib/api/courses.api';
import type { Course } from '@/lib/api/courses.api';
import type { CohortDetails } from '@/app/(protected)/admin/cohorts/components/CohortDetails';

interface ChangeCoursePageProps {
  cohortId: number;
  cohort: CohortDetails;
  onBack: () => void;
  onAssigned: (course: Course) => void;
}

const actionButtonClass = 'w-36';

function formatDate(value: string) {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export default function ChangeCoursePage({
  cohortId,
  cohort,
  onBack,
  onAssigned,
}: ChangeCoursePageProps) {
  const { showError, showSuccess } = useToast();
  const [courses, setCourses] = useState<Course[]>([]);
  const [currentCourse, setCurrentCourse] = useState<Course | null>(null);
  const [selectedId, setSelectedId] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;
    coursesApi
      .listCourses()
      .then((list) => {
        if (cancelled) return;
        const assigned =
          list.find((course) => course.cohortId === cohortId) ?? null;
        const availableCourses = assigned
          ? list.filter((course) => course.id !== assigned.id)
          : list;
        setCourses(availableCourses);
        setCurrentCourse(assigned);
        setSelectedId('');
      })
      .catch((error) => {
        if (!cancelled) {
          showError(
            'Could not load courses',
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

  const selectedCourse = courses.find(
    (course) => String(course.id) === selectedId,
  );

  const assignCourse = async () => {
    if (!selectedCourse) return;
    setSaving(true);
    try {
      const updated = await coursesApi.assignCourseToCohort(
        selectedCourse.id,
        cohortId,
      );
      onAssigned(updated);
      showSuccess(
        'Course assigned successfully.',
        `${updated.title} is now assigned to ${cohort.name}.`,
      );
      onBack();
    } catch (error) {
      showError(
        'Could not assign course',
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
        <div className="flex items-start justify-between border-b border-disabled px-6 py-5">
          <div>
            <h1 className="h5-b text-text">Change course</h1>
            <p className="b2-r mt-1 text-muted">
              Update the course assigned to this cohort.
            </p>
          </div>
          <AppButton
            variant="outlined"
            color="primary"
            radius="full"
            size="small"
            className={actionButtonClass}
          >
            Edit cohort
          </AppButton>
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
              <div><p className="f1-r text-muted">Start date</p><p className="b1-b mt-1 text-text">{formatDate(cohort.startDate)}</p></div>
              <div><p className="f1-r text-muted">End date</p><p className="b1-b mt-1 text-text">{formatDate(cohort.endDate)}</p></div>
              <div><p className="f1-r text-muted">Total learners</p><p className="b1-b mt-1 text-text">{cohort.totalLearners}</p></div>
            </div>
          </div>
        </div>
      </AppCard>

      <div>
        <h2 className="h6-b text-text">Current assigned course</h2>
        <div className="mt-3 rounded-card border border-disabled bg-background px-4 py-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="b1-b text-text">{currentCourse?.title ?? 'No course assigned yet'}</p>
              <p className="f1-r mt-1 text-muted">
                {currentCourse?.description ?? 'Assign a course to this cohort.'}
              </p>
            </div>
            {currentCourse && (
              <AppPill label="Published" color="success" />
            )}
          </div>
        </div>
      </div>

      <div>
        <label className="f1-m mb-2 block text-text">Select new course</label>
        <AppDropdown
          value={selectedId}
          options={courses.map((course) => ({
            value: String(course.id),
            label: course.title,
          }))}
          onChange={setSelectedId}
          placeholder="Select a course"
          ariaLabel="Select new course"
          className="w-full [&>button]:min-h-12 [&>button]:w-full"
        />
      </div>

      <div className="flex justify-end gap-3">
        <AppButton
          variant="outlined"
          color="neutral"
          radius="full"
          className={actionButtonClass}
          onClick={onBack}
        >
          Cancel
        </AppButton>
        <AppButton
          radius="full"
          className={actionButtonClass}
          disabled={!selectedCourse || saving}
          loading={saving}
          onClick={() => setConfirmOpen(true)}
        >
          Change course
        </AppButton>
      </div>

      <AppConfirmModal
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        icon={
          <span className="flex h-16 w-16 items-center justify-center rounded-full bg-warning/15">
            <AlertTriangle size={30} className="text-warning" />
          </span>
        }
        title={`Assign ${selectedCourse?.title} to this cohort?`}
        description={`This will replace ${currentCourse?.title ?? 'the current course'} for ${cohort.name}.`}
        secondaryButton={{ label: 'Cancel', onClick: () => setConfirmOpen(false) }}
        primaryButton={{
          label: 'Change course',
          loading: saving,
          onClick: assignCourse,
        }}
      />
    </div>
  );
}
