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
    course_id: request.courseId ?? undefined,
    module_id: request.moduleId ?? undefined,
    assignment_id: request.assignmentId ?? undefined,
    question: request.question,
  };
}

let localMessageId = -1;

function mapAgentTurn(dto: AgentTurnResponseDto): ChatAnswer {
  return {
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
  try {
    const dto = await apiFetch<AgentTurnResponseDto>('/agent/chat', {
      method: 'POST',
      auth: true,
      body: toMessageRequest(request),
    });
    return mapAgentTurn(dto);
  } catch (err) {
    if (!request.assignmentId) throw err;
    console.warn(
      '[chat] assignment-guidance request failed, retrying as a plain course question:',
      err,
    );
    const dto = await apiFetch<AgentTurnResponseDto>('/agent/chat', {
      method: 'POST',
      auth: true,
      body: toMessageRequest({ ...request, assignmentId: null }),
    });
    return mapAgentTurn(dto);
  }
}

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

export function isChatMocked(): boolean {
  return false;
}

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
    learnerName: dto.learner_full_name || dto.learner_email || null,
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
    response: dto.response,
    respondedAt: dto.responded_at,
  };
}

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

export async function respondToEscalation(
  request: RespondToEscalationRequest,
): Promise<void> {
  await apiFetch<unknown>(`/escalations/${request.escalationId}`, {
    method: 'PATCH',
    auth: true,
    body: { response: request.message, status: 'resolved' },
  });
}
