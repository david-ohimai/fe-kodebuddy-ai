'use client';

import { useRouter } from 'next/navigation';
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  FileText,
  Sparkles,
} from 'lucide-react';
import PageHeader from '@/components/ui/AppPageHeader';
import { AppCard } from '@/components/ui/AppCard';
import AppButton from '@/components/ui/AppButton';
import AppSpinner from '@/components/ui/AppSpinner';
import AppEmptyState from '@/components/ui/AppEmptyState';
import AppProgressBar from '@/components/ui/AppProgressBar';
import { useMyEnrolledCourses } from '@/lib/learn/useMyEnrolledCourses';
import { useCurrentUserContext } from '@/lib/auth/CurrentUserContext';
import AskKodeBuddyFab from '@/components/chat/AskKodeBuddyFab';
import emptyStateImage from '@/assets/images/empty state.webp';

const LEARN_SUGGESTIONS = [
  'What should I focus on next in this course?',
  'Summarize what this module covers',
];

export default function LearnPage() {
  const router = useRouter();
  const { user } = useCurrentUserContext();
  const { courses, loading, error } = useMyEnrolledCourses(user?.id);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="My Courses"
        subtitle="Access the courses available to you."
      />

      {loading ? (
        <div className="flex min-h-[420px] items-center justify-center">
          <AppSpinner size={40} />
        </div>
      ) : error ? (
        <AppCard padding="lg" className="border border-error/30 bg-error/5">
          <p className="b2-r text-error">{error}</p>
        </AppCard>
      ) : courses.length === 0 ? (
        <AppCard padding="lg">
          <AppEmptyState
            image={emptyStateImage}
            title="Start your learning journey"
            description="You don't have a course in progress yet. Explore your courses to get started."
            actionLabel="Back to Dashboard"
            actionIcon={null}
            onAction={() => router.push('/dashboard')}
          />
        </AppCard>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {courses.map((course) => {
            const isCompleted = course.completionPercentage === 100;
            const inProgress =
              course.completionPercentage > 0 && !isCompleted;

            return (
              <div
                key={course.courseId}
                className="group flex flex-col justify-between overflow-hidden rounded-2xl border border-disabled bg-white shadow-xs transition-all hover:border-primary/40 hover:shadow-md"
              >
                {/* Visual Gradient Header */}
                <div className="relative flex h-36 w-full flex-col justify-between overflow-hidden bg-gradient-to-br from-[#0F172A] via-[#1E3A8A] to-primary p-5">
                  <div className="absolute -right-4 -bottom-6 text-white/10 transition-transform duration-300 group-hover:scale-105">
                    <BookOpen size={100} />
                  </div>

                  <div className="z-10 flex items-center justify-between">
                    {isCompleted ? (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-success/95 px-3 py-1 text-xs font-bold text-white shadow-xs backdrop-blur-md">
                        <CheckCircle2 size={13} /> Completed
                      </span>
                    ) : inProgress ? (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1 text-xs font-bold text-primary shadow-xs backdrop-blur-md">
                        <Sparkles size={13} /> In Progress
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-white/90 px-3 py-1 text-xs font-bold text-slate-700 shadow-xs backdrop-blur-md">
                        Not Started
                      </span>
                    )}
                  </div>

                  <div className="z-10 flex items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 rounded-md bg-black/30 px-2.5 py-1 text-xs font-medium text-white backdrop-blur-md">
                      <BookOpen size={13} /> {course.totalModules}{' '}
                      {course.totalModules === 1 ? 'Module' : 'Modules'}
                    </span>
                    <span className="inline-flex items-center gap-1.5 rounded-md bg-black/30 px-2.5 py-1 text-xs font-medium text-white backdrop-blur-md">
                      <FileText size={13} /> {course.totalLessons}{' '}
                      {course.totalLessons === 1 ? 'Lesson' : 'Lessons'}
                    </span>
                  </div>
                </div>

                {/* Card Body */}
                <div className="flex flex-1 flex-col justify-between p-5">
                  <div>
                    <h2 className="text-lg font-bold tracking-tight text-text transition-colors group-hover:text-primary">
                      {course.courseTitle}
                    </h2>
                    <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-text-secondary">
                      Comprehensive learning modules, lessons, and interactive
                      resources tailored for your cohort.
                    </p>
                  </div>

                  {/* Progress section */}
                  <div className="mt-5 border-t border-disabled pt-4">
                    <div className="mb-2 flex items-center justify-between text-xs">
                      <span className="font-medium text-muted">Progress</span>
                      <span className="font-bold text-text">
                        {course.completionPercentage}%
                      </span>
                    </div>

                    <AppProgressBar percent={course.completionPercentage} />

                    <div className="mt-2 flex items-center justify-between text-xs text-muted">
                      <span>
                        {course.completedLessons} of {course.totalLessons}{' '}
                        lessons
                      </span>
                      <span>
                        {Math.max(
                          0,
                          course.totalLessons - course.completedLessons,
                        )}{' '}
                        remaining
                      </span>
                    </div>

                    <AppButton
                      href={`/learn/courses/${course.courseId}`}
                      radius="full"
                      endIcon={<ArrowRight size={15} />}
                      className="mt-5 w-full justify-center text-sm font-semibold"
                    >
                      {isCompleted
                        ? 'Review Course'
                        : inProgress
                          ? 'Continue Learning'
                          : 'Start Course'}
                    </AppButton>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <AskKodeBuddyFab suggestions={LEARN_SUGGESTIONS} />
    </div>
  );
}
