import React from 'react';
import { AppCard } from '@/components/ui/AppCard';
import AppPill from '@/components/ui/AppPill';
import AppButton from '@/components/ui/AppButton';
import type { Course } from '@/lib/api/courses.api';

export interface AssignedCourseCardProps {
  course: Course;
  cohortName: string;
  learnerCount: number;
  trainerName?: string;
  viewCourseHref?: string;
}

export default function AssignedCourseCard({
  course,
  cohortName,
  learnerCount,
  trainerName,
  viewCourseHref,
}: AssignedCourseCardProps) {
  return (
    <AppCard padding="md">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="b2-m mb-2 text-text-secondary">Assigned courses</p>
          <div className="flex items-center gap-2.5">
            <h2 className="h5-b text-text">{course.title}</h2>
            <AppPill
              label={course.isActive ? 'Active' : 'Inactive'}
              color={course.isActive ? 'success' : 'default'}
            />
          </div>
          <p className="f1-r mt-1 text-muted">
            {cohortName} · {learnerCount} learner
            {learnerCount === 1 ? '' : 's'}
          </p>

          {trainerName && (
            <>
              <p className="b2-m mt-5 text-text-secondary">Trainer</p>
              <p className="b1-b text-text">{trainerName}</p>
            </>
          )}

          {viewCourseHref && (
            <AppButton
              href={viewCourseHref}
              variant="outlined"
              radius="full"
              size="small"
              className="mt-4"
            >
              View course
            </AppButton>
          )}
        </div>

        <div className="h-32 w-full shrink-0 rounded-card bg-gradient-to-br from-primary via-secondary to-primary-dark sm:w-56" />
      </div>
    </AppCard>
  );
}
