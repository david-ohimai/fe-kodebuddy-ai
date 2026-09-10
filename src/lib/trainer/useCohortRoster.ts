'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import * as coursesApi from '@/lib/api/courses.api';
import * as mentorsApi from '@/lib/api/mentors.api';
import * as activityApi from '@/lib/api/activity.api';
import { getErrorMessage } from '@/lib/api/client';

export type RosterStatus = 'needs_attention' | 'on_track';

export interface RosterEntry {
  learnerId: number;
  fullName: string | null;
  email: string;
  progressPercentage: number | null;
  status: RosterStatus | null;
  lastActiveAt: string | null;
}

export type RosterTab = 'all' | 'needs_attention' | 'on_track';

const STATUS_THRESHOLD = 50;

export function useCohortRoster(courseId: number | undefined) {
  const [roster, setRoster] = useState<RosterEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sendingReminder, setSendingReminder] = useState(false);

  const [now] = useState(() => Date.now());

  const loadRoster = useCallback(() => {
    if (!courseId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);

    Promise.all([
      coursesApi.listCourseLearners(courseId),
      activityApi.listTrainerActivity(100).catch(() => []),
    ])
      .then(async ([learners, activity]) => {
        const lastActiveByLearner = new Map<number, string>();
        for (const entry of activity) {
          const current = lastActiveByLearner.get(entry.userId);
          if (!current || entry.createdAt > current) {
            lastActiveByLearner.set(entry.userId, entry.createdAt);
          }
        }

        const progressResults = await Promise.all(
          learners.map((l) =>
            mentorsApi
              .getLearnerCourseProgress(l.learnerId, courseId)
              .then((p) => p.completionPercentage)
              .catch(() => null),
          ),
        );

        setRoster(
          learners.map((l, index) => {
            const progressPercentage = progressResults[index];
            return {
              learnerId: l.learnerId,
              fullName: l.fullName,
              email: l.email,
              progressPercentage,
              status:
                progressPercentage === null
                  ? null
                  : progressPercentage < STATUS_THRESHOLD
                    ? 'needs_attention'
                    : 'on_track',
              lastActiveAt: lastActiveByLearner.get(l.learnerId) ?? null,
            };
          }),
        );
      })
      .catch((err) => {
        setError(getErrorMessage(err, 'Please try again.'));
        setRoster([]);
      })
      .finally(() => setLoading(false));
  }, [courseId]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadRoster();
  }, [loadRoster]);

  const stats = useMemo(() => {
    const needsAttention = roster.filter(
      (r) => r.status === 'needs_attention',
    ).length;
    const active = roster.filter((r) => {
      if (!r.lastActiveAt) return false;
      const days = (now - new Date(r.lastActiveAt).getTime()) / 86_400_000;
      return days <= 7;
    }).length;
    return { total: roster.length, needsAttention, active };
  }, [roster, now]);

  const sendReminder = async (subject: string, message: string) => {
    setSendingReminder(true);
    const now = new Date().toISOString();
    const notes = `${subject}\n\n${message}`.slice(0, 1000);
    try {
      await Promise.all(
        roster.map((r) =>
          mentorsApi.createCheckIn({
            learnerId: r.learnerId,
            scheduledTime: now,
            notes,
          }),
        ),
      );
    } finally {
      setSendingReminder(false);
    }
  };

  return {
    roster,
    loading,
    error,
    retry: loadRoster,
    stats,
    sendingReminder,
    sendReminder,
  };
}
