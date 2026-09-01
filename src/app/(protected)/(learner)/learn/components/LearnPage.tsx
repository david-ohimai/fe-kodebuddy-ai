'use client';

import { useRouter } from 'next/navigation';
import { ArrowRight } from 'lucide-react';
import PageHeader from '@/components/ui/AppPageHeader';
import { AppCard } from '@/components/ui/AppCard';
import AppButton from '@/components/ui/AppButton';
import AppSpinner from '@/components/ui/AppSpinner';
import AppEmptyState from '@/components/ui/AppEmptyState';
import AppProgressBar from '@/components/ui/AppProgressBar';
import { useMyEnrolledCourses } from '@/lib/learn/useMyEnrolledCourses';
import emptyStateImage from '@/assets/images/empty state.webp';

export default function LearnPage() {
  const router = useRouter();
  const { courses, loading, error } = useMyEnrolledCourses();

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
        <div className="flex flex-col gap-4">
          {courses.map((course) => (
            <AppCard
              key={course.courseId}
              padding="lg"
              className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="min-w-0 flex-1">
                <h3 className="b1-b text-text">{course.courseTitle}</h3>
                <div className="mt-3 flex items-center gap-3">
                  <AppProgressBar
                    percent={course.completionPercentage}
                    className="max-w-64"
                  />
                  <span className="b2-m shrink-0 text-text-secondary">
                    {course.completionPercentage}% complete
                  </span>
                </div>
                <p className="f1-r mt-1 text-muted">
                  {course.completedLessons} of {course.totalLessons} lessons
                  completed across {course.totalModules} modules
                </p>
              </div>
              <AppButton
                href={`/learn/courses/${course.courseId}`}
                radius="full"
                endIcon={<ArrowRight size={16} />}
                className="shrink-0"
              >
                Continue
              </AppButton>
            </AppCard>
          ))}
        </div>
      )}
    </div>
  );
}
