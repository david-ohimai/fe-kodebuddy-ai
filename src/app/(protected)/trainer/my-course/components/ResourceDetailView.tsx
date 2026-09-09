'use client';

import React, { useState } from 'react';
import { ArrowLeft, Pencil, Trash2, XCircle } from 'lucide-react';
import { AppCard } from '@/components/ui/AppCard';
import AppButton from '@/components/ui/AppButton';
import AppPill from '@/components/ui/AppPill';
import AppConfirmModal from '@/components/ui/AppConfirmModal';
import { useToast } from '@/components/ui/ToastProvider';
import { getErrorMessage } from '@/lib/api/client';
import { getResourceTypeMeta } from '@/lib/trainer/resourceTypeMeta';
import ResourceModal from './ResourceModal';
import type { CourseResource } from '@/lib/api/resources.api';
import type { ResourceFormInput } from '@/lib/trainer/useCourseResources';

export interface ResourceDetailViewProps {
  courseName: string;
  cohortName: string;
  resource: CourseResource;
  saving: boolean;
  editResource: (
    resource: CourseResource,
    data: ResourceFormInput,
  ) => Promise<CourseResource>;
  deleteResource: (resource: CourseResource) => Promise<void>;
  onBack: () => void;
}

export default function ResourceDetailView({
  courseName,
  cohortName,
  resource,
  saving,
  editResource,
  deleteResource,
  onBack,
}: ResourceDetailViewProps) {
  const { showError } = useToast();
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const meta = getResourceTypeMeta(resource.type);
  const Icon = meta.icon;

  const handleEdit = async (data: {
    title: string;
    url: string;
    type: string;
  }) => {
    try {
      await editResource(resource, data);
      setIsEditOpen(false);
    } catch (err) {
      showError(
        'Could not update resource',
        getErrorMessage(err, 'Please try again.'),
      );
    }
  };

  const handleDelete = async () => {
    try {
      await deleteResource(resource);
      setIsDeleteOpen(false);
      onBack();
    } catch (err) {
      showError(
        'Could not delete resource',
        getErrorMessage(err, 'Please try again.'),
      );
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <button
        type="button"
        onClick={onBack}
        className="b2-b inline-flex w-fit items-center gap-1.5 text-primary hover:underline"
      >
        <ArrowLeft size={16} /> Back to resources
      </button>

      <AppCard padding="lg">
        <h1 className="h5-b text-text">Resource details</h1>

        <div className="mt-5 flex flex-wrap items-center justify-between gap-2 rounded-input bg-primary-light px-4 py-2.5">
          <p className="f1-r text-primary-dark">
            <span className="b2-b text-text">Course:</span> {courseName}
          </p>
          <p className="f1-r text-primary-dark">
            <span className="b2-b text-text">Assigned Cohort:</span>{' '}
            {cohortName}
          </p>
        </div>

        <div className="mt-5 rounded-card border border-disabled p-5">
          <div className="flex items-start gap-3">
            <span
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${meta.bgClass} ${meta.textClass}`}
            >
              <Icon size={18} />
            </span>
            <div className="min-w-0 flex-1">
              <p className="b1-b text-text">{resource.title}</p>
              <div className="mt-1.5 flex flex-wrap items-center gap-2">
                <span className="f1-r text-muted">Type:</span>
                <AppPill label={meta.label} color="primary" />
                {resource.url && (
                  <>
                    <span className="f1-r ml-2 text-muted">Link:</span>
                    <a
                      href={resource.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="f1-r break-all text-primary hover:underline"
                    >
                      {resource.url}
                    </a>
                  </>
                )}
                {resource.content && (
                  <div className="mt-4 rounded-lg border border-disabled bg-surface-raised p-4">
                    <p className="f1-r mb-1 text-muted">Article Content:</p>
                    <p className="b2-r whitespace-pre-wrap text-text">
                      {resource.content}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="mt-5 flex justify-end gap-3 border-t border-disabled pt-5">
            <AppButton
              variant="outlined"
              color="error"
              size="small"
              radius="full"
              startIcon={<Trash2 size={14} />}
              onClick={() => setIsDeleteOpen(true)}
            >
              Delete resource
            </AppButton>
            <AppButton
              size="small"
              radius="full"
              startIcon={<Pencil size={14} />}
              onClick={() => setIsEditOpen(true)}
            >
              Edit resource
            </AppButton>
          </div>
        </div>
      </AppCard>

      <ResourceModal
        open={isEditOpen}
        saving={saving}
        initial={{
          title: resource.title,
          url: resource.url ?? '',
          type: meta.label,
        }}
        onClose={() => setIsEditOpen(false)}
        onSubmit={handleEdit}
      />

      <AppConfirmModal
        open={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        hideCloseOnBackdrop={saving}
        icon={<XCircle size={64} className="text-error" />}
        title="Remove Resource?"
        description="Are you sure you want to remove this resource? This action cannot be undone."
        secondaryButton={{
          label: 'Cancel',
          onClick: () => setIsDeleteOpen(false),
          disabled: saving,
        }}
        primaryButton={{
          label: 'Remove',
          color: 'error',
          loading: saving,
          onClick: handleDelete,
        }}
      />
    </div>
  );
}
