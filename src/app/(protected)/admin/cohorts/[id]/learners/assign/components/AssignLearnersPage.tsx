'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AlertTriangle, ArrowLeft, Search } from 'lucide-react';
import AppButton from '@/components/ui/AppButton';
import { AppCard } from '@/components/ui/AppCard';
import AppSpinner from '@/components/ui/AppSpinner';
import { useToast } from '@/components/ui/ToastProvider';
import { cx } from '@/lib/utils/cx';
import * as cohortsApi from '@/lib/api/cohorts.api';
import * as coursesApi from '@/lib/api/courses.api';
import { getErrorMessage } from '@/lib/api/client';
import type { CohortLearner } from '@/lib/api/cohorts.api';
import type { Course } from '@/lib/api/courses.api';

export interface AssignLearnersPageProps {
  cohortId: number;
}

/** Outcome of one assignment, kept per learner so partial runs stay legible. */
interface AssignResult {
  learnerId: number;
  name: string;
  ok: boolean;
  message?: string;
}

function learnerName(learner: CohortLearner): string {
  return learner.fullName || learner.email;
}

export default function AssignLearnersPage({
  cohortId,
}: AssignLearnersPageProps) {
  const router = useRouter();
  const { showError, showSuccess } = useToast();

  const [learners, setLearners] = useState<CohortLearner[]>([]);
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [submitting, setSubmitting] = useState(false);
  const [results, setResults] = useState<AssignResult[] | null>(null);

  useEffect(() => {
    let cancelled = false;

    Promise.all([
      cohortsApi.listCohortLearners(cohortId),
      // The cohort's own course: assignment is rejected server-side when the
      // course's cohort differs, so there is nothing to choose here.
      coursesApi.listCourses(),
    ])
      .then(([cohortLearners, courses]) => {
        if (cancelled) return;
        setLearners(cohortLearners);
        setCourse(courses.find((c) => c.cohortId === cohortId) ?? null);
      })
      .catch((err) => {
        if (!cancelled) {
          setLoadError(getErrorMessage(err, 'Could not load this cohort.'));
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [cohortId]);

  const visible = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return learners;
    return learners.filter(
      (learner) =>
        learnerName(learner).toLowerCase().includes(term) ||
        learner.email.toLowerCase().includes(term),
    );
  }, [learners, search]);

  /** Already on this course — selecting them would only earn a 409. */
  const isAlreadyAssigned = useCallback(
    (learner: CohortLearner) =>
      course !== null &&
      learner.currentCourseId !== undefined &&
      learner.currentCourseId === course.id,
    [course],
  );

  /**
   * On a different course. Assigning replaces that silently server-side, so
   * the row says so before the admin commits.
   */
  const movesFrom = useCallback(
    (learner: CohortLearner): string | null => {
      if (course === null) return null;
      if (learner.currentCourseId === undefined) return null;
      if (learner.currentCourseId === null) return null;
      if (learner.currentCourseId === course.id) return null;
      return learner.currentCourseTitle || 'another course';
    },
    [course],
  );

  const toggle = useCallback((learnerId: number) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(learnerId)) next.delete(learnerId);
      else next.add(learnerId);
      return next;
    });
  }, []);

  const selectable = useMemo(
    () => visible.filter((l) => !isAlreadyAssigned(l)),
    [visible, isAlreadyAssigned],
  );

  const allSelected =
    selectable.length > 0 && selectable.every((l) => selected.has(l.learnerId));

  const toggleAll = useCallback(() => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (selectable.every((l) => next.has(l.learnerId))) {
        selectable.forEach((l) => next.delete(l.learnerId));
      } else {
        selectable.forEach((l) => next.add(l.learnerId));
      }
      return next;
    });
  }, [selectable]);

  const movingCount = useMemo(
    () =>
      learners.filter((l) => selected.has(l.learnerId) && movesFrom(l) !== null)
        .length,
    [learners, selected, movesFrom],
  );

  const handleAssign = useCallback(async () => {
    if (!course || selected.size === 0 || submitting) return;

    setSubmitting(true);
    setResults(null);

    const targets = learners.filter((l) => selected.has(l.learnerId));
    const collected: AssignResult[] = [];

    // Sequential, not parallel: the endpoint takes one learner per call and
    // each is a separate write. Firing them together would make a partial
    // failure much harder to report accurately.
    for (const learner of targets) {
      try {
        await coursesApi.assignLearnerToCourse(course.id, learner.learnerId);
        collected.push({
          learnerId: learner.learnerId,
          name: learnerName(learner),
          ok: true,
        });
      } catch (err) {
        collected.push({
          learnerId: learner.learnerId,
          name: learnerName(learner),
          ok: false,
          message: getErrorMessage(err, 'Could not assign this learner.'),
        });
      }
    }

    setResults(collected);
    setSubmitting(false);

    const succeeded = collected.filter((r) => r.ok).length;
    const failed = collected.length - succeeded;

    if (failed === 0) {
      showSuccess(
        'Learners assigned',
        `${succeeded} learner${succeeded === 1 ? '' : 's'} assigned to ${course.title}.`,
      );
    } else {
      showError(
        'Some learners were not assigned',
        `${succeeded} assigned, ${failed} failed. See the results below.`,
      );
    }

    // Clear only what worked, so a retry targets the failures.
    setSelected((prev) => {
      const next = new Set(prev);
      collected.filter((r) => r.ok).forEach((r) => next.delete(r.learnerId));
      return next;
    });

    // Refresh so already-assigned state reflects what just happened.
    cohortsApi
      .listCohortLearners(cohortId)
      .then(setLearners)
      .catch(() => {
        /* the results list already reports the outcome */
      });
  }, [course, selected, submitting, learners, cohortId, showSuccess, showError]);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <AppSpinner />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <button
        type="button"
        onClick={() => router.push(`/admin/cohorts/${cohortId}`)}
        className="flex w-fit items-center gap-2 b2-b text-primary"
      >
        <ArrowLeft size={16} />
        Back to cohort details
      </button>

      <AppCard padding="none">
        <div className="border-b border-disabled px-6 py-5">
          <h1 className="h5-b text-text">Add learners to course</h1>
          <p className="b2-r mt-1 text-muted">
            {course
              ? `Assign learners from this cohort to ${course.title}.`
              : 'This cohort has no course assigned yet.'}
          </p>
        </div>

        {loadError ? (
          <div className="px-6 py-10 text-center">
            <p className="b1-b text-text">Could not load learners</p>
            <p className="b2-r mt-1 text-text-secondary">{loadError}</p>
          </div>
        ) : !course ? (
          <div className="flex items-start gap-3 px-6 py-6">
            <AlertTriangle size={18} className="mt-0.5 shrink-0 text-warning" />
            <p className="b2-r text-text-secondary">
              Assign a course to this cohort before adding learners to it.
            </p>
          </div>
        ) : (
          <>
            <div className="flex flex-col gap-3 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex w-full max-w-xs items-center gap-2 rounded-input border border-disabled px-3 py-2">
                <Search size={16} className="text-muted" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by name or email"
                  className="b2-r w-full bg-transparent text-text placeholder:text-muted focus:outline-none"
                />
              </div>

              {selectable.length > 0 && (
                <button
                  type="button"
                  onClick={toggleAll}
                  className="b2-m w-fit text-primary hover:underline"
                >
                  {allSelected ? 'Clear selection' : 'Select all'}
                </button>
              )}
            </div>

            {visible.length === 0 ? (
              <p className="px-6 py-10 text-center b2-r text-muted">
                {learners.length === 0
                  ? 'No learners are enrolled in this cohort yet.'
                  : 'No learners match your search.'}
              </p>
            ) : (
              <ul className="border-t border-disabled">
                {visible.map((learner) => {
                  const assigned = isAlreadyAssigned(learner);
                  const movedFrom = movesFrom(learner);
                  const isChecked = selected.has(learner.learnerId);

                  return (
                    <li
                      key={learner.learnerId}
                      className="border-b border-disabled last:border-b-0"
                    >
                      <label
                        className={cx(
                          'flex items-center gap-4 px-6 py-4',
                          assigned
                            ? 'cursor-not-allowed opacity-60'
                            : 'cursor-pointer hover:bg-primary-light/30',
                        )}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          disabled={assigned || submitting}
                          onChange={() => toggle(learner.learnerId)}
                          className="peer sr-only"
                        />
                        <span
                          aria-hidden="true"
                          className={cx(
                            'flex h-5 w-5 shrink-0 items-center justify-center rounded-[5px] border transition-colors',
                            isChecked
                              ? 'border-primary bg-primary'
                              : 'border-muted/60',
                          )}
                        />

                        <span className="min-w-0 flex-1">
                          <span className="block b2-b text-text">
                            {learnerName(learner)}
                          </span>
                          <span className="block f1-r text-muted">
                            {learner.email}
                          </span>
                        </span>

                        {assigned && (
                          <span className="shrink-0 rounded-full bg-secondary-light px-2.5 py-1 f2-m text-secondary-dark">
                            Already assigned
                          </span>
                        )}

                        {movedFrom && (
                          <span className="shrink-0 rounded-full bg-warning-light px-2.5 py-1 f2-m text-warning-dark">
                            Currently on {movedFrom} — will be moved
                          </span>
                        )}
                      </label>
                    </li>
                  );
                })}
              </ul>
            )}

            {movingCount > 0 && (
              <div className="mx-6 mt-4 flex items-start gap-3 rounded-input bg-warning/10 px-4 py-3">
                <AlertTriangle
                  size={16}
                  className="mt-0.5 shrink-0 text-warning"
                />
                <p className="f1-r text-text-secondary">
                  {movingCount} selected learner
                  {movingCount === 1 ? ' is' : 's are'} already on another
                  course. Assigning will move them — a learner can only be on
                  one course at a time.
                </p>
              </div>
            )}

            <div className="flex items-center justify-between gap-4 px-6 py-5">
              <p className="b2-r text-muted">
                {selected.size} selected
              </p>
              <AppButton
                radius="full"
                disabled={selected.size === 0 || submitting}
                loading={submitting}
                onClick={handleAssign}
              >
                Assign to {course.title}
              </AppButton>
            </div>

            {results && (
              <div className="border-t border-disabled px-6 py-5">
                <p className="b2-b text-text">Results</p>
                <ul className="mt-3 flex flex-col gap-2">
                  {results.map((result) => (
                    <li
                      key={result.learnerId}
                      className="flex items-start justify-between gap-4"
                    >
                      <span className="b2-r text-text">{result.name}</span>
                      <span
                        className={cx(
                          'shrink-0 text-right f1-r',
                          result.ok ? 'text-secondary-dark' : 'text-error',
                        )}
                      >
                        {result.ok ? 'Assigned' : result.message}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </>
        )}
      </AppCard>
    </div>
  );
}
