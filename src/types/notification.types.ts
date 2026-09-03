export type MentorNotificationKind =
  | 'lesson_completed'
  | 'assignment_submitted'
  | 'assignment_graded'
  | 'progress_updated'
  | 'check_in_completed'
  | 'check_in_sent';

export type MentorNotificationTone = 'warning' | 'success' | 'neutral';

export type NotificationKind =
  | 'escalation_reply'
  | 'assignment_deadline'
  | 'general';

export interface AppNotification {
  id: string;
  kind: NotificationKind;
  title: string;
  subject: string;
  createdAt: string;
  read: boolean;
}

export interface MentorNotification {
  id: string;
  learnerId: number;
  learnerName: string;
  kind: MentorNotificationKind;
  title: string;
  subject: string;
  createdAt: string;
  read: boolean;
  tone: MentorNotificationTone;
}

const TONE_BY_KIND: Record<MentorNotificationKind, MentorNotificationTone> = {
  lesson_completed: 'neutral',
  assignment_submitted: 'success',
  assignment_graded: 'success',
  progress_updated: 'neutral',
  check_in_completed: 'neutral',
  check_in_sent: 'neutral',
};

export function toneForKind(kind: MentorNotificationKind): MentorNotificationTone {
  return TONE_BY_KIND[kind] ?? 'neutral';
}

/** "10mins ago" / "2hrs ago" / "3days ago", matching the notifications design. */
export function formatRelativeTime(iso: string, now: Date = new Date()): string {
  const then = new Date(iso);
  if (Number.isNaN(then.getTime())) return '';

  const seconds = Math.max(0, Math.floor((now.getTime() - then.getTime()) / 1000));
  if (seconds < 60) return 'Just now';

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}min${minutes === 1 ? '' : 's'} ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}hr${hours === 1 ? '' : 's'} ago`;

  const days = Math.floor(hours / 24);
  return `${days}day${days === 1 ? '' : 's'} ago`;
}
