'use client';

import React, { useEffect, useState } from 'react';
import { AlertTriangle, ArrowLeft, Info } from 'lucide-react';
import AppButton from '@/components/ui/AppButton';
import { AppCard } from '@/components/ui/AppCard';
import AppInput from '@/components/ui/AppInput';
import AppTextarea from '@/components/ui/AppTextarea';
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
  const [currentCourse, setCurrentCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    let cancelled = false;
    coursesApi
      .listCourses()
      .then((list) => {
        if (cancelled) return;
        const assigned =
          list.find((course) => course.cohortId === cohortId) ?? null;
        setCurrentCourse(assigned);
        setTitle(assigned?.title ?? '');
        setDescription(assigned?.description ?? '');
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

  const isEdit = !!currentCourse;
  const isTitleEmpty = title.trim().length === 0;

  const handleSave = async () => {
    if (isTitleEmpty) return;
    setSaving(true);
    try {
      if (isEdit && currentCourse) {
        const updated = await coursesApi.updateCourse(currentCourse.id, {
          title: title.trim(),
          description: description.trim() || undefined,
        });
        setCurrentCourse(updated);
        onAssigned(updated);
        showSuccess('Course updated.', `"${updated.title}" has been saved.`);
      } else {
        const created = await coursesApi.createCourse({
          title: title.trim(),
          description: description.trim() || undefined,
          cohortId,
        });
        setCurrentCourse(created);
        onAssigned(created);
        showSuccess(
          'Course added successfully.',
          `"${created.title}" is now assigned to ${cohort.name}.`,
        );
      }
      onBack();
    } catch (error) {
      showError(
        isEdit ? 'Could not update course' : 'Could not add course',
        getErrorMessage(error, 'Please try again.'),
      );
    } finally {
      setSaving(false);
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
          <h1 className="h5-b text-text">
            {isEdit ? 'Edit course' : 'Add course'}
          </h1>
          <p className="b2-r mt-1 text-muted">
            {isEdit
              ? "Update this cohort's course."
              : 'This cohort has no course yet — add one to get started.'}
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
                <p className="b1-b mt-1 text-text">
                  {formatDate(cohort.startDate)}
                </p>
              </div>
              <div>
                <p className="f1-r text-muted">End date</p>
                <p className="b1-b mt-1 text-text">
                  {formatDate(cohort.endDate)}
                </p>
              </div>
              <div>
                <p className="f1-r text-muted">Total learners</p>
                <p className="b1-b mt-1 text-text">{cohort.totalLearners}</p>
              </div>
            </div>
          </div>
        </div>
      </AppCard>

      <div className="flex flex-col gap-6 rounded-card border border-disabled bg-background p-6">
        <AppInput
          label="Course title *"
          placeholder="Enter course title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <AppTextarea
          label="Description (optional)"
          placeholder="What will learners cover in this course?"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
        />

        {!isEdit && (
          <div className="flex gap-3 rounded-input bg-primary-light p-4">
            <Info size={18} className="mt-0.5 shrink-0 text-primary" />
            <div>
              <p className="b2-b text-text">What happens next?</p>
              <p className="b2-r text-text-secondary">
                Once created, this course is permanently tied to {cohort.name} —
                courses can&apos;t be moved to a different cohort afterward, so
                double-check the cohort before saving.
              </p>
            </div>
          </div>
        )}

        {isEdit && (
          <div className="flex gap-3 rounded-input bg-warning/10 p-4">
            <AlertTriangle size={18} className="mt-0.5 shrink-0 text-warning" />
            <p className="b2-r text-text-secondary">
              A cohort&apos;s course can&apos;t be swapped for a different one —
              you can only edit this course&apos;s title and description here.
              To manage its modules and lessons, use{' '}
              <span className="b2-b text-text">Courses &amp; Contents</span>.
            </p>
          </div>
        )}

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
            disabled={isTitleEmpty || saving}
            loading={saving}
            onClick={handleSave}
          >
            {isEdit ? 'Save changes' : 'Add course'}
          </AppButton>
        </div>
      </div>
    </div>
  );
}
