'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { AlertCircle, RotateCcw, TrendingUp, UserCircle2 } from 'lucide-react';
import { AppCard } from '@/components/ui/AppCard';
import AppEmptyState from '@/components/ui/AppEmptyState';
import AppSpinner from '@/components/ui/AppSpinner';
import AppPill from '@/components/ui/AppPill';
import AssignedCourseCard from '../../components/AssignedCourseCard';
import CircularProgress from '@/components/course/CircularProgress';
import { useCurrentUserContext } from '@/lib/auth/CurrentUserContext';
import { useMyAssignedCourse } from '@/lib/trainer/useMyAssignedCourse';
import { useCohortRoster } from '@/lib/trainer/useCohortRoster';
import { listTrainerEscalations } from '@/lib/api/chat.api';
import * as activityApi from '@/lib/api/activity.api';
import { ACTIVITY_TYPE_LABEL } from '@/lib/api/activity.api';
import noCourses from '@/assets/images/no-courses.webp';
import activity from '@/assets/images/activity.webp';

export default function TrainerDashboard() {
  const { user } = useCurrentUserContext();
  const firstName =
    user?.fullName?.trim().split(' ')[0] ||
    user?.email.split('@')[0] ||
    'there';

  const { data, cohortWithoutCourse, loading } = useMyAssignedCourse(user?.id);
  const {
    roster,
    loading: loadingRoster,
    error: rosterError,
    retry: retryRoster,
  } = useCohortRoster(data?.cohort.id, data?.course.id);
  const needsAttention = roster
    .filter((r) => r.status === 'needs_attention')
    .slice(0, 5);

  const [openEscalations, setOpenEscalations] = useState<number | null>(null);
  const [activities, setActivities] = useState<activityApi.ActivityEntry[]>([]);
  const [loadingSidebar, setLoadingSidebar] = useState(true);

  useEffect(() => {
    let cancelled = false;
    Promise.allSettled([
      listTrainerEscalations(),
      activityApi.listTrainerActivity(20),
    ]).then(([escalationsResult, activityResult]) => {
      if (cancelled) return;
      if (escalationsResult.status === 'fulfilled') {
        setOpenEscalations(
          escalationsResult.value.filter((e) => e.status === 'open').length,
        );
      }
      if (activityResult.status === 'fulfilled') {
        setActivities(activityResult.value);
      }
      setLoadingSidebar(false);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div>
      <div className="mb-6">
        <h1 className="h5-b text-text">Welcome back, {firstName}! 👋</h1>
        <p className="b2-r mt-1 text-text-secondary">
          Here&apos;s what&apos;s happening with your courses and learners.
        </p>
      </div>

      {loading ? (
        <div className="flex min-h-[420px] items-center justify-center">
          <AppSpinner size={40} />
        </div>
      ) : !data ? (
        <AppCard padding="lg">
          <AppEmptyState
            image={noCourses}
            title={
              cohortWithoutCourse
                ? `${cohortWithoutCourse.name} doesn't have a course yet`
                : 'No courses assigned yet'
            }
            description={
              cohortWithoutCourse
                ? "You're assigned to this cohort, but an admin hasn't added its course yet. Check back soon."
                : 'Courses assigned to you will appear here.'
            }
          />
        </AppCard>
      ) : (
        <div className="flex flex-col gap-4">
          <AssignedCourseCard
            course={data.course}
            cohortName={data.cohort.name}
            learnerCount={data.learnerCount}
            viewCourseHref="/trainer/my-course"
          />

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            <div className="flex flex-col gap-4">
              <AppCard padding="md">
                <div className="mb-3 flex items-center gap-3">
                  <AppCard.Icon variant="primary">
                    <TrendingUp />
                  </AppCard.Icon>
                  <div>
                    <p className="b2-b text-text">Cohort progress</p>
                    <p className="f1-r text-muted">
                      Overall progress of your cohort
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="relative shrink-0">
                    <CircularProgress percent={data.completionPercent} />
                    <span className="b2-b absolute inset-0 flex items-center justify-center text-text">
                      {data.completionPercent}%
                    </span>
                  </div>
                  <p className="f1-r text-muted">
                    Across {data.learnerCount} learner
                    {data.learnerCount === 1 ? '' : 's'}
                  </p>
                </div>
                <p className="b2-m mt-3 text-success-dark">
                  {data.completionPercent >= 70
                    ? 'Keep up the great work'
                    : data.completionPercent >= 40
                      ? 'Keep up with the good work'
                      : 'Your cohort could use a nudge'}
                </p>
              </AppCard>

              <AppCard padding="md">
                <div className="mb-3 flex items-center gap-3">
                  <AppCard.Icon variant="error">
                    <AlertCircle />
                  </AppCard.Icon>
                  <div>
                    <p className="b2-b text-text">Escalations</p>
                    <p className="f1-r text-muted">
                      Open escalations that need your attention.
                    </p>
                  </div>
                </div>
                <p className="h3-b text-text">
                  {openEscalations === null ? '—' : openEscalations}
                </p>
                <Link
                  href="/trainer/escalations"
                  className="b2-b mt-3 inline-block text-primary hover:underline"
                >
                  View escalations
                </Link>
              </AppCard>
            </div>

            <AppCard padding="none" className="lg:col-span-2">
              <div className="border-b border-muted/20 px-6 py-4">
                <div className="flex items-center gap-3">
                  <AppCard.Icon variant="error">
                    <UserCircle2 />
                  </AppCard.Icon>
                  <div>
                    <p className="b1-b text-text">Learners needing attention</p>
                    <p className="f1-r text-muted">
                      These learners may need your support.
                    </p>
                  </div>
                </div>
              </div>
              {loadingRoster ? (
                <div className="flex min-h-[160px] items-center justify-center">
                  <AppSpinner size={32} />
                </div>
              ) : rosterError ? (
                <AppEmptyState
                  title="Could not load your cohort"
                  description={rosterError}
                  actionLabel="Retry"
                  actionIcon={<RotateCcw size={16} />}
                  onAction={retryRoster}
                  className="!min-h-0 py-14"
                />
              ) : needsAttention.length === 0 ? (
                <AppEmptyState
                  image={activity}
                  title="Everyone's on track"
                  description="No learners in your cohort are below 50% course progress right now."
                  className="!min-h-0 py-14"
                />
              ) : (
                <ul className="divide-y divide-muted/20">
                  {needsAttention.map((learner) => (
                    <li
                      key={learner.learnerId}
                      className="flex items-center justify-between gap-3 px-6 py-4"
                    >
                      <div className="flex items-center gap-3">
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary-light b2-b text-primary">
                          {(learner.fullName || learner.email)
                            .charAt(0)
                            .toUpperCase()}
                        </span>
                        <div className="min-w-0">
                          <p className="b2-m truncate text-text">
                            {learner.fullName || learner.email}
                          </p>
                          <p className="f1-r text-muted">
                            {learner.progressPercentage ?? 0}% complete
                          </p>
                        </div>
                      </div>
                      <AppPill label="Needs attention" color="warning" />
                    </li>
                  ))}
                </ul>
              )}
              <div className="border-t border-muted/20 px-6 py-4">
                <Link
                  href="/trainer/my-cohort"
                  className="b2-b text-primary hover:underline"
                >
                  View full cohort
                </Link>
              </div>
            </AppCard>
          </div>

          <AppCard padding="none">
            <div className="flex items-center justify-between border-b border-muted/20 px-6 py-4">
              <h3 className="b1-b text-text">Recent Activity</h3>
              {activities.length > 0 && (
                <Link
                  href="/trainer/recent-activities"
                  className="b2-m text-primary hover:underline"
                >
                  View more
                </Link>
              )}
            </div>
            {loadingSidebar ? (
              <div className="flex min-h-[160px] items-center justify-center">
                <AppSpinner size={32} />
              </div>
            ) : activities.length === 0 ? (
              <AppEmptyState
                image={activity}
                title="No activity yet"
                description="Activity from your cohort will appear here."
                className="!min-h-0 py-14"
              />
            ) : (
              <ul className="divide-y divide-muted/20">
                {activities.slice(0, 7).map((entry) => (
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
      )}
    </div>
  );
}
