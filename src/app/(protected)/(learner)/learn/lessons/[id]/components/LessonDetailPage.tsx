'use client';

import Link from 'next/link';
import { ArrowLeft, ArrowRight, CheckCircle2 } from 'lucide-react';
import { AppCard } from '@/components/ui/AppCard';
import AppButton from '@/components/ui/AppButton';
import AppSpinner from '@/components/ui/AppSpinner';
import { useLessonDetail } from '@/lib/learn/useLessonDetail';

interface LessonDetailPageProps {
  lessonId: number;
}

export default function LessonDetailPage({ lessonId }: LessonDetailPageProps) {
  const {
    lesson,
    module,
    course,
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
        <div className="flex items-center gap-2">
          <span className="b2-b text-primary">Lesson {lesson.order}</span>
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
