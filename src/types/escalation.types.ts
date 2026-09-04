/**
 * Where a learner's request for a trainer has got to.
 *
 * `status` is a free-form string on the backend (it defaults to "open" and the
 * trainer PATCH accepts anything), so this is the set the UI knows how to
 * render, not a mirror of a server enum. Anything unrecognised maps to
 * `pending` and keeps its original text as the pill label — a new server-side
 * status shows up honestly rather than silently reading as "Pending".
 */
export type EscalationStatus = 'pending' | 'sent' | 'resolved';

export interface Escalation {
  id: string;
  /** Null until the escalation is tied to a module. */
  moduleOrder: number | null;
  courseId: number;
  assignmentId: number | null;
  /** What the learner asked. */
  message: string;
  status: EscalationStatus;
  /** The server's own status string, shown when it is not one we recognise. */
  rawStatus: string;
  /** The trainer's reply, once they have written one. */
  response: string | null;
  respondedAt: string | null;
  createdAt: string;
}

export const ESCALATION_STATUS_LABEL: Record<EscalationStatus, string> = {
  pending: 'Pending',
  sent: 'Sent',
  resolved: 'Resolved',
};

export const ESCALATION_STATUS_CLASS: Record<EscalationStatus, string> = {
  pending: 'bg-warning-light text-warning-dark',
  sent: 'bg-primary-light text-primary',
  resolved: 'bg-secondary-light text-secondary-dark',
};

/**
 * Server status string to the state the pill renders.
 *
 * Deliberately generous about synonyms, because the values are not pinned to
 * an enum on the backend yet. `open` is the model's default.
 */
export function mapEscalationStatus(raw: string): EscalationStatus {
  switch (raw.trim().toLowerCase()) {
    case 'resolved':
    case 'closed':
    case 'answered':
      return 'resolved';
    case 'sent':
    case 'assigned':
    case 'in_progress':
    case 'in-progress':
      return 'sent';
    case 'open':
    case 'pending':
    case 'new':
      return 'pending';
    default:
      return 'pending';
  }
}

/** True for a status string the UI has no mapping for. */
export function isUnknownEscalationStatus(raw: string): boolean {
  const known = [
    'resolved',
    'closed',
    'answered',
    'sent',
    'assigned',
    'in_progress',
    'in-progress',
    'open',
    'pending',
    'new',
  ];
  return !known.includes(raw.trim().toLowerCase());
}

/**
 * What the pill reads. A recognised status uses the design's wording; an
 * unrecognised one shows the server's own value rather than a wrong label.
 */
export function escalationStatusLabel(escalation: Escalation): string {
  if (isUnknownEscalationStatus(escalation.rawStatus)) {
    return escalation.rawStatus;
  }
  return ESCALATION_STATUS_LABEL[escalation.status];
}
