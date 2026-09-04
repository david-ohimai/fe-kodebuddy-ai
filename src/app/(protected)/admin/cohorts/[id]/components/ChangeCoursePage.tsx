'use client';

import React, { useEffect, useState } from 'react';
import { ArrowLeft, Info, Pencil, Plus } from 'lucide-react';
import AppButton from '@/components/ui/AppButton';
import { AppCard } from '@/components/ui/AppCard';
import AppInput from '@/components/ui/AppInput';
import AppTextarea from '@/components/ui/AppTextarea';
import AppSpinner from '@/components/ui/AppSpinner';
import AppEmptyState from '@/components/ui/AppEmptyState';
import { useToast } from '@/components/ui/ToastProvider';
import { getErrorMessage } from '@/lib/api/client';
import * as coursesApi from '@/lib/api/courses.api';
import type { Course } from '@/lib/api/courses.api';
import type { CohortDetails } from '@/app/(protected)/admin/cohorts/components/CohortDetails';

interface ChangeCoursePageProps {
  cohortId: number;
  cohort: CohortDetails;
  onBack: () => void;
  onCoursesChange: (courses: Course[]) => void;
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

interface CourseFormState {
  title: string;
  description: string;
  level: string;
}

const EMPTY_FORM: CourseFormState = { title: '', description: '', level: '' };

function CourseForm({
  form,
  onChange,
  onCancel,
  onSave,
  saving,
  saveLabel,
}: {
  form: CourseFormState;
  onChange: (form: CourseFormState) => void;
  onCancel?: () => void;
  onSave: () => void;
  saving: boolean;
  saveLabel: string;
}) {
  const isTitleEmpty = form.title.trim().length === 0;
  return (
    <div className="flex flex-col gap-5">
      <AppInput
        label="Course title *"
        placeholder="Enter course title"
        value={form.title}
        onChange={(e) => onChange({ ...form, title: e.target.value })}
      />
      <AppInput
        label="Level (optional)"
        placeholder="e.g. Beginner, Intermediate, Advanced"
        value={form.level}
        onChange={(e) => onChange({ ...form, level: e.target.value })}
      />
      <AppTextarea
        label="Description (optional)"
        placeholder="What will learners cover in this course?"
        value={form.description}
        onChange={(e) => onChange({ ...form, description: e.target.value })}
        rows={3}
      />
      <div className="flex justify-end gap-3">
        {onCancel && (
          <AppButton
            variant="outlined"
            color="neutral"
            radius="full"
            size="small"
            onClick={onCancel}
          >
            Cancel
          </AppButton>
        )}
        <AppButton
          radius="full"
          size="small"
          disabled={isTitleEmpty || saving}
          loading={saving}
          onClick={onSave}
        >
          {saveLabel}
        </AppButton>
      </div>
    </div>
  );
}

export default function ChangeCoursePage({
  cohortId,
  cohort,
  onBack,
  onCoursesChange,
}: ChangeCoursePageProps) {
  const { showError, showSuccess } = useToast();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<number | 'new' | null>(null);

  const [editingCourseId, setEditingCourseId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<CourseFormState>(EMPTY_FORM);

  const [showAddForm, setShowAddForm] = useState(false);
  const [addForm, setAddForm] = useState<CourseFormState>(EMPTY_FORM);

  useEffect(() => {
    let cancelled = false;
    coursesApi
      .listCourses()
      .then((list) => {
        if (cancelled) return;
        const cohortCourses = list.filter(
          (course) => course.cohortId === cohortId,
        );
        setCourses(cohortCourses);
        // Nothing to list yet — go straight to the add form instead of
        // showing an empty list plus a collapsed "Add course" button.
        if (cohortCourses.length === 0) setShowAddForm(true);
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

  const startEdit = (course: Course) => {
    setEditingCourseId(course.id);
    setEditForm({
      title: course.title,
      description: course.description ?? '',
      level: course.level ?? '',
    });
  };

  const handleSaveEdit = async () => {
    if (!editingCourseId || !editForm.title.trim()) return;
    setSavingId(editingCourseId);
    try {
      const updated = await coursesApi.updateCourse(editingCourseId, {
        title: editForm.title.trim(),
        description: editForm.description.trim() || undefined,
        level: editForm.level.trim() || undefined,
      });
      const next = courses.map((c) => (c.id === updated.id ? updated : c));
      setCourses(next);
      onCoursesChange(next);
      showSuccess('Course updated.', `"${updated.title}" has been saved.`);
      setEditingCourseId(null);
    } catch (error) {
      showError(
        'Could not update course',
        getErrorMessage(error, 'Please try again.'),
      );
    } finally {
      setSavingId(null);
    }
  };

  const handleAddCourse = async () => {
    if (!addForm.title.trim()) return;
    setSavingId('new');
    try {
      const created = await coursesApi.createCourse({
        title: addForm.title.trim(),
        description: addForm.description.trim() || undefined,
        level: addForm.level.trim() || undefined,
        cohortId,
      });
      const next = [...courses, created];
      setCourses(next);
      onCoursesChange(next);
      showSuccess(
        'Course added successfully.',
        `"${created.title}" is now assigned to ${cohort.name}.`,
      );
      setAddForm(EMPTY_FORM);
      setShowAddForm(false);
    } catch (error) {
      showError(
        'Could not add course',
        getErrorMessage(error, 'Please try again.'),
      );
    } finally {
      setSavingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <AppSpinner size={40} />
      </div>
    );
  }

  const addSection = (
    <AppCard padding="lg">
      <div className="flex items-center justify-between gap-3">
        <h2 className="h6-b text-text">Add a course</h2>
        {!showAddForm && (
          <AppButton
            variant="outlined"
            size="small"
            radius="full"
            startIcon={<Plus size={14} />}
            onClick={() => setShowAddForm(true)}
          >
            Add course
          </AppButton>
        )}
      </div>

      {showAddForm && (
        <div className="mt-4 flex flex-col gap-5">
          <CourseForm
            form={addForm}
            onChange={setAddForm}
            onCancel={
              courses.length > 0 ? () => setShowAddForm(false) : undefined
            }
            onSave={handleAddCourse}
            saving={savingId === 'new'}
            saveLabel="Add course"
          />
          <div className="flex gap-3 rounded-input bg-primary-light p-4">
            <Info size={18} className="mt-0.5 shrink-0 text-primary" />
            <p className="b2-r text-text-secondary">
              Once created, a course is permanently tied to {cohort.name} —
              courses can&apos;t be moved to a different cohort afterward.
            </p>
          </div>
        </div>
      )}
    </AppCard>
  );

  const listSection = (
    <AppCard padding="none">
      <div className="border-b border-disabled px-6 py-5">
        <h2 className="h6-b text-text">
          Courses in {cohort.name} ({courses.length})
        </h2>
        <p className="b2-r mt-1 text-muted">
          Edit a course&apos;s title, level, or description. To manage its
          modules and lessons, use{' '}
          <span className="b2-b text-text">Courses &amp; Contents</span>.
        </p>
      </div>

      {courses.length === 0 ? (
        <AppEmptyState
          title="No courses yet"
          description="Add this cohort's first course below."
          className="!min-h-0 py-14"
        />
      ) : (
        <ul className="divide-y divide-disabled">
          {courses.map((course) => (
            <li key={course.id} className="px-6 py-5">
              {editingCourseId === course.id ? (
                <CourseForm
                  form={editForm}
                  onChange={setEditForm}
                  onCancel={() => setEditingCourseId(null)}
                  onSave={handleSaveEdit}
                  saving={savingId === course.id}
                  saveLabel="Save changes"
                />
              ) : (
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="b1-b text-text">{course.title}</p>
                      {course.level && (
                        <span className="f1-b rounded-full bg-primary-light px-2.5 py-1 text-primary">
                          {course.level}
                        </span>
                      )}
                      {!course.isActive && (
                        <span className="f1-b rounded-full bg-disabled px-2.5 py-1 text-muted">
                          Draft
                        </span>
                      )}
                    </div>
                    {course.description && (
                      <p className="b2-r mt-1 text-muted">
                        {course.description}
                      </p>
                    )}
                    <p className="f1-r mt-1.5 text-muted">
                      Added {formatDate(course.createdAt)}
                    </p>
                  </div>
                  <AppButton
                    variant="outlined"
                    size="small"
                    radius="full"
                    startIcon={<Pencil size={14} />}
                    onClick={() => startEdit(course)}
                  >
                    Edit
                  </AppButton>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </AppCard>
  );

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
          <h1 className="h5-b text-text">Manage courses</h1>
          <p className="b2-r mt-1 text-muted">
            View, edit, or add courses for this cohort.
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

      {listSection}
      {addSection}
    </div>
  );
}
