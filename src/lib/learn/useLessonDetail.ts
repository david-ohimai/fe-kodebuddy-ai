'use client';

import { useEffect, useState } from 'react';
import { getLesson, type Lesson } from '@/lib/api/lessons.api';
import { getModule, type CourseModule } from '@/lib/api/modules.api';
import { getCourse, type Course } from '@/lib/api/courses.api';
import { listModuleLessons } from '@/lib/api/lessons.api';
import {
  getModuleProgress,
  toggleLessonCompletion,
} from '@/lib/api/progress.api';

export function useLessonDetail(lessonId: number) {
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [module, setModule] = useState<CourseModule | null>(null);
  const [course, setCourse] = useState<Course | null>(null);
  const [siblingLessons, setSiblingLessons] = useState<Lesson[]>([]);
  const [completedIds, setCompletedIds] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toggling, setToggling] = useState(false);
  const [justCompleted, setJustCompleted] = useState(false);

  useEffect(() => {
    let cancelled = false;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setJustCompleted(false);

    async function load() {
      try {
        const lessonData = await getLesson(lessonId);
        const [moduleData, lessons, progress] = await Promise.all([
          getModule(lessonData.moduleId),
          listModuleLessons(lessonData.moduleId),
          getModuleProgress(lessonData.moduleId).catch(() => null),
        ]);
        const courseData = await getCourse(moduleData.courseId);

        if (!cancelled) {
          setLesson(lessonData);
          setModule(moduleData);
          setCourse(courseData);
          setSiblingLessons(lessons);
          setCompletedIds(
            new Set(
              (progress?.lessons ?? [])
                .filter((l) => l.isCompleted)
                .map((l) => l.lessonId),
            ),
          );
        }
      } catch {
        if (!cancelled) {
          setError('Could not load this lesson. Please try again.');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [lessonId]);

  const isCompleted = lesson ? completedIds.has(lesson.id) : false;
  const currentIndex = lesson
    ? siblingLessons.findIndex((l) => l.id === lesson.id)
    : -1;
  const previousLesson = currentIndex > 0 ? siblingLessons[currentIndex - 1] : null;
  const nextLesson =
    currentIndex >= 0 && currentIndex < siblingLessons.length - 1
      ? siblingLessons[currentIndex + 1]
      : null;

  const markComplete = async () => {
    if (!lesson || isCompleted) return;
    setToggling(true);
    try {
      const result = await toggleLessonCompletion(lesson.id);
      setCompletedIds((prev) => {
        const next = new Set(prev);
        if (result.isCompleted) next.add(lesson.id);
        else next.delete(lesson.id);
        return next;
      });
      setJustCompleted(result.isCompleted);
    } finally {
      setToggling(false);
    }
  };

  return {
    lesson,
    module,
    course,
    siblingLessons,
    isCompleted,
    completedCount: completedIds.size,
    totalLessons: siblingLessons.length,
    previousLesson,
    nextLesson,
    loading,
    error,
    toggling,
    justCompleted,
    markComplete,
  };
}
