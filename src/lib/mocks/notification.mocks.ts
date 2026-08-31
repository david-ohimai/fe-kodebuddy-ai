// Demo fixtures for the notifications menu.
//
// `app/features/notifications/router.py` on the backend is an empty file and
// is not mounted, so there is no source for these yet. Times are relative to
// load so the menu always reads sensibly rather than drifting to "300days ago".

import type { AppNotification } from '@/types/notification.types';

function minutesAgo(minutes: number): string {
  return new Date(Date.now() - minutes * 60_000).toISOString();
}

export function buildDemoNotifications(): AppNotification[] {
  return [
    {
      id: 'notif-1',
      kind: 'escalation_reply',
      title: 'Your trainer responded to your escalation',
      subject: 'Layout Vs Autolayout',
      createdAt: minutesAgo(10),
      read: false,
    },
    {
      id: 'notif-2',
      kind: 'assignment_deadline',
      title: 'Assignment deadline approaching',
      subject: 'Data Collection Method',
      createdAt: minutesAgo(5),
      read: false,
    },
    {
      id: 'notif-3',
      kind: 'general',
      title: 'New resource added to your module',
      subject: 'Module 2 live session recording',
      createdAt: minutesAgo(90),
      read: false,
    },
    {
      id: 'notif-4',
      kind: 'assignment_deadline',
      title: 'Assignment graded',
      subject: 'Colour & Type Scale',
      createdAt: minutesAgo(60 * 26),
      read: true,
    },
  ];
}
