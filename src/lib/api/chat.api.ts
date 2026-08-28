import { apiFetch } from './client';
import type {
  AskKodeBuddyRequest,
  AskKodeBuddyRequestDto,
  ChatAnswer,
  ChatAnswerDto,
  EscalateRequest,
  EscalationReceipt,
  EscalationReceiptDto,
  EscalationStage,
} from '@/types/chat.types';

// ---------------------------------------------------------------------------
// Transport switch
// ---------------------------------------------------------------------------

/**
 * The `/chat` endpoints DO NOT EXIST on the backend yet — the agent graph is
 * built in `app/agent/` but no router is mounted in `main.py`. Until the AI
 * team ships that layer, this module answers from a local mock.
 *
 * Everything below the switch is written against the contract in
 * docs/chat-api-contract.md, so going live is a one-line change here plus
 * setting NEXT_PUBLIC_CHAT_API=live — no component touches the transport.
 */
// Named `isLiveChat`, not `useLiveChat` — a `use` prefix on a plain module
// function makes the react-hooks lint rule treat it as a hook.
function isLiveChat(): boolean {
  return process.env.NEXT_PUBLIC_CHAT_API === 'live';
}

// ---------------------------------------------------------------------------
// Mock
// ---------------------------------------------------------------------------

let mockMessageId = 1000;

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Canned answers keyed by intent. Deliberately shaped like the real agent's
 * output: it opens by normalising the learner's uncertainty, breaks the task
 * down, and ends by offering a choice rather than dumping a solution — the
 * "guide, don't solve" posture the assignment_guidance prompt enforces.
 */
function mockAnswer(request: AskKodeBuddyRequest): string {
  const q = request.question.toLowerCase();

  if (q.includes('explain') && q.includes('auto-layout')) {
    return (
      "Auto-layout is Figma's way of letting a frame lay its own children out, " +
      'instead of you placing each one by hand.\n\n' +
      'You give the frame three things — a direction (horizontal or vertical), ' +
      'a gap between children, and padding around them. From then on the frame ' +
      'positions everything itself. Add a child and the others move aside; make ' +
      'a label longer and the frame grows to fit.\n\n' +
      "That's the whole idea: you describe the *rules* of the layout once, " +
      'rather than the *result* every time the content changes.\n\n' +
      'Want to try it on a simple two-button row before tackling the card?'
    );
  }

  if (q.includes('part a') || q.includes('card')) {
    return (
      "Part A is the card, and the trick is to build it boringly first.\n\n" +
      'Drop in the four elements stacked in the order you want them — image, ' +
      'title, description, button. Ignore spacing entirely at this stage; just ' +
      'get them on the canvas in the right order.\n\n' +
      'Then select all four and apply vertical Auto-layout. Everything will snap ' +
      'into a column and probably look wrong — that\'s expected. Now set the gap ' +
      'and the padding, and it will start looking like the design.\n\n' +
      'The reason for that order: if you space things manually first, you fight ' +
      'Auto-layout when you apply it.\n\n' +
      'Try getting the four elements stacked, and tell me what happens when you ' +
      'apply Auto-layout?'
    );
  }

  return (
    "No worries, that's a totally normal place to start from. Let's break it " +
    'down together.\n\n' +
    'This assignment has two main parts — a card component and a navigation ' +
    'bar — both built using Auto-layout. Before touching Figma, it helps to ' +
    "know why Auto-layout matters here: it's what makes your components resize " +
    'properly instead of breaking when content changes.\n\n' +
    'A good first step: open Figma and just build a basic card with an image, ' +
    "title, description, and button — don't worry about Auto-layout yet. Once " +
    "that's laid out, we can add Auto-layout together and I'll walk you through " +
    'what each setting does.\n\n' +
    'Want to start there, or would it help if I first explained what ' +
    'Auto-layout actually does before you touch anything?'
  );
}

/**
 * A learner saying they still don't understand is the signal the real graph
 * uses to lower its confidence — so the mock mirrors it: that phrasing gets an
 * analogy, curriculum links, and an offer to hand off, rather than another
 * explanation.
 */
