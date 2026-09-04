# CRM 360 + NBA — Handoff for a non-Frappe frontend

Date: 2026-09-04 · Branch `refactor/core-crm` (both repos, committed, **not pushed**)
Audience: the FE team building the Student/School 360 view and the NBA
recommendation review/decision experience on a separate web app.

This document has two jobs:

1. **Explain the two features** — *Student / School 360* (evidence-grounded
   analysis) and *NBA* (Next Best Action recommendations) — how they run, what
   triggers them, and how they relate.
2. **Be the build + test contract** for the FE team: endpoint shapes, the state
   model, conflict recovery, an implementation guide, a test checklist, how to
   run and configure the environment, and the full list of data caveats.

Frappe stays the authority for schema, permissions and writes. Your app is a
pure client of the whitelisted HTTP endpoints below. You cannot widen access —
every endpoint is permission- and role-scoped server-side and fails closed.

---

## 0. The two features at a glance

| | **Student / School 360** | **NBA (Next Best Action)** |
|---|---|---|
| Question it answers | "What do we know about this student / school, with evidence?" | "What should the salesperson do next for this student, and why?" |
| Output | `claims[]` (fact / inference / uncertainty / recommendation) + a `report`, each claim citing sources | 0..N immutable ranked `CRM Recommendation` rows + a grounded `explanation` |
| Engine | analysis-run stages `student_360` / `school_360` (LLM over verified evidence snapshot) | deterministic decision kernel (`nba-engine-r1`) — **no LLM in the decision**; LLM only renders the explanation afterwards |
| Durability | `CRM Student Analysis Run` / `CRM High School Analysis Run` + stages | `CRM Evaluation` run → `CRM Recommendation` rows → `CRM Student Decision Event` → `CRM Action Item` (Task) |
| Human in the loop | none — read-only intelligence | **mandatory** — every recommendation is accepted / changed / rejected / deferred / dismissed by a person before anything executes |

**They are independent.** NBA never reads, waits for, or is blocked by a 360
run. A student with no 360 data still gets NBA recommendations, and vice-versa.
Treat them as two separate panels that happen to share a student.

---

## 1. Feature A — Student / School 360

### 1.1 Mental model

```
"Analyse now" (manual)  ─┐
scheduled / event refresh ─┼─→ Analysis Run committed (status: queued)
                          ─┘        ↓ outbox signal → worker
                            stage student_360 | school_360 runs
                            (LLM over a verified evidence snapshot)
                                   ↓
                            claims[] + report   ← your app READS these
                                   ↓ retention window
                            claims eventually expire (retention_expired: true)
```

A run has a **status** and one or more **stages**. Each stage produces:

- `claims[]` — atomic statements, each with a kind, cited sources, a visibility
  label, and an optional confidence.
- `report` — a longer prose synthesis for that stage.
- `terminal_reason` — set when the stage ended without a full result
  (`abstained`, `failed`, `dead_lettered`).

### 1.2 Claim shape

Source of truth: `app/contracts/analysis_runs.py::AnalysisClaim`.

```jsonc
{
  "claim_kind": "fact",            // fact | inference | uncertainty | recommendation
  "statement": "…≤800 chars…",
  "provenance_ids": ["evt:CRM Interaction:abc123", "doc:CRM Student:ENR-2026-00002"],
                                   // 1–8 refs, each ≤140 chars, unique
  "visibility_label": "shareable", // shareable | source_scoped
  "confidence": 0.72               // 0..1, or null — DO NOT render as a percentage
}
```

- `claim_kind` tells the UI how to badge it: `fact` = observed, `inference` =
  derived, `uncertainty` = explicit unknown, `recommendation` = suggested move
  (advisory only — **not** an NBA recommendation, no decision workflow attached).
- **`visible_claims()` suppresses a whole claim** if the caller cannot resolve
  **every** source it cites. You may therefore receive fewer claims than were
  produced; that is correct behaviour, not data loss. Never show "N claims
  hidden" counts — just render what you got.
- `visibility_label: "source_scoped"` means the claim is only for users who can
  see the underlying record; the server already enforces this, but do not
  forward such a claim into a shareable export.

### 1.3 Run status values

`RunStatus` = `queued` | `running` | `completed` | `abstained` | `failed` |
`dead_lettered`.

- `queued` / `running` → poll again.
- `completed` → render claims + report.
- `abstained` → the engine deliberately produced no claims (insufficient
  verified evidence). Show a neutral empty state with the reason, not an error.
- `failed` / `dead_lettered` → show "couldn't analyse", offer a manual re-run
  (subject to quota, §1.6).

### 1.4 Dispatch a run (manual "Analyse now")

Both are crm-agents endpoints (they proxy one Frappe command and return its
receipt without waiting for the LLM):

`POST /api/v1/analysis-runs/student`
```jsonc
// body
{ "student_id": "ENR-2026-00002", "force_rerun_reason": "…≥10 chars, optional…" }
// → 202 + receipt { request_id, run_id, run_type, status, … }
```

`POST /api/v1/analysis-runs/school`
```jsonc
{ "high_school": "01-001-062", "admission_year": 2026, "force_rerun_reason": null }
// → 202 + receipt
```

Header `Idempotency-Key` (8–140 chars, `[A-Za-z0-9._:-]`) is required. Same key
= same run, no duplicate.

### 1.5 Poll a run

`GET /api/v1/analysis-runs/{run_id}?run_kind=student|school` (crm-agents proxy of
`crm.api.intelligence_runs.get_analysis_run`).

```jsonc
{
  "run_id": "…",
  "run_type": "student" | "school",
  "status": "completed",
  "stages": [
    {
      "name": "student_360",
      "stage_kind": "student_360",     // student_360 | school_360
      "status": "completed",
      "claims": [ /* claim shape, §1.2 */ ],
      "report": "…prose…",
      "terminal_reason": null,
      "policy_revision": "…",
      "model_revision": "…"
    }
  ]
}
```

