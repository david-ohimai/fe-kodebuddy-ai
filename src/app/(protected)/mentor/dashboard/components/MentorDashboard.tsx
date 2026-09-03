'use client';

import React, { useEffect, useState } from 'react';
import { Users, Flag, ClipboardCheck } from 'lucide-react';
import { AppCard } from '@/components/ui/AppCard';
import AppEmptyState from '@/components/ui/AppEmptyState';
import AppSpinner from '@/components/ui/AppSpinner';
import { useToast } from '@/components/ui/ToastProvider';
import { useCurrentUserContext } from '@/lib/auth/CurrentUserContext';
import * as mentorsApi from '@/lib/api/mentors.api';
import * as activityApi from '@/lib/api/activity.api';
import { ACTIVITY_TYPE_LABEL } from '@/lib/api/activity.api';
import activity from '@/assets/images/activity.webp';

interface MentorStats {
  totalLearners: number;
  checkInsThisWeek: number;
}

export default function MentorDashboard() {
  const { user } = useCurrentUserContext();
  const { showError } = useToast();
  const firstName =
    user?.fullName?.trim().split(' ')[0] ||
    user?.email.split('@')[0] ||
    'there';

  const [stats, setStats] = useState<MentorStats>({
    totalLearners: 0,
    checkInsThisWeek: 0,
  });
  const [activities, setActivities] = useState<activityApi.ActivityEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    Promise.allSettled([
      mentorsApi.listMyAssignedLearners(),
      mentorsApi.listMyCheckIns(),
      activityApi.listMentorActivity(20),
    ]).then(([learnersResult, checkInsResult, activityResult]) => {
      if (cancelled) return;

      const sevenDaysAgo = Date.now() - 7 * 86_400_000;
      setStats({
        totalLearners:
          learnersResult.status === 'fulfilled'
            ? learnersResult.value.length
            : 0,
        checkInsThisWeek:
          checkInsResult.status === 'fulfilled'
            ? checkInsResult.value.filter(
                (c) => new Date(c.createdAt).getTime() >= sevenDaysAgo,
              ).length
            : 0,
      });

      if (activityResult.status === 'fulfilled') {
        setActivities(activityResult.value);
      }

      setLoading(false);

      const failed = [learnersResult, checkInsResult].some(
        (r) => r.status === 'rejected',
      );
      if (failed) {
        showError(
          'Some dashboard data could not load',
          'Part of the dashboard may be showing incomplete numbers. Try refreshing shortly.',
        );
      }
    });

    return () => {
      cancelled = true;
    };
  }, [showError]);

  const STAT_CARDS = [
    {
      icon: Users,
      label: 'Total learners',
      value: stats.totalLearners,
      subtext: 'All learners assigned',
    },
    {
      icon: Flag,
      label: 'Needs attention',
      value: '—',
      subtext: 'Not available for mentors yet',
    },
    {
      icon: ClipboardCheck,
      label: 'Check ins',
      value: stats.checkInsThisWeek,
      subtext: 'Sent this week',
    },
  ];

  return (
    <div>
      <div className="mb-6">
        <h1 className="h5-b text-text">Welcome back, {firstName}! 👋</h1>
        <p className="b2-r mt-1 text-text-secondary">
          Here&apos;s how the learners assigned to you are doing.
        </p>
      </div>

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {STAT_CARDS.map(({ icon: Icon, label, value, subtext }) => (
          <AppCard key={label} padding="md">
            <AppCard.Icon variant="primary" className="mb-3">
              <Icon />
            </AppCard.Icon>
            <p className="b2-m text-text-secondary">{label}</p>
            <p className="h3-b mt-1 text-text">{loading ? '—' : value}</p>
            <p className="f1-r mt-1 text-muted">{subtext}</p>
          </AppCard>
        ))}
      </div>

      <AppCard padding="none">
        <div className="border-b border-muted/20 px-6 py-4">
          <h3 className="b1-b text-text">Recent Activity</h3>
        </div>
        {loading ? (
          <div className="flex min-h-[200px] items-center justify-center">
            <AppSpinner size={32} />
          </div>
        ) : activities.length === 0 ? (
          <AppEmptyState
            image={activity}
            title="No activity yet"
            description="Activity will appear here as your assigned learners make progress."
            className="!min-h-0 py-14"
          />
        ) : (
          <ul className="divide-y divide-muted/20">
            {activities.map((entry) => (
              <li
                key={entry.id}
                className="flex items-center justify-between gap-3 px-6 py-4"
              >
                <p className="b2-r text-text-secondary">
                  {entry.title || ACTIVITY_TYPE_LABEL[entry.activityType]}
                  {entry.description ? ` · ${entry.description}` : ''}
                </p>
                <span className="f1-r shrink-0 text-muted">
                  {new Date(entry.createdAt).toLocaleString('en-US', {
                    day: 'numeric',
                    month: 'short',
                    hour: 'numeric',
                    minute: '2-digit',
                  })}
                </span>
              </li>
            ))}
          </ul>
        )}
      </AppCard>
    </div>
  );
}
