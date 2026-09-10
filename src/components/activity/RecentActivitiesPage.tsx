'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, Clock } from 'lucide-react';
import AppButton from '@/components/ui/AppButton';
import { AppCard } from '@/components/ui/AppCard';
import AppEmptyState from '@/components/ui/AppEmptyState';
import PageHeader from '@/components/ui/AppPageHeader';
import AppPagination from '@/components/ui/AppPagination';
import AppSpinner from '@/components/ui/AppSpinner';
import type { ActivityEntry } from '@/lib/api/activity.api';
import {
  ACTIVITY_TYPE_LABEL,
  listAdminActivity,
  listMyActivity,
  listTrainerActivity,
} from '@/lib/api/activity.api';

const ACTIVITIES_PER_PAGE = 10;

export interface RecentActivitiesPageProps {
  dashboardHref: string;
  emptyDescription: string;
  role: 'admin' | 'trainer' | 'learner';
}

const ACTIVITY_LOADERS = {
  admin: () => listAdminActivity(100),
  trainer: () => listTrainerActivity(100),
  learner: () => listMyActivity(100),
};

function formatTimestamp(timestamp: string) {
  return new Date(timestamp).toLocaleString('en-US', {
    day: 'numeric',
    month: 'short',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export default function RecentActivitiesPage({
  dashboardHref,
  emptyDescription,
  role,
}: RecentActivitiesPageProps) {
  const [activities, setActivities] = useState<ActivityEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  useEffect(() => {
    let cancelled = false;

    ACTIVITY_LOADERS[role]()
      .then((entries) => {
        if (!cancelled) setActivities(entries);
      })
      .catch(() => {
        if (!cancelled) setActivities([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [role]);

  const totalPages = Math.ceil(activities.length / ACTIVITIES_PER_PAGE);
  const rangeStart = (page - 1) * ACTIVITIES_PER_PAGE + 1;
  const rangeEnd = Math.min(page * ACTIVITIES_PER_PAGE, activities.length);
  const pagedActivities = useMemo(
    () =>
      activities.slice(
        (page - 1) * ACTIVITIES_PER_PAGE,
        page * ACTIVITIES_PER_PAGE,
      ),
    [activities, page],
  );

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="All Recent Activities"
        subtitle="Review the latest activity in your learning space."
        actions={
          <AppButton
            href={dashboardHref}
            variant="outlined"
            radius="full"
            size="small"
            startIcon={<ArrowLeft size={16} />}
          >
            Go back
          </AppButton>
        }
      />

      <AppCard padding="none">
        {loading ? (
          <div className="flex min-h-[280px] items-center justify-center">
            <AppSpinner size={36} />
          </div>
        ) : activities.length === 0 ? (
          <AppEmptyState
            icon={<Clock />}
            title="No recent activity"
            description={emptyDescription}
            className="!min-h-[280px]"
          />
        ) : (
          <>
            <ul className="divide-y divide-muted/20">
              {pagedActivities.map((entry) => (
                <li
                  key={entry.id}
                  className="flex flex-col gap-2 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:px-6"
                >
                  <p className="b2-r text-text-secondary">
                    {entry.title || ACTIVITY_TYPE_LABEL[entry.activityType]}
                    {entry.description ? ` · ${entry.description}` : ''}
                  </p>
                  <span className="f1-r shrink-0 text-muted">
                    {formatTimestamp(entry.createdAt)}
                  </span>
                </li>
              ))}
            </ul>
            <div className="flex flex-col gap-3 border-t border-disabled px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="b2-r text-text-secondary">
                Showing {rangeStart}–{rangeEnd} of {activities.length}{' '}
                activities
              </p>
              <AppPagination
                currentPage={page}
                totalPages={totalPages}
                onChange={setPage}
                scrollToTop
                className="flex-wrap"
              />
            </div>
          </>
        )}
      </AppCard>
    </div>
  );
}
