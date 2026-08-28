'use client';

import React from 'react';
import Link from 'next/link';
import { TrendingUp, AlertCircle, UserCircle2 } from 'lucide-react';
import { AppCard } from '@/components/ui/AppCard';
import AppEmptyState from '@/components/ui/AppEmptyState';
import AppSpinner from '@/components/ui/AppSpinner';
import AssignedCourseCard from '../../components/AssignedCourseCard';
import { useCurrentUserContext } from '@/lib/auth/CurrentUserContext';
import { useMyAssignedCourse } from '@/lib/trainer/useMyAssignedCourse';
import noCourses from '@/assets/images/no-courses.webp';
import activity from '@/assets/images/activity.webp';

export default function TrainerDashboard() {
  const { user } = useCurrentUserContext();
  const firstName =
    user?.fullName?.trim().split(' ')[0] ||
    user?.email.split('@')[0] ||
    'there';

  const { data, loading } = useMyAssignedCourse(user?.id);

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
            title="No courses assigned yet"
            description="Courses assigned to you will appear here."
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
                <p className="h3-b text-muted">—</p>
                <p className="f1-r mt-1 text-muted">Not available yet</p>
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
                <p className="h3-b text-muted">—</p>
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
              <AppEmptyState
                image={activity}
                title="Not available yet"
                description="Per-learner progress data isn't available from the backend yet."
                className="!min-h-0 py-14"
              />
            </AppCard>
          </div>
        </div>
      )}
    </div>
  );
}
