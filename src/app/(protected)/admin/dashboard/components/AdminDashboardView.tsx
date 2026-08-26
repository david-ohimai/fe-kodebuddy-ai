'use client';

import React, { useEffect, useState } from 'react';
import {
  Users,
  BookOpen,
  GraduationCap,
  UserCog,
  FileText,
  Lightbulb,
} from 'lucide-react';
import AppButton from '@/components/ui/AppButton';
import { AppCard } from '@/components/ui/AppCard';
import AppEmptyState from '@/components/ui/AppEmptyState';
import AppSpinner from '@/components/ui/AppSpinner';
import { useToast } from '@/components/ui/ToastProvider';
import activity from '@/assets/images/activity.webp';
import { useCurrentUserContext } from '@/lib/auth/CurrentUserContext';
import * as profileApi from '@/lib/api/profile.api';
import * as coursesApi from '@/lib/api/courses.api';
import * as cohortsApi from '@/lib/api/cohorts.api';

// NOTE: there is no activity/audit-log endpoint anywhere in the backend
// API, so "Recent Activity" has no real data source yet — it always
// shows the empty state below. This is intentionally NOT tied to
// `hasData` (whether any users exist): those are two different
// questions, and conflating them was the earlier bug where this section
// rendered an empty box instead of the empty state once users existed.
interface ActivityItem {
  id: string;
  actor: string;
  action: string;
  meta: string;
  timestamp: string;
}

interface DashboardStats {
  totalUsers: number;
  activeCourses: number;
  activeCohorts: number;
}

function cx(...classes: Array<string | false | undefined | null>) {
  return classes.filter(Boolean).join(' ');
}

const AdminDashboardView: React.FC = () => {
  const { user } = useCurrentUserContext();
  const { showError } = useToast();
  const firstName =
    user?.fullName?.trim().split(' ')[0] ||
    user?.email.split('@')[0] ||
    'there';

  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    activeCourses: 0,
    activeCohorts: 0,
  });
  const [loading, setLoading] = useState(true);
  const activities: ActivityItem[] = [];

  useEffect(() => {
    let cancelled = false;

    Promise.allSettled([
      profileApi.listUsers(),
      coursesApi.listCourses(),
      cohortsApi.listCohorts(),
    ]).then(([usersResult, coursesResult, cohortsResult]) => {
      if (cancelled) return;

      setStats({
        totalUsers:
          usersResult.status === 'fulfilled' ? usersResult.value.length : 0,
        activeCourses:
          coursesResult.status === 'fulfilled'
            ? coursesResult.value.filter((c) => c.isActive).length
            : 0,
        activeCohorts:
          cohortsResult.status === 'fulfilled'
            ? cohortsResult.value.filter((c) => c.isOpen).length
            : 0,
      });
      setLoading(false);

      const failed = [usersResult, coursesResult, cohortsResult].some(
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const hasData = stats.totalUsers > 0;
  const hasActivity = activities.length > 0;

  const STAT_CARDS = [
    {
      icon: Users,
      label: 'Total users',
      value: stats.totalUsers,
      subtext: 'All learners, trainers & mentors',
    },
    {
      icon: BookOpen,
      label: 'Active courses',
      value: stats.activeCourses,
      subtext: 'Courses published',
    },
    {
      icon: GraduationCap,
      label: 'Active Cohorts',
      value: stats.activeCohorts,
      subtext: 'active cohorts',
    },
  ];

  const actionButtonsContent = (
    <>
      <AppButton
        href="/admin/users/assign-role"
        startIcon={<UserCog size={18} />}
        fullWidth
        radius="full"
        className="sm:w-auto"
      >
        Assign role
      </AppButton>
      <AppButton
        href="/admin/courses-and-contents"
        variant="outlined"
        startIcon={<FileText size={18} />}
        fullWidth
        radius="full"
        className="sm:w-auto"
      >
        Create courses
      </AppButton>
    </>
  );

  return (
    <div>
      <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="h5-b text-text">Welcome back, {firstName}! 👋</h1>
          <p className="b2-r mt-1 text-text-secondary">
            {hasData
              ? "Here's what's happening on KodeBuddy today."
              : 'Your admin workspace is ready. Start by setting up your platform.'}
          </p>
        </div>
        {hasData && (
          <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:justify-end">
            {actionButtonsContent}
          </div>
        )}
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

      {!loading && !hasData && (
        <AppCard
          padding="lg"
          className="mb-6 flex flex-col items-center py-14 text-center"
        >
          <h2 className="h5-b text-text">
            Let&apos;s get your platform ready.
          </h2>
          <p className="b2-r mt-2 max-w-md text-text-secondary">
            Add your team, create your first course and organise learners into
            cohorts to get started.
          </p>
          <div className="mx-auto mt-6 flex w-full max-w-xs flex-col gap-3 [@media(min-width:470px)]:w-fit [@media(min-width:470px)]:max-w-none [@media(min-width:470px)]:flex-row">
            {actionButtonsContent}
          </div>
          <p className="f1-r mt-4 flex items-center gap-1.5 text-muted">
            <Lightbulb size={14} />
            Assign Trainer or Mentor roles first, then create courses and add
            content later.
          </p>
        </AppCard>
      )}

      <AppCard padding="none">
        <div className="flex items-center justify-between border-b border-muted/20 px-6 py-4">
          <h3 className="b1-b text-text">Recent Activity</h3>
          {hasActivity && (
            <button type="button" className="b2-m text-primary hover:underline">
              View all
            </button>
          )}
        </div>

        {loading ? (
          <div className="flex min-h-[200px] items-center justify-center">
            <AppSpinner size={32} />
          </div>
        ) : hasActivity ? (
          <ul>
            {activities.map((item, i) => (
              <li
                key={item.id}
                className={cx(
                  'flex items-center justify-between px-6 py-4',
                  i !== activities.length - 1 && 'border-b border-muted/20',
                )}
              >
                <p className="b2-r text-text-secondary">
                  <span className="b2-b text-text">{item.actor}</span>{' '}
                  {item.action} · {item.meta}
                </p>
                <span className="f1-r shrink-0 text-muted">
                  {item.timestamp}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <AppEmptyState
            image={activity}
            title="No activity yet"
            description="Activity will appear here as you add users, courses and manage the platform."
            className="!min-h-0 py-14"
          />
        )}
      </AppCard>
    </div>
  );
};

export default AdminDashboardView;
