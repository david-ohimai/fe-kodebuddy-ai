import { ApiError, apiFetch, getAccessToken, getApiBaseUrl } from './client';
import { LEARNER_INITIATED_ESCALATION_REASON } from '@/types/chat.types';
import type {
  AskKodeBuddyRequest,
  AskKodeBuddyRequestDto,
  ChatAnswer,
  ChatAnswerDto,
  ChatStreamEvent,
  ChatStreamHandlers,
  ChatStreamStage,
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
      'Part A is the card, and the trick is to build it boringly first.\n\n' +
      'Drop in the four elements stacked in the order you want them — image, ' +
      'title, description, button. Ignore spacing entirely at this stage; just ' +
      'get them on the canvas in the right order.\n\n' +
      'Then select all four and apply vertical Auto-layout. Everything will snap ' +
      "into a column and probably look wrong — that's expected. Now set the gap " +
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

/** The answer itself, with no latency baked in, so both mocks can share it. */
function buildMockAnswer(request: AskKodeBuddyRequest): ChatAnswer {
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

async function askMock(request: AskKodeBuddyRequest): Promise<ChatAnswer> {
  // Long enough that the "Thinking..." state is visible in the demo.
  await delay(1400);
  return buildMockAnswer(request);
}

/**
 * Mock stream. Emits the same stage sequence the real graph would, then plays
 * the answer out in word-sized chunks.
 *
 * The pause before the first token is deliberate and not padding: it stands in
 * for retrieve -> reason -> confidence_gate, none of which can emit prose,
 * because the gate has to see the finished draft before any of it is shown.
 */
async function streamMock(
  request: AskKodeBuddyRequest,
  handlers: ChatStreamHandlers,
  signal?: AbortSignal,
): Promise<ChatAnswer> {
  const throwIfAborted = () => {
    if (signal?.aborted) throw new DOMException('Aborted', 'AbortError');
  };

  handlers.onStage?.('retrieving');
  await delay(450);
  throwIfAborted();

  handlers.onStage?.('reasoning');
  await delay(650);
  throwIfAborted();

  handlers.onStage?.('checking');
  await delay(300);
  throwIfAborted();

  const full = buildMockAnswer(request);

  handlers.onStage?.('answering');

  // Split so the whitespace rides along with each chunk, keeping paragraph
  // breaks intact as the text accumulates.
  const chunks = full.answer.match(/\S+\s*/g) ?? [full.answer];
  for (const chunk of chunks) {
    throwIfAborted();
    handlers.onToken?.(chunk);
    await delay(18);
  }

  return full;
}

// No escalateMock: POST /agent/escalate is live and writes a real row, so the
// handoff always goes to the server even while answers are still mocked.

/**
 * Fixture data for the trainer inbox mock — matches the Figma exactly so the
 * demo reads as real content rather than lorem ipsum. Mutated in place by
 * `respondToEscalationMock` so a response persists for the rest of the
 * session (not across reloads — there's nowhere real to write it yet).
 */
const mockEscalations: EscalationDto[] = [
  {
    id: 1,
    learner_id: 101,
    learner_name: 'Aisha Mohammed',
    question:
      "I'm stuck on the last part of the data analysis assignment and need help understanding it.",
    course_id: 1,
    module_id: 3,
    status: 'open',
    created_at: '2026-01-30T09:12:00Z',
    response: null,
    responded_at: null,
  },
  {
    id: 2,
    learner_id: 102,
    learner_name: 'John Daniel',
    question:
      "KodeBuddy provided an answer but I'm still not clear on how to approach this question.",
    course_id: 1,
    module_id: 2,
    status: 'open',
    created_at: '2026-01-30T11:40:00Z',
    response: null,
    responded_at: null,
  },
  {
    id: 3,
    learner_id: 103,
    learner_name: 'Sarah Okoro',
    question:
      'I need more guidance on how to calculate the metrics for this project.',
    course_id: 1,
    module_id: 3,
    status: 'open',
    created_at: '2026-01-31T08:05:00Z',
    response: null,
    responded_at: null,
  },
  {
    id: 4,
    learner_id: 104,
    learner_name: 'Emeka Tanaka',
    question:
      'I cannot understand the instructions for this task. Please assist.',
    course_id: 1,
    module_id: 1,
    status: 'open',
    created_at: '2026-01-31T14:22:00Z',
    response: null,
    responded_at: null,
  },
  {
    id: 5,
    learner_id: 105,
    learner_name: 'Michael Benson',
    question:
      "I'm experiencing an issue with the code in this lesson. Please help.",
    course_id: 1,
    module_id: 2,
    status: 'open',
    created_at: '2026-02-01T07:50:00Z',
    response: null,
    responded_at: null,
  },
];

async function listEscalationsMock(): Promise<EscalationDto[]> {
  await delay(500);
  return mockEscalations.filter((e) => e.status === 'open');
}

async function getEscalationMock(id: number): Promise<EscalationDto | null> {
  await delay(400);
  return mockEscalations.find((e) => e.id === id) ?? null;
}

async function respondToEscalationMock(
  id: number,
  message: string,
): Promise<void> {
  await delay(700);
  const escalation = mockEscalations.find((e) => e.id === id);
  if (!escalation) {
    throw new ApiError('Escalation not found', 404);
  }
  escalation.response = message;
  escalation.responded_at = new Date().toISOString();
  escalation.status = 'resolved';
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

function mapEscalation(dto: EscalationDto): Escalation {
  return {
    id: dto.id,
    learnerId: dto.learner_id,
    learnerName: dto.learner_name,
    question: dto.question,
    courseId: dto.course_id,
    moduleId: dto.module_id,
    status: dto.status.toLowerCase() === 'resolved' ? 'resolved' : 'open',
    createdAt: dto.created_at,
    response: dto.response,
    respondedAt: dto.responded_at,
  };
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Streamed ask. Resolves with the same ChatAnswer as `askKodeBuddy`, having
 * delivered the prose incrementally via `handlers.onToken` on the way.
 *
 * Uses `fetch` + a ReadableStream rather than `EventSource`, which cannot POST
 * and cannot carry an Authorization header. `apiFetch` is not reusable here
 * either — it parses the whole body as JSON.
 *
 * Callers should treat `onToken` as append-only and rely on the resolved value
 * for anything structural (message id, resources, escalation state).
 */
export async function streamKodeBuddy(
  request: AskKodeBuddyRequest,
  handlers: ChatStreamHandlers = {},
  signal?: AbortSignal,
): Promise<ChatAnswer> {
  if (!isLiveChat()) return streamMock(request, handlers, signal);

  const headers = new Headers({
    'Content-Type': 'application/json',
    Accept: 'text/event-stream',
  });
  const token = getAccessToken();
  if (token) headers.set('Authorization', `Bearer ${token}`);

  const response = await fetch(`${getApiBaseUrl()}/chat/stream`, {
    method: 'POST',
    headers,
    body: JSON.stringify(toAskDto(request)),
    signal,
  });

  if (!response.ok || !response.body) {
    throw new ApiError(
      `Chat stream failed with status ${response.status}`,
      response.status,
    );
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  let answer: ChatAnswer | null = null;

  try {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });

      // SSE frames are separated by a blank line. Anything after the last
      // separator is a partial frame and stays buffered for the next read.
      const frames = buffer.split('\n\n');
      buffer = frames.pop() ?? '';

      for (const frame of frames) {
        const event = parseSseFrame(frame);
        if (!event) continue;

        if (event.type === 'stage') handlers.onStage?.(event.stage);
        else if (event.type === 'token') handlers.onToken?.(event.text);
        else if (event.type === 'done') answer = event.answer;
        else if (event.type === 'error') {
          throw new ApiError(event.message, 500);
        }
      }
    }
  } finally {
    reader.releaseLock();
  }

  if (!answer) {
    // A stream that ends without a `done` frame is a truncated response, not
    // an empty answer — surfacing it as an error beats rendering half a reply
    // as if it were complete.
    throw new ApiError('Chat stream ended before completing', 500);
  }

  return answer;
}

/** Parses one `event:`/`data:` SSE frame. Returns null for keep-alives. */
function parseSseFrame(frame: string): ChatStreamEvent | null {
  let eventName = 'message';
  const dataLines: string[] = [];

  for (const line of frame.split('\n')) {
    if (line.startsWith(':')) continue; // comment / keep-alive
    if (line.startsWith('event:')) eventName = line.slice(6).trim();
    else if (line.startsWith('data:')) dataLines.push(line.slice(5).trim());
  }

  if (dataLines.length === 0) return null;

  let payload: Record<string, unknown>;
  try {
    payload = JSON.parse(dataLines.join('\n'));
  } catch {
    return null;
  }

  switch (eventName) {
    case 'stage':
      return { type: 'stage', stage: payload.stage as ChatStreamStage };
    case 'token':
      return { type: 'token', text: String(payload.text ?? '') };
    case 'done':
      return {
        type: 'done',
        answer: mapAnswer(payload as unknown as ChatAnswerDto),
      };
    case 'error':
      return {
        type: 'error',
        message: String(payload.message ?? 'The assistant stopped responding.'),
      };
    default:
      return null;
  }
}

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

/**
 * Hands the question to a trainer.
 *
 * Live against POST /agent/escalate regardless of NEXT_PUBLIC_CHAT_API: the
 * endpoint exists and writes a real row, so mocking it would silently drop
 * a learner's request for help. Only the *answers* are still mocked.
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

/** True when answers are canned — the UI surfaces this so nobody is misled. */
export function isChatMocked(): boolean {
  return !isLiveChat();
}

// ---------------------------------------------------------------------------
// Trainer escalation inbox.
//
// No screen consumes these yet. The paths were written speculatively against a
// `/chat/escalations/...` prefix that never existed; they now match what the
// backend actually shipped, so whoever builds the trainer inbox starts from
// something correct. The learner side lives in lib/api/escalations.api.ts.
//
// Still behind the mock switch, unlike the learner endpoints, because there is
// no trainer screen to exercise them against.
// ---------------------------------------------------------------------------

/** GET /escalations/trainer — escalations assigned to the signed-in trainer. */
export async function listTrainerEscalations(): Promise<Escalation[]> {
  if (!isLiveChat()) {
    const dtos = await listEscalationsMock();
    return dtos.map(mapEscalation);
  }

  const dtos = await apiFetch<EscalationDto[]>('/escalations/trainer', {
    method: 'GET',
    auth: true,
  });
  return (dtos ?? []).map(mapEscalation);
}

export async function getEscalation(id: number): Promise<Escalation | null> {
  if (!isLiveChat()) {
    const dto = await getEscalationMock(id);
    return dto ? mapEscalation(dto) : null;
  }

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
 * PATCH /escalations/{id} — the trainer's reply.
 *
 * `status` rides along with the response because the backend treats them as
 * one update; sending a reply without it would leave the escalation open.
 */
export async function respondToEscalation(
  request: RespondToEscalationRequest,
): Promise<void> {
  if (!isLiveChat()) {
    return respondToEscalationMock(request.escalationId, request.message);
  }

  await apiFetch<unknown>(`/escalations/${request.escalationId}`, {
    method: 'PATCH',
    auth: true,
    body: { response: request.message, status: 'resolved' },
  });
}
