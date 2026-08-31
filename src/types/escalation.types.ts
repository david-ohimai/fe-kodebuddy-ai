/**
 * Where a learner's request for a trainer has got to.
 *
 * `sent` means it has reached a trainer; `resolved` means one has replied.
 * The design shows the third card's pill in green — read here as resolved,
 * since a second identical "Sent" in a different colour would be unreadable.
 */
export type EscalationStatus = 'pending' | 'sent' | 'resolved';

export interface Escalation {
  id: string;
  moduleOrder: number;
  /** The assignment the learner was working on when they asked. */
  assignmentTitle: string;
  /** What the learner told their trainer. */
  message: string;
  status: EscalationStatus;
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
