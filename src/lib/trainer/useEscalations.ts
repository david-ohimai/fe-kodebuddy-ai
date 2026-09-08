'use client';

import { useCallback, useEffect, useState } from 'react';
import * as chatApi from '@/lib/api/chat.api';
import * as coursesApi from '@/lib/api/courses.api';
import { getErrorMessage } from '@/lib/api/client';
import type { CourseLearner } from '@/lib/api/courses.api';
import type { Escalation } from '@/types/chat.types';

export function useEscalations() {
  const [escalations, setEscalations] = useState<Escalation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    setError(null);
    chatApi
      .listTrainerEscalations()
      .then(async (items) => {
        const courseIds = [...new Set(items.map((e) => e.courseId))];
        const learnersByCourse = await Promise.all(
          courseIds.map((courseId) =>
            coursesApi.listCourseLearners(courseId).catch((err) => {
              console.warn(
                `[escalations] GET /courses/${courseId}/learners failed — escalations for this course will show "Unknown learner".`,
                err,
              );
              return [] as CourseLearner[];
            }),
          ),
        );
        const learnerById = new Map<number, CourseLearner>();
        for (const learners of learnersByCourse) {
          for (const learner of learners) {
            learnerById.set(learner.learnerId, learner);
          }
        }

        setEscalations(
          items.map((e) => {
            const learner = learnerById.get(e.learnerId);
            return {
              ...e,
              learnerName: learner?.fullName || learner?.email || null,
            };
          }),
        );
      })
      .catch((err: unknown) => {
        setError(getErrorMessage(err, 'Please try again.'));
        setEscalations([]);
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [load]);

  return { escalations, loading, error, refresh: load };
}
