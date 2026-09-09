'use client';

import { useEffect, useState } from 'react';
import { useToast } from '@/components/ui/ToastProvider';
import * as resourcesApi from '@/lib/api/resources.api';
import { getErrorMessage } from '@/lib/api/client';
import type { CourseResource } from '@/lib/api/resources.api';
import type { CourseModule } from '@/lib/api/modules.api';

import type { Lesson } from '@/lib/api/lessons.api';

export interface ResourceFormInput {
  title: string;
  type: string;
  url?: string;
  description?: string;
  content?: string;
  file?: File;
}

/** Course-wide, aggregated the same way useCourseAssignments/useCourseFaqs are. */
export function useCourseResources(
  modules: CourseModule[],
  lessonsByModule?: Record<number, Lesson[]>,
) {
  const { showSuccess, showError } = useToast();
  const [resources, setResources] = useState<CourseResource[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const moduleIds = modules.map((m) => m.id).join(',');
  const lessonIds = lessonsByModule
    ? Object.values(lessonsByModule)
        .flat()
        .map((l) => l.id)
        .join(',')
    : '';

  const loadResources = () => {
    if (modules.length === 0) {
      setResources([]);
      setLoading(false);
      return;
    }
    setLoading(true);

    const modulePromises = modules.map((m) =>
      resourcesApi.listModuleResourcesFull(m.id).catch(() => []),
    );
    const lessonIdList = lessonsByModule
      ? Object.values(lessonsByModule)
          .flat()
          .map((l) => l.id)
      : [];
    const lessonPromises = lessonIdList.map((lid) =>
      resourcesApi.listLessonResources(lid).catch(() => []),
    );

    Promise.all([...modulePromises, ...lessonPromises])
      .then((lists) => {
        const seen = new Set<number>();
        const merged: CourseResource[] = [];
        for (const r of lists.flat()) {
          if (!seen.has(r.id)) {
            seen.add(r.id);
            merged.push(r);
          }
        }
        setResources(merged);
      })
      .catch((err) => {
        showError(
          'Could not load resources',
          getErrorMessage(err, 'Please try again.'),
        );
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadResources();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [moduleIds, lessonIds]);

  // New resources attach to the course's first module for the same reason
  // new assignments/FAQs do — see useCourseAssignments.
  const defaultModuleId = modules[0]?.id ?? null;

  const addResource = async (data: ResourceFormInput) => {
    if (!defaultModuleId) {
      throw new Error('Add a module to this course before adding resources.');
    }
    setSaving(true);
    try {
      const backendType = data.type === 'document' ? 'file' : data.type;
      const created = await resourcesApi.createModuleResource(
        defaultModuleId,
        {
          ...data,
          type: backendType,
        },
      );
      setResources((prev) => [...prev, created]);
      showSuccess(
        'Resource added successfully.',
        `"${data.title}" was added to this course.`,
      );
      return created;
    } finally {
      setSaving(false);
    }
  };

  const editResource = async (
    resource: CourseResource,
    data: ResourceFormInput,
  ) => {
    setSaving(true);
    try {
      const backendType = data.type === 'document' ? 'file' : data.type;
      const updated = await resourcesApi.updateModuleResource(
        resource.moduleId,
        resource.id,
        {
          ...data,
          type: backendType,
        },
      );
      setResources((prev) =>
        prev.map((r) => (r.id === updated.id ? updated : r)),
      );
      showSuccess(
        'Resource updated successfully.',
        `"${data.title}" has been saved.`,
      );
      return updated;
    } finally {
      setSaving(false);
    }
  };

  const deleteResource = async (resource: CourseResource) => {
    setSaving(true);
    try {
      await resourcesApi.deleteModuleResource(resource.moduleId, resource.id);
      setResources((prev) => prev.filter((r) => r.id !== resource.id));
      showSuccess('Resource deleted.', `"${resource.title}" was removed.`);
    } finally {
      setSaving(false);
    }
  };

  return {
    resources,
    loading,
    saving,
    hasModules: modules.length > 0,
    addResource,
    editResource,
    deleteResource,
  };
}
