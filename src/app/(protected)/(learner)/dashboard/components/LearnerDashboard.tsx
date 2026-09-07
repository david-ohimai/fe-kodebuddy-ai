'use client';

import { useEffect, useState } from 'react';
import {
  BarChart3,
  BookOpen,
  CalendarClock,
  Clock,
  RotateCcw,
  Send,
  Sparkles,
} from 'lucide-react';

import AppButton from '@/components/ui/AppButton';
import { AppCard } from '@/components/ui/AppCard';
import AppEmptyState from '@/components/ui/AppEmptyState';
import AppSpinner from '@/components/ui/AppSpinner';
import AppProgressBar from '@/components/ui/AppProgressBar';
import KodeBuddyChatPanel from '@/components/chat/KodeBuddyChatPanel';
import { useCurrentUserContext } from '@/lib/auth/CurrentUserContext';
import { useMyEnrolledCourses } from '@/lib/learn/useMyEnrolledCourses';
import { listMyActivity, ACTIVITY_TYPE_LABEL } from '@/lib/api/activity.api';
import type { ActivityEntry } from '@/lib/api/activity.api';

function AskKodeBuddyWidget({ onAsk }: { onAsk: (question: string) => void }) {
  const [question, setQuestion] = useState('');
  const trimmed = question.trim();

  const submit = () => {
    if (!trimmed) return;
    onAsk(trimmed);
    setQuestion('');
  };

  return (
    <div className="rounded-card bg-slate-900 p-5 text-white">
      <div className="flex items-center gap-2">
        <Sparkles size={18} className="shrink-0 text-secondary" />
        <p className="b2-b">Ask KodeBuddy</p>
      </div>

      <p className="mt-1.5 b2-r text-white/60">
        Quick help with your code or concepts.
      </p>

      <textarea
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            submit();
          }
        }}
        placeholder="What are arrow functions?"
        rows={3}
        aria-label="Ask KodeBuddy a question"
        className="b2-r mt-4 w-full resize-none rounded-input border border-white/15 bg-white/5 p-3 text-white outline-none transition-colors placeholder:text-white/40 focus:border-white/30"
      />

      <AppButton
        onClick={submit}
        disabled={!trimmed}
        startIcon={<Send size={16} />}
        fullWidth
        radius="full"
        className="mt-4"
      >
        Ask Question
      </AppButton>
    </div>
  );
}

