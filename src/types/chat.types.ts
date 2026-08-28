// Wire types for the KodeBuddy AI chat panel.
//
// PROPOSED CONTRACT — not yet implemented on the backend. The `/chat` feature
// module does not exist in kodebuddy-ai-be yet; see docs/chat-api-contract.md
// for the matching FastAPI schema and the open questions both teams need to
// close before this is frozen.
//
// Field shapes are derived from the agent's own AgentState (app/agent/graph/
// state.py) so the service layer is a straight mapping with no invention:
//   request  -> AgentState input fields
//   response -> AgentState route-node output fields

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
}

export interface ChatAnswer {
  messageId: number;
  answer: string;
  resources: ChatResource[];
  offersEscalation: boolean;
  escalated: boolean;
  escalationId: number | null;
  createdAt: string;
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
export interface EscalateRequestDto {
  question: string;
  course_id?: number | null;
  module_id?: number | null;
  assignment_id?: number | null;
}

export interface EscalateRequest {
  question: string;
  courseId?: number | null;
  moduleId?: number | null;
  assignmentId?: number | null;
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
