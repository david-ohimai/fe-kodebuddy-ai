import React from 'react';
import { ArrowLeft, ExternalLink, FileText, AlignLeft, BookOpen } from 'lucide-react';
import { AppCard } from '@/components/ui/AppCard';
import AppButton from '@/components/ui/AppButton';
import AppPill from '@/components/ui/AppPill';
import AppSpinner from '@/components/ui/AppSpinner';
import { CONTENT_TYPE_META } from '@/types/lesson-content.types';
import type { CourseResource } from '@/lib/api/resources.api';
import type { Lesson } from '@/lib/api/lessons.api';

export interface LessonDetailViewProps {
  lesson: Lesson;
  resource: CourseResource | null;
  loading: boolean;
  onBack: () => void;
}

export default function LessonDetailView({
  lesson,
  resource,
  loading,
  onBack,
}: LessonDetailViewProps) {
  const rawType = (resource?.type ?? '').toLowerCase();
  const contentType =
    rawType === 'file' || rawType === 'document'
      ? 'document'
      : rawType === 'link'
        ? 'link'
        : rawType === 'article'
          ? 'article'
          : null;

  const meta = contentType ? CONTENT_TYPE_META[contentType] : null;

  return (
    <div className="flex flex-col gap-6">
      {/* Back button — same style as CourseDetailView */}
      <button
        type="button"
        onClick={onBack}
        className="b2-m inline-flex w-fit items-center gap-1.5 text-primary hover:underline"
      >
        <ArrowLeft size={16} />
        Back to course
      </button>

      {/* Lesson header card */}
      <AppCard>
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="flex flex-col gap-1">
              <h2 className="h5-b text-text">{lesson.title}</h2>
              {lesson.contentBody && (
                <p className="b2-r text-text-secondary">{lesson.contentBody}</p>
              )}
            </div>
            {meta && (
              <AppPill
                label={meta.label}
                color={meta.pillColor}
                icon={meta.icon as React.ReactElement}
              />
            )}
          </div>
        </div>
      </AppCard>

      {/* Resource card */}
      <AppCard>
        <div className="flex flex-col gap-4">
          <p className="b2-b text-text">Attached resource</p>

          {loading ? (
            <div className="flex items-center justify-center py-10">
              <AppSpinner size={32} />
            </div>
          ) : resource && contentType && meta ? (
            <div className="flex flex-col gap-5">
              {/* Resource title + description */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <p className="f1-r text-muted">Resource title</p>
                  <p className="b2-m mt-1 text-text">{resource.title}</p>
                </div>
                <div>
                  <p className="f1-r text-muted">Resource type</p>
                  <div className="mt-1">
                    <AppPill
                      label={meta.label}
                      color={meta.pillColor}
                      icon={meta.icon as React.ReactElement}
                    />
                  </div>
                </div>
                {resource.description && (
                  <div className="sm:col-span-2">
                    <p className="f1-r text-muted">Resource description</p>
                    <p className="b2-r mt-1 text-text">{resource.description}</p>
                  </div>
                )}
              </div>

              <div className="h-px bg-disabled" />

              {/* Document */}
              {contentType === 'document' && (
                <div className="flex flex-col gap-2">
                  <p className="f1-r text-muted">Document</p>
                  <div className="flex items-center gap-3 rounded-input border border-disabled bg-disabled/10 px-4 py-3">
                    <span
                      className={
                        'flex h-10 w-10 shrink-0 items-center justify-center rounded ' +
                        meta.tint
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
                        meta.tint
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
                  <div className="flex items-center gap-1.5">
                    <AlignLeft size={14} className="text-muted" />
                    <p className="f1-r text-muted">Article content</p>
                  </div>
                  <div className="rounded-input border border-disabled bg-disabled/5 p-4">
                    <p className="b2-r whitespace-pre-wrap leading-relaxed text-text">
                      {resource.content}
                    </p>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3 rounded-card border border-dashed border-disabled py-12 text-center">
              <BookOpen size={36} className="text-muted" />
              <div>
                <p className="b2-m text-text">No resource attached</p>
                <p className="f1-r mt-0.5 text-muted">
                  This lesson has no document, link, or article attached to it.
                </p>
              </div>
            </div>
          )}
        </div>
      </AppCard>
    </div>
  );
}
