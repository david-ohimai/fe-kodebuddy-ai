'use client';

import { useCallback, useEffect, useState } from 'react';
import { getCourse, type Course } from '@/lib/api/courses.api';
import { listCourseModules, type CourseModule } from '@/lib/api/modules.api';
import {
  getCourseProgress,
  getModuleProgress,
  type CourseProgress,
  type ModuleProgress,
} from '@/lib/api/progress.api';
import { getErrorMessage } from '@/lib/api/client';

export interface ModuleWithProgress extends CourseModule {
  progress: ModuleProgress | null;
}

export function useCourseCurriculum(courseId: number) {
  const [course, setCourse] = useState<Course | null>(null);
  const [modules, setModules] = useState<ModuleWithProgress[]>([]);
  const [courseProgress, setCourseProgress] = useState<CourseProgress | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  const retry = useCallback(() => setReloadKey((key) => key + 1), []);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const [courseData, moduleList, progress] = await Promise.all([
          getCourse(courseId),
          listCourseModules(courseId),
          getCourseProgress(courseId).catch(() => null),
        ]);

        const withProgress = await Promise.all(
          moduleList.map(async (module) => ({
            ...module,
            progress: await getModuleProgress(module.id).catch(() => null),
          })),
        );

        if (!cancelled) {
          setCourse(courseData);
          setModules(withProgress);
          setCourseProgress(progress);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            getErrorMessage(
              err,
              'Could not load this course. Please try again.',
            ),
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [courseId, reloadKey]);

  return { course, modules, courseProgress, loading, error, retry };
}
