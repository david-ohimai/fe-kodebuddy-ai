import React from 'react';
import { ChevronDown, ChevronUp, Plus } from 'lucide-react';
import { AppCard } from '@/components/ui/AppCard';
import AppButton from '@/components/ui/AppButton';
import AppPill from '@/components/ui/AppPill';
import AppEmptyState from '@/components/ui/AppEmptyState';
import OptionsMenu from '@/components/course/OptionsMenu';
import {
  CONTENT_TYPE_META,
  type LessonContentType,
} from '@/types/lesson-content.types';
import noLessons from '@/assets/images/no-lessons.webp';
import type { CourseModule } from '@/lib/api/modules.api';
import type { Lesson } from '@/lib/api/lessons.api';

export interface ModuleCardProps {
  module: CourseModule;
  index: number;
  isFirst: boolean;
  isLast: boolean;
  lessons: Lesson[];
  onEditModule: () => void;
  onDeleteModule: () => void;
  onMoveModule: (direction: 'up' | 'down') => void;
  onAddLesson: () => void;
  onViewLesson: (lesson: Lesson) => void;
  onEditLesson: (lesson: Lesson) => void;
  onDeleteLesson: (lesson: Lesson) => void;
  onMoveLesson: (lesson: Lesson, direction: 'up' | 'down') => void;
}

function ReorderButtons({
  isFirst,
  isLast,
  onMoveUp,
  onMoveDown,
  label,
}: {
  isFirst: boolean;
  isLast: boolean;
  onMoveUp: () => void;
  onMoveDown: () => void;
  label: string;
}) {
  return (
    <div className="flex flex-col">
      <button
        type="button"
        disabled={isFirst}
        onClick={onMoveUp}
        aria-label={`Move ${label} up`}
        className="rounded p-0.5 text-muted enabled:hover:bg-disabled enabled:hover:text-text disabled:opacity-30"
      >
        <ChevronUp size={16} />
      </button>
      <button
        type="button"
        disabled={isLast}
        onClick={onMoveDown}
        aria-label={`Move ${label} down`}
        className="rounded p-0.5 text-muted enabled:hover:bg-disabled enabled:hover:text-text disabled:opacity-30"
      >
        <ChevronDown size={16} />
      </button>
    </div>
  );
}

export default function ModuleCard({
  module,
  index,
  isFirst,
  isLast,
  lessons,
  onEditModule,
  onDeleteModule,
  onMoveModule,
  onAddLesson,
  onViewLesson,
  onEditLesson,
  onDeleteLesson,
  onMoveLesson,
}: ModuleCardProps) {
  return (
    <AppCard padding="none">
      <div className="flex items-start justify-between gap-3 border-b border-disabled p-5 sm:p-6">
        <div className="flex items-start gap-2">
          <ReorderButtons
            isFirst={isFirst}
            isLast={isLast}
            onMoveUp={() => onMoveModule('up')}
            onMoveDown={() => onMoveModule('down')}
            label={module.title}
          />
          <div>
            <p className="b2-b text-text">
              {index + 1}. {module.title}
            </p>
            {module.description && (
              <p className="f1-r mt-0.5 text-muted">{module.description}</p>
            )}
          </div>
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
          {lessons.map((lesson, lessonIndex) => {
            const lessonMeta =
              lesson.resourceType &&
              CONTENT_TYPE_META[lesson.resourceType as LessonContentType]
                ? CONTENT_TYPE_META[lesson.resourceType as LessonContentType]
                : null;

            return (
              <li
                key={lesson.id}
                className="flex items-center justify-between gap-3 px-5 py-3 sm:px-6"
              >
                <div className="flex items-start gap-2">
                  <ReorderButtons
                    isFirst={lessonIndex === 0}
                    isLast={lessonIndex === lessons.length - 1}
                    onMoveUp={() => onMoveLesson(lesson, 'up')}
                    onMoveDown={() => onMoveLesson(lesson, 'down')}
                    label={lesson.title}
                  />
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
                      {lessonMeta && (
                        <AppPill
                          label={lessonMeta.label}
                          color={lessonMeta.pillColor}
                          icon={lessonMeta.icon as React.ReactElement}
                        />
                      )}
                    </div>
                  </div>
                </div>

                <OptionsMenu
                  viewLabel="View Lesson"
                  editLabel="Edit Lesson"
                  deleteLabel="Delete Lesson"
                  onView={() => onViewLesson(lesson)}
                  onEdit={() => onEditLesson(lesson)}
                  onDelete={() => onDeleteLesson(lesson)}
                />
              </li>
            );
          })}
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