export default function LearnerDashboard() {
  const { user } = useCurrentUserContext();

  const { courses, loading, error, refresh } = useMyEnrolledCourses(user?.id);
  const [activities, setActivities] = useState<ActivityEntry[]>([]);
  const [activityLoading, setActivityLoading] = useState(true);

  const [askedQuestion, setAskedQuestion] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    listMyActivity(10)
      .then((entries) => {
        if (!cancelled) setActivities(entries);
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setActivityLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const firstName =
    user?.fullName?.trim().split(' ')[0] ||
    user?.email?.split('@')[0] ||
    undefined;
  const activeCourses = courses;
  const hasCourseInProgress = activeCourses.length > 0;

  if (loading) {
    return (
      <div className="flex min-h-[420px] items-center justify-center">
        <AppSpinner size={40} />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="h5-b text-text">
          Welcome to KodeBuddy{firstName ? `, ${firstName}` : ''}
        </h1>
        <p className="b2-r mt-1 text-text-secondary">
          Start your learning journey and keep track of your progress here.
        </p>
      </div>

      {error && (
        <AppCard padding="lg" className="border border-error/30 bg-error/5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="b2-r text-error">{error}</p>
            <AppButton
              variant="outlined"
              color="error"
              size="small"
              radius="full"
              startIcon={<RotateCcw size={14} />}
              onClick={refresh}
            >
              Retry
            </AppButton>
          </div>
        </AppCard>
      )}

      {!hasCourseInProgress && !error && (
        <AppCard
          padding="lg"
          className="flex flex-col items-center py-12 text-center"
        >
          <AppCard.Icon variant="primary" className="mb-4">
            <BookOpen />
          </AppCard.Icon>
          <p className="b1-b text-text">Start your learning journey</p>
          <p className="b2-r mt-1 max-w-sm text-muted">
            You don&apos;t have a course in progress yet. Explore your courses
            to get started.
          </p>
          <AppButton href="/learn" radius="full" className="mt-5">
            Explore My Courses
          </AppButton>
        </AppCard>
      )}

      {hasCourseInProgress && (
        <div className="grid grid-cols-1 gap-4">
          {activeCourses.map((course) => (
            <AppCard
              key={course.courseId}
              padding="lg"
              className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center"
            >
              <div className="space-y-1">
                <span className="text-xs font-semibold uppercase tracking-wider text-primary bg-primary/10 px-2.5 py-1 rounded-full">
                  Active Course
                </span>
                <h3 className="b1-b text-text mt-2">{course.courseTitle}</h3>
                <p className="b2-r text-muted">
                  Continue where you left off in your curriculum.
                </p>
              </div>
              <AppButton
                href={`/learn/courses/${course.courseId}`}
                radius="full"
              >
                Continue Course
              </AppButton>
            </AppCard>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_320px]">
        <div className="flex flex-col gap-4">
          <AppCard padding="none">
            <div className="border-b border-muted/20 px-5 py-3">
              <p className="b2-b text-text">Learning Progress</p>
            </div>
            {activeCourses.length === 0 ? (
              <AppEmptyState
                size="compact"
                icon={<BarChart3 />}
                title="No learning progress yet"
                description="Complete your first lesson to start tracking your progress."
              />
            ) : (
              <ul className="divide-y divide-muted/20">
                {activeCourses.map((course) => (
                  <li key={course.courseId} className="px-5 py-4">
                    <div className="flex items-center justify-between gap-3">
                      <p className="b2-m text-text">{course.courseTitle}</p>
                      <span className="f1-r text-muted">
                        {course.completionPercentage}%
                      </span>
                    </div>
                    <AppProgressBar
                      percent={course.completionPercentage}
                      className="mt-2"
                    />
                    <p className="f1-r mt-1.5 text-muted">
                      {course.completedLessons} of {course.totalLessons} lessons
                      complete
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </AppCard>

          <AppCard padding="none">
            <div className="border-b border-muted/20 px-5 py-3">
              <p className="b2-b text-text">Recent Activity</p>
            </div>
            {activityLoading ? (
              <div className="flex min-h-[140px] items-center justify-center">
                <AppSpinner size={28} />
              </div>
            ) : activities.length === 0 ? (
              <AppEmptyState
                size="compact"
                icon={<Clock />}
                title="No recent activity"
                description="Your learning activity will appear here."
              />
            ) : (
              <ul className="divide-y divide-muted/20">
                {activities.map((entry) => (
                  <li
                    key={entry.id}
                    className="flex flex-wrap items-center justify-between gap-2 px-5 py-3"
                  >
                    <p className="b2-r text-text-secondary">
                      {entry.title || ACTIVITY_TYPE_LABEL[entry.activityType]}
                    </p>
                    <span className="f1-r shrink-0 text-muted">
                      {new Date(entry.createdAt).toLocaleDateString('en-US', {
                        day: 'numeric',
                        month: 'short',
                      })}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </AppCard>
        </div>

        <div className="flex flex-col gap-4">
          <AppCard padding="none">
            <div className="border-b border-muted/20 px-5 py-3">
              <p className="b2-b text-text">Upcoming Deadlines</p>
            </div>
            <AppEmptyState
              size="compact"
              icon={<CalendarClock />}
              title="No upcoming deadlines"
            />
          </AppCard>

          {hasCourseInProgress && (
            <AskKodeBuddyWidget onAsk={setAskedQuestion} />
          )}
        </div>
      </div>

      {askedQuestion !== null && activeCourses[0] && (
        <>
          <div
            role="presentation"
            onClick={() => setAskedQuestion(null)}
            className="fixed inset-0 z-40 bg-black/40"
          />
          <aside className="fixed inset-x-4 top-4 bottom-4 z-50 lg:inset-y-6 lg:right-6 lg:left-auto lg:w-100">
            <KodeBuddyChatPanel
              context={{
                courseId: activeCourses[0].courseId,
                moduleId: null,
                assignmentId: null,
                label: activeCourses[0].courseTitle,
              }}
              courseOptions={activeCourses.map((course) => ({
                id: course.courseId,
                title: course.courseTitle,
              }))}
              initialQuestion={askedQuestion}
              onClose={() => setAskedQuestion(null)}
            />
          </aside>
        </>
      )}
    </div>
  );
}
