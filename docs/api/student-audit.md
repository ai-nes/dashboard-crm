# Student / lead / segment audit API

## Read-only endpoints

| Method | Path |
| --- | --- |
| `GET` | `/api/v1/students/{id}/audit-logs` |
| `GET` | `/api/v1/leads/{id}/audit-logs` |
| `GET` | `/api/v1/segments/{id}/audit-logs` |

All three return the same additive audit projection. Query parameters are
`start` and `pageLength` (maximum `100`, default `100`). The backend checks read
permission for the requested record and its related records.

The projection combines a lead and its canonical student when linked. It covers
creation, field changes, status and assignment history, deletions, comments,
messages, attachments, calls, notes, tasks, actions, interactions and the
lifecycle, ownership, outcome, marketing, SLA, decision, consent and conversion
events.

Rows keep the audit envelope (`eventId`, `occurredAt`, `action`, `sourceName`,
`changeType`) and may carry `content`, `subject` and source-specific `metadata`.
The endpoints never modify data. Types: `src/services/api/student-audit/types.ts`.