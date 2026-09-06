import React from 'react';
import { Plus } from 'lucide-react';
import { AppCard } from '@/components/ui/AppCard';
import AppButton from '@/components/ui/AppButton';
import AppEmptyState from '@/components/ui/AppEmptyState';
import AppSpinner from '@/components/ui/AppSpinner';
import ModuleCard from './ModuleCard';
import noModules from '@/assets/images/no-modules.webp';
import type { CourseModule } from '@/lib/api/modules.api';
import type { Lesson } from '@/lib/api/lessons.api';

export interface ModulesSectionProps {
  modules: CourseModule[];
  lessonsByModule: Record<number, Lesson[]>;
  loading: boolean;
  onAddModule: () => void;
  onEditModule: (module: CourseModule) => void;
  onDeleteModule: (module: CourseModule) => void;
  onMoveModule: (module: CourseModule, direction: 'up' | 'down') => void;
  onAddLesson: (module: CourseModule) => void;
  onEditLesson: (module: CourseModule, lesson: Lesson) => void;
  onDeleteLesson: (module: CourseModule, lesson: Lesson) => void;
  onMoveLesson: (
    module: CourseModule,
    lesson: Lesson,
    direction: 'up' | 'down',
  ) => void;
}

export default function ModulesSection({
  modules,
  lessonsByModule,
  loading,
  onAddModule,
  onEditModule,
  onDeleteModule,
  onMoveModule,
  onAddLesson,
  onEditLesson,
  onDeleteLesson,
  onMoveLesson,
}: ModulesSectionProps) {
  if (loading) {
    return (
      <div className="flex min-h-[300px] items-center justify-center">
        <AppSpinner size={40} />
      </div>
    );
  }

  if (modules.length === 0) {
    return (
      <AppCard padding="none">
        <div className="border-b border-disabled p-5 sm:p-6">
          <p className="b2-b text-text">Create module</p>
        </div>
        <AppEmptyState
          image={noModules}
          title="No modules yet"
          description="Get started by adding your first module."
          actionLabel="Add modules"
          onAction={onAddModule}
        />
      </AppCard>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <p className="b2-b text-text">Modules</p>
        <AppButton
          variant="outlined"
          size="small"
          radius="full"
          startIcon={<Plus size={14} />}
          onClick={onAddModule}
        >
          Add module
        </AppButton>
      </div>

      {modules.map((module, index) => (
        <ModuleCard
          key={module.id}
          module={module}
          index={index}
          isFirst={index === 0}
          isLast={index === modules.length - 1}
          lessons={lessonsByModule[module.id] ?? []}
          onEditModule={() => onEditModule(module)}
          onDeleteModule={() => onDeleteModule(module)}
          onMoveModule={(direction) => onMoveModule(module, direction)}
          onAddLesson={() => onAddLesson(module)}
          onEditLesson={(lesson) => onEditLesson(module, lesson)}
          onDeleteLesson={(lesson) => onDeleteLesson(module, lesson)}
          onMoveLesson={(lesson, direction) =>
            onMoveLesson(module, lesson, direction)
          }
        />
      ))}
    </div>
  );
}
