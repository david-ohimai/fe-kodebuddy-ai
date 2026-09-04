'use client';

import { useEffect, useState } from 'react';
import { listMyCourses } from '@/lib/api/myCourses';
import { getCourseProgress } from '@/lib/api/progress.api';

export interface EnrolledCourseSummary {
  courseId: number;
  courseTitle: string;
  completionPercentage: number;
  totalModules: number;
  totalLessons: number;
  completedLessons: number;
}

export function useMyEnrolledCourses(learnerId: number | undefined) {
  const [courses, setCourses] = useState<EnrolledCourseSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const load = () => {
    if (!learnerId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);

    listMyCourses()
      .then((myCourses) =>
        Promise.all(
          myCourses.map(async (course) => {
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
        ),
      )
      .then(setCourses)
      .catch(() => {
        setError('Could not load your courses. Please try again.');
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [learnerId, refreshKey]);

  return {
    courses,
    loading,
    error,
    refresh: () => setRefreshKey((k) => k + 1),
  };
}
