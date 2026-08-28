import React from 'react';
import { ArrowLeft, ChevronRight, Pencil, Plus } from 'lucide-react';
import { AppCard } from '@/components/ui/AppCard';
import AppButton from '@/components/ui/AppButton';
import AppEmptyState from '@/components/ui/AppEmptyState';
import AppSpinner from '@/components/ui/AppSpinner';
import noLessons from '@/assets/images/no-lessons.webp';
import type { CourseModule } from '@/lib/api/modules.api';
import type { Lesson } from '@/lib/api/lessons.api';

export interface LearningContentListProps {
  courseName: string;
  module: CourseModule;
  moduleIndex: number;
  lessons: Lesson[];
  loading: boolean;
  onBack: () => void;
  onSelectLesson: (lesson: Lesson) => void;
  onAddContent: () => void;
  onEditModule: () => void;
}

export default function LearningContentList({
  courseName,
  module,
  moduleIndex,
  lessons,
  loading,
  onBack,
  onSelectLesson,
  onAddContent,
  onEditModule,
}: LearningContentListProps) {
  return (
    <div className="flex flex-col gap-4 p-5 sm:p-6">
      <button
        type="button"
        onClick={onBack}
        className="b2-b inline-flex w-fit items-center gap-1.5 text-primary hover:underline"
      >
        <ArrowLeft size={16} /> Back to {courseName}
      </button>

      <AppCard padding="md">
        <div className="flex items-start justify-between gap-3">
          <div>
            <span className="f2-m inline-block rounded-full bg-primary-light px-2.5 py-1 text-primary">
              Module {moduleIndex + 1}
            </span>
            <h2 className="h6-b mt-2 text-text">{module.title}</h2>
            {module.description && (
              <p className="b2-r mt-1 text-muted">{module.description}</p>
            )}
          </div>
          <AppButton
            variant="outlined"
            size="small"
            radius="full"
            startIcon={<Pencil size={14} />}
            className="shrink-0"
            onClick={onEditModule}
          >
            Edit module
          </AppButton>
        </div>
      </AppCard>

      <AppCard padding="none">
        <div className="flex items-center justify-between border-b border-disabled p-5 sm:p-6">
          <div>
            <p className="b2-b text-text">Learning contents</p>
            <p className="f1-r text-muted">
              Manage the learning contents in this module.
            </p>
          </div>
          <AppButton
            startIcon={<Plus size={16} />}
            radius="full"
            size="small"
            onClick={onAddContent}
          >
            Add learning content
          </AppButton>
        </div>

        {loading ? (
          <div className="flex min-h-[240px] items-center justify-center">
            <AppSpinner size={40} />
          </div>
        ) : lessons.length === 0 ? (
          <AppEmptyState
            image={noLessons}
            title="No learning content yet"
            description="Get started by adding learning content to this module."
            actionLabel="Add learning content"
            actionIcon={<Plus size={16} />}
            onAction={onAddContent}
          />
        ) : (
          <ul className="divide-y divide-disabled">
            {lessons.map((lesson, index) => (
              <li key={lesson.id}>
                <button
                  type="button"
                  onClick={() => onSelectLesson(lesson)}
                  className="flex w-full items-center gap-4 px-5 py-4 text-left transition-colors hover:bg-primary-light/40 sm:px-6"
                >
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary-light b2-b text-primary">
                    {index + 1}
                  </span>
                  <p className="b2-m min-w-0 flex-1 text-text">
                    {lesson.title}
                  </p>
                  <ChevronRight size={18} className="shrink-0 text-muted" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </AppCard>
    </div>
  );
}
