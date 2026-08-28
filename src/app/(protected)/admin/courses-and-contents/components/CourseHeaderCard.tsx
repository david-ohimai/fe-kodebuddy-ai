import React from 'react';
import { Pencil, Send, Info } from 'lucide-react';
import { AppCard } from '@/components/ui/AppCard';
import AppButton from '@/components/ui/AppButton';
import AppPill from '@/components/ui/AppPill';
import type { Course } from '@/lib/api/courses.api';

export interface CourseHeaderCardProps {
  course: Course;
  canPublish: boolean;
  onEditCourse: () => void;
  onPublishClick: () => void;
}

export default function CourseHeaderCard({
  course,
  canPublish,
  onEditCourse,
  onPublishClick,
}: CourseHeaderCardProps) {
  return (
    <AppCard>
      <div className="flex flex-col gap-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <h2 className="h5-b text-text">{course.title}</h2>
            <AppPill
              label={course.isActive ? 'Published' : 'Draft'}
              color={course.isActive ? 'success' : 'default'}
            />
          </div>
          <div className="flex items-center gap-3">
            <AppButton
              variant="outlined"
              size="small"
              radius="full"
              startIcon={<Pencil size={14} />}
              onClick={onEditCourse}
            >
              Edit course
            </AppButton>
            <AppButton
              size="small"
              radius="full"
              startIcon={<Send size={14} />}
              disabled={!canPublish || course.isActive}
              onClick={onPublishClick}
            >
              Publish course
            </AppButton>
          </div>
        </div>

        {!course.isActive && (
          <div className="flex gap-3 rounded-input bg-primary-light p-4">
            <Info size={18} className="mt-0.5 shrink-0 text-primary" />
            <p className="b2-r text-text">
              This course is in draft mode. Add modules and lessons to build
              your course content before publishing.
            </p>
          </div>
        )}
      </div>
    </AppCard>
  );
}
