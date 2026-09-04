'use client';

import { useEffect, useState } from 'react';
import { listCourses, type Course } from '@/lib/api/courses.api';

export function useAvailableCourses() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    listCourses()
      .then((all) => {
        if (!cancelled) setCourses(all.filter((c) => c.isActive));
      })
      .catch(() => {
        if (!cancelled) {
          setError('Could not load available courses.');
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return { courses, loading, error };
}
