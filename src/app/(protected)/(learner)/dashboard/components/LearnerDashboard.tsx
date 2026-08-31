'use client';

import { useEffect, useState } from 'react';
import {
  BarChart3,
  BookOpen,
  CalendarClock,
  Clock,
  Send,
  Sparkles,
} from 'lucide-react';

import AppButton from '@/components/ui/AppButton';
import { AppCard } from '@/components/ui/AppCard';
import AppInlineEmpty from '@/components/ui/AppInlineEmpty';
import AppSpinner from '@/components/ui/AppSpinner';
import KodeBuddyChatPanel from '@/components/chat/KodeBuddyChatPanel';
import { useCurrentUserContext } from '@/lib/auth/CurrentUserContext';
import { listCourses, type Course } from '@/lib/api/courses.api';

/**
 * Dashboard quick ask.
 *
 * Collects a question and hands it to the assistant panel, which asks it on
 * open. There is no standalone assistant route — the panel is opened in place
 * wherever the learner is.
 */
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
        <p className="b1-b">Ask KodeBuddy</p>
      </div>

      <p className="mt-1.5 b2-r text-white/60">
        Quick help with your code or concepts.
      </p>

      <textarea
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
        onKeyDown={(e) => {
          // Enter asks; Shift+Enter is a newline, matching the chat composer.
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

  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /** The question the assistant was opened with; null while it is closed. */
  const [askedQuestion, setAskedQuestion] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    listCourses()
      .then((list) => {
        if (!cancelled) setCourses(list);
      })
      .catch(() => {
        if (!cancelled) setError('Could not load your dashboard. Please try again.');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const firstName =
    user?.fullName?.trim().split(' ')[0] ||
    user?.email?.split('@')[0] ||
    undefined;
  const activeCourses = courses.filter((c) => c.isActive);
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
          <p className="b2-r text-error">{error}</p>
        </AppCard>
      )}

      {!hasCourseInProgress && !error && (
        <AppCard padding="lg" className="flex flex-col items-center py-12 text-center">
          <AppCard.Icon variant="primary" className="mb-4">
            <BookOpen />
          </AppCard.Icon>
          <p className="b1-b text-text">Start your learning journey</p>
          <p className="b2-r mt-1 max-w-sm text-muted">
            You don&apos;t have a course in progress yet. Explore your
            courses to get started.
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
              key={course.id}
              padding="lg"
              className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center"
            >
              <div className="space-y-1">
                <span className="text-xs font-semibold uppercase tracking-wider text-primary bg-primary/10 px-2.5 py-1 rounded-full">
                  Active Course
                </span>
                <h3 className="b1-b text-text mt-2">{course.title}</h3>
                <p className="b2-r text-muted">
                  Continue where you left off in your curriculum.
                </p>
              </div>
              <AppButton href={`/learn/courses/${course.id}`} radius="full">
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
            <AppInlineEmpty
              icon={<BarChart3 />}
              title="No learning progress yet"
              description="Complete your first lesson to start tracking your progress."
            />
          </AppCard>

          <AppCard padding="none">
            <div className="border-b border-muted/20 px-5 py-3">
              <p className="b2-b text-text">Recent Activity</p>
            </div>
            <AppInlineEmpty
              icon={<Clock />}
              title="No recent activity"
              description="Your learning activity will appear here."
            />
          </AppCard>
        </div>

        <div className="flex flex-col gap-4">
          <AppCard padding="none">
            <div className="border-b border-muted/20 px-5 py-3">
              <p className="b2-b text-text">Upcoming Deadlines</p>
            </div>
            <AppInlineEmpty
              icon={<CalendarClock />}
              title="No upcoming deadlines"
            />
          </AppCard>

          <AskKodeBuddyWidget onAsk={setAskedQuestion} />
        </div>
      </div>

      {/* The assistant opens in place — there is no separate route for it. */}
      {askedQuestion !== null && (
        <>
          <div
            role="presentation"
            onClick={() => setAskedQuestion(null)}
            className="fixed inset-0 z-40 bg-black/40"
          />
          <aside className="fixed inset-x-4 top-4 bottom-4 z-50 lg:inset-y-6 lg:right-6 lg:left-auto lg:w-100">
            <KodeBuddyChatPanel
              context={{
                courseId: activeCourses[0]?.id ?? courses[0]?.id ?? 0,
                moduleId: null,
                assignmentId: null,
                label: activeCourses[0]?.title ?? courses[0]?.title ?? 'General',
              }}
              initialQuestion={askedQuestion}
              onClose={() => setAskedQuestion(null)}
            />
          </aside>
        </>
      )}
    </div>
  );
}