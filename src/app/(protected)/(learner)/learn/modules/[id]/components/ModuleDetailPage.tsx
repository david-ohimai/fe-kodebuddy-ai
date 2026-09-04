'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, CheckCircle2, PlayCircle, Sparkles } from 'lucide-react';
import { AppCard } from '@/components/ui/AppCard';
import AppButton from '@/components/ui/AppButton';
import AppSpinner from '@/components/ui/AppSpinner';
import AppProgressBar from '@/components/ui/AppProgressBar';
import KodeBuddyChatPanel from '@/components/chat/KodeBuddyChatPanel';
import { useModuleDetail } from '@/lib/learn/useModuleDetail';

interface ModuleDetailPageProps {
  moduleId: number;
}

export default function ModuleDetailPage({ moduleId }: ModuleDetailPageProps) {
  const { module, course, lessons, moduleProgress, loading, error } =
    useModuleDetail(moduleId);
  const [chatOpen, setChatOpen] = useState(false);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <AppSpinner size={40} />
      </div>
    );
  }

  if (error || !module || !course) {
    return (
      <AppCard padding="lg" className="text-center">
        <p className="b1-b text-text">Could not load this module</p>
        <p className="b2-r mt-1 text-muted">{error ?? 'Please try again.'}</p>
      </AppCard>
    );
  }

  const total = moduleProgress?.totalLessons ?? lessons.length;
  const completed = moduleProgress?.completedLessons ?? 0;

  const firstIncompleteIndex = lessons.findIndex((l) => !l.isCompleted);
  const rows = lessons.map((lesson, index) => {
    const isCurrent = index === firstIncompleteIndex;
    const isLocked = !lesson.isCompleted && !isCurrent;
    return { lesson, isCurrent, isLocked };
  });
  const currentLesson = rows.find((r) => r.isCurrent)?.lesson ?? lessons[0];

  return (
    <div className="flex flex-col gap-6">
      <Link
        href={`/learn/courses/${module.courseId}`}
        className="b2-b inline-flex w-fit items-center gap-1.5 text-primary hover:underline"
      >
        <ArrowLeft size={16} /> Back to {course.title}
      </Link>

      <AppCard padding="lg">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <p className="f1-m uppercase text-muted">Module {module.order}</p>
            <h1 className="h4-b mt-1 text-text">{module.title}</h1>
            <div className="mt-3 flex max-w-64 items-center gap-3">
              <AppProgressBar percent={moduleProgress?.completionPercentage ?? 0} />
              <span className="b2-m shrink-0 text-text-secondary">
                {completed} of {total} lessons completed
              </span>
            </div>
          </div>

          {currentLesson && (
            <AppButton
              href={`/learn/lessons/${currentLesson.id}`}
              radius="full"
              className="shrink-0"
            >
              Continue Lesson
            </AppButton>
          )}
        </div>
      </AppCard>

      <div className="flex flex-col divide-y divide-disabled rounded-card border border-disabled bg-background">
        {rows.map(({ lesson, isCurrent, isLocked }, index) => {
          const content = (
            <div className="flex items-center gap-4 px-5 py-4">
              <span
                className={
                  'flex h-9 w-9 shrink-0 items-center justify-center rounded-full ' +
                  (lesson.isCompleted
                    ? 'bg-success-light text-success-dark'
                    : isCurrent
                      ? 'bg-primary text-background'
                      : 'bg-disabled text-muted')
                }
              >
                {lesson.isCompleted ? (
                  <CheckCircle2 size={18} />
                ) : isCurrent ? (
                  <PlayCircle size={18} />
                ) : (
                  <span className="b2-b">{index + 1}</span>
                )}
              </span>

              <div className="min-w-0 flex-1">
                <p className={'b1-b ' + (isLocked ? 'text-muted' : 'text-text')}>
                  {index + 1}. {lesson.title}
                </p>
                <p
                  className={
                    'f1-m mt-0.5 uppercase ' +
                    (lesson.isCompleted
                      ? 'text-success-dark'
                      : isCurrent
                        ? 'text-primary'
                        : 'text-muted')
                  }
                >
                  {lesson.isCompleted
                    ? 'Completed'
                    : isCurrent
                      ? 'Current Lesson'
                      : 'Upcoming'}
                </p>
              </div>
            </div>
          );

          return isLocked ? (
            <div key={lesson.id} className="cursor-not-allowed opacity-80">
              {content}
            </div>
          ) : (
            <Link
              key={lesson.id}
              href={`/learn/lessons/${lesson.id}`}
              className="transition-colors hover:bg-primary-light/40"
            >
              {content}
            </Link>
          );
        })}
      </div>

      <div className="flex flex-col items-start justify-between gap-4 rounded-card bg-slate-950 p-6 text-white sm:flex-row sm:items-center">
        <div>
          <h2 className="b1-b text-white">Stuck on a concept?</h2>
          <p className="b2-r mt-1 text-white/60">
            Ask KodeBuddy AI for a quick explanation or code examples.
          </p>
        </div>
        <AppButton
          radius="full"
          startIcon={<Sparkles size={16} />}
          onClick={() => setChatOpen(true)}
          className="shrink-0"
        >
          Ask KodeBuddy
        </AppButton>
      </div>

      {chatOpen && (
        <>
          <div
            role="presentation"
            onClick={() => setChatOpen(false)}
            className="fixed inset-0 z-40 bg-black/40"
          />
          <aside className="fixed inset-x-4 top-4 bottom-4 z-50 lg:inset-y-6 lg:right-6 lg:left-auto lg:w-100">
            <KodeBuddyChatPanel
              context={{
                courseId: module.courseId,
                moduleId: module.id,
                assignmentId: null,
                label: module.title,
              }}
              onClose={() => setChatOpen(false)}
            />
          </aside>
        </>
      )}
    </div>
  );
}