function isStillStuck(question: string): boolean {
  const q = question.toLowerCase();
  return (
    q.includes("don't get") ||
    q.includes('dont get') ||
    q.includes('still not') ||
    q.includes("don't understand") ||
    q.includes('confused')
  );
}

function stuckAnswer(): string {
  return (
    "Okay, let's think of it like this.\n\n" +
    'Think of Auto-layout like a suitcase that repacks itself — add one more ' +
    'shirt, and everything shifts to make room automatically. No manual ' +
    'dragging.\n\n' +
    'Three things matter: direction (vertical/horizontal), spacing, and ' +
    'padding.\n' +
    'Try it on one shape first, then resize it — watching it move is what ' +
    'makes it click.'
  );
}

async function askMock(request: AskKodeBuddyRequest): Promise<ChatAnswer> {
  // Long enough that the "Thinking..." state is visible in the demo.
  await delay(1400);

  const stuck = isStillStuck(request.question);

  return {
    messageId: (mockMessageId += 1),
    answer: stuck ? stuckAnswer() : mockAnswer(request),
    resources: stuck
      ? [
          { label: 'Module 2 live session recording', url: '/resources' },
          {
            label: "Figma's official auto layout guide",
            url: 'https://help.figma.com/hc/en-us/articles/360040451373',
          },
        ]
      : [],
    offersEscalation: stuck,
    escalated: false,
    escalationId: null,
    createdAt: new Date().toISOString(),
  };
}

async function escalateMock(): Promise<EscalationReceipt> {
  await delay(800);
  return {
    escalationId: (mockMessageId += 1),
    trainerId: null,
    stage: 'sent',
    createdAt: new Date().toISOString(),
  };
}

// ---------------------------------------------------------------------------
// Mappers
// ---------------------------------------------------------------------------

function toAskDto(request: AskKodeBuddyRequest): AskKodeBuddyRequestDto {
  return {
    question: request.question,
    // Omitted when an assignment is in context — the server derives the course
    // from the assignment, which is the entitlement-checked path.
    course_id: request.assignmentId ? null : (request.courseId ?? null),
    module_id: request.moduleId ?? null,
    assignment_id: request.assignmentId ?? null,
    query_type: request.queryType,
  };
}

function mapAnswer(dto: ChatAnswerDto): ChatAnswer {
  return {
    messageId: dto.message_id,
    answer: dto.answer,
    resources: dto.resources ?? [],
    offersEscalation: dto.offers_escalation ?? false,
    escalated: dto.escalated,
    escalationId: dto.escalation_id,
    createdAt: dto.created_at,
  };
}

/**
 * `escalations.status` is a free-form string on the backend; anything the UI
 * does not recognise is treated as freshly sent rather than dropped.
 */
function mapStage(status: string): EscalationStage {
  const normalised = status.toLowerCase();
  if (normalised === 'ready' || normalised === 'resolved') return 'ready';
  if (normalised === 'reviewing' || normalised === 'in_progress') {
    return 'reviewing';
  }
  return 'sent';
}

function mapReceipt(dto: EscalationReceiptDto): EscalationReceipt {
  return {
    escalationId: dto.escalation_id,
    trainerId: dto.trainer_id,
    stage: mapStage(dto.status),
    createdAt: dto.created_at,
  };
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export async function askKodeBuddy(
  request: AskKodeBuddyRequest,
): Promise<ChatAnswer> {
  if (!isLiveChat()) return askMock(request);

  const dto = await apiFetch<ChatAnswerDto>('/chat', {
    method: 'POST',
    auth: true,
    body: toAskDto(request),
  });
  return mapAnswer(dto);
}

export async function escalateToTrainer(
  request: EscalateRequest,
): Promise<EscalationReceipt> {
  if (!isLiveChat()) return escalateMock();

  const dto = await apiFetch<EscalationReceiptDto>('/chat/escalate', {
    method: 'POST',
    auth: true,
    body: {
      question: request.question,
      course_id: request.assignmentId ? null : (request.courseId ?? null),
      module_id: request.moduleId ?? null,
      assignment_id: request.assignmentId ?? null,
    },
  });
  return mapReceipt(dto);
}

/** True when answers are canned — the UI surfaces this so nobody is misled. */
export function isChatMocked(): boolean {
  return !isLiveChat();
}
