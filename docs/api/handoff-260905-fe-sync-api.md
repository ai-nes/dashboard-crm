# FE handoff: Student/School 360 synchronous API

## Status
Live, verified end-to-end at the code-execution level (see "Known issue" below
for the one open item before FE cutover).

## What changed
Student 360 and School 360 no longer need a webhook + poll loop. Each domain
now has one synchronous endpoint that returns the settled report in the same
HTTP response — same shape as the existing NBA sync endpoint
(`POST /api/v1/nba-evaluations/student/run`).

## Endpoints

### `POST /api/v1/analysis-runs/student/run`

Headers: `X-API-Key`, `Authorization: Bearer <oauth-bearer>`,
`X-Frappe-Delegation: <proof>`, `Idempotency-Key` (8-140 chars,
`[A-Za-z0-9._:-]`), `Content-Type: application/json`.

Body:
```json
{
  "student_id": "ENR-2026-00003",
  "force_rerun_reason": "optional, 10-500 chars, only to bypass a fresh cached run"
}
```

Response (200):
```json
{
  "run_id": "rvlglthkhc",
  "student_id": "ENR-2026-00003",
  "status": "completed",
  "report": {
    "advisory_signals": [
      {
        "type": "Academic Readiness",
        "title": "Kết quả học tập lớp 12 đạt hạn cao",
        "summary": "...",
        "confidence": "HIGH",
        "evidence_refs": ["score:SCH-2026-00003", "application:APP-2026-00001"]
      }
    ],
    "risks": [
      {
        "code": "INCOMPLETE_DOCS",
        "severity": "LOW",
        "title": "Còn thiếu tài liệu hồ sơ",
        "summary": "...",
        "evidence_refs": ["application:APP-2026-00001"]
      }
    ],
    "opportunity_signals": [
      {
        "code": "HIGH_FIT_INTEREST",
        "strength": "HIGH",
        "title": "...",
        "summary": "...",
        "evidence_refs": ["score:SCH-2026-00003"]
      }
    ],
    "recent_changes": [
      {
        "type": "Lifecycle Progression",
        "summary": "Hồ sơ đã tiến triển từ Lead → MQL → Applicant (từ 04/09/2026).",
        "evidence_refs": ["lifecycle:c148e19411040a5fbfc2"]
      }
    ]
  },
  "terminal_reason": null
}
```

`status` is one of `completed`, `abstained`, `failed`, `dead_lettered`.
When not `completed`, `report` is `null` and `terminal_reason` names why
(e.g. `student_analysis_model_timeout`, `evidence_access_denied`). Render
`terminal_reason` as a retryable-error state in the UI, not a hard failure —
the caller can retry with a fresh `Idempotency-Key`.

### `POST /api/v1/analysis-runs/school/run`

Same shape, with `high_school` (+ optional `admission_year`) instead of
`student_id`, and the response's echo field is `"high_school"` instead of
`"student_id"`.

### Notes for the FE caller
- One HTTP round trip drives the whole pipeline inline (lease claim → evidence
  fetch → model call → settle). No polling, no webhook callback to listen for.
- Typical latency: ~15-20s (one Bedrock call). Set the FE request timeout to
  at least 60s to match the server's own inline drive budget.
- `GET /api/v1/analysis-runs/{run_id}?run_kind=student|school` still exists
  read-only, for audit/history views — not needed for the "Analyse now" flow.
- Reusing the same `Idempotency-Key` + inputs returns the same settled run
  without re-invoking the model (cheap retry-safe polling from the FE if a
  request times out client-side).

## Known issue (blocks FE cutover until resolved)
The delegated-caller auth path (`X-Frappe-Delegation` proof minted via the
local Sale-user login flow) currently gets `403 { "detail": "analysis target
is not permitted" }` on `/analysis-runs/student/run` in this local Docker
environment — even for a student explicitly owned by that Sale user
(`owner_staff` match confirmed). This is **not** specific to Student 360: the
already-shipped NBA sync endpoint (`/nba-evaluations/student/run`) returns
the identical `403 { "detail": "evaluation target is not permitted" }` for
the same credential and student. It is a pre-existing delegated-session
capability/permission-scoping gap in this dev environment, unrelated to this
change. The underlying execution path (claim → evidence → model → settle) is
proven working via the service-identity path (see the live report above).
Needs separate investigation on the Frappe side (delegated-session
capability manifest / `crm.api.intelligence_runs.request_student_analysis_run`
permission check) before FE can call this with a real logged-in user session.

## Env settings (crm-agents)

No new settings were added. These existing ones govern the sync path and are
worth the FE/infra owner knowing about, since they now sit on the request's
hot path (previously only the background worker's retry budget):

| Setting | Current value | Purpose |
|---|---|---|
| `ANALYSIS_RUN_MODEL_TIMEOUT_S` | `45` | Per-call Bedrock timeout for the Student/School 360 model call. Raised from `20` after live evidence showed real calls take ~15-19s. |
| `ANALYSIS_RUN_STAGE_TIMEOUT_S` | `60` | Wall-clock budget for one stage execution (evidence + model + settle). |
| `ANALYSIS_RUN_STAGE_LEASE_S` | `90` | How long a claimed stage lease is held before another caller/worker can reclaim it. |

`ANALYSIS_RUN_MODEL_MAX_TOKENS` was removed entirely (it does not exist
anymore in `app/config.py`, `.env`, `.env.example`, or `docker-compose.yml`).
It previously capped the model's structured output at a fixed token budget
and was the root cause of a truncation bug; Student 360 now matches NBA and
School 360, which never capped `max_tokens`.

`ANALYSIS_RUN_WORKER_ENABLED` / `ANALYSIS_RUN_WORKER_POLL_S` /
`ANALYSIS_RUN_WORKER_CONCURRENCY` / `ANALYSIS_RUN_MAX_ATTEMPTS` govern the
legacy background worker and webhook ingress, which this plan's phase 3
removes — do not build new FE/infra dependencies on them.
