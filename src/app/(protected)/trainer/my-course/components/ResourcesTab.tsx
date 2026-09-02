'use client';

import React, { useState } from 'react';
import { ChevronRight, Plus } from 'lucide-react';
import AppButton from '@/components/ui/AppButton';
import AppEmptyState from '@/components/ui/AppEmptyState';
import AppSpinner from '@/components/ui/AppSpinner';
import { useToast } from '@/components/ui/ToastProvider';
import { getErrorMessage } from '@/lib/api/client';
import { getResourceTypeMeta } from '@/lib/trainer/resourceTypeMeta';
import ResourceModal from './ResourceModal';
import noResources from '@/assets/images/empty state res.webp';
import type { CourseResource } from '@/lib/api/resources.api';
import type { ResourceFormInput } from '@/lib/trainer/useCourseResources';

export interface ResourcesTabProps {
  resources: CourseResource[];
  loading: boolean;
  saving: boolean;
  hasModules: boolean;
  addResource: (data: ResourceFormInput) => Promise<CourseResource>;
  onSelectResource: (resource: CourseResource) => void;
}

export default function ResourcesTab({
  resources,
  loading,
  saving,
  hasModules,
  addResource,
  onSelectResource,
}: ResourcesTabProps) {
  const { showError } = useToast();
  const [isAddOpen, setIsAddOpen] = useState(false);

  const handleAdd = async (data: {
    title: string;
    url: string;
    type: string;
  }) => {
    try {
      await addResource(data);
      setIsAddOpen(false);
    } catch (err) {
      showError(
        'Could not add resource',
        getErrorMessage(err, 'Please try again.'),
      );
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[300px] items-center justify-center">
        <AppSpinner size={40} />
      </div>
    );
  }

  if (resources.length === 0) {
    return (
      <>
        <AppEmptyState
          image={noResources}
          title="No resource yet"
          description={
            hasModules
              ? 'Add learning resources such as articles, videos, or guides to support your learners and enhance their learning'
              : 'Add a module to this course before adding resources.'
          }
          actionLabel={hasModules ? 'Add resource' : undefined}
          actionIcon={<Plus size={16} />}
          onAction={hasModules ? () => setIsAddOpen(true) : undefined}
        />
        <ResourceModal
          open={isAddOpen}
          saving={saving}
          onClose={() => setIsAddOpen(false)}
          onSubmit={handleAdd}
        />
      </>
    );
  }

  return (
    <div className="p-5 sm:p-6">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <p className="b2-b text-text">Resource</p>
          <p className="f1-r text-muted">
            Curate learning resources for this course.
          </p>
        </div>
        <AppButton
          startIcon={<Plus size={16} />}
          radius="full"
          size="small"
          onClick={() => setIsAddOpen(true)}
        >
          Resources
        </AppButton>
      </div>

      <ul className="divide-y divide-disabled rounded-input border border-disabled">
        {resources.map((resource) => {
          const meta = getResourceTypeMeta(resource.type);
          const Icon = meta.icon;
          return (
            <li key={resource.id}>
              <button
                type="button"
                onClick={() => onSelectResource(resource)}
                className="flex w-full items-center gap-4 px-4 py-4 text-left transition-colors hover:bg-primary-light/40"
              >
                <span
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${meta.bgClass} ${meta.textClass}`}
                >
                  <Icon size={18} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="b2-b text-text">{resource.title}</p>
                  <p className="f1-r text-muted">Type: {meta.label}</p>
                </div>
                <ChevronRight size={18} className="shrink-0 text-muted" />
              </button>
            </li>
          );
        })}
      </ul>

      <ResourceModal
        open={isAddOpen}
        saving={saving}
        onClose={() => setIsAddOpen(false)}
        onSubmit={handleAdd}
      />
    </div>
  );
}
