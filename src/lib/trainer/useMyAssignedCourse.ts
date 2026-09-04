'use client';

import { useEffect, useState } from 'react';
import * as coursesApi from '@/lib/api/courses.api';
import * as cohortsApi from '@/lib/api/cohorts.api';
import { getTrainerDashboard } from '@/lib/api/dashboard.api';
import { ApiError } from '@/lib/api/client';
import type { Course } from '@/lib/api/courses.api';
import type { Cohort, CohortLearner } from '@/lib/api/cohorts.api';

export interface AssignedCourseInfo {
  course: Course;
  cohort: Cohort;
  learners: CohortLearner[];
  learnerCount: number;
  completionPercent: number;
}

interface UseMyAssignedCourseResult {
  data: AssignedCourseInfo | null;
  cohortWithoutCourse: Cohort | null;
  loading: boolean;
  error: string | null;
}

function firstNumber(...candidates: unknown[]): number | null {
  for (const c of candidates) {
    if (typeof c === 'number' && Number.isFinite(c)) return c;
  }
  return null;
}

function extractAssignment(
  raw: unknown,
): { cohortId: number; courseId: number | null } | null {
  console.log('[useMyAssignedCourse] Raw /dashboard/trainer response:', raw);

  if (!raw || typeof raw !== 'object') return null;
  const obj = raw as Record<string, unknown>;

  const cohort = obj.cohort as Record<string, unknown> | undefined;
  const course = obj.course as Record<string, unknown> | undefined;
  const cohorts = obj.cohorts as unknown[] | undefined;
  const courses = obj.courses as unknown[] | undefined;
  const firstOfArray = (arr: unknown[] | undefined) =>
    arr && arr.length > 0 && typeof arr[0] === 'object'
      ? (arr[0] as Record<string, unknown>)
      : undefined;
  const firstCohortFromArray = firstOfArray(cohorts);
  const firstCourseFromArray = firstOfArray(courses);

  const cohortId = firstNumber(
    obj.cohort_id,
    obj.cohortId,
    cohort?.id,
    cohort?.cohort_id,
    firstCohortFromArray?.id,
    firstCohortFromArray?.cohort_id,
  );

  const courseId = firstNumber(
    obj.course_id,
    obj.courseId,
    course?.id,
    course?.course_id,
    firstCourseFromArray?.id,
    firstCourseFromArray?.course_id,
  );

  if (cohortId === null) return null;
  return { cohortId, courseId };
}

export function useMyAssignedCourse(
  trainerId: number | undefined,
): UseMyAssignedCourseResult {
  const [data, setData] = useState<AssignedCourseInfo | null>(null);
  const [cohortWithoutCourse, setCohortWithoutCourse] = useState<Cohort | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!trainerId) return;
    let cancelled = false;

    (async () => {
      try {
        const dashboard = await getTrainerDashboard();
        const assignment = extractAssignment(dashboard);

        if (!assignment) {
          if (!cancelled) {
            setData(null);
            setCohortWithoutCourse(null);
          }
          return;
        }

        const cohort = await cohortsApi.getCohortById(assignment.cohortId);

        let course: Course | null = assignment.courseId
          ? await coursesApi.getCourse(assignment.courseId).catch(() => null)
          : null;

        if (!course) {
          const allCourses = await coursesApi.listCourses();
          const cohortCourses = allCourses
            .filter((c) => c.cohortId === cohort.id)
            .sort(
              (a, b) => Number(b.isActive) - Number(a.isActive) || b.id - a.id,
            );
          course = cohortCourses[0] ?? null;
        }

        if (!course) {
          if (!cancelled) {
            setData(null);
            setCohortWithoutCourse(cohort);
          }
          return;
        }

        const learners = await cohortsApi
          .getCohortLearners(cohort.id)
          .catch((err) => {
            const detail =
              err instanceof ApiError
                ? `${err.status} ${err.message}`
                : String(err);
            console.error(
              `[useMyAssignedCourse] GET /assign-cohorts/${cohort.id}/learners failed: ${detail}`,
            );
            return [];
          });
        const activeLearners = learners.filter((l) => l.isActive);
        const completionPercent =
          activeLearners.length === 0
            ? 0
            : Math.round(
                (activeLearners.filter((l) => l.completedAt).length /
                  activeLearners.length) *
                  100,
              );

        if (!cancelled) {
          setError(null);
          setCohortWithoutCourse(null);
          setData({
            course,
            cohort,
            learners: activeLearners,
            learnerCount: activeLearners.length,
            completionPercent,
          });
        }
      } catch (err) {
        const detail =
          err instanceof ApiError
            ? `${err.status} ${err.message}`
            : String(err);
        console.error(
          `[useMyAssignedCourse] GET /dashboard/trainer failed: ${detail}`,
        );
        if (!cancelled) {
          setError('Could not load your assigned course. Please try again.');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [trainerId]);

  return { data, cohortWithoutCourse, loading, error };
}
