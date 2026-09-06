'use client';

import { useEffect, useState } from 'react';
import { useToast } from '@/components/ui/ToastProvider';
import * as modulesApi from '@/lib/api/modules.api';
import * as lessonsApi from '@/lib/api/lessons.api';
import { getErrorMessage } from '@/lib/api/client';
import type { CourseModule } from '@/lib/api/modules.api';
import type { Lesson } from '@/lib/api/lessons.api';

interface ToastOverride {
  title: string;
  message: string;
}

export function useCourseContent(courseId: number | null | undefined) {
  const { showSuccess, showError } = useToast();

  const [modules, setModules] = useState<CourseModule[]>([]);
  const [lessonsByModule, setLessonsByModule] = useState<
    Record<number, Lesson[]>
  >({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const loadContent = () => {
    if (!courseId) {
      setModules([]);
      setLessonsByModule({});
      setLoading(false);
      return;
    }
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

  const addModule = async (
    data: { title: string; description?: string },
    toastOverride?: ToastOverride,
  ) => {
    if (!courseId) throw new Error('No course selected.');
    const created = await modulesApi.createModule({
      courseId,
      title: data.title,
      description: data.description,
      order: modules.length + 1,
    });
    setModules((prev) => [...prev, created]);
    setLessonsByModule((prev) => ({ ...prev, [created.id]: [] }));
    const toast = toastOverride ?? {
      title: 'Module added.',
      message: `"${data.title}" was added to this course.`,
    };
    showSuccess(toast.title, toast.message);
    return created;
  };

  const editModule = async (
    moduleId: number,
    data: { title: string; description?: string },
    toastOverride?: ToastOverride,
  ) => {
    const updated = await modulesApi.updateModule(moduleId, {
      title: data.title,
      description: data.description,
    });
    setModules((prev) => prev.map((m) => (m.id === updated.id ? updated : m)));
    const toast = toastOverride ?? {
      title: 'Module updated.',
      message: `"${data.title}" has been saved.`,
    };
    showSuccess(toast.title, toast.message);
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
    toastOverride?: ToastOverride,
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
    const toast = toastOverride ?? {
      title: 'Lesson added.',
      message: `"${data.title}" was added to this module.`,
    };
    showSuccess(toast.title, toast.message);
    return created;
  };

  const editLesson = async (
    moduleId: number,
    lessonId: number,
    data: { title: string; description?: string },
    toastOverride?: ToastOverride,
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
    const toast = toastOverride ?? {
      title: 'Lesson updated.',
      message: `"${data.title}" has been saved.`,
    };
    showSuccess(toast.title, toast.message);
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

  const moveModule = async (moduleId: number, direction: 'up' | 'down') => {
    const index = modules.findIndex((m) => m.id === moduleId);
    const swapWith = direction === 'up' ? index - 1 : index + 1;
    if (index === -1 || swapWith < 0 || swapWith >= modules.length) return;

    const reordered = [...modules];
    [reordered[index], reordered[swapWith]] = [
      reordered[swapWith],
      reordered[index],
    ];
    const withNewOrder = reordered.map((m, i) => ({ ...m, order: i + 1 }));

    setModules(withNewOrder);
    setSaving(true);
    try {
      if (!courseId) return;
      const saved = await modulesApi.reorderModules(
        courseId,
        withNewOrder.map((m) => ({ id: m.id, order: m.order })),
      );
      setModules(saved);
    } catch (err) {
      setModules(modules);
      showError(
        'Could not reorder modules',
        getErrorMessage(err, 'Please try again.'),
      );
    } finally {
      setSaving(false);
    }
  };

  const moveLesson = async (
    moduleId: number,
    lessonId: number,
    direction: 'up' | 'down',
  ) => {
    const current = lessonsByModule[moduleId] ?? [];
    const index = current.findIndex((l) => l.id === lessonId);
    const swapWith = direction === 'up' ? index - 1 : index + 1;
    if (index === -1 || swapWith < 0 || swapWith >= current.length) return;

    const reordered = [...current];
    [reordered[index], reordered[swapWith]] = [
      reordered[swapWith],
      reordered[index],
    ];
    const withNewOrder = reordered.map((l, i) => ({ ...l, order: i + 1 }));

    setLessonsByModule((prev) => ({ ...prev, [moduleId]: withNewOrder }));
    setSaving(true);
    try {
      const saved = await lessonsApi.reorderLessons(
        moduleId,
        withNewOrder.map((l) => ({ id: l.id, order: l.order })),
      );
      setLessonsByModule((prev) => ({ ...prev, [moduleId]: saved }));
    } catch (err) {
      setLessonsByModule((prev) => ({ ...prev, [moduleId]: current }));
      showError(
        'Could not reorder lessons',
        getErrorMessage(err, 'Please try again.'),
      );
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
    moveModule,
    moveLesson,
  };
}
