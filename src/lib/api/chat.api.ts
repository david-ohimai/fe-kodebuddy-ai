import { ApiError, apiFetch } from './client';
import { LEARNER_INITIATED_ESCALATION_REASON } from '@/types/chat.types';
import type {
  AskKodeBuddyRequest,
  ChatAnswer,
  ChatStreamHandlers,
  EscalateRequest,
  EscalateRequestDto,
  EscalationReceipt,
  EscalationResponseDto,
  EscalationStage,
  Escalation,
  EscalationDto,
  RespondToEscalationRequest,
} from '@/types/chat.types';

// ---------------------------------------------------------------------------
// LIVE — POST /agent/chat, POST /agent/escalate, GET /escalations/trainer,
// GET/PATCH /escalations/{id}. All confirmed real against the live
// /openapi.json (Sept 2026); none of this is mocked anymore.
//
// POST /agent/chat is a plain request/response, not SSE — there is no
// streaming endpoint on the backend. streamKodeBuddy below calls the real
// endpoint and then simulates token-by-token delivery from the complete
// answer, so the panel's existing streaming UI keeps working without the
// backend actually streaming anything.
// ---------------------------------------------------------------------------

interface AgentTurnResponseDto {
  answer: string;
  query_type: string;
  escalated: boolean;
  escalation_id: number | null;
  escalation_available?: boolean;
  escalation_reason?: string | null;
  escalation_detail?: string | null;
  draft_response?: string | null;
  confidence_score: number;
}

function toMessageRequest(request: AskKodeBuddyRequest) {
  return {
    // Omitted when an assignment is in context — the server derives the
    // course from the assignment (the entitlement-checked path).
    course_id: request.assignmentId
      ? undefined
      : (request.courseId ?? undefined),
    module_id: request.moduleId ?? undefined,
    assignment_id: request.assignmentId ?? undefined,
    question: request.question,
  };
}

let localMessageId = -1;

function mapAgentTurn(dto: AgentTurnResponseDto): ChatAnswer {
  return {
    // AgentTurnResponse carries no persisted turn id — it's written to
    // conversation_history server-side but not returned here. Negative,
    // decrementing ids keep these unique and visually distinct from any
    // real id encountered elsewhere (all real ids are positive).
    messageId: localMessageId--,
    answer: dto.answer,
    resources: [],
    offersEscalation: dto.escalation_available ?? false,
    escalated: dto.escalated,
    escalationId: dto.escalation_id,
    createdAt: new Date().toISOString(),
    escalationReason: dto.escalation_reason ?? null,
    escalationDetail: dto.escalation_detail ?? null,
    draftResponse: dto.draft_response ?? null,
    confidenceScore: dto.confidence_score,
  };
}

export async function askKodeBuddy(
  request: AskKodeBuddyRequest,
): Promise<ChatAnswer> {
  const dto = await apiFetch<AgentTurnResponseDto>('/agent/chat', {
    method: 'POST',
    auth: true,
    body: toMessageRequest(request),
  });
  return mapAgentTurn(dto);
}

/**
 * Simulated streaming: waits for the real (non-streaming) answer, then
 * replays it to `handlers.onToken` in small chunks so the panel's existing
 * incremental-render UI has something to animate. `onStage` fires once
 * ('answering') immediately before playback starts — there's no real
 * pipeline visibility to report finer stages than that.
 */
export async function streamKodeBuddy(
  request: AskKodeBuddyRequest,
  handlers: ChatStreamHandlers = {},
  signal?: AbortSignal,
): Promise<ChatAnswer> {
  handlers.onStage?.('retrieving');
  const answer = await askKodeBuddy(request);
  if (signal?.aborted) return answer;

  handlers.onStage?.('answering');
  const words = answer.answer.split(/(\s+)/);
  for (const word of words) {
    if (signal?.aborted) break;
    handlers.onToken?.(word);
    await new Promise((resolve) => setTimeout(resolve, 18));
  }

  return answer;
}

/**
 * Hands the question to a trainer. `module_id`/`assignment_id`/
 * `draft_response`/`confidence_score` should be round-tripped from the
 * chat turn that offered escalation (AgentTurnResponse's own fields —
 * see mapAgentTurn above) rather than re-typed by the learner.
 */
export async function escalateToTrainer(
  request: EscalateRequest,
): Promise<EscalationReceipt> {
  const body: EscalateRequestDto = {
    course_id: request.courseId,
    module_id: request.moduleId ?? null,
    assignment_id: request.assignmentId ?? null,
    question: request.question,
    reason: request.reason || LEARNER_INITIATED_ESCALATION_REASON,
    detail: request.detail ?? null,
    draft_response: request.draftResponse ?? null,
    confidence_score: request.confidenceScore ?? null,
  };

  const dto = await apiFetch<EscalationResponseDto>('/agent/escalate', {
    method: 'POST',
    auth: true,
    body,
  });

  return {
    escalationId: dto.id,
    trainerId: dto.trainer_id,
    stage: mapStage(dto.status),
    createdAt: dto.created_at,
  };
}

/**
 * Always false now — nothing in this module is mocked. Kept so the panel's
 * existing "demo mode" banner conditional doesn't need touching; it simply
 * never renders.
 */
export function isChatMocked(): boolean {
  return false;
}

// ---------------------------------------------------------------------------
// Mappers
// ---------------------------------------------------------------------------

/** `escalations.status` is a free-form string on the backend. */
function mapStage(status: string): EscalationStage {
  const normalised = status.toLowerCase();
  if (normalised === 'ready' || normalised === 'resolved') return 'ready';
  if (normalised === 'reviewing' || normalised === 'in_progress') {
    return 'reviewing';
  }
  return 'sent';
}

function mapEscalation(dto: EscalationDto): Escalation {
  return {
    id: dto.id,
    learnerId: dto.learner_id,
    learnerName: null, // resolved by the caller — see chat.types.ts
    question: dto.question,
    reason: dto.reason,
    detail: dto.detail,
    draftResponse: dto.draft_response,
    confidenceScore: dto.confidence_score,
    courseId: dto.course_id,
    moduleId: dto.module_id,
    assignmentId: dto.assignment_id,
    trainerId: dto.trainer_id,
    status: dto.status.toLowerCase() === 'resolved' ? 'resolved' : 'open',
    createdAt: dto.created_at,
    response: null,
    respondedAt: null,
  };
}

// ---------------------------------------------------------------------------
// Trainer escalation inbox
// ---------------------------------------------------------------------------

/** GET /escalations/trainer — escalations assigned to the signed-in trainer. */
export async function listTrainerEscalations(): Promise<Escalation[]> {
  const dtos = await apiFetch<EscalationDto[]>('/escalations/trainer', {
    method: 'GET',
    auth: true,
  });
  return (dtos ?? []).map(mapEscalation);
}

export async function getEscalation(id: number): Promise<Escalation | null> {
  try {
    const dto = await apiFetch<EscalationDto>(`/escalations/${id}`, {
      method: 'GET',
      auth: true,
    });
    return mapEscalation(dto);
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) return null;
    throw err;
  }
}

/**
 * PATCH /escalations/{id} — the trainer's reply. `status` rides along with
 * the response because the backend treats them as one update.
 */
export async function respondToEscalation(
  request: RespondToEscalationRequest,
): Promise<void> {
  await apiFetch<unknown>(`/escalations/${request.escalationId}`, {
    method: 'PATCH',
    auth: true,
    body: { response: request.message, status: 'resolved' },
  });
}
