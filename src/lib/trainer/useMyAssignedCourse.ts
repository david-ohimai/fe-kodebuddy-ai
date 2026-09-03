'use client';

import { useEffect, useState } from 'react';
import * as coursesApi from '@/lib/api/courses.api';
import * as cohortsApi from '@/lib/api/cohorts.api';
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
        const [cohorts, courses] = await Promise.all([
          cohortsApi.listCohorts(),
          coursesApi.listCourses(),
        ]);

        const assignments = await Promise.all(
          cohorts.map((cohort) =>
            cohortsApi
              .getCohortTrainers(cohort.id)
              .then((trainers) => ({ cohort, trainers }))
              .catch(() => ({ cohort, trainers: [] })),
          ),
        );

        const myAssignment = assignments.find(({ trainers }) =>
          trainers.some((t) => t.trainerId === trainerId && !t.removedAt),
        );

        if (!myAssignment) {
          if (!cancelled) {
            setData(null);
            setCohortWithoutCourse(null);
          }
          return;
        }

        const course =
          courses.find((c) => c.cohortId === myAssignment.cohort.id) ?? null;

        if (!course) {
          if (!cancelled) {
            setData(null);
            setCohortWithoutCourse(myAssignment.cohort);
          }
          return;
        }

        const learners = await cohortsApi.getCohortLearners(
          myAssignment.cohort.id,
        );
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
          setCohortWithoutCourse(null);
          setData({
            course,
            cohort: myAssignment.cohort,
            learners: activeLearners,
            learnerCount: activeLearners.length,
            completionPercent,
          });
        }
      } catch {
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
