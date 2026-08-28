# KodeBuddy AI chat — API contract (proposal)

**Status:** draft, unratified. Needs sign-off from whoever owns `app/features/chat/` on the backend before frontend Phase 4 starts.

**Why this exists:** the agent is built (`app/agent/` — graph, tools, prompts, tables) but nothing exposes it over HTTP. No chat router is mounted in `main.py`. This pins the request/response shape so the frontend can build against a mock now and swap in the real endpoint later without rework.

**Frontend counterpart:** [`src/types/chat.types.ts`](../src/types/chat.types.ts).

---

## Design rules this contract follows

1. **`learner_id` is never accepted from the client.** It comes from `get_current_learner`. This is the entire RBAC boundary — `AgentTools.for_learner()` binds it at construction, and `escalate_to_trainer` re-validates it. Everything else in the request is untrusted input.
2. **`course_id` is derived when it can be.** If `assignment_id` is present, the server takes `course_id` from `AgentRepository.get_assignment()`, which is already entitlement-checked and returns `None` for both "doesn't exist" and "not yours". Any client-sent `course_id` is ignored in that case. Otherwise the client sends it and the server validates with `AgentRepository.is_enrolled()`.
3. **`query_type` is client-selected but server-validated.** `assignment_guidance` without an `assignment_id` is a 422.
4. **Explicit escalation is a separate endpoint**, not a flag on `/chat`. It writes an escalation directly with no retrieval and no LLM call.

---

## Endpoints

| Method | Path | Auth | Purpose |
|---|---|---|---|
| `POST` | `/chat/stream` | `get_current_learner` | **Primary.** Ask a question; streams the reply as SSE |
| `POST` | `/chat` | `get_current_learner` | Non-streaming equivalent; same request and result |
| `GET` | `/chat/history` | `get_current_learner` | Replay the panel on mount |
| `POST` | `/chat/escalate` | `get_current_learner` | The "ASK A TRAINER" button |

`/chat` is kept alongside `/chat/stream` deliberately: it is the fallback when a
proxy buffers SSE, and it keeps the non-streaming path testable. Both take the
same `ChatRequest` and produce the same final payload.

### `POST /chat`

Request maps 1:1 onto `AgentState` input fields; response maps onto its `route`-node output fields (`final_response`, `escalated`, `escalation_id`).

```json
{
  "question": "I'm not quite sure where or how to start this assignment, help?",
  "module_id": 2,
  "assignment_id": 14,
  "query_type": "assignment_guidance"
}
```

```json
{
  "message_id": 812,
  "answer": "No worries, that's a totally normal place to start from...",
  "escalated": false,
  "escalation_id": null,
  "created_at": "2026-02-01T22:34:11Z"
}
```

**On escalation, `answer` is still displayable.** The graph composes its own learner-facing copy ("I've passed this on to your trainer…") in `nodes.py::route`, including a partial answer when it's safe to show. The panel renders `answer` normally and adds an escalation affordance when `escalated` is true. There is no separate error state.

**Errors**

| Status | Condition |
|---|---|
| 403 | `course_id` sent that the learner isn't enrolled in |
| 404 | `assignment_id` not found *or* not entitled — deliberately indistinguishable |
| 422 | `assignment_guidance` with no `assignment_id`; empty `question` |
| 503 | `AgentRetrievalError` — embeddings or content store down |

`503` matters for the UI: it is distinct from an escalation. The retrieval pipeline being broken is not the same as the agent being unsure, and the panel should say so rather than implying a trainer was notified.

---

## FastAPI schema

Drop into `app/features/chat/schema.py`.

```python
from datetime import datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field

from app.agent.graph.state import QueryType


class ChatRequest(BaseModel):
    """
    Maps onto AgentState's input fields.

    `learner_id` and `trainer_id` are deliberately absent: the first comes from
    the authenticated session, the second is resolved server-side. Neither is
    ever client-supplied.
    """

    question: str = Field(min_length=1, max_length=4000)

    # Ignored when assignment_id is set — the course is derived from the
    # assignment instead, which is already entitlement-checked. Required
    # otherwise, and validated against enrolment before use.
    course_id: int | None = None
    module_id: int | None = None
    assignment_id: int | None = None

    query_type: QueryType = QueryType.CHAT


class ChatResponse(BaseModel):
    """
    Maps onto AgentState's route-node output.

    `answer` is AgentState.final_response, which is learner-safe in every
    branch including escalation — the graph composes its own fallback copy.
    Escalation internals (reason, confidence_score, retrieved chunk ids) are
    written to query_logs, never returned: they are operator telemetry, and
    surfacing them would leak retrieval behaviour to the learner.
    """

    message_id: int
    answer: str
    escalated: bool
    escalation_id: int | None = None
    created_at: datetime


class ChatTurnResponse(BaseModel):
    id: int
    role: Literal["user", "assistant"]
    message: str
    timestamp: datetime

    model_config = ConfigDict(from_attributes=True)


class EscalateRequest(BaseModel):
    """
    The explicit "Ask a Trainer" handoff. Bypasses the graph entirely: no
    retrieval, no LLM call, no confidence gate — just an escalation row with
    reason EXPLICIT_USER_REQUEST, the value already reserved for this in
    EscalationReason.
    """

    question: str = Field(min_length=1, max_length=4000)
    course_id: int | None = None
    module_id: int | None = None
    assignment_id: int | None = None


class EscalationReceiptResponse(BaseModel):
    escalation_id: int
    # Null when no trainer could be resolved for the course — see open
    # question 1. The escalation is still written.
    trainer_id: int | None
    status: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
```

