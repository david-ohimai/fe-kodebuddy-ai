import { ApiError, apiFetch } from './client';
import {
  mapEscalationStatus,
  type Escalation,
} from '@/types/escalation.types';

/** Mirrors EscalationResponse on the backend. */
interface EscalationResponseDto {
  id: number;
  learner_id: number;
  course_id: number;
  module_id: number | null;
  assignment_id: number | null;
  trainer_id: number | null;
  question: string;
  reason: string;
  detail: string | null;
  draft_response: string | null;
  confidence_score: number | null;
  /** The trainer's reply. Null until one is written. */
  response: string | null;
  responded_at: string | null;
  /** Free-form on the server; see mapEscalationStatus. */
  status: string;
  created_at: string;
  updated_at: string;
}

function mapEscalation(dto: EscalationResponseDto): Escalation {
  return {
    id: String(dto.id),
    // The API carries module_id, not the module's display order. The card
    // falls back to the course when this is absent.
    moduleOrder: dto.module_id,
    courseId: dto.course_id,
    assignmentId: dto.assignment_id,
    message: dto.question,
    status: mapEscalationStatus(dto.status),
    rawStatus: dto.status,
    response: dto.response,
    respondedAt: dto.responded_at,
    createdAt: dto.created_at,
  };
}

export interface ListEscalationsOptions {
  /** Server-side filter on the raw status string. */
  status?: string;
  courseId?: number;
}

/**
 * The signed-in learner's own escalations.
 *
 * Scoped server-side to the caller — the service filters by learner_id and the
 * route rejects non-learners, so there is no way to read another learner's.
 */
export async function listMyEscalations(
  options: ListEscalationsOptions = {},
): Promise<Escalation[]> {
  const params = new URLSearchParams();
  if (options.status) params.set('status', options.status);
  if (options.courseId !== undefined) {
    params.set('course_id', String(options.courseId));
  }

  const query = params.toString();
  const dtos = await apiFetch<EscalationResponseDto[]>(
    `/escalations/learner${query ? `?${query}` : ''}`,
    { method: 'GET', auth: true },
  );

  return (dtos ?? []).map(mapEscalation);
}

/**
 * One escalation, including the trainer's reply.
 *
 * Returns null on 404 so a stale notification link renders "not found" rather
 * than throwing. A 403 still throws: that means the id belongs to someone
 * else, which is worth surfacing rather than hiding as an empty page.
 */
export async function getMyEscalation(
  escalationId: string,
): Promise<Escalation | null> {
  try {
    const dto = await apiFetch<EscalationResponseDto>(
      `/escalations/${escalationId}`,
      { method: 'GET', auth: true },
    );
    return mapEscalation(dto);
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) return null;
    throw err;
  }
}