`run_kind` is required because Student and School runs have independent
autoincrement ids today (no globally unique run id yet). The server still
scope-checks the run against the caller.

### 1.6 Dedicated 360 read (recommended for the 360 panel)

`GET /api/method/crm.api.analysis_run_read.get_student_360` (Frappe whitelisted
method — call directly with the 3 auth headers).

Query: **either** `run_id`, **or** `student` + `source_revision` (exactly one
form).

```jsonc
{
  "contract_version": "student-360-read-v1",
  "run_id": "…",
  "run_type": "student",
  "student": "ENR-2026-00002",
  "source_revision": "…",
  "source_digest": "sha256:…",
  "result_digest": "sha256:…",
  "status": "completed",
  "policy_revision": "…",
  "model_revision": "…",
  "retention_expired": false,
  "claims": [ /* claim shape, §1.2 — already visibility-filtered */ ],
  "settled_at": "2026-09-04T13:41:14+07:00"
}
```

Not-available shape (no run yet, or retention expired, or not permitted):

```jsonc
{ "contract_version": "student-360-read-v1", "run_type": "student",
  "student": "ENR-2026-00002", "status": "not_available", "claims": [] }
```

`retention_expired: true` ⇒ `claims` may be empty even though a run existed. Show
"analysis expired, re-run to refresh".

### 1.7 Manual-run quota

- `crm_intelligence_manual_requests_per_actor_target` (default **3**) requests
  per `crm_intelligence_manual_request_window_minutes` (default **60**), counted
  per (actor, target).
- Over quota ⇒ the dispatch returns 409 ("analysis request was not accepted").
  Surface a friendly "you've requested this too many times, try again later".
- `force_rerun_reason` (10–500 chars) forces a fresh run even if a recent one
  exists, but is **role-gated**: `crm_intelligence_force_rerun_roles` (default
  `["System Manager"]`). Hide the "force" affordance for users without the role.

---

## 2. Feature B — NBA Recommendation

### 2.1 Mental model

```
NBA Evaluation (deterministic kernel, independent of Student 360)
        ↓ commit
0..N immutable CRM Recommendation rows   ← your app READS these (review queue)
        ↓ Sales decides each one (append-only)
CRM Student Decision Event  +  (accept only) exactly one CRM Action Item = "Task"
        ↓
Execution / Outcome / Feedback  (follows the Task, not the Recommendation)
```

Hard rules the UI must respect:

- A **Recommendation is immutable**. There is no "edit recommendation" — the only
  writes are decisions (accept / accept-with-changes / reject / defer / dismiss).
- A **RECOMMEND** evaluation produces 1..N recommendations (ranked). Any other
  disposition (`WAIT`, `NO_ACTION`, `ABSTAIN`) produces **zero** — show an empty
  state, not an error.
- **One recommendation → at most one Task**, created atomically on accept.
- The **kernel owns** action, rank, score, timing and disposition. The LLM
  explanation (§5) is presentation only and can never override them.
- Deciding is **append-only and idempotent** — every decision call needs an
  `idempotency_key`; replaying the same key returns the same result.

### 2.2 Disposition values

| Disposition | Meaning | `recommendations` |
|---|---|---|
| `RECOMMEND` | act now — here are the ranked options | 1..N |
| `WAIT` | do nothing yet; there is a revisit time or trigger | 0 |
| `NO_ACTION` | nothing worthwhile to do | 0 |
| `ABSTAIN` | the kernel could not decide safely | 0 |

---

## 3. The NBA trigger flows

There are **three ways an NBA Evaluation starts**. All three converge on the
same durable runtime (evaluate → commit immutable Recommendations → render
explanation). They differ only in *what kicks them off* and *whether the caller
waits for the result*.

```
         ┌──────────────────────────────────────────────┐
Flow 1   │ Chatwoot conversation → CRM Interaction write │─┐
(interaction)                                              │
         ┌──────────────────────────────────────────────┐  │
Flow 2   │ Chatwoot conversation → CRM Intent write      │─┼─→ record_domain_reevaluation_trigger
(intent) └──────────────────────────────────────────────┘  │        ↓  GATE crm_nba_domain_reevaluation_enabled
                                                            │   request_domain_reevaluation(student, trigger_reason)
         ┌──────────────────────────────────────────────┐  │        ↓  (coalesced: 1 active run per student)
Flow 3   │ FE calls POST /api/v1/nba-evaluations/student │──┘   NBA Evaluation runtime
(manual) │            (async 202)  or  …/student/run     │           ↓
         │            (sync, full result)               │      commit 0..N immutable CRM Recommendation
         └──────────────────────────────────────────────┘           ↓
                                                              render explanation (Layer 9)
```

### 3.1 Flow 1 — Chatwoot interaction re-evaluation (automatic, event-driven)

1. A Chatwoot conversation is analysed by the agent pipeline
   (`app/services/conversation/pipeline.py::analyze_conversation`).
2. The pipeline writes a **`CRM Interaction`** row into Frappe (directly, or via
   the canonical intake command when `INTERACTION_INTAKE_ENABLED=true`).
3. Frappe `after_insert` on `CRM Interaction` (`crm/hooks.py`) calls
   `dispatch_interaction_domain_reevaluation` (`crm/api/agent_events.py`).
4. That calls `record_domain_reevaluation_trigger(student, trigger="interaction")`.
5. **Gate:** `crm_nba_domain_reevaluation_enabled` (site config, default
   **0 / OFF**). If off, the trigger is recorded and stops there.
6. If on: `request_domain_reevaluation(student, trigger_reason="interaction")`
   commits an NBA Evaluation. **Coalesced** — if an evaluation is already active
   for that student, the new trigger merges into it instead of starting a
   duplicate run.

