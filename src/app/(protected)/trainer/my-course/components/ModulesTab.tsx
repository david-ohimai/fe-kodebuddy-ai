import React from 'react';
import { ChevronRight, Plus } from 'lucide-react';
import AppButton from '@/components/ui/AppButton';
import AppEmptyState from '@/components/ui/AppEmptyState';
import AppSpinner from '@/components/ui/AppSpinner';
import noModules from '@/assets/images/no-modules.webp';
import type { CourseModule } from '@/lib/api/modules.api';
import type { Lesson } from '@/lib/api/lessons.api';

export interface ModulesTabProps {
  modules: CourseModule[];
  lessonsByModule: Record<number, Lesson[]>;
  loading: boolean;
  onAddModule: () => void;
  onSelectModule: (module: CourseModule) => void;
}

export default function ModulesTab({
  modules,
  lessonsByModule,
  loading,
  onAddModule,
  onSelectModule,
}: ModulesTabProps) {
  if (loading) {
    return (
      <div className="flex min-h-[300px] items-center justify-center">
        <AppSpinner size={40} />
      </div>
    );
  }

  if (modules.length === 0) {
    return (
      <AppEmptyState
        image={noModules}
        title="This course is still empty."
        description="Get started by building your course."
        actionLabel="Add module"
        actionIcon={<Plus size={16} />}
        onAction={onAddModule}
      />
    );
  }

  return (
    <div className="p-5 sm:p-6">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <p className="b2-b text-text">Modules</p>
          <p className="f1-r text-muted">Manage all modules in this course.</p>
        </div>
        <AppButton
          startIcon={<Plus size={16} />}
          radius="full"
          size="small"
          onClick={onAddModule}
        >
          Add module
        </AppButton>
      </div>

      <ul className="divide-y divide-disabled rounded-input border border-disabled">
        {modules.map((module, index) => {
          const lessonCount = lessonsByModule[module.id]?.length ?? 0;
          return (
            <li key={module.id}>
              <button
                type="button"
                onClick={() => onSelectModule(module)}
                className="flex w-full items-center gap-4 px-4 py-4 text-left transition-colors hover:bg-primary-light/40"
              >
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary-light b2-b text-primary">
                  {index + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="b2-b text-text">{module.title}</p>
                  <p className="f1-r text-muted">
                    {lessonCount} lesson{lessonCount === 1 ? '' : 's'}
                  </p>
                </div>
                <ChevronRight size={18} className="shrink-0 text-muted" />
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
