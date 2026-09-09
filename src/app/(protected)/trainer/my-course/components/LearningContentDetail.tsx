import React, { useEffect, useState } from 'react';
import { ArrowLeft, Pencil, FileText, ExternalLink, AlignLeft } from 'lucide-react';
import { AppCard } from '@/components/ui/AppCard';
import AppButton from '@/components/ui/AppButton';
import AppPill from '@/components/ui/AppPill';
import AppSpinner from '@/components/ui/AppSpinner';
import {
  CONTENT_TYPE_META,
  type LessonContentType,
} from '@/types/lesson-content.types';
import { listLessonResources, type CourseResource } from '@/lib/api/resources.api';
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
  const [resource, setResource] = useState<CourseResource | null>(null);
  const [loadingResource, setLoadingResource] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoadingResource(true);
    listLessonResources(lesson.id)
      .then((list) => {
        if (!cancelled) setResource(list[0] ?? null);
      })
      .catch(() => {
        if (!cancelled) setResource(null);
      })
      .finally(() => {
        if (!cancelled) setLoadingResource(false);
      });
    return () => {
      cancelled = true;
    };
  }, [lesson.id]);

  const rawType = resource?.type?.toLowerCase();
  const contentType: LessonContentType | null =
    rawType === 'file' || rawType === 'document'
      ? 'document'
      : rawType === 'link'
        ? 'link'
        : rawType === 'article'
          ? 'article'
          : null;

  const resourceMeta = contentType ? CONTENT_TYPE_META[contentType] : null;

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
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="h5-b text-text">{lesson.title}</h2>
            {resourceMeta && (
              <AppPill
                label={resourceMeta.label}
                color={resourceMeta.pillColor}
                icon={resourceMeta.icon as React.ReactElement}
              />
            )}
          </div>
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

      {/* Resource section */}
      {loadingResource ? (
        <div className="flex items-center justify-center py-4">
          <AppSpinner size={28} />
        </div>
      ) : resource && contentType && resourceMeta ? (
        <AppCard padding="lg">
          <div className="flex flex-col gap-4">
            <div className="flex flex-wrap items-center gap-2.5 border-b border-disabled pb-4">
              <h2 className="b1-b text-text">Lesson Resource</h2>
              <AppPill
                label={resourceMeta.label}
                color={resourceMeta.pillColor}
                icon={resourceMeta.icon as React.ReactElement}
              />
            </div>

            <div>
              <p className="b2-m text-text">{resource.title}</p>
              {resource.description && (
                <p className="b2-r mt-1 text-text-secondary">
                  {resource.description}
                </p>
              )}
            </div>

            {/* Document */}
            {contentType === 'document' && (
              <div className="flex flex-col gap-2">
                <p className="f1-r text-muted">Document</p>
                <div className="flex items-center gap-3 rounded-input border border-disabled bg-disabled/10 px-4 py-3">
                  <span
                    className={
                      'flex h-10 w-10 shrink-0 items-center justify-center rounded ' +
                      resourceMeta.tint
                    }
                  >
                    <FileText size={18} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="b2-m truncate text-text">
                      {resource.fileName ?? 'Uploaded document'}
                    </p>
                    {resource.url ? (
                      <a
                        href={resource.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="f1-r inline-flex items-center gap-1 text-primary hover:underline"
                      >
                        Open file <ExternalLink size={11} />
                      </a>
                    ) : (
                      <p className="f1-r text-muted">No file URL available</p>
                    )}
                  </div>
                  {resource.url && (
                    <AppButton
                      variant="outlined"
                      size="small"
                      radius="full"
                      startIcon={<ExternalLink size={13} />}
                      onClick={() => window.open(resource.url!, '_blank')}
                    >
                      View
                    </AppButton>
                  )}
                </div>
              </div>
            )}

            {/* Link */}
            {contentType === 'link' && resource.url && (
              <div className="flex flex-col gap-2">
                <p className="f1-r text-muted">Resource link</p>
                <div className="flex items-center gap-3 rounded-input border border-disabled bg-disabled/10 px-4 py-3">
                  <span
                    className={
                      'flex h-10 w-10 shrink-0 items-center justify-center rounded ' +
                      resourceMeta.tint
                    }
                  >
                    <ExternalLink size={18} />
                  </span>
                  <a
                    href={resource.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="b2-r min-w-0 flex-1 truncate text-primary hover:underline"
                  >
                    {resource.url}
                  </a>
                  <AppButton
                    variant="outlined"
                    size="small"
                    radius="full"
                    startIcon={<ExternalLink size={13} />}
                    onClick={() => window.open(resource.url!, '_blank')}
                  >
                    Open
                  </AppButton>
                </div>
              </div>
            )}

            {/* Article */}
            {contentType === 'article' && resource.content && (
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-1.5 text-muted">
                  <AlignLeft size={14} />
                  <p className="f1-r">Article content</p>
                </div>
                <div className="rounded-input border border-disabled bg-disabled/5 p-4">
                  <p className="b2-r whitespace-pre-wrap leading-relaxed text-text">
                    {resource.content}
                  </p>
                </div>
              </div>
            )}
          </div>
        </AppCard>
      ) : null}
    </div>
  );
}
