'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import emptyStateImg from '@/assets/images/empty state.webp';
import AppButton from '@/components/ui/AppButton';
import AppSpinner from '@/components/ui/AppSpinner';
import { useToast } from '@/components/ui/ToastProvider';
import { listCourses } from '@/lib/api/courses.api';
import { getErrorMessage } from '@/lib/api/client';
import type { CourseSummary } from '@/types/dashboard.types';

export default function LearnPage() {
  const { showError } = useToast();
  const [courses, setCourses] = useState<CourseSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    listCourses()
      .then((list) => {
        if (!cancelled) setCourses(list);
      })
      .catch((err) => {
        if (!cancelled) {
          showError(
            'Could not load your courses',
            getErrorMessage(err, 'Please try again.'),
          );
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [showError]);

  if (loading) {
    return (
      <div className="flex min-h-[420px] items-center justify-center">
        <AppSpinner size={40} />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 p-8 max-w-6xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">My Courses</h1>
        <p className="text-sm text-slate-500 mt-1">
          Access the courses available to you.
        </p>
      </div>

      {courses.length === 0 ? (
        <div className="bg-white border border-slate-100 rounded-2xl py-2 px-1 shadow-sm flex flex-col items-center justify-center text-center min-h-[500px]">
          <div className="relative w-[154px] h-[103px] mb-1">
            <Image
              src={emptyStateImg}
              alt="Start your learning journey"
              fill
              className="object-contain"
              priority
            />
          </div>

          <h3 className="text-xl font-bold text-slate-900 mb-2">
            Start your learning journey
          </h3>
          <p className="text-sm text-slate-500 max-w-sm mb-8">
            You don&apos;t have a course in progress yet. Explore your courses to get started.
          </p>

          <AppButton
            href="/dashboard"
            radius="full"
            className="px-8 py-2.5 bg-primary text-white font-medium hover:bg-primary/90 transition-all shadow-sm"
          >
            Back to Dashboard
          </AppButton>
        </div>
      ) : (
        <div className="grid gap-4">
          {courses.map((course) => (
            <div key={course.id} className="bg-white border p-6 rounded-2xl shadow-sm flex justify-between items-center">
              <h3 className="font-semibold text-lg text-slate-900">{course.title}</h3>
              <AppButton href={`/learn/courses/${course.id}`} radius="full">
                Continue
              </AppButton>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}