'use client';

import Link from 'next/link';
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  FileText,
  ExternalLink,
  AlignLeft,
} from 'lucide-react';
import { AppCard } from '@/components/ui/AppCard';
import AppButton from '@/components/ui/AppButton';
import AppPill from '@/components/ui/AppPill';
import AppSpinner from '@/components/ui/AppSpinner';
import { useLessonDetail } from '@/lib/learn/useLessonDetail';
import {
  CONTENT_TYPE_META,
  type LessonContentType,
} from '@/types/lesson-content.types';

interface LessonDetailPageProps {
  lessonId: number;
}

export default function LessonDetailPage({ lessonId }: LessonDetailPageProps) {
  const {
    lesson,
    module,
    course,
    siblingLessons,
    resource,
    isCompleted,
    completedCount,
    totalLessons,
    previousLesson,
    nextLesson,
    loading,
    error,
    retry,
    toggling,
    justCompleted,
    markComplete,
  } = useLessonDetail(lessonId);

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

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <AppSpinner size={40} />
      </div>
    );
  }

  if (error || !lesson || !module || !course) {
    return (
      <AppCard padding="lg" className="text-center">
        <p className="b1-b text-text">Could not load this lesson</p>
        <p className="b2-r mt-1 text-muted">{error ?? 'Please try again.'}</p>
        <AppButton className="mt-4" onClick={retry}>
          Retry
        </AppButton>
      </AppCard>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="f1-m flex flex-wrap items-center gap-1.5 uppercase text-muted">
        <span>{course.title}</span>
        <span>{'>'}</span>
        <Link
          href={`/learn/modules/${module.id}`}
          className="text-primary hover:underline"
        >
          Module {module.order} — {module.title}
        </Link>
      </div>

      <div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="b2-b text-primary">Lesson {lesson.order}</span>
          {resourceMeta && (
            <AppPill
              label={resourceMeta.label}
              color={resourceMeta.pillColor}
              icon={resourceMeta.icon as React.ReactElement}
            />
          )}
          {isCompleted && (
            <span className="f1-b inline-flex items-center gap-1 rounded-full bg-success-light px-2.5 py-1 uppercase text-success-dark">
              <CheckCircle2 size={12} /> Completed
            </span>
          )}
        </div>
        <h1 className="h3-b mt-1 uppercase text-text">{lesson.title}</h1>
      </div>

      {justCompleted && (
        <div className="flex items-start gap-3 rounded-card border border-success/20 bg-success-light px-5 py-4">
          <CheckCircle2
            size={20}
            className="mt-0.5 shrink-0 text-success-dark"
          />
          <div>
            <p className="b2-b text-success-dark">
              Lesson Completed Successfully!
            </p>
            <p className="b2-r mt-0.5 text-success-dark/80">
              Your progress has been recorded. You are now at {completedCount}{' '}
              of {totalLessons} lessons.
            </p>
          </div>
        </div>
      )}

      <AppCard padding="lg">
        {lesson.contentBody ? (
          <p className="b1-r whitespace-pre-wrap text-text-secondary">
            {lesson.contentBody}
          </p>
        ) : (
          <p className="b1-r text-muted">
            No content has been added to this lesson yet.
          </p>
        )}
      </AppCard>

      {resource && contentType && resourceMeta && (
        <AppCard padding="lg">
          <div className="flex flex-col gap-4">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-disabled pb-4">
              <div className="flex items-center gap-2.5">
                <h2 className="b1-b text-text">Lesson Resource</h2>
                <AppPill
                  label={resourceMeta.label}
                  color={resourceMeta.pillColor}
                  icon={resourceMeta.icon as React.ReactElement}
                />
              </div>
              <AppButton
                href={`/resources/${resource.id}`}
                variant="outlined"
                color="neutral"
                size="small"
                radius="full"
                endIcon={<ArrowRight size={13} />}
              >
                View in Resources
              </AppButton>
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
      )}

      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div className="flex flex-wrap items-center gap-4">
          {previousLesson ? (
            <Link
              href={`/learn/lessons/${previousLesson.id}`}
              className="b2-b flex items-center gap-1.5 text-text-secondary hover:text-text"
            >
              <ArrowLeft size={16} /> Previous Lesson
            </Link>
          ) : (
            <span />
          )}
          {isCompleted && (
            <Link
              href={`/learn/modules/${module.id}`}
              className="b2-b text-primary hover:underline"
            >
              Back to module
            </Link>
          )}
        </div>

        {isCompleted ? (
          nextLesson ? (
            <AppButton
              href={`/learn/lessons/${nextLesson.id}`}
              radius="full"
              endIcon={<ArrowRight size={16} />}
            >
              Next Lesson: {nextLesson.title}
            </AppButton>
          ) : (
            <AppButton href={`/learn/modules/${module.id}`} radius="full">
              Back to module
            </AppButton>
          )
        ) : (
          <AppButton
            radius="full"
            loading={toggling}
            onClick={markComplete}
            startIcon={<CheckCircle2 size={16} />}
          >
            Mark Complete
          </AppButton>
        )}
      </div>
    </div>
  );
}
