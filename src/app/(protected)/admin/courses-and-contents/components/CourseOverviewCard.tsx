import React from 'react';
import { Plus } from 'lucide-react';
import { AppCard } from '@/components/ui/AppCard';
import AppButton from '@/components/ui/AppButton';
import AppPill from '@/components/ui/AppPill';
import type { Course } from '@/lib/api/courses.api';

export interface CourseOverviewCardProps {
  course: Course;
  cohortName: string;
  moduleCount: number;
  lessonCount: number;
  onEditDescription: () => void;
}

export default function CourseOverviewCard({
  course,
  cohortName,
  moduleCount,
  lessonCount,
  onEditDescription,
}: CourseOverviewCardProps) {
  return (
    <AppCard>
      <div className="flex flex-col">
        <div>
          <p className="b2-b mb-4 text-text">Course overview</p>
          <div className="grid grid-cols-2 gap-6 sm:grid-cols-5">
            <div>
              <p className="f1-r text-muted">Status</p>
              <div className="mt-1">
                <AppPill
                  label={course.isActive ? 'Published' : 'Draft'}
                  color={course.isActive ? 'success' : 'default'}
                />
              </div>
            </div>
            <div>
              <p className="f1-r text-muted">Cohort</p>
              <p className="b1-m mt-1 text-text">{cohortName}</p>
            </div>
            <div>
              <p className="f1-r text-muted">Modules</p>
              <p className="b1-m mt-1 text-text">{moduleCount}</p>
            </div>
            <div>
              <p className="f1-r text-muted">Lessons</p>
              <p className="b1-m mt-1 text-text">{lessonCount}</p>
            </div>
            <div>
              <p className="f1-r text-muted">Last updated</p>
              <p className="b1-m mt-1 text-text">
                {new Date(course.updatedAt).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </p>
            </div>
          </div>
        </div>

        <div className="my-6 border-t border-disabled" />

        <div>
          <div className="mb-2 flex items-center justify-between">
            <p className="b2-b text-text">Course description</p>
            <AppButton
              variant="outlined"
              size="small"
              radius="full"
              startIcon={<Plus size={14} />}
              onClick={onEditDescription}
            >
              {course.description ? 'Edit description' : 'Add description'}
            </AppButton>
          </div>
          <p className="b2-r text-muted">
            {course.description || 'No description added yet.'}
          </p>
        </div>
      </div>
    </AppCard>
  );
}
