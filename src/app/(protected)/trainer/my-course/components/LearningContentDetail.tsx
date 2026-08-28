import React from 'react';
import { ArrowLeft, Pencil } from 'lucide-react';
import { AppCard } from '@/components/ui/AppCard';
import AppButton from '@/components/ui/AppButton';
import type { CourseModule } from '@/lib/api/modules.api';
import type { Lesson } from '@/lib/api/lessons.api';

export interface LearningContentDetailProps {
  module: CourseModule;
  moduleIndex: number;
  lesson: Lesson;
  onBack: () => void;
  onEditContent: () => void;
}

export default function LearningContentDetail({
  module,
  moduleIndex,
  lesson,
  onBack,
  onEditContent,
}: LearningContentDetailProps) {
  return (
    <div className="flex flex-col gap-4 p-5 sm:p-6">
      <button
        type="button"
        onClick={onBack}
        className="b2-b inline-flex w-fit items-center gap-1.5 text-primary hover:underline"
      >
        <ArrowLeft size={16} /> Back to {module.title}
      </button>

      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="h5-b text-text">{lesson.title}</h2>
          <p className="b2-r mt-1 text-muted">
            Learning content in {module.title}.
          </p>
        </div>
        <AppButton
          variant="outlined"
          size="small"
          radius="full"
          startIcon={<Pencil size={14} />}
          onClick={onEditContent}
        >
          Edit content
        </AppButton>
      </div>

      <AppCard padding="md">
        <span className="f2-m inline-block rounded-full bg-primary-light px-2.5 py-1 text-primary">
          Module {moduleIndex + 1}
        </span>
        <h3 className="h6-b mt-2 text-text">{module.title}</h3>
        {module.description && (
          <p className="b2-r mt-1 text-muted">{module.description}</p>
        )}
      </AppCard>

      <AppCard padding="md">
        <p className="b1-b mb-3 border-b border-disabled pb-3 text-text">
          Learning content
        </p>
        {lesson.contentBody ? (
          <p className="b2-r whitespace-pre-wrap text-text-secondary">
            {lesson.contentBody}
          </p>
        ) : (
          <p className="b2-r text-muted">No content added yet.</p>
        )}
      </AppCard>
    </div>
  );
}
