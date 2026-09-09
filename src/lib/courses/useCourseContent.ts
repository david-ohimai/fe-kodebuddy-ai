'use client';

import { useEffect, useState } from 'react';
import { useToast } from '@/components/ui/ToastProvider';
import * as modulesApi from '@/lib/api/modules.api';
import * as lessonsApi from '@/lib/api/lessons.api';
import * as resourcesApi from '@/lib/api/resources.api';
import { getErrorMessage } from '@/lib/api/client';
import type { CourseModule } from '@/lib/api/modules.api';
import type { Lesson } from '@/lib/api/lessons.api';
import type { LessonContentType } from '@/types/lesson-content.types';

interface ToastOverride {
  title: string;
  message: string;
}

export interface LessonFormInput {
  title: string;
  description?: string;
  contentType?: LessonContentType;
  file?: File;
  fileName?: string;
  fileSize?: string;
  resourceUrl?: string;
  articleContent?: string;
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
        const [lessonLists, moduleResourceLists] = await Promise.all([
          Promise.all(moduleList.map((m) => lessonsApi.listModuleLessons(m.id))),
          Promise.all(
            moduleList.map((m) =>
              resourcesApi.listModuleResourcesFull(m.id).catch(() => []),
            ),
          ),
        ]);

        const allLessons = lessonLists.flat();
        const lessonResourceLists = await Promise.all(
          allLessons.map((l) =>
            resourcesApi.listLessonResources(l.id).catch(() => []),
          ),
        );

        const resourceByLessonId = new Map<
          number,
          resourcesApi.CourseResource
        >();
        moduleResourceLists.flat().forEach((r) => {
          if (r.lessonId) resourceByLessonId.set(r.lessonId, r);
        });
        allLessons.forEach((l, idx) => {
          const res = lessonResourceLists[idx]?.[0];
          if (res) resourceByLessonId.set(l.id, res);
        });

        const map: Record<number, Lesson[]> = {};
        moduleList.forEach((m, i) => {
          const lessons = lessonLists[i];
          map[m.id] = lessons.map((l) => {
            const res = resourceByLessonId.get(l.id);
            if (!res) return l;
            const resType = res.type.toLowerCase();
            const contentType: LessonContentType =
              resType === 'file' || resType === 'document'
                ? 'document'
                : resType === 'link'
                  ? 'link'
                  : 'article';
            return {
              ...l,
              resourceType: contentType,
              resourceFileName: res.fileName ?? undefined,
            };
          });
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
    data: LessonFormInput,
    toastOverride?: ToastOverride,
  ) => {
    const effectiveType = data.contentType ?? 'article';
    const contentBody: string | undefined = data.description;

    // Step 1: Create lesson
    const created = await lessonsApi.createLesson({
      moduleId,
      title: data.title,
      contentBody,
      order: (lessonsByModule[moduleId]?.length ?? 0) + 1,
    });

    // Step 2: Create attached resource if data is provided
    let attachedResource: resourcesApi.CourseResource | null = null;
    const backendType =
      effectiveType === 'document' ? 'file' : effectiveType;

    const hasResourceData =
      (effectiveType === 'document' && (data.file || data.fileName)) ||
      (effectiveType === 'link' && data.resourceUrl) ||
      (effectiveType === 'article' && data.articleContent);

    if (hasResourceData) {
      try {
        attachedResource = await resourcesApi.createLessonResource(created.id, {
          title: data.title,
          description: data.description,
          type: backendType,
          file: data.file,
          url: data.resourceUrl,
          content: data.articleContent,
        });
      } catch (resourceErr) {
        console.error('Failed to create lesson resource:', resourceErr);
        try {
          await lessonsApi.deleteLesson(created.id);
        } catch (cleanupErr) {
          console.warn('Could not clean up orphan lesson:', cleanupErr);
        }
        throw resourceErr;
      }
    }

    const lessonWithResource: Lesson = {
      ...created,
      resourceType: effectiveType,
      resourceFileName:
        data.fileName ?? attachedResource?.fileName ?? undefined,
    };

    setLessonsByModule((prev) => ({
      ...prev,
      [moduleId]: [...(prev[moduleId] ?? []), lessonWithResource],
    }));

    const toast = toastOverride ?? {
      title: 'Lesson added.',
      message: `"${data.title}" was added to this module.`,
    };
    showSuccess(toast.title, toast.message);
    return lessonWithResource;
  };

  const editLesson = async (
    moduleId: number,
    lessonId: number,
    data: LessonFormInput,
    toastOverride?: ToastOverride,
  ) => {
    const effectiveType = data.contentType ?? 'article';
    const contentBody: string | undefined = data.description;

    const updated = await lessonsApi.updateLesson(lessonId, {
      title: data.title,
      contentBody,
    });

    const backendType =
      effectiveType === 'document' ? 'file' : effectiveType;

    try {
      const existingResources =
        await resourcesApi.listLessonResources(lessonId);
      const primary = existingResources[0];

      if (primary) {
        const isDocumentWithNewFile =
          effectiveType === 'document' && Boolean(data.file);
        const isLinkUpdate =
          effectiveType === 'link' &&
          Boolean(data.resourceUrl) &&
          data.resourceUrl?.trim() !== (primary.url ?? '').trim();
        const isArticleUpdate =
          effectiveType === 'article' &&
          data.articleContent !== undefined &&
          data.articleContent?.trim() !== (primary.content ?? '').trim();
        const isTypeChange =
          primary.type.toLowerCase() !== backendType;

        if (
          isDocumentWithNewFile ||
          isLinkUpdate ||
          isArticleUpdate ||
          isTypeChange
        ) {
          await resourcesApi.updateLessonResource(lessonId, primary.id, {
            title: data.title,
            description: data.description,
            type: backendType,
            file: data.file,
            url: effectiveType === 'link' ? data.resourceUrl : undefined,
            content:
              effectiveType === 'article' ? data.articleContent : undefined,
          });
        }
      } else if (
        data.file ||
        (effectiveType === 'link' && data.resourceUrl) ||
        (effectiveType === 'article' && data.articleContent)
      ) {
        await resourcesApi.createLessonResource(lessonId, {
          title: data.title,
          description: data.description,
          type: backendType,
          file: data.file,
          url: effectiveType === 'link' ? data.resourceUrl : undefined,
          content:
            effectiveType === 'article' ? data.articleContent : undefined,
        });
      }
    } catch (err) {
      console.warn('[editLesson] Could not sync lesson resource:', err);
    }

    const lessonWithResource: Lesson = {
      ...updated,
      resourceType: effectiveType,
      resourceFileName: data.fileName,
    };

    setLessonsByModule((prev) => ({
      ...prev,
      [moduleId]: (prev[moduleId] ?? []).map((l) =>
        l.id === updated.id ? lessonWithResource : l,
      ),
    }));

    const toast = toastOverride ?? {
      title: 'Lesson updated.',
      message: `"${data.title}" has been saved.`,
    };
    showSuccess(toast.title, toast.message);
    return lessonWithResource;
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
