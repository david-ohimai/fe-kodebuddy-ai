'use client';

import { useEffect, useState } from 'react';
import { useToast } from '@/components/ui/ToastProvider';
import * as modulesApi from '@/lib/api/modules.api';
import * as lessonsApi from '@/lib/api/lessons.api';
import { getErrorMessage } from '@/lib/api/client';
import type { CourseModule } from '@/lib/api/modules.api';
import type { Lesson } from '@/lib/api/lessons.api';

export function useCourseContent(courseId: number) {
  const { showSuccess, showError } = useToast();

  const [modules, setModules] = useState<CourseModule[]>([]);
  const [lessonsByModule, setLessonsByModule] = useState<
    Record<number, Lesson[]>
  >({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const loadContent = () => {
    setLoading(true);
    modulesApi
      .listCourseModules(courseId)
      .then(async (moduleList) => {
        setModules(moduleList);
        const lessonLists = await Promise.all(
          moduleList.map((m) => lessonsApi.listModuleLessons(m.id)),
        );
        const map: Record<number, Lesson[]> = {};
        moduleList.forEach((m, i) => {
          map[m.id] = lessonLists[i];
        });
        setLessonsByModule(map);
      })
      .catch((err) => {
        showError(
          'Could not load course content',
          getErrorMessage(err, 'Please try again.'),
        );
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadContent();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courseId]);

  const totalLessons = modules.reduce(
    (sum, m) => sum + (lessonsByModule[m.id]?.length ?? 0),
    0,
  );

  const addModule = async (data: { title: string; description?: string }) => {
    const created = await modulesApi.createModule({
      courseId,
      title: data.title,
      description: data.description,
      order: modules.length + 1,
    });
    setModules((prev) => [...prev, created]);
    setLessonsByModule((prev) => ({ ...prev, [created.id]: [] }));
    showSuccess('Module added.', `"${data.title}" was added to this course.`);
    return created;
  };

  const editModule = async (
    moduleId: number,
    data: { title: string; description?: string },
  ) => {
    const updated = await modulesApi.updateModule(moduleId, {
      title: data.title,
      description: data.description,
    });
    setModules((prev) => prev.map((m) => (m.id === updated.id ? updated : m)));
    showSuccess('Module updated.', `"${data.title}" has been saved.`);
    return updated;
  };

  const deleteModule = async (module: CourseModule) => {
    setSaving(true);
    try {
      await modulesApi.deleteModule(module.id);
      setModules((prev) => prev.filter((m) => m.id !== module.id));
      setLessonsByModule((prev) => {
        const next = { ...prev };
        delete next[module.id];
        return next;
      });
      showSuccess('Module deleted.', `"${module.title}" was removed.`);
    } finally {
      setSaving(false);
    }
  };

  const addLesson = async (
    moduleId: number,
    data: { title: string; description?: string },
  ) => {
    const created = await lessonsApi.createLesson({
      moduleId,
      title: data.title,
      contentBody: data.description,
      order: (lessonsByModule[moduleId]?.length ?? 0) + 1,
    });
    setLessonsByModule((prev) => ({
      ...prev,
      [moduleId]: [...(prev[moduleId] ?? []), created],
    }));
    showSuccess('Lesson added.', `"${data.title}" was added to this module.`);
    return created;
  };

  const editLesson = async (
    moduleId: number,
    lessonId: number,
    data: { title: string; description?: string },
  ) => {
    const updated = await lessonsApi.updateLesson(lessonId, {
      title: data.title,
      contentBody: data.description,
    });
    setLessonsByModule((prev) => ({
      ...prev,
      [moduleId]: (prev[moduleId] ?? []).map((l) =>
        l.id === updated.id ? updated : l,
      ),
    }));
    showSuccess('Lesson updated.', `"${data.title}" has been saved.`);
    return updated;
  };

  const deleteLesson = async (
    moduleId: number,
    lessonId: number,
    title: string,
  ) => {
    setSaving(true);
    try {
      await lessonsApi.deleteLesson(lessonId);
      setLessonsByModule((prev) => ({
        ...prev,
        [moduleId]: (prev[moduleId] ?? []).filter((l) => l.id !== lessonId),
      }));
      showSuccess('Lesson deleted.', `"${title}" was removed.`);
    } finally {
      setSaving(false);
    }
  };

  return {
    modules,
    lessonsByModule,
    loading,
    saving,
    totalLessons,
    addModule,
    editModule,
    deleteModule,
    addLesson,
    editLesson,
    deleteLesson,
  };
}
