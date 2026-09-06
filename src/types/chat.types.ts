export type ChatQueryType = 'chat' | 'assignment_guidance';

export type ChatRole = 'user' | 'assistant';

export interface AskKodeBuddyRequestDto {
  question: string;
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

export interface ChatResourceDto {
  label: string;
  url: string;
}

export interface ChatResource {
  label: string;
  url: string;
}

export interface ChatAnswerDto {
  message_id: number;
  answer: string;
  resources?: ChatResourceDto[];
  offers_escalation?: boolean;
  escalated: boolean;
  escalation_id: number | null;
  created_at: string;
  escalation_reason?: string | null;
  escalation_detail?: string | null;
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

export type ChatStreamStage =
  'retrieving' | 'reasoning' | 'checking' | 'answering';

export type ChatStreamEvent =
  | { type: 'stage'; stage: ChatStreamStage }
  | { type: 'token'; text: string }
  | { type: 'done'; answer: ChatAnswer }
  | { type: 'error'; message: string };

export interface ChatStreamHandlers {
  onStage?: (stage: ChatStreamStage) => void;
  onToken?: (text: string) => void;
}

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
  limit?: number;
}

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
  courseId: number;
  moduleId?: number | null;
  assignmentId?: number | null;
  question: string;
  reason?: string | null;
  detail?: string | null;
  draftResponse?: string | null;
  confidenceScore?: number | null;
}

export const LEARNER_INITIATED_ESCALATION_REASON = 'explicit_user_request';

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

export interface ChatMessage {
  id: number | string;
  role: ChatRole;
  content: string;
  timestamp: string;
  status: 'pending' | 'sent' | 'failed';
  resources?: ChatResource[];
  offersEscalation?: boolean;
  escalated?: boolean;
  escalationId?: number | null;

  escalationReason?: string | null;
  escalationDetail?: string | null;
  confidenceScore?: number | null;
}

export interface ChatContext {
  courseId: number;
  moduleId?: number | null;
  assignmentId?: number | null;
  label: string;
}

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
  response: string | null;
  responded_at: string | null;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface Escalation {
  id: number;
  learnerId: number;
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
  response: string | null;
  respondedAt: string | null;
}

export interface RespondToEscalationRequest {
  escalationId: number;
  message: string;
}
