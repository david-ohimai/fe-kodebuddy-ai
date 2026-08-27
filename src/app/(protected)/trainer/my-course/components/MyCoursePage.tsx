'use client';

import React, { useEffect, useState } from 'react';
import { Plus } from 'lucide-react';
import PageHeader from '@/components/ui/AppPageHeader';
import { AppCard } from '@/components/ui/AppCard';
import AppPill from '@/components/ui/AppPill';
import AppTab from '@/components/ui/AppTab';
import AppEmptyState from '@/components/ui/AppEmptyState';
import AppSpinner from '@/components/ui/AppSpinner';
import { useToast } from '@/components/ui/ToastProvider';
import { useCurrentUserContext } from '@/lib/auth/CurrentUserContext';
import * as coursesApi from '@/lib/api/courses.api';
import * as cohortsApi from '@/lib/api/cohorts.api';
import { getErrorMessage } from '@/lib/api/client';
import noModules from '@/assets/images/no-modules.webp';
import type { Course } from '@/lib/api/courses.api';

// NOTE: the backend's Course model has no explicit "assigned trainer"
// field (only `created_by`, the admin who created it, per the PRD's
// Admin-creates → Admin-assigns → Trainer-manages ownership model) —
// there's no dedicated "courses assigned to me" endpoint either. As a
// best-effort stand-in, this matches courses where `createdBy` equals
// the signed-in trainer's own id, which will start working correctly
// once the backend clarifies/adds real trainer-assignment data.
const TABS = [
  { id: 'overview', label: 'Overview' },
  { id: 'modules', label: 'Modules' },
  { id: 'learning-content', label: 'Learning content' },
  { id: 'assignments', label: 'Assignments' },
  { id: 'faqs', label: 'FAQs' },
  { id: 'resources', label: 'Resources' },
];

export default function MyCoursePage() {
  const { user } = useCurrentUserContext();
  const { showError, showSuccess } = useToast();

  const [course, setCourse] = useState<Course | null>(null);
  const [cohortName, setCohortName] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('modules');

  useEffect(() => {
    if (!user) return;
    let cancelled = false;

    Promise.all([coursesApi.listCourses(), cohortsApi.listCohorts()])
      .then(([courses, cohorts]) => {
        if (cancelled) return;
        const mine = courses.find((c) => c.createdBy === user.id) ?? null;
        setCourse(mine);
        if (mine) {
          const cohort = cohorts.find((c) => c.id === mine.cohortId);
          setCohortName(cohort?.name ?? null);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          showError(
            'Could not load your course',
            getErrorMessage(err, 'Please try again.'),
          );
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        title="My Course"
        subtitle="Manage the content of your assigned course."
      />

      {loading ? (
        <div className="flex min-h-[420px] items-center justify-center">
          <AppSpinner size={40} />
        </div>
      ) : !course ? (
        <AppCard padding="lg">
          <AppEmptyState
            image={noModules}
            title="No course assigned yet"
            description="Once an admin assigns you a course, it'll show up here."
          />
        </AppCard>
      ) : (
        <>
          <AppCard padding="md">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="b2-m mb-2 text-text-secondary">
                  Assigned courses
                </p>
                <div className="flex items-center gap-2.5">
                  <h2 className="h5-b text-text">{course.title}</h2>
                  <AppPill
                    label={course.isActive ? 'Active' : 'Inactive'}
                    color={course.isActive ? 'success' : 'default'}
                  />
                </div>
                <p className="f1-r mt-1 text-muted">
                  {cohortName ?? 'Cohort'}
                </p>

                <p className="b2-m mt-5 text-text-secondary">Trainer</p>
                <p className="b1-b text-text">
                  {user?.fullName || user?.email}
                </p>
              </div>

              <div className="h-32 w-full shrink-0 rounded-card bg-gradient-to-br from-primary via-secondary to-primary-dark sm:w-56" />
            </div>
          </AppCard>

          <AppCard padding="none">
            <AppTab
              tabs={TABS}
              activeTab={activeTab}
              onChange={setActiveTab}
              className="px-4 pt-2"
            />

            <AppEmptyState
              image={noModules}
              title="This course is still empty."
              description="Get started by building your course."
              actionLabel="Add module"
              actionIcon={<Plus size={16} />}
              onAction={() =>
                showSuccess(
                  'Coming soon',
                  'Module authoring for trainers is on the roadmap.',
                )
              }
            />
          </AppCard>
        </>
      )}
    </div>
  );
}
