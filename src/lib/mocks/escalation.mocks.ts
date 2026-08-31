// Demo fixtures for the Escalations tab.
//
// The backend records escalations the agent raises but exposes no endpoint to
// read them, and there is no learner-initiated escalate endpoint either, so
// this screen has no live source yet. Swap this for the API once one exists —
// nothing outside `listEscalations` depends on it being mock data.

import type { Escalation } from '@/types/escalation.types';

const MESSAGE =
  "I have been trying to understand this auto layout, but it seems like I can't seem to get the idea of fill and hug content";

export const DEMO_ESCALATIONS: Escalation[] = [
  {
    id: 'esc-1',
    moduleOrder: 1,
    assignmentTitle: 'Layout and Auto Layout',
    message: MESSAGE,
    status: 'pending',
    createdAt: '2026-02-01T09:12:00Z',
  },
  {
    id: 'esc-2',
    moduleOrder: 1,
    assignmentTitle: 'Layout and Auto Layout',
    message: MESSAGE,
    status: 'sent',
    createdAt: '2026-01-29T14:03:00Z',
  },
  {
    id: 'esc-3',
    moduleOrder: 1,
    assignmentTitle: 'Layout and Auto Layout',
    message: MESSAGE,
    status: 'resolved',
    createdAt: '2026-01-26T11:47:00Z',
  },
];

/** Stands in for the endpoint this screen will eventually call. */
export async function listEscalations(): Promise<Escalation[]> {
  return DEMO_ESCALATIONS;
}
