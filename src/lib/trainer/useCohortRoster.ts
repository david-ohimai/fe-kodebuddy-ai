'use client';

import { useEffect, useMemo, useState } from 'react';
import { useToast } from '@/components/ui/ToastProvider';
import * as cohortsApi from '@/lib/api/cohorts.api';
import * as mentorsApi from '@/lib/api/mentors.api';
import * as activityApi from '@/lib/api/activity.api';
import { getErrorMessage } from '@/lib/api/client';

export type RosterStatus = 'needs_attention' | 'on_track';

export interface RosterEntry {
  learnerId: number;
  fullName: string | null;
  email: string;
  joinedAt: string;
  progressPercentage: number | null;
  status: RosterStatus | null;
  lastActiveAt: string | null;
}

export type RosterTab = 'all' | 'needs_attention' | 'on_track';

const STATUS_THRESHOLD = 50;

export function useCohortRoster(
  cohortId: number | undefined,
  courseId: number | undefined,
) {
  const { showError } = useToast();
  const [roster, setRoster] = useState<RosterEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [sendingReminder, setSendingReminder] = useState(false);

  const [now] = useState(() => Date.now());

  const loadRoster = () => {
    if (!cohortId || !courseId) {
      setLoading(false);
      return;
    }
    setLoading(true);

    Promise.all([
      cohortsApi.listCohortLearners(cohortId),
      activityApi.listTrainerActivity(100).catch(() => []),
    ])
      .then(async ([learners, activity]) => {
        const activeLearners = learners.filter((l) => l.isActive);

        const lastActiveByLearner = new Map<number, string>();
        for (const entry of activity) {
          const current = lastActiveByLearner.get(entry.userId);
          if (!current || entry.createdAt > current) {
            lastActiveByLearner.set(entry.userId, entry.createdAt);
          }
        }

        const progressResults = await Promise.all(
          activeLearners.map((l) =>
            mentorsApi
              .getLearnerCourseProgress(l.learnerId, courseId)
              .then((p) => p.completionPercentage)
              .catch(() => null),
          ),
        );

        setRoster(
          activeLearners.map((l, index) => {
            const progressPercentage = progressResults[index];
            return {
              learnerId: l.learnerId,
              fullName: l.fullName,
              email: l.email,
              joinedAt: l.joinedAt,
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
        showError(
          'Could not load your cohort',
          getErrorMessage(err, 'Please try again.'),
        );
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadRoster();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cohortId, courseId]);

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
    stats,
    sendingReminder,
    sendReminder,
  };
}
