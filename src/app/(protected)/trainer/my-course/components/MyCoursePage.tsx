'use client';

import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import PageHeader from '@/components/ui/AppPageHeader';
import { AppCard } from '@/components/ui/AppCard';
import AppTab from '@/components/ui/AppTab';
import AppEmptyState from '@/components/ui/AppEmptyState';
import AppSpinner from '@/components/ui/AppSpinner';
import { useToast } from '@/components/ui/ToastProvider';
import { useCurrentUserContext } from '@/lib/auth/CurrentUserContext';
import { useMyAssignedCourse } from '@/lib/trainer/useMyAssignedCourse';
import AssignedCourseCard from '../../components/AssignedCourseCard';
import noModules from '@/assets/images/no-modules.webp';
import noCourses from '@/assets/images/no-courses.webp';

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
  const { showSuccess } = useToast();
  const { data, loading } = useMyAssignedCourse(user?.id);
  const [activeTab, setActiveTab] = useState('modules');

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
      ) : !data ? (
        <AppCard padding="lg">
          <AppEmptyState
            image={noCourses}
            title="No course assigned yet"
            description="Once an admin assigns you a course, it'll show up here."
          />
        </AppCard>
      ) : (
        <>
          <AssignedCourseCard
            course={data.course}
            cohortName={data.cohort.name}
            learnerCount={data.learnerCount}
            trainerName={user?.fullName || user?.email}
          />

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