This is **best-effort and never aborts the Interaction write** — if the NBA
dispatch fails, the conversation data is still saved.

### 3.2 Flow 2 — Chatwoot intent re-evaluation (automatic, event-driven)

Identical to Flow 1 but keyed on a **`CRM Intent`** row:
`after_insert` → `dispatch_intent_domain_reevaluation` →
`record_domain_reevaluation_trigger(student, trigger="intent")` → same gate →
same coalesced `request_domain_reevaluation`.

Intents represent a detected buying signal (e.g. "asked about tuition"); an
interaction represents a contact event. Both are produced by the same pipeline
pass over a conversation, so a single Chatwoot conversation can fire both
triggers — coalescing collapses them to one run.

### 3.3 Related: AI insight write-back (not an NBA trigger, but same pipeline)

When `AI_INSIGHT_WRITEBACK_ENABLED=true` (default **false**), the same
conversation pipeline also writes `ai_summary` / `ai_detected_interests` /
`ai_risk_flags` onto `CRM Student`, guarded by a CAS check on
`student_context_revision`. This changes what the 360 panel and the student
header show; it does **not** by itself start an NBA run.

### 3.4 Flow 3 — Manual / on-demand API (FE-initiated)

Two shapes, same underlying runtime. Both are crm-agents endpoints under
`/api/v1/nba-evaluations`, both authenticated with the 3 headers from §4, both
require an `Idempotency-Key` header (8–140 chars, `[A-Za-z0-9._:-]`).

The **caller must be able to read the student**; Frappe enforces that on the
request command. Execution itself (lease claim → kernel → commit → explanation)
runs under the **service identity**, exactly as the background worker does —
those steps are service-only in Frappe.

#### 3.4a Async — `POST /api/v1/nba-evaluations/student`

```jsonc
// body
{ "student_id": "ENR-2026-00002", "force_rerun_reason": "…≥10 chars, optional…" }
// → 202 + receipt
{ "evaluation": "hdf9godcif", "student": "ENR-2026-00002", "status": "queued",
  "disposition": null, "contract_version": "…", "engine_revision": "nba-engine-r1",
  "evaluation_key": "…", "run_generation": 0, "recommendation_count": 0,
  "terminal_reason": null }
```

Returns immediately; the background worker runs it. Poll for the result by
reading the recommendations for that student (§4 read endpoints) or re-POSTing
the same idempotency key and watching `status` / `recommendation_count`.
**Requires the worker to be running** (`NBA_EVALUATION_WORKER_ENABLED=true`) —
otherwise it stays `queued` forever.

#### 3.4b Sync — `POST /api/v1/nba-evaluations/student/run`

Drives the whole pipeline inline and returns the settled result. **Use a client
timeout ≥ 120 s.**

```jsonc
{
  "evaluation": "hdf9godcif",
  "student_id": "ENR-2026-00002",
  "status": "completed",              // completed | failed | cancelled | dead_lettered
  "disposition": "RECOMMEND",         // RECOMMEND | WAIT | NO_ACTION | ABSTAIN
  "recommendation_count": 1,
  "terminal_reason": null,
  "recommendations": [
    {
      "id": "hdf9godcif-1", "rank": 1, "actionId": "ACTIVATE_WINBACK",
      "recommendationKey": "…", "studentId": "ENR-2026-00002",
      "priority": "high", "channel": null, "reason": "…short kernel reason…",
      "aiPayload": { /* immutable kernel object, §4.6 */ },
      "explanation": { /* 6-group object, §5, or null */ },
      "explanationSource": "model"    // "model" | null
    }
  ]
}
```

- `disposition` ≠ `RECOMMEND` ⇒ `recommendations: []`.
- If the background worker grabbed the lease first, the endpoint falls back to a
  bounded poll (up to ~30 s) and returns whatever settled.
- Errors: **422** invalid request · **409** not accepted (quota / conflicting
  run) · **403** student not permitted · **503** dispatch unavailable.

**When to use which:** sync for an interactive "Run NBA now" button where the
user waits for the answer; async when you are refreshing many students or don't
need the result in the same request.

### 3.5 Timing / WAIT re-entry

A `WAIT` disposition carries a revisit time. The runtime re-evaluates at that
time (or when a domain trigger arrives, if Flow 1/2 is enabled). The FE does not
schedule this — just re-read the recommendations and reflect the current
disposition.

---

## 4. API contracts — NBA read & decide

All Frappe methods are called as `POST|GET /api/method/<dotted.path>`. Responses
are `{ "message": <payload> }`; payloads below are the `message` body. The
crm-agents endpoints (`/api/v1/...`) return the payload directly.

### 4.1 Auth (every request, all endpoints in this doc)

| Header | Value |
|---|---|
| `Authorization: Bearer <token>` | Frappe OAuth bearer for the acting user |
| `X-API-Key: <key>` | service API key |
| `X-Frappe-Delegation: <proof>` | HS256 delegation proof, ≤120 s lifetime, replay-guarded |

Role authority is **Frappe only**: `Sale`, `Lead Sales`, `Marketing`,
`Admissions Director`. Role selects which surfaces/commands are available; it
does not widen data scope. Absent / ambiguous / stale role ⇒ 403. Guest ⇒ 401.
Do not send the user's email in any header/URL/payload beyond identity.

### 4.2 Director recommendation queue (read)

`GET crm.api.director_next_best_action.get_director_recommendations`

Query: `admissionYear` (optional, defaults to resolved current year),
`limit` (1..200, default 50). Requires director access. `rank asc`.

```jsonc
{
  "meta": {
    "admissionYear": 2026,
    "asOf": "2026-09-04T13:41:14+07:00",
    "timezone": "Asia/Ho_Chi_Minh",
    "status": "available",          // or "empty"
    "count": 3,
    "limit": 50,
    "metricKind": "observational",
    "metricDisclaimer": "Số liệu mô tả trạng thái lịch sử … không phải … nhân quả …"
  },
  "recommendations": [
    {
      "id": "oo3kgs831p-1",
      "rank": 1,
      "recommendationKey": "NBAEVAL-aae36ae93fc18387:ACT-ACTIVATE_WINBACK:1",
      "studentId": "ENR-2026-00002",
      "actionId": "ACTIVATE_WINBACK",
      "aiPayload": { /* immutable kernel object, verbatim — §4.6 */ },
      "explanation": { /* 6-group object, or null — §5 */ },
      "explanationSource": "model",   // "model" | null
      "evaluation": { "id": "oo3kgs831p", "disposition": "RECOMMEND", "status": "completed" },
      "generatedAt": "2026-09-04T13:41:14+07:00"
    }
  ]
}
```

### 4.3 Director NBA operational queue + analytics (read)

`GET crm.api.director_next_best_action.get_director_next_best_action`

Query: `admissionYear`, `scope` (`all`), `queueFilter` (`all|urgent`),
`page` (≥1), `pageSize` (1..100, default 8), `outcomePeriod` (`7d|30d|90d`).

This is the **Task-side** projection (accepted work + SLA + outcome telemetry),
not the recommendation review queue. `meta.metricKind = "observational"` and
`meta.metricDisclaimer` MUST be shown next to any counts/rates — they are
descriptive history, never causal or predictive. `confidence`,
`currentProbability`, `projectedProbability` are `null` / a static default —
**do not render them as model outputs**.

### 4.4 Per-student review queue (read)

`GET|POST crm.api.student_worklist.list_student_worklist`

Query: `student_id` (optional, one Student), `cursor` (opaque, from prior
`next_cursor`), `page_size` (1..50, default 20). When `student_id` is provided,
the same permission-scoped worklist is narrowed to that Student; scope still
comes from the delegated session.

```jsonc
{
  "items": [
    {
      "id": "oo3kgs831p-1",
      "recommendation": "oo3kgs831p-1",     // same value as id
      "rank": 1,
      "recommendationKey": "NBAEVAL-…:ACT-ACTIVATE_WINBACK:1",
      "studentId": "ENR-2026-00002",
      "studentName": "…",
      "actionId": "ACTIVATE_WINBACK",
      "priority": "high",
      "channel": null,
      "reason": "…short kernel reason string…",
      "aiPayload": { /* verbatim kernel object */ },
      "evaluation": { "id": "…", "disposition": "RECOMMEND", "status": "completed" },
      "generatedAt": "2026-09-04 13:41:14",
      "expected_revision": "2026-09-04 13:41:14.512345",  // CAS token — pass back on decide
      "revision": "…",
      "permitted_decisions": ["accepted", "deferred", "rejected", "dismissed"]
    }
  ],
  "next_cursor": "…" | null,
  "policy_version": "recommendation-worklist-v1"
}
```

The worklist DTO does **not** carry `explanation` today — only
`get_director_recommendations` does. On the worklist, render from `reason` +
`aiPayload`, or call the sync run endpoint (§3.4b) which returns `explanation`.

### 4.5 Single-student latest Task (read)

`GET crm.api.student_worklist.get_next_best_action_for_student?student_id=ENR-2026-00002`

Returns the newest active `CRM Action Item` for the student (Task view), or
`nba: null`. 400 `INVALID_STUDENT_ID`, 403 `FORBIDDEN`, 404 `STUDENT_NOT_FOUND`,
503 `STUDENT_NBA_UNAVAILABLE`.

### 4.6 `aiPayload` — the immutable kernel object

Surfaced verbatim (no key rewriting) from `CRM Recommendation.ai_payload`. It is
the deterministic decision record: action reference, disposition, kernel rank,
score band, normalized timing window, evidence references. Treat it as the
**source of display facts** when `explanation` is null. **Do not assume a fixed
key set** — read the exact shape off a live response in the target environment
and type it there; it is stable within engine revision `nba-engine-r1` but owned
by the kernel, not this contract.

**Never render** raw numeric `score` / `confidence` values from it. Rank and
qualitative bands only.

### 4.7 Decide a recommendation (write)

`POST crm.api.student_decision.decide_recommendation`

| Param | Required | Notes |
|---|---|---|
| `name` | yes | recommendation id (`items[].id`) |
| `expected_revision` | yes | the `expected_revision` string from the read model (CAS) |
| `operation` | yes | `ACCEPT` \| `ACCEPT_WITH_CHANGES` \| `REJECT` \| `DEFER` \| `DISMISS` |
| `idempotency_key` | yes | client-generated, stable per user intent; replay-safe |
| `delta` | for `ACCEPT_WITH_CHANGES` | JSON object, allowlist only (below) |
| `decision_reason` | for `REJECT`, `DISMISS` | free text |
| `revisit_at` | for `DEFER` | datetime |
| `correlation_id` | optional | trace id |

**`delta` allowlist** (ACCEPT_WITH_CHANGES only):
`{ due_at, revisit_at, assignee_staff, channel, priority }`.
Any identity key (`action`, `action_type`, `action_code`, `nba_action`,
`target_id`, `target_type`, `student`) in the delta ⇒ rejected `IDENTITY_CHANGE`.
Any other key ⇒ `INVALID_INPUT`.

Success:

```jsonc
{
  "status": "accepted",            // accepted | rejected | deferred | dismissed
  "operation": "ACCEPT",
  "recommendation": "oo3kgs831p-1",
  "action": "ACT-2026-00009",      // the created Task id, or null for non-accepting ops
  "event": "…decision event id…",
  "receipt": "…"
}
```

`ACCEPT` / `ACCEPT_WITH_CHANGES` create exactly one `CRM Action Item` ("Task") in
the same transaction. `REJECT` / `DEFER` / `DISMISS` / passive expiry never
create a Task.

**Error handling / conflict recovery:**

| Condition | Code (in error body) | UI action |
|---|---|---|
| Recommendation changed since read | `STALE_REVISION` | re-fetch the row, show new state, let the user re-decide |
| Already decided (terminal) | `INVALID_STATE` | refresh; the decision is closed |
| Recommendation expired | `ACTION_EXPIRED` | tell the user it must be regenerated (run NBA again) |
| Delta touches identity | `IDENTITY_CHANGE` | block the edit client-side too |
| Unknown / unsupported delta key | `INVALID_INPUT` | validation message |
| Role not an approved acceptor | `FORBIDDEN` (403) | hide/disable accept for this user |
| Not authenticated | 401 | re-auth |

HTTP status: `FORBIDDEN`/auth ⇒ 403/401; `STALE_REVISION`/`INVALID_STATE` map to
409-class; other validation ⇒ 400. Always treat a failed decide as "reload then
retry", never a silent retry.

### 4.8 Director queue command (write, Task-side)

`POST crm.api.director_next_best_action.apply_action_command` —
`assign` / `defer` / `dismiss` one **Task** (not a recommendation).
Params: `actionId`, `command`, `assigneeId` (assign), `deferUntil` (defer),
`reason`, `expectedVersion` (the queue row `version` = `decision_revision`),
`idempotencyKey`. `STALE_VERSION` ⇒ 409 reload. Only needed if you also build
the director Task workbench.

---

## 5. The `explanation` object (Layer 9)

Post-decision, LLM-rendered, **grounded**, per recommendation, best-effort.
`explanation` is `null` until the render pass has succeeded for that row;
`explanationSource` is `"model"` when rendered, else `null`. When `null`, fall
back to `aiPayload` + `reason`.

6 conceptual groups, 7 keys: 5 string fields + 2 list fields. Server validates
all present, no extras; strings 1..500 chars; lists ≤8 items of ≤400 chars each.

| Field | Type | Meaning |
|---|---|---|
| `summary` | string | one-paragraph "what and why", sales-facing |
| `why_action` | string | why this action fits the situation |
| `why_now` | string | why act now vs wait |
| `timing_reason` | string | why the specific timing window |
| `evidence_summary` | string[] | observed facts behind the call |
| `uncertainty` | string | what's not known — **qualitative only** |
| `execution_guidance` | string[] | draft/approach notes for the sales rep |

Live example (`oo3kgs831p-1`):

```json
{
  "summary": "Lead đang giảm tương tác (chưa liên lạc trong 5 ngày). Cần kích hoạt chiến dịch tái kích hoạt để khôi phục sự quan tâm trước khi mất hoàn toàn.",
  "why_action": "Tương tác lạnh do thời gian không liên hệ kéo dài. Một tin nhắn tái kích hoạt có thể đưa lead quay trở lại chu trình tuyển sinh khi sự chú ý của họ còn tương đối gần đây.",
  "why_now": "5 ngày là khoảng thời gian tới hạn — đủ lâu để sự quan tâm nguội lạnh, nhưng chưa quá lâu để mất hoàn toàn.",
  "timing_reason": "Thời điểm 04/09/2026 được lựa chọn để tránh gửi quá sớm hoặc quá muộn.",
  "evidence_summary": ["Lead chưa có liên lạc trong 5 ngày qua", "Mức độ tương tác hiện tại không rõ ràng", "Điểm số tín hiệu cho thấy mức độ quan tâm giảm"],
  "uncertainty": "Còn ít dữ liệu về lý do tạm dừng của lead và mức độ sẵn sàng của họ lúc này — hành động tái kích hoạt có thể không hiệu quả nếu lead đã từ bỏ rồi.",
  "execution_guidance": ["Soạn tin nhắn ngắn, tập trung vào giá trị mà lead quan tâm", "Đặt câu hỏi mở để hiểu lý do tạm dừng", "Chuẩn bị tùy chọn thay thế nếu lead phản hồi", "Nếu không phản hồi sau 3 ngày, cân nhắc kênh liên lạc thay thế"]
}
```

Grounding guarantees (server rejects a render that violates them and falls back
to `null`): no different action id, no timing override, no fabricated
percentage/preference, no raw-confidence-number leak, no authorization language,
Vietnamese only.

`execution_guidance` is **draft/approach text, not execution authorization** —
nothing is executed until the Task is accepted and worked. Label it in the UI
("gợi ý cách làm", not "đã duyệt gửi").

---

## 6. FE implementation guide

### 6.1 Surfaces to build

| Surface | Endpoints | Notes |
|---|---|---|
| **Student 360 panel** | `get_student_360` (§1.6), fallback `GET /api/v1/analysis-runs/{run_id}` (§1.5); "Analyse now" → `POST /api/v1/analysis-runs/student` (§1.4) | Group claims by `claim_kind`. Show `report` below. Poll every ~3 s while `queued`/`running`. Respect quota (§1.7). |
| **School 360 panel** | same, `school` variants | `high_school` accepts the canonical external id (e.g. `01-001-062`). |
| **Per-student NBA review** | `list_student_worklist` (§4.4) to list; `decide_recommendation` (§4.7) to act; optional `POST …/nba-evaluations/student/run` (§3.4b) for a "Run NBA now" button | Keep `expected_revision` per row; send it back on decide. |
| **Director recommendation queue** | `get_director_recommendations` (§4.2) | Has `explanation`. Show `metricDisclaimer`. |
| **Director Task workbench** (optional) | `get_director_next_best_action` (§4.3) + `apply_action_command` (§4.8) | Task-side; separate from the review queue. |
| **Single-student "current Task"** | `get_next_best_action_for_student` (§4.5) | Shows what was already accepted. |

