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
| `POST` | `/chat` | `get_current_learner` | Ask a question; runs the agent graph |
| `GET` | `/chat/history` | `get_current_learner` | Replay the panel on mount |
| `POST` | `/chat/escalate` | `get_current_learner` | The "ASK A TRAINER" button |

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

### 4. Streaming or single-shot?

`LLMClient.complete()` is synchronous and returns a whole string, so single-shot is what the current design supports and this contract assumes. The "Thinking…" state in the Figma works either way. If streaming is wanted later it's an additive `/chat/stream` (SSE) — but note `apiFetch` in the frontend is JSON-only and would need extending.

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
