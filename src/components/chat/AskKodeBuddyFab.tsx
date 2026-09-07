'use client';

import { useState } from 'react';
import { Sparkles } from 'lucide-react';
import KodeBuddyChatPanel from '@/components/chat/KodeBuddyChatPanel';
import { useCurrentUserContext } from '@/lib/auth/CurrentUserContext';
import { useMyEnrolledCourses } from '@/lib/learn/useMyEnrolledCourses';

export interface AskKodeBuddyFabProps {
  suggestions?: string[];
}

export default function AskKodeBuddyFab({ suggestions }: AskKodeBuddyFabProps) {
  const { user } = useCurrentUserContext();
  const { courses } = useMyEnrolledCourses(user?.id);
  const [open, setOpen] = useState(false);

  if (courses.length === 0) return null;

  const defaultCourse = courses[0];
  const courseOptions = courses.map((course) => ({
    id: course.courseId,
    title: course.courseTitle,
  }));

  return (
    <>
      {!open && (
        <button
          type="button"
          aria-label="Ask KodeBuddy AI"
          onClick={() => setOpen(true)}
          className="fixed bottom-6 right-6 z-40 inline-flex items-center gap-2 rounded-full bg-slate-950 py-3.5 pl-4 pr-5 text-white shadow-lg transition-transform hover:scale-105 hover:bg-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
        >
          <Sparkles size={20} className="shrink-0 text-secondary" />
          <span className="b2-b whitespace-nowrap">KodeBuddy AI</span>
        </button>
      )}

      {open && (
        <>
          <div
            role="presentation"
            onClick={() => setOpen(false)}
            className="fixed inset-0 z-40 bg-black/40"
          />
          <aside className="fixed inset-x-4 top-4 bottom-4 z-50 lg:inset-y-6 lg:right-6 lg:left-auto lg:w-100">
            <KodeBuddyChatPanel
              context={{
                courseId: defaultCourse.courseId,
                moduleId: null,
                assignmentId: null,
                label: defaultCourse.courseTitle,
              }}
              courseOptions={courseOptions}
              suggestions={suggestions}
              onClose={() => setOpen(false)}
            />
          </aside>
        </>
      )}
    </>
  );
}
