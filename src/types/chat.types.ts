// Wire types for the KodeBuddy AI chat panel.
//
// LIVE — POST /agent/chat, POST /agent/escalate, GET /agent/history, all
// confirmed real and richly documented in the live /openapi.json (as of
// Sept 2026). Field shapes below are mapped from AgentTurnResponse
// directly (see mapAnswer in lib/api/chat.api.ts), not invented.
//
// Two real mismatches from the shape this file originally guessed at,
// worth knowing if this ever needs revisiting:
//  - There's no streaming endpoint. POST /agent/chat is a plain
//    request/response, not SSE. streamKodeBuddy (chat.api.ts) calls the
//    real endpoint and then simulates token-by-token delivery from the
//    complete answer, so the panel's existing streaming UI keeps working
//    without the backend actually streaming anything.
//  - AgentTurnResponse has no message_id, no resources, and no
//    created_at. Those are synthesized client-side in mapAnswer
//    (resources always empty, id/timestamp generated) rather than read
//    from the response.

// ---------------------------------------------------------------------------
// Shared enums
// ---------------------------------------------------------------------------

/**
 * Mirrors QueryType in app/agent/graph/state.py. Selects which prompt and
 * retrieval path the graph uses — `assignment_guidance` additionally loads the
 * assignment brief and applies the "guide, don't solve" policy check.
 */
export type ChatQueryType = 'chat' | 'assignment_guidance';

export type ChatRole = 'user' | 'assistant';

// ---------------------------------------------------------------------------
// POST /chat — ask a question
// ---------------------------------------------------------------------------

export interface AskKodeBuddyRequestDto {
  question: string;
  /**
   * Omit when `assignment_id` is set — the server derives the course from the
   * assignment (entitlement-checked) and ignores any client value. Required
   * otherwise; the server validates enrolment before use.
   */
  course_id?: number | null;
  module_id?: number | null;
  assignment_id?: number | null;
  query_type: ChatQueryType;
}

export interface AskKodeBuddyRequest {
  question: string;
  courseId?: number | null;
  moduleId?: number | null;
  assignmentId?: number | null;
  queryType: ChatQueryType;
}

/**
 * A curriculum link surfaced alongside an answer.
 *
 * PROPOSED — the agent's `search_curriculum` tool already returns scored
 * chunks carrying their source lesson/resource, so the service layer can
 * project the top hits into this without new retrieval work. Not in the
 * backend response today.
 */
export interface ChatResourceDto {
  label: string;
  url: string;
}

export interface ChatResource {
  label: string;
  url: string;
}

export interface ChatAnswerDto {
  /** id of the persisted assistant turn in conversation_history. */
  message_id: number;
  /** AgentState.final_response — already learner-safe prose in every branch. */
  answer: string;
  /** Curriculum links backing the answer. Empty when retrieval returned nothing. */
  resources?: ChatResourceDto[];
  /**
   * True when the agent's confidence was low enough to invite a handoff without
   * forcing one. Distinct from `escalated`: this offers the learner the choice,
   * whereas `escalated` means the graph already routed it to a trainer.
   */
  offers_escalation?: boolean;
  /**
   * True when the graph handed the question to a trainer. `answer` still
   * carries displayable copy in this case (the graph's own fallback message),
   * so the panel renders it normally and adds an "escalated" affordance.
   */
  escalated: boolean;
  escalation_id: number | null;
  created_at: string;
  /** Structured category for the low-confidence handoff, e.g. "low_retrieval_confidence" — pass straight through as `reason` on POST /agent/escalate. */
  escalation_reason?: string | null;
  /** The graph's own human-readable note on why it wasn't confident. Pass through as `detail`. */
  escalation_detail?: string | null;
  /** The agent's best-effort answer, distinct from `answer` — safe to forward as `draft_response`. */
  draft_response?: string | null;
  confidence_score?: number | null;
}

export interface ChatAnswer {
  messageId: number;
  answer: string;
  resources: ChatResource[];
  offersEscalation: boolean;
  escalated: boolean;
  escalationId: number | null;
  createdAt: string;
  escalationReason?: string | null;
  escalationDetail?: string | null;
  draftResponse?: string | null;
  confidenceScore?: number | null;
}

