'use client';

import Link from 'next/link';
import { CheckCircle2, Lock, PlayCircle } from 'lucide-react';
import { AppCard } from '@/components/ui/AppCard';
import AppButton from '@/components/ui/AppButton';
import AppSpinner from '@/components/ui/AppSpinner';
import AppProgressBar from '@/components/ui/AppProgressBar';
import { useCourseCurriculum } from '@/lib/learn/useCourseCurriculum';

const PLACEHOLDER_LEVEL = 'Beginner';

interface CourseDetailPageProps {
  courseId: number;
}

export default function CourseDetailPage({ courseId }: CourseDetailPageProps) {
  const { course, modules, courseProgress, loading, error } =
    useCourseCurriculum(courseId);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <AppSpinner size={40} />
      </div>
    );
  }

  if (error || !course) {
    return (
      <AppCard padding="lg" className="text-center">
        <p className="b1-b text-text">Could not load this course</p>
        <p className="b2-r mt-1 text-muted">{error ?? 'Please try again.'}</p>
      </AppCard>
    );
  }

  const totalModules = courseProgress?.totalModules ?? modules.length;
  const totalLessons =
    courseProgress?.totalLessons ??
    modules.reduce((sum, m) => sum + (m.progress?.totalLessons ?? 0), 0);
  const percent = courseProgress?.completionPercentage ?? 0;

  const isModuleComplete = (m: (typeof modules)[number]) => {
    const total = m.progress?.totalLessons ?? 0;
    const completed = m.progress?.completedLessons ?? 0;
    return total > 0 && completed === total;
  };
  const currentModuleIndex = modules.findIndex((m) => !isModuleComplete(m));

  return (
    <div className="flex flex-col gap-6">
      <AppCard padding="lg">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-3">
              <span className="f1-b rounded-full bg-primary-light px-3 py-1 uppercase text-primary">
                {PLACEHOLDER_LEVEL}
              </span>
              <span className="b2-r text-muted">
                {totalModules} Modules • {totalLessons} Lessons
              </span>
            </div>
            <h1 className="h4-b mt-2 text-text">{course.title}</h1>
            {course.description && (
              <p className="b2-r mt-2 max-w-2xl text-text-secondary">
                {course.description}
              </p>
            )}
          </div>

          <AppCard padding="md" className="w-full shrink-0 sm:w-56">
            <p className="f1-m uppercase text-muted">Overall Progress</p>
            <p className="h3-b mt-2 text-text">
              {percent}%{' '}
              <span className="b2-r font-normal text-muted">completed</span>
            </p>
            <AppProgressBar percent={percent} className="mt-3" />
          </AppCard>
        </div>
      </AppCard>

      <div>
        <h2 className="h6-b mb-4 text-text">Course Curriculum</h2>

        <div className="flex flex-col divide-y divide-disabled rounded-card border border-disabled bg-background">
          {modules.map((module, index) => {
            const total = module.progress?.totalLessons ?? 0;
            const completed = module.progress?.completedLessons ?? 0;
            const isComplete = total > 0 && completed === total;
            const isCurrent = index === currentModuleIndex;
            const isLocked = !isComplete && !isCurrent;
            const modulePercent = module.progress?.completionPercentage ?? 0;

            const content = (
              <div className="flex items-center gap-4 px-5 py-4">
                <span
                  className={
                    'flex h-9 w-9 shrink-0 items-center justify-center rounded-full ' +
                    (isComplete
                      ? 'bg-success-light text-success-dark'
                      : isCurrent
                        ? 'bg-primary text-background'
                        : 'bg-disabled text-muted')
                  }
                >
                  {isComplete ? (
                    <CheckCircle2 size={18} />
                  ) : isCurrent ? (
                    <PlayCircle size={18} />
                  ) : (
                    <Lock size={16} />
                  )}
                </span>

                <div className="min-w-0 flex-1">
                  <p
                    className={
                      'b1-b ' + (isLocked ? 'text-muted' : 'text-text')
                    }
                  >
                    {module.title}
                  </p>
                  {module.description && (
                    <p className="f1-r mt-0.5 text-muted">
                      {module.description}
                    </p>
                  )}
                  {isCurrent && total > 0 && (
                    <div className="mt-2 flex max-w-56 items-center gap-2">
                      <AppProgressBar percent={modulePercent} />
                      <span className="f1-m shrink-0 text-muted">
                        {modulePercent}%
                      </span>
                    </div>
                  )}
                </div>

                <div className="shrink-0 text-right">
                  {isCurrent ? (
                    <AppButton
                      href={`/learn/modules/${module.id}`}
                      radius="full"
                      size="small"
                    >
                      Continue
                    </AppButton>
                  ) : (
                    <div>
                      <p className="f1-m uppercase text-muted">Status</p>
                      <p
                        className={
                          'b2-m ' +
                          (isComplete ? 'text-success-dark' : 'text-muted')
                        }
                      >
                        {isComplete ? 'Completed' : 'Locked'}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            );

            return isLocked ? (
              <div key={module.id} className="cursor-not-allowed opacity-80">
                {content}
              </div>
            ) : (
              <Link
                key={module.id}
                href={`/learn/modules/${module.id}`}
                className="transition-colors hover:bg-primary-light/40"
              >
                {content}
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