---

## Open questions — these need answers, not assumptions

### 1. `trainer_id` resolution does not exist

`AgentState` requires it and there is no lookup anywhere. The tables are `CourseTrainer` and `CohortTrainer`, owned by the courses/cohorts features. Either the backend exposes `get_trainer_for_course(course_id) -> int | None`, or the chat service queries those tables directly and crosses a feature boundary.

It's nullable in the contract, so escalation still works without it — but escalations land unassigned and the trainer dashboard has nothing to filter on. **This is the one hard cross-team dependency in the whole feature.**

### 2. "New chat" has nothing to persist against

`conversation_history` is a flat `(learner_id, course_id, role, message, timestamp)` log with no `session_id` or `thread_id`. The ⊕ button in the Figma implies discrete conversations.

Options: (a) add `session_id` to the table and thread it through, (b) treat ⊕ as a client-side clear only — the agent's `chat_history` window still carries prior turns, so the model remembers what the learner just "cleared", which is a visible bug the first time anyone tests it. **(a) is the honest fix.** It's a migration, so it needs deciding now rather than after launch.

### 3. Thumbs up/down has no storage

The Figma shows feedback controls on every assistant message. No table, no column. Either add one or cut the control from v1 — shipping a button that discards its input is worse than not shipping it.

### 4. Streaming — RESOLVED, with one constraint the backend must respect

Streaming is required. The frontend is built for it. **But tokens cannot be streamed straight out of the `reason` node**, and this is not a preference — it is forced by the graph:

```
retrieve → reason → confidence_gate → route
```

`reason` produces the **entire** draft. `confidence_gate` then inspects that finished text — `_violates_guide_dont_solve_policy` counts non-empty lines against `POLICY_VIOLATION_LINE_THRESHOLD` — and `route` **suppresses the draft outright** when the reason is `POLICY_VIOLATION` (`safe_to_show` in `nodes.py::route`).

That guardrail is the thing stopping the agent from simply doing the learner's assignment for them. Streaming from `reason` would push exactly that content onto the screen and only afterwards decide it should have been withheld. Streamed tokens cannot be retracted.

**So the required shape is: stage events during the graph run, then token events only after `route` approves.**

```
event: stage
data: {"stage": "retrieving"}

event: stage
data: {"stage": "reasoning"}

event: stage
data: {"stage": "checking"}

event: stage
data: {"stage": "answering"}

event: token
data: {"text": "No worries, that's a "}

event: done
data: {"message_id": 812, "answer": "<the full text>", "resources": [],
       "offers_escalation": false, "escalated": false,
       "escalation_id": null, "created_at": "2026-02-01T22:34:11Z"}
```

Rules:

- `answering` is emitted **only** after `route` has approved a response. The three stages before it are the honest reason for the wait.
- `token` frames carry an incremental slice; the client appends. Chunk size is the server's choice — word, sentence, or whole paragraphs all render correctly.
- `done` is **mandatory** and carries the full `answer` plus all metadata. A stream that ends without it is treated by the client as a truncated response and surfaced as an error, not as a short answer.
- On escalation, still emit `done` with `escalated: true`; the graph's fallback copy is learner-safe and renders like any other answer.
- Errors use `event: error` with `{"message": "..."}`.

**What this does and does not buy.** It does not reduce time-to-first-token — the learner still waits for the whole LLM call plus the gate. What it buys is an honest progress signal instead of a spinner, and the ability to render long answers progressively. If genuine low-latency token streaming is wanted, the guardrail has to become incremental (checking as tokens arrive and cutting the stream on violation), which is real backend work in `confidence_gate` and should be costed separately.

Frontend note: `apiFetch` is JSON-only, so `streamKodeBuddy` in `lib/api/chat.api.ts` uses `fetch` + a `ReadableStream` reader directly — `EventSource` is unusable here as it cannot POST or send an `Authorization` header. Whatever proxy fronts this in production must not buffer `text/event-stream` (`X-Accel-Buffering: no` for nginx).

### 5. Replayed history can't show escalation state

`conversation_history` has no `escalated` column, so a reloaded panel renders past escalated answers as ordinary ones. Acceptable for v1; worth a column if the escalation affordance matters after reload. Related to (2) — same table, same migration.

---

## What each side owns

**AI team, no backend dependency:**
- `LLMClient` implementation — `anthropic` is already in `requirements.txt`, nothing implements `complete()` yet. Needs `ANTHROPIC_API_KEY` added to `core/config.py`, which today has only `VOYAGE_API_KEY`.
- The service composition — `AgentTools.for_learner` → `build_dependencies_from_agent_tools` → `build_agent_graph` → `invoke`. The call sequence is spelled out in `integration.py`'s docstring.
- Conversation-history read/write on `AgentRepository` (table exists, methods don't).
- `QueryLog` writes.

**Backend team:**
- `get_trainer_for_course()` (open question 1).
- One line in `main.py` to mount the router, and review that the module follows the `router.py` / `service.py` / `schema.py` convention.
- Migration for open questions 2/3/5, if accepted.

**Frontend:**
- Builds against a mock resolver matching this contract; swaps to the real endpoint at Phase 4 with no component changes.