// ---------------------------------------------------------------------------
// POST /chat/stream — server-sent events
// ---------------------------------------------------------------------------

/**
 * Lifecycle stages the server reports while the graph runs, mirroring the node
 * names in build.py so a trace and the UI tell the same story.
 *
 * `answering` is only reached once `route` has approved a response. Tokens are
 * NEVER emitted from the `reason` node directly — see the streaming section of
 * docs/chat-api-contract.md for why that ordering is load-bearing.
 */
export type ChatStreamStage =
  'retrieving' | 'reasoning' | 'checking' | 'answering';

export type ChatStreamEvent =
  | { type: 'stage'; stage: ChatStreamStage }
  /** An incremental slice of the approved answer. Append, never replace. */
  | { type: 'token'; text: string }
  /** Terminal success. Carries the metadata a token cannot. */
  | { type: 'done'; answer: ChatAnswer }
  | { type: 'error'; message: string };

export interface ChatStreamHandlers {
  onStage?: (stage: ChatStreamStage) => void;
  onToken?: (text: string) => void;
}

// ---------------------------------------------------------------------------
// GET /chat/history — replay the panel on mount
// ---------------------------------------------------------------------------

export interface ChatTurnDto {
  id: number;
  role: ChatRole;
  message: string;
  timestamp: string;
}

export interface ChatTurn {
  id: number;
  role: ChatRole;
  message: string;
  timestamp: string;
}

export interface ChatHistoryQuery {
  courseId: number;
  /** Server caps this; the client asks for a window, not the whole log. */
  limit?: number;
}

// ---------------------------------------------------------------------------
// POST /chat/escalate — the "ASK A TRAINER" button
// ---------------------------------------------------------------------------

/**
 * Deliberately NOT the same call as `/chat`. This is an explicit, learner-
 * initiated handoff that bypasses the graph entirely: no retrieval, no LLM
 * call, no confidence gate. It writes an escalation with reason
 * `explicit_user_request` — the value already reserved (and documented as "not
 * yet triggered anywhere in this graph") in EscalationReason.
 */
/** Body of POST /agent/escalate — mirrors EscalationCreate on the backend. */
export interface EscalateRequestDto {
  course_id: number;
  module_id?: number | null;
  assignment_id?: number | null;
  question: string;
  reason: string;
  detail?: string | null;
  draft_response?: string | null;
  confidence_score?: number | null;
}

export interface EscalateRequest {
  /** Required by the API — an escalation is always scoped to a course. */
  courseId: number;
  moduleId?: number | null;
  assignmentId?: number | null;
  question: string;
  /**
   * Why the handoff is happening. Round-tripped from the chat turn's
   * `escalationReason` when the agent offered the handoff itself; otherwise
   * the learner asked for it outright.
   */
  reason?: string | null;
  detail?: string | null;
  /** The answer the agent had drafted, carried over so the trainer sees it. */
  draftResponse?: string | null;
  confidenceScore?: number | null;
}

/**
 * Sent when the learner presses "Ask a Trainer" without the agent having
 * offered. The backend's EscalationReason enum has no learner-initiated
 * member, and `reason` is a plain string on EscalationCreate, so this is
 * accepted — but it will not aggregate alongside the enum values in the
 * team's escalation analytics.
 */
export const LEARNER_INITIATED_ESCALATION_REASON = 'explicit_user_request';

/** The row POST /agent/escalate returns — EscalationResponse on the backend. */
export interface EscalationResponseDto {
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
  status: string;
  created_at: string;
  updated_at: string;
}

/**
 * The three stages shown in the panel's progress tracker after a handoff.
 * `escalations.status` on the backend is a free-form string today; these are
 * the values the UI renders, and the contract should pin them to an enum.
 */
export type EscalationStage = 'sent' | 'reviewing' | 'ready';