### 6.2 The decision interaction (the important one)

1. Read the row from `list_student_worklist`. Keep `id` and `expected_revision`.
2. User picks an operation. For `ACCEPT_WITH_CHANGES`, collect only allowlisted
   delta fields (`due_at`, `revisit_at`, `assignee_staff`, `channel`,
   `priority`) — never expose action/target fields as editable.
3. Generate a stable `idempotency_key` for this intent (e.g.
   `decide:<recommendationId>:<operation>:<uuid>`), and reuse it verbatim on retry.
4. `POST decide_recommendation` with `name`, `expected_revision`, `operation`,
   `idempotency_key`, and the operation-specific params.
5. On success: on `ACCEPT*`, `action` is the new Task id — route the user to it.
6. On `STALE_REVISION` / `INVALID_STATE`: re-fetch the row, show the new state,
   ask the user to decide again. **Do not auto-retry** with the old revision.
7. On `ACTION_EXPIRED`: offer "Run NBA again" (§3.4b).

### 6.3 Empty / non-RECOMMEND states

- `disposition` in {`WAIT`, `NO_ACTION`, `ABSTAIN`} ⇒ no recommendations. Show a
  neutral message ("Chưa có hành động được đề xuất — hệ thống đang chờ thêm tín
  hiệu" for WAIT). Not an error, no red.
- 360 `status: abstained` ⇒ "Chưa đủ dữ kiện đã xác minh để phân tích".

### 6.4 What the FE must NOT do

- Never build an "edit recommendation" form. Recommendations are immutable.
- Never treat `explanation`/`execution_guidance` as "approved to send".
- Never render raw `score` / `confidence` numbers.
- Never cache a decision result and replay a different `idempotency_key`.
- Never assume a fixed `aiPayload` key set across engine revisions.

---

## 7. FE test checklist

Run against `crm.localhost` (shared dev site — see data caveats §9).

### 7.1 Student / School 360

- [ ] `POST /api/v1/analysis-runs/student` with a seed student (e.g.
  `ENR-2026-00001`) → 202 with a `run_id`.
- [ ] Poll `GET /api/v1/analysis-runs/{run_id}?run_kind=student` → transitions
  `queued`→`running`→`completed` (needs the worker running; if not, drive
  manually per §8.4).
- [ ] `get_student_360` by `run_id` → `contract_version: student-360-read-v1`,
  claims present, each claim's `provenance_ids` non-empty.
- [ ] `get_student_360` for a student with no run → `status: "not_available"`,
  `claims: []`.
- [ ] Exceed the manual quota (4 requests in an hour) → 409.
- [ ] `force_rerun_reason` as a non–System-Manager user → rejected.
- [ ] A student where you can't resolve a cited source → that claim is absent
  (visibility filtering), not an error.

### 7.2 NBA — manual run

- [ ] `POST /api/v1/nba-evaluations/student/run` for a seed student → 200,
  `status: "completed"`, a `disposition`.
- [ ] If `disposition == "RECOMMEND"` → `recommendations` non-empty, each has
  `id`, `rank`, `actionId`, `aiPayload`; `explanation` is an object or `null`.
- [ ] If `disposition != "RECOMMEND"` → `recommendations: []`.
- [ ] Re-POST with the **same** `Idempotency-Key` → same `evaluation` id, no
  duplicate rows.
- [ ] Invalid `Idempotency-Key` (`"bad"`) → 422.
- [ ] `student_id` the caller can't read → 403.
- [ ] `POST /api/v1/nba-evaluations/student` (async) → 202, then the row appears
  in `list_student_worklist` once the worker settles it.

### 7.3 NBA — decide

- [ ] `list_student_worklist` → capture `id` + `expected_revision`.
- [ ] `decide_recommendation` `ACCEPT` → `status: "accepted"`, `action` is a new
  Task id.
- [ ] Decide the **same** recommendation again → `INVALID_STATE`.
- [ ] Decide with a stale `expected_revision` → `STALE_REVISION`.
- [ ] `ACCEPT_WITH_CHANGES` with `delta: {"priority": "high"}` → accepted.
- [ ] `ACCEPT_WITH_CHANGES` with `delta: {"action": "X"}` → `IDENTITY_CHANGE`.
- [ ] `ACCEPT_WITH_CHANGES` with `delta: {"foo": 1}` → `INVALID_INPUT`.
- [ ] `REJECT` without `decision_reason` → validation error.
- [ ] Replay the same `idempotency_key` for a successful decide → same result,
  no second Task.

### 7.4 Chatwoot re-evaluation flows (only if enabled)

- [ ] With `crm_nba_domain_reevaluation_enabled = 0`: insert a `CRM Interaction`
  for a student → trigger recorded, **no** new evaluation.
- [ ] Set `crm_nba_domain_reevaluation_enabled = 1`: insert a `CRM Interaction`
  → a new NBA Evaluation is committed for that student.
- [ ] Insert an `Interaction` **and** an `Intent` for the same student close
  together → **one** coalesced run, not two.
- [ ] The Interaction/Intent write still succeeds even if NBA dispatch fails.

---

## 8. Run & environment configuration

### 8.1 Stack

Two docker-compose stacks:

- **frappe-crm** — the Frappe site `crm.localhost` (container
  `crm-dev-frappe-1`), Frappe + MariaDB + Redis + the Frappe scheduler/workers.
- **crm-agents** — the FastAPI agent service (`app` service, port `7999`),
  Postgres, Redis, plus the LightRAG stack in `compat` profile.

### 8.2 Bring up crm-agents

```bash
# the `app` service has NO bind mount — you MUST rebuild to pick up code changes
docker compose build app && docker compose up -d app
curl http://localhost:7999/health
```

Local (non-docker) dev:

```bash
uv venv && uv pip install -e ".[dev]"
python -m uvicorn app.main:app --reload --port 7999 --loop app.main:selector_event_loop_factory
```

### 8.3 Run bench commands (Frappe)

```bash
docker exec -u frappe -w /home/frappe/frappe-bench crm-dev-frappe-1 \
  bench --site crm.localhost <command>
# examples:
#   bench --site crm.localhost console
#   bench --site crm.localhost set-config -g crm_nba_domain_reevaluation_enabled 1
#   bench --site crm.localhost migrate
```

### 8.4 Drive an evaluation / stage manually (when the worker is off)

- NBA end-to-end: `scripts/nba_live_e2e.py` (note: this script is partly stale —
  it references an analysis-run NBA sub-path that no longer exists; the
  evaluate→commit→accept portion still illustrates the flow).
- Any analysis-run stage: `execute_stage(...)` in the crm-agents app container.
- Preferred for NBA now: just call `POST /api/v1/nba-evaluations/student/run`
  (§3.4b) — it drives the evaluation inline under the service identity.

### 8.5 crm-agents config flags (`app/config.py`, env-loaded)

| Flag | Default | Effect |
|---|---|---|
| `NBA_EVALUATION_RUNTIME_ENABLED` | `true` | master switch for the NBA Evaluation runtime |
| `NBA_EVALUATION_WORKER_ENABLED` | `true` | background worker claims and runs queued evaluations; **off ⇒ async dispatch stays `queued`**, use the sync endpoint |
| `NBA_EVALUATION_ENGINE_EPOCH` | `1` | must match Frappe `crm_nba_engine_revision` epoch; exactly one engine authoritative |
| `NBA_EVALUATION_WORKER_CONCURRENCY` | `2` | parallel worker slots |
| `NBA_EVALUATION_LEASE_S` | `300` | lease held while one evaluation runs |
| `NBA_EVALUATION_TIMEOUT_S` | `240` | hard cap per evaluation |
| `NBA_REASONING_ENABLED` | `true` | Layer 9 explanation render; **off ⇒ `explanation` is always `null`** |
| `NBA_REASONING_TIMEOUT_S` | `20` | explanation render timeout (falls back to `null`) |
| `NBA_WAIT_RECENT_CONTACT_HOURS` | `24` | kernel WAIT boundary — recent-contact suppression window |
| `NBA_WAIT_DEADLINE_OVERRIDE_DAYS` | `3` | kernel WAIT boundary — deadline override |
| `INTERACTION_INTAKE_ENABLED` | `false` | pipeline writes `CRM Interaction` via the canonical intake command vs. legacy direct create (either way the `after_insert` hook fires) |
| `AI_INSIGHT_WRITEBACK_ENABLED` | `false` | pipeline writes `ai_summary`/`ai_detected_interests`/`ai_risk_flags` onto `CRM Student` (CAS-guarded) |
| `FRAPPE_DELEGATION_REQUIRED` | `true` | require the HS256 delegation proof (production) |
| `RUNTIME_PROFILE` | `compat` | `core` = chat-only; `compat` = optional workloads enabled |

`docker-compose.yml` re-declares each var with a default; keep `.env.example` in
sync when adding fields.

### 8.6 Frappe site config flags (`bench set-config -g …` on `crm.localhost`)

| Key | Current on `crm.localhost` | Effect |
|---|---|---|
| `crm_nba_evaluation_runtime_enabled` | `1` | Frappe-side master switch for the evaluation control plane |
| `crm_nba_engine_revision` / epoch | `1` (cutover live) | selects the authoritative evaluation engine; legacy generation path fails closed |
| `crm_nba_domain_reevaluation_enabled` | **not set ⇒ `0` (OFF)** | **the gate for Chatwoot Flow 1 & 2.** `1` ⇒ `CRM Interaction` / `CRM Intent` inserts start a coalesced NBA re-evaluation |
| `crm_intelligence_manual_requests_per_actor_target` | `3` (default) | 360 manual-run quota count |
| `crm_intelligence_manual_request_window_minutes` | `60` (default) | 360 manual-run quota window |
| `crm_intelligence_force_rerun_roles` | `["System Manager"]` (default) | roles allowed to force a 360 re-run |
| `crm_agents_service_user` | `system@gmail.com` | the service identity used for fenced execution commands |

### 8.7 To turn ON the Chatwoot NBA re-evaluation flows

```bash
docker exec -u frappe -w /home/frappe/frappe-bench crm-dev-frappe-1 \
  bench --site crm.localhost set-config -g crm_nba_domain_reevaluation_enabled 1
```

That is the only switch. The wiring (`after_insert` hooks →
`dispatch_*_domain_reevaluation` → `record_domain_reevaluation_trigger` →
`request_domain_reevaluation`) is always present; the gate just decides whether
the last step runs. `INTERACTION_INTAKE_ENABLED` / `AI_INSIGHT_WRITEBACK_ENABLED`
are independent crm-agents-side toggles for how much the conversation pipeline
writes.

---

## 9. Data caveats (read before testing)

### 9.1 Environment

- **`crm.localhost` is a shared dev site, not disposable.** Other people use it.
  Do not bulk-delete, do not reset. Your test evaluations, decisions and Tasks
  persist and accumulate.
- Seed data: `crm.demo.seed_golden.golden_seed` — **5 students**
  `ENR-2026-00001..05` (lifecycle Lead → Lost) + **2 high schools**. That is the
  canonical fixture set; anything else may be another person's test data.
- Timezone is `Asia/Ho_Chi_Minh`. `generatedAt` from `list_student_worklist` is a
  naive `"YYYY-MM-DD HH:MM:SS"` string; `get_director_recommendations` returns
  ISO with offset. Normalize on the FE.

### 9.2 Immutability & append-only

- `CRM Recommendation` rows never change after commit. A "new" recommendation for
  a student is a **new evaluation** producing **new rows**; the old rows stay
  (terminal or superseded).
- `CRM Student Decision Event` is append-only. There is no "undo a decision" —
  a wrong accept is corrected by working/closing the Task, not by deleting the
  event.
- One accepted recommendation ⇒ exactly one `CRM Action Item`. Re-accepting
  (same idempotency key) does not create a second.

### 9.3 Cutover / epoch state

- The Recommendation → HITL → Task cutover is **live** on `crm.localhost`
  (`crm_nba_engine_revision` epoch = 1). The legacy Student-360-coupled
  generation path is dead (fails closed).
- **Pre-cutover history rows remain readable** but were produced by the old
  path — they may not carry the full new contract fields (`explanation`,
  `evaluation_key`, engine revision). Filter to recent evaluations when testing
  the new contract.

### 9.4 `explanation` can be `null`

- `null` whenever: the render pass hasn't run yet, `NBA_REASONING_ENABLED` is
  off, the render timed out, or the grounding validator rejected the output.
- `explanationSource` is only ever `"model"` or `null` in practice (`"facts"` is
  reserved, not produced).
- The FE must always have a working fallback from `aiPayload` + `reason`.

### 9.5 Worker on/off matters

- Async dispatch (`POST …/nba-evaluations/student`, `POST …/analysis-runs/*`)
  needs `NBA_EVALUATION_WORKER_ENABLED` / the Frappe scheduler running. If the
  worker is off, those runs sit at `queued` and never finish.
- The **sync** NBA endpoint (`…/student/run`) does not depend on the worker —
  it drives the run inline. Prefer it for interactive testing.
- School 360 in particular has **no sync endpoint** — with the worker off,
  `POST /analysis-runs/school` stays `queued`; drive it via `execute_stage`.

### 9.6 Visibility filtering (360)

- `visible_claims()` drops a whole claim if you can't resolve every cited
  source. Two users viewing the same run can legitimately see different claim
  counts. Never show "hidden claims" counts.
- `source_scoped` claims must not be forwarded into shareable exports.

### 9.7 Quotas & idempotency

- 360 manual run: 3 per hour per (actor, target). NBA manual run: subject to the
  same "one active run per student" coalescing — a second request while one is
  active returns 409, not a new run.
- Every write endpoint needs a client-generated key. Reuse the **exact** key on
  retry. A new key = a new operation.

### 9.8 Observational metrics

- All director analytics counts/rates are **descriptive history**, not causal or
  predictive. `meta.metricDisclaimer` / `metricKind: "observational"` MUST be
  rendered next to them. `confidence` / `currentProbability` /
  `projectedProbability` are placeholders — do not present as model output.

### 9.9 `aiPayload` shape is not frozen

- Stable within engine revision `nba-engine-r1`, but the key set is owned by the
  kernel, not this contract. Type it from a live response in your target
  environment and re-verify when the engine revision changes.

---

## 10. Never display

- Raw numeric `score` / `confidence` (from `aiPayload`, a claim, or anywhere).
  Rank + qualitative band only.
- The raw kernel JSON object as-is to end users.
- Any "approved to send / execute" framing on a recommendation or on
  `execution_guidance`. Execution authority = an accepted Task being worked.
- Director analytics counts/rates without the `metricDisclaimer` /
  "observational" wording next to them.
- Evaluation / run internal ids as primary identifiers to sales users (use
  student + action label).
- `source_scoped` 360 claims in any shareable/exported view.

---

## 11. Known limitations / open items (as of this handoff)

- `explanation` is only on `get_director_recommendations`, not on
  `list_student_worklist`. Use the sync run endpoint if you need it per-student,
  or raise a one-field add.
- `explanationSource` only ever emits `"model"` or `null` today.
- `aiPayload` exact key set is not frozen here — type it from a live response.
- Student and School analysis runs have independent id series — hence the
  required `run_kind` query param on the poll endpoint.
- `scripts/nba_live_e2e.py` is partly stale (references a removed analysis-run
  NBA sub-path).
- `crm.api.test_director_next_best_action` has known-stale test assertions
  against the changed director contract (pre-existing, flag-independent) — does
  not affect the runtime contract above.
- Domain re-evaluation trigger name strings (`"interaction"` / `"intent"`) vs the
  crm-agents kernel's `reevaluation_trigger` values are not yet cross-verified;
  degrades safely.
- Nothing is pushed to any remote yet.

---

## 12. Committed state

Both repos on branch `refactor/core-crm`, committed, **not pushed**.

| Repo | Commits (newest → oldest) |
|---|---|
| crm-agents | `5a8624a` (sync on-demand evaluation endpoint), `c748cd3`, `c625de6`, `3ece87f`, `6e1a6d5` |
| frappe-crm | `7859c80`, `0c94322`, `7aa94ae`, `1707c9b`, `65eb758`, `dc974c8` |

Cutover state is live: NBA Evaluation runtime + worker enabled, engine epoch = 1.
Pre-cutover history rows remain readable.

Verification at the `5a8624a` commit: crm-agents `pytest` green (incl. the 5 new
`test_nba_evaluations_api.py` tests); `ruff check` + `ruff format` clean. Earlier
commits: Frappe gate modules green (`test_nba_recommendation_commit` 27/27,
`test_recommendation_decision` 36/36, `test_nba_reevaluation` 9/9,
`test_agent_events_domain_reevaluation` 9/9, `test_nba_epoch_exclusion` 5/5,
`test_student_worklist` 35/35); `bench migrate` clean; `yarn build` OK; full live
E2E cycle (evaluate → commit → explanation persisted → accept → 1 Task,
explanation byte-identical through accept).
