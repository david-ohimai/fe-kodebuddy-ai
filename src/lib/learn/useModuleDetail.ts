'use client';

import { useCallback, useEffect, useState } from 'react';
import { getModule, type CourseModule } from '@/lib/api/modules.api';
import { getCourse, type Course } from '@/lib/api/courses.api';
import { listModuleLessons, type Lesson } from '@/lib/api/lessons.api';
import { listLessonResources } from '@/lib/api/resources.api';
import { getModuleProgress, type ModuleProgress } from '@/lib/api/progress.api';
import { getErrorMessage } from '@/lib/api/client';
import type { LessonContentType } from '@/types/lesson-content.types';

export interface LessonWithProgress extends Lesson {
  isCompleted: boolean;
}

export function useModuleDetail(moduleId: number) {
  const [module, setModule] = useState<CourseModule | null>(null);
  const [course, setCourse] = useState<Course | null>(null);
  const [lessons, setLessons] = useState<LessonWithProgress[]>([]);
  const [moduleProgress, setModuleProgress] = useState<ModuleProgress | null>(
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
        const moduleData = await getModule(moduleId);
        const [courseData, lessonList, progress] = await Promise.all([
          getCourse(moduleData.courseId),
          listModuleLessons(moduleId),
          getModuleProgress(moduleId).catch(() => null),
        ]);

        const lessonResources = await Promise.all(
          lessonList.map((l) => listLessonResources(l.id).catch(() => [])),
        );

        const completedIds = new Set(
          (progress?.lessons ?? [])
            .filter((l) => l.isCompleted)
            .map((l) => l.lessonId),
        );

        if (!cancelled) {
          setModule(moduleData);
          setCourse(courseData);
          setLessons(
            lessonList.map((lesson, idx) => {
              const res = lessonResources[idx]?.[0];
              const rawType = res?.type?.toLowerCase();
              const contentType: LessonContentType | undefined =
                rawType === 'file' || rawType === 'document'
                  ? 'document'
                  : rawType === 'link'
                    ? 'link'
                    : rawType === 'article'
                      ? 'article'
                      : undefined;
              return {
                ...lesson,
                resourceType: contentType,
                isCompleted: completedIds.has(lesson.id),
              };
            }),
          );
          setModuleProgress(progress);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            getErrorMessage(
              err,
              'Could not load this module. Please try again.',
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
  }, [moduleId, reloadKey]);

  return { module, course, lessons, moduleProgress, loading, error, retry };
}
