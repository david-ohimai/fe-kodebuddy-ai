'use client';

import { useEffect, useState } from 'react';
import * as coursesApi from '@/lib/api/courses.api';
import * as cohortsApi from '@/lib/api/cohorts.api';
import type { Course } from '@/lib/api/courses.api';
import type { Cohort } from '@/lib/api/cohorts.api';

export interface AssignedCourseInfo {
  course: Course;
  cohort: Cohort;
  learnerCount: number;
}

interface UseMyAssignedCourseResult {
  data: AssignedCourseInfo | null;
  loading: boolean;
  error: string | null;
}

export function useMyAssignedCourse(
  trainerId: number | undefined,
): UseMyAssignedCourseResult {
  const [data, setData] = useState<AssignedCourseInfo | null>(null);
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

        const course = myAssignment
          ? (courses.find((c) => c.cohortId === myAssignment.cohort.id) ?? null)
          : null;

        if (!myAssignment || !course) {
          if (!cancelled) setData(null);
          return;
        }

        const learners = await cohortsApi.getCohortLearners(
          myAssignment.cohort.id,
        );
        const learnerCount = learners.filter((l) => l.isActive).length;

        if (!cancelled) {
          setData({ course, cohort: myAssignment.cohort, learnerCount });
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

  return { data, loading, error };
}
