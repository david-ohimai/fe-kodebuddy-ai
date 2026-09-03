export type NotificationKind =
  | 'escalation_reply'
  | 'assignment_deadline'
  | 'general';

export interface AppNotification {
  id: string;
  kind: NotificationKind;
  /** Bold headline, e.g. "Your trainer responded to your escalation". */
  title: string;
  /** The thing it concerns, e.g. the assignment title. */
  subject: string;
  createdAt: string;
  read: boolean;
  /** What the notification refers to, e.g. "escalation". Null for general ones. */
  relatedEntityType?: string | null;
  relatedEntityId?: number | null;
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