export const ESCALATION_STAGES: ReadonlyArray<{
  id: EscalationStage;
  label: string;
}> = [
  { id: 'sent', label: 'Sent' },
  { id: 'reviewing', label: 'Reviewing' },
  { id: 'ready', label: 'Ready' },
];

export interface EscalationReceiptDto {
  escalation_id: number;
  /** Null when no trainer could be resolved — see the open question in the doc. */
  trainer_id: number | null;
  status: string;
  created_at: string;
}

export interface EscalationReceipt {
  escalationId: number;
  trainerId: number | null;
  stage: EscalationStage;
  createdAt: string;
}

// ---------------------------------------------------------------------------
// Client-only view state
// ---------------------------------------------------------------------------

/**
 * What the panel actually renders. Not a wire type — `pending` and `failed`
 * turns exist only in the browser, and `escalated` is folded in from the
 * response so a replayed history turn and a live one render identically.
 *
 * NOTE: history replayed from the server cannot reproduce `escalated`, because
 * conversation_history has no such column. Replayed assistant turns will render
 * without the escalation affordance. Accepted for v1 — flagged in the doc.
 */
export interface ChatMessage {
  /** Server id once persisted; a client-generated string while in flight. */
  id: number | string;
  role: ChatRole;
  content: string;
  timestamp: string;
  status: 'pending' | 'sent' | 'failed';
  resources?: ChatResource[];
  offersEscalation?: boolean;
  escalated?: boolean;
  escalationId?: number | null;

  /**
   * Carried from the agent turn so that pressing "Ask a Trainer" can hand the
   * trainer the agent's own reasoning rather than just the question. Absent on
   * turns where the agent answered confidently.
   */
  escalationReason?: string | null;
  escalationDetail?: string | null;
  confidenceScore?: number | null;
}

/**
 * The context chip in the panel header ("MODULE 2"). Drives which ids get sent
 * and which `queryType` is selected: an assignmentId present means
 * `assignment_guidance`, otherwise `chat`.
 */
export interface ChatContext {
  courseId: number;
  moduleId?: number | null;
  assignmentId?: number | null;
  label: string;
}

// ---------------------------------------------------------------------------
// Trainer-facing escalation inbox — GET /escalations/trainer, GET/PATCH
// /escalations/{id}
// ---------------------------------------------------------------------------
//
// LIVE — confirmed real against the live /openapi.json. Both endpoints are
// unconditionally live in lib/api/chat.api.ts now (no mock fallback,
// no env-var gate); the trainer Escalations page (lib/trainer/useEscalations.ts)
// consumes them directly.

export interface EscalationDto {
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
  /** The trainer's written reply, and when it was written. */
  response: string | null;
  responded_at: string | null;
  /** Free-form on the server (no fixed enum) — see mapStage. */
  status: string;
  created_at: string;
  updated_at: string;
}

export interface Escalation {
  id: number;
  learnerId: number;
  /**
   * Not on EscalationResponse — the real schema only has learner_id, no
   * name/email. Resolved client-side by joining against
   * profileApi.listUsers() (lib/trainer/useEscalations.ts,
   * useEscalationDetail.ts), same pattern used for submissions/cohort
   * rosters elsewhere. Null while that join hasn't resolved yet.
   */
  learnerName: string | null;
  question: string;
  reason: string;
  detail: string | null;
  draftResponse: string | null;
  confidenceScore: number | null;
  courseId: number;
  moduleId: number | null;
  assignmentId: number | null;
  trainerId: number | null;
  status: 'open' | 'resolved';
  createdAt: string;
  /**
   * The trainer's written reply. EscalationUpdate accepts one on write
   * (PATCH body), but EscalationResponse — the read shape — has no field
   * to read it back. Set optimistically client-side right after a
   * successful send (useEscalationDetail.sendResponse) so the trainer sees
   * their own reply immediately; will read back null after a fresh
   * page load/re-fetch, since the server doesn't echo it. A real gap in
   * the backend's response schema, not something fixable from here.
   */
  response: string | null;
  respondedAt: string | null;
}

export interface RespondToEscalationRequest {
  escalationId: number;
  message: string;
}
