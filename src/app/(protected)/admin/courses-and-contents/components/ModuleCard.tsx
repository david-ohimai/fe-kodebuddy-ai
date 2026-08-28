import React from 'react';
import { Plus } from 'lucide-react';
import { AppCard } from '@/components/ui/AppCard';
import AppButton from '@/components/ui/AppButton';
import AppPill from '@/components/ui/AppPill';
import AppEmptyState from '@/components/ui/AppEmptyState';
import OptionsMenu from './OptionsMenu';
import { CONTENT_TYPE_META } from '@/types/lesson-content.types';
import { DEFAULT_LESSON_CONTENT_TYPE } from '@/lib/api/lessons.api';
import noLessons from '@/assets/images/no-lessons.webp';
import type { CourseModule } from '@/lib/api/modules.api';
import type { Lesson } from '@/lib/api/lessons.api';

export interface ModuleCardProps {
  module: CourseModule;
  index: number;
  lessons: Lesson[];
  onEditModule: () => void;
  onDeleteModule: () => void;
  onAddLesson: () => void;
  onEditLesson: (lesson: Lesson) => void;
  onDeleteLesson: (lesson: Lesson) => void;
}

export default function ModuleCard({
  module,
  index,
  lessons,
  onEditModule,
  onDeleteModule,
  onAddLesson,
  onEditLesson,
  onDeleteLesson,
}: ModuleCardProps) {
  const meta = CONTENT_TYPE_META[DEFAULT_LESSON_CONTENT_TYPE];

  return (
    <AppCard padding="none">
      <div className="flex items-start justify-between gap-3 border-b border-disabled p-5 sm:p-6">
        <div>
          <p className="b2-b text-text">
            {index + 1}. {module.title}
          </p>
          {module.description && (
            <p className="f1-r mt-0.5 text-muted">{module.description}</p>
          )}
        </div>
        <div className="flex shrink-0 items-center gap-3">
          <AppPill
            label={`${lessons.length} lesson${lessons.length === 1 ? '' : 's'}`}
            color="primary"
          />
          <OptionsMenu
            editLabel="Edit Module"
            deleteLabel="Delete Module"
            onEdit={onEditModule}
            onDelete={onDeleteModule}
          />
        </div>
      </div>

      {lessons.length === 0 ? (
        <AppEmptyState
          image={noLessons}
          title="No lessons yet"
          description="Add lessons to this module to start building your content."
          actionLabel="Add lessons"
          onAction={onAddLesson}
          className="min-h-65 py-10"
        />
      ) : (
        <ul className="flex flex-col divide-y divide-disabled">
          {lessons.map((lesson, lessonIndex) => (
            <li
              key={lesson.id}
              className="flex items-center justify-between px-5 py-3 sm:px-6"
            >
              <div>
                <p className="b2-m text-text">
                  {index + 1}.{lessonIndex + 1} {lesson.title}
                </p>
                <div className="mt-1 flex flex-col items-start gap-2">
                  {lesson.contentBody && (
                    <span className="f1-r text-muted">
                      {lesson.contentBody}
                    </span>
                  )}
                  <AppPill
                    label={meta.label}
                    color={meta.pillColor}
                    icon={meta.icon as React.ReactElement}
                  />
                </div>
              </div>

              <OptionsMenu
                editLabel="Edit Lesson"
                deleteLabel="Delete Lesson"
                onEdit={() => onEditLesson(lesson)}
                onDelete={() => onDeleteLesson(lesson)}
              />
            </li>
          ))}
          <li className="px-5 py-3 sm:px-6">
            <AppButton
              variant="outlined"
              size="small"
              radius="full"
              startIcon={<Plus size={14} />}
              className="w-full"
              onClick={onAddLesson}
            >
              Add lesson
            </AppButton>
          </li>
        </ul>
      )}
    </AppCard>
  );
}
