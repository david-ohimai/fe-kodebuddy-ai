'use client';

import React, { useEffect, useState } from 'react';
import { ArrowLeft, Info, AlertTriangle } from 'lucide-react';
import Link from 'next/link';
import AppButton from '@/components/ui/AppButton';
import AppInput from '@/components/ui/AppInput';
import AppSearchSelect from '@/components/ui/AppSearchSelect';
import { useToast } from '@/components/ui/ToastProvider';
import * as coursesApi from '@/lib/api/courses.api';
import * as cohortsApi from '@/lib/api/cohorts.api';
import { getErrorMessage } from '@/lib/api/client';
import type { Course } from '@/lib/api/courses.api';
import type { Cohort } from '@/lib/api/cohorts.api';

interface AddCourseViewProps {
  onBack: () => void;
  onSaved: (course: Course) => void;
  /** When provided, edits this course's title instead of creating a new one. */
  editCourse?: Course;
}

const AddCourseView: React.FC<AddCourseViewProps> = ({
  onBack,
  onSaved,
  editCourse,
}) => {
  const { showSuccess, showError } = useToast();
  const isEdit = !!editCourse;

  const [title, setTitle] = useState(editCourse?.title ?? '');
  const [cohortId, setCohortId] = useState('');
  const [cohorts, setCohorts] = useState<Cohort[]>([]);
  const [loadingCohorts, setLoadingCohorts] = useState(!isEdit);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isEdit) return;
    let cancelled = false;
    cohortsApi
      .listCohorts()
      .then((list) => {
        if (!cancelled) setCohorts(list);
      })
      .catch(() => {
        if (!cancelled) {
          showError('Could not load cohorts', 'Please try again.');
        }
      })
      .finally(() => {
        if (!cancelled) setLoadingCohorts(false);
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEdit]);

  const isTitleEmpty = title.trim().length === 0;
  const isSubmitDisabled =
    isTitleEmpty || submitting || (!isEdit && !cohortId);

  const handleSubmit = async () => {
    if (isSubmitDisabled) return;
    setSubmitting(true);

    try {
      if (isEdit && editCourse) {
        const updated = await coursesApi.updateCourse(editCourse.id, {
          title: title.trim(),
        });
        showSuccess('Course updated.', `"${updated.title}" has been saved.`);
        onSaved(updated);
      } else {
        const created = await coursesApi.createCourse({
          title: title.trim(),
          cohortId: Number(cohortId),
        });
        // New courses start as drafts — the backend has no draft/publish
        // concept at creation time (CourseCreate has no `is_active`
        // field), so this is an explicit follow-up patch.
        const draft = await coursesApi.updateCourse(created.id, {
          isActive: false,
        });
        showSuccess(
          'Course saved as draft successfully.',
          `"${draft.title}" is ready to build on.`,
        );
        onSaved(draft);
      }
    } catch (err) {
      showError(
        isEdit ? 'Could not update course' : 'Could not create course',
        getErrorMessage(err, 'Please try again.'),
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <button
        type="button"
        onClick={onBack}
        className="b2-m inline-flex w-fit items-center gap-1.5 text-primary hover:underline"
      >
        <ArrowLeft size={16} />
        Back to content &amp; courses
      </button>

      <div className="flex flex-col gap-6 rounded-card border border-disabled bg-background p-6">
        <div>
          <h2 className="h5-b text-text">
            {isEdit ? 'Edit course' : 'Add course'}
          </h2>
          <p className="b2-r mt-1 text-text-secondary">
            {isEdit
              ? 'Update the basic information for this course.'
              : 'Create a new course by entering the basic information.'}
          </p>
        </div>

        <AppInput
          label="Course title *"
          placeholder="Enter course title"
          hint={
            isEdit
              ? undefined
              : "This will be saved as a draft. You can edit and publish it later."
          }
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        {!isEdit && (
          <div className="flex flex-col gap-1.5">
            <label className="b2-m text-text">Cohort *</label>
            <AppSearchSelect
              value={cohortId}
              onChange={setCohortId}
              loading={loadingCohorts}
              options={cohorts.map((c) => ({
                value: String(c.id),
                label: c.name,
                description: c.isOpen ? 'Open' : 'Closed',
              }))}
              placeholder="Search and select a cohort"
              searchPlaceholder="Type a cohort name..."
              emptyMessage={
                loadingCohorts ? 'Loading cohorts...' : 'No cohorts found.'
              }
              ariaLabel="Select cohort"
            />
            {!loadingCohorts && cohorts.length === 0 && (
              <div className="mt-1 flex items-start gap-2 rounded-input bg-warning/10 px-3.5 py-2.5">
                <AlertTriangle size={16} className="mt-0.5 shrink-0 text-warning" />
                <p className="f1-r text-text-secondary">
                  No cohorts exist yet.{' '}
                  <Link
                    href="/admin/cohorts"
                    className="b2-b text-primary hover:underline"
                  >
                    Create a cohort
                  </Link>{' '}
                  first, then come back to add a course.
                </p>
              </div>
            )}
          </div>
        )}

        <div className="flex gap-3 rounded-input bg-primary-light p-4">
          <Info size={18} className="mt-0.5 shrink-0 text-primary" />
          <div>
            <p className="b2-b text-text">What happens next?</p>
            <p className="b2-r text-text-secondary">
              {isEdit
                ? "Your changes will be saved immediately."
                : "After saving the draft, you'll be taken to the course details page where you can add modules, lessons and content."}
            </p>
          </div>
        </div>

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
            onClick={handleSubmit}
            radius="full"
            loading={submitting}
            disabled={isSubmitDisabled}
          >
            {isEdit ? 'Save changes' : 'Save draft'}
          </AppButton>
        </div>
      </div>
    </div>
  );
};

export default AddCourseView;
