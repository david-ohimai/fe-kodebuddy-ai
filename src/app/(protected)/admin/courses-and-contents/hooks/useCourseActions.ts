'use client';

import { useState } from 'react';
import * as coursesApi from '@/lib/api/courses.api';
import type { Course } from '@/lib/api/courses.api';

export function useCourseActions(
  course: Course,
  onCourseChanged: (course: Course) => void,
) {
  const [saving, setSaving] = useState(false);

  const publish = async () => {
    setSaving(true);
    try {
      const updated = await coursesApi.updateCourse(course.id, {
        isActive: true,
      });
      onCourseChanged(updated);
      return updated;
    } finally {
      setSaving(false);
    }
  };

  const saveDescription = async (description: string) => {
    setSaving(true);
    try {
      const updated = await coursesApi.updateCourse(course.id, {
        description: description.trim(),
      });
      onCourseChanged(updated);
      return updated;
    } finally {
      setSaving(false);
    }
  };

  return { saving, publish, saveDescription };
}
