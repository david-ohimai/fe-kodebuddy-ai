'use client';

import { useEffect, useState } from 'react';
import { useToast } from '@/components/ui/ToastProvider';
import * as activityApi from '@/lib/api/activity.api';
import * as mentorsApi from '@/lib/api/mentors.api';
import { getErrorMessage } from '@/lib/api/client';
import {
  toneForKind,
  type MentorNotification,
  type MentorNotificationKind,
} from '@/types/notification.types';

function learnerDisplayName(
  learnerId: number,
  names: Map<number, string>,
): string {
  return names.get(learnerId) ?? `Learner #${learnerId}`;
}

export function useMentorNotifications() {
  const { showError } = useToast();
  const [notifications, setNotifications] = useState<MentorNotification[]>([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    Promise.all([
      activityApi.listMentorActivity(),
      mentorsApi.listMyCheckIns(),
      mentorsApi.listMyAssignedLearners(),
    ])
      .then(([activity, checkIns, learners]) => {
        const names = new Map(
          learners.map((learner) => [
            learner.learnerId,
            learner.fullName || learner.email,
          ]),
        );

        const fromActivity: MentorNotification[] = activity.map((entry) => {
          const kind = entry.activityType as MentorNotificationKind;
          return {
            id: `activity-${entry.id}`,
            learnerId: entry.userId,
            learnerName: learnerDisplayName(entry.userId, names),
            kind,
            title: entry.title,
            subject: entry.description ?? '',
            createdAt: entry.createdAt,
            read: false,
            tone: toneForKind(kind),
          };
        });

        const fromCheckIns: MentorNotification[] = checkIns.map((checkIn) => {
          const name = learnerDisplayName(checkIn.learnerId, names);
          return {
            id: `checkin-${checkIn.id}`,
            learnerId: checkIn.learnerId,
            learnerName: name,
            kind: 'check_in_sent',
            title: `You sent a check-in to ${name}`,
            subject: checkIn.notes ?? 'Delivered successfully',
            createdAt: checkIn.createdAt,
            read: false,
            tone: 'neutral',
          };
        });

        const merged = [...fromActivity, ...fromCheckIns].sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        );

        setNotifications(merged);
      })
      .catch((err) => {
        showError(
          'Could not load notifications',
          getErrorMessage(err, 'Please try again.'),
        );
        setNotifications([]);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { notifications, loading, refresh: load };
}
