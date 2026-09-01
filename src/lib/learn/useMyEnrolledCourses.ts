'use client';

import { useEffect, useState } from 'react';
import { getLearnerDashboard } from '@/lib/api/dashboard.api';
import { getCourseProgress } from '@/lib/api/progress.api';

export interface EnrolledCourseSummary {
  courseId: number;
  courseTitle: string;
  completionPercentage: number;
  totalModules: number;
  totalLessons: number;
  completedLessons: number;
}

export function useMyEnrolledCourses() {
  const [courses, setCourses] = useState<EnrolledCourseSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const dashboard = await getLearnerDashboard();
        const withProgress = await Promise.all(
          dashboard.courses.map(async (course) => {
            const progress = await getCourseProgress(course.courseId).catch(
              () => null,
            );
            return {
              courseId: course.courseId,
              courseTitle: course.courseTitle,
              completionPercentage: progress?.completionPercentage ?? 0,
              totalModules: progress?.totalModules ?? 0,
              totalLessons: progress?.totalLessons ?? 0,
              completedLessons: progress?.completedLessons ?? 0,
            };
          }),
        );
        if (!cancelled) setCourses(withProgress);
      } catch {
        if (!cancelled) {
          setError('Could not load your courses. Please try again.');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  return { courses, loading, error };
}
