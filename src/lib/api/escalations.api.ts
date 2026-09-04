import { ApiError, apiFetch } from './client';
import { mapEscalationStatus, type Escalation } from '@/types/escalation.types';

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
    // EscalationResponse has no field for the trainer's reply — it can be
    // written via PATCH (EscalationUpdate.response) but isn't echoed back
    // on read. Always null here; a real gap in the backend's response
    // schema, not something this mapping can work around.
    response: null,
    respondedAt: null,
    createdAt: dto.created_at,
  };
}

/**
 * There is no GET /escalations/learner (or any other way to list a
 * learner's own escalations) anywhere in the live API — confirmed
 * directly against /openapi.json, not inferred. The only learner-facing
 * escalation read is GET /escalations/{id} (getMyEscalation below), for
 * one specific id already known to the caller (e.g. just returned from
 * POST /agent/escalate). This used to call a guessed `/escalations/learner`
 * endpoint that doesn't exist and would 404 in production; resolving to
 * empty immediately instead of attempting that call.
 */
export async function listMyEscalations(): Promise<Escalation[]> {
  return [];
}

/** True while there's no way to list a learner's own escalations — see listMyEscalations. */
export function isEscalationListUnavailable(): boolean {
  return true;
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
