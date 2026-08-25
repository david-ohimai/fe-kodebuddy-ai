'use client';

import React, { useState } from 'react';
import { ArrowLeft, Info, Pencil, Plus } from 'lucide-react';
import AppButton from '@/components/ui/AppButton';
import { AppCard } from '@/components/ui/AppCard';
import AppEmptyState from '@/components/ui/AppEmptyState';
import AddModuleModal from './AddModuleModal';
import noModules from '@/assets/images/no-modules.webp';

export interface CourseOverview {
  title: string;
  status: 'draft' | 'published';
  modules: number;
  lessons: number;
  lastUpdated: string;
  createdBy: string;
  description?: string;
}

interface CourseDetailsViewProps {
  course: CourseOverview;
  onBack: () => void;
  onEditCourse: () => void;
  onAddDescription: () => void;
}

const STATUS_LABEL: Record<CourseOverview['status'], string> = {
  draft: 'Draft',
  published: 'Published',
};

const CourseDetailsView: React.FC<CourseDetailsViewProps> = ({
  course,
  onBack,
  onEditCourse,
  onAddDescription,
}) => {
  const [addModuleOpen, setAddModuleOpen] = useState(false);

  const handleAddModule = (data: {
    title: string;
    description?: string;
  }) => {
    // TODO: replace with create-module API call.
    console.log('Create module:', data);

    setAddModuleOpen(false);
  };

  return (
    <>
      <div className="flex flex-col gap-6">
        <button
          type="button"
          onClick={onBack}
          className="b2-m inline-flex w-fit items-center gap-1.5 text-primary hover:underline"
        >
          <ArrowLeft size={16} />
          Back to content &amp; courses
        </button>

        <div className="rounded-card border border-disabled bg-background p-6">
          <div className="flex flex-col gap-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <h2 className="h5-b text-text">
                  {course.title}
                </h2>

                <span className="f1-m inline-flex items-center rounded-full border border-disabled px-2.5 py-0.5 text-text-secondary">
                  {STATUS_LABEL[course.status]}
                </span>
              </div>

              <AppButton
                variant="outlined"
                size="small"
                radius="full"
                startIcon={<Pencil size={14} />}
                onClick={onEditCourse}
              >
                Edit course
              </AppButton>
            </div>

            <div className="flex gap-3 rounded-input bg-primary-light p-4">
              <Info
                size={18}
                className="mt-0.5 shrink-0 text-primary"
              />

              <p className="b2-r text-text">
                This course is in draft mode. Add modules and lessons to
                build your course content before publishing.
              </p>
            </div>

            <div className="flex flex-col gap-6 rounded-card border border-disabled p-5 sm:p-6">
              <div>
                <p className="b2-b mb-4 text-text">
                  Course overview
                </p>

                <div className="grid grid-cols-2 gap-6 divide-x divide-disabled/50 sm:grid-cols-5">
                  <div>
                    <p className="f1-r text-muted">Status</p>

                    <span className="f1-m mt-1 inline-flex items-center rounded-full border border-disabled px-2.5 py-0.5 text-text-secondary">
                      {STATUS_LABEL[course.status]}
                    </span>
                  </div>

                  <div className="pl-4">
                    <p className="f1-r text-muted">Modules</p>
                    <p className="b1-m mt-1 text-text">
                      {course.modules}
                    </p>
                  </div>

                  <div className="pl-4">
                    <p className="f1-r text-muted">Lessons</p>
                    <p className="b1-m mt-1 text-text">
                      {course.lessons}
                    </p>
                  </div>

                  <div className="pl-4">
                    <p className="f1-r text-muted">Last updated</p>
                    <p className="b1-m mt-1 text-text">
                      {course.lastUpdated}
                    </p>
                  </div>

                  <div className="pl-4">
                    <p className="f1-r text-muted">Created by</p>
                    <p className="b1-m mt-1 text-text">
                      {course.createdBy}
                    </p>
                  </div>
                </div>
              </div>

              <hr className="border-disabled" />

              <div>
                <div className="mb-2 flex items-center justify-between">
                  <p className="b2-b text-text">
                    Course description
                  </p>

                  <AppButton
                    variant="outlined"
                    size="small"
                    radius="full"
                    startIcon={<Plus size={14} />}
                    onClick={onAddDescription}
                  >
                    Add description
                  </AppButton>
                </div>

                <p className="b2-r text-muted">
                  {course.description || 'No description added yet'}
                </p>
              </div>
            </div>
          </div>
        </div>

        <AppCard padding="none">
          <div className="border-b border-disabled p-5 sm:p-6">
            <p className="b2-b text-text">
              Create module
            </p>
          </div>

          <AppEmptyState
            image={noModules}
            title="No modules yet"
            description="Get started by adding your first module."
            actionLabel="Add modules"
            onAction={() => setAddModuleOpen(true)}
          />
        </AppCard>
      </div>

      <AddModuleModal
        open={addModuleOpen}
        onClose={() => setAddModuleOpen(false)}
        onSubmit={handleAddModule}
      />
    </>
  );
};

export default CourseDetailsView;
