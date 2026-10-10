# Director lead list API

Endpoint: `GET /api/v1/leads`

The endpoint answers `{ data, meta }` and is limited to the leads inside the caller's lead access scope.

## Query

| Parameter | Type | Default | Semantics |
| --- | --- | --- | --- |
| `page` | integer | `1` | 1-based page. |
| `pageSize` | integer | `20` | 1–100. |
| `q` | string | — | Searches lead code, student name, phone and email. |
| `status` | `NEW \| PROCESSING \| PROCESSED \| ASSIGNED \| CLOSED` | — | Filters the processing status. |
| `resolution` | `PENDING \| MATCHED \| CREATED \| DUPLICATE \| INVALID \| SPAM \| FAILED` | — | Filters the resolution. |
| `campaign` | string | — | Campaign id, title or stable code. |
| `admissionYear` | `YYYY` | — | Restricts to one admission year. |
| `order` | `asc \| desc` | `desc` | Sort direction on creation time (then id). |

Rows are ordered by creation time in the requested direction; there is no
grouping by status, so a status filter is the way to see one workflow stage.

## Row

| Field | Meaning |
| --- | --- |
| `id`, `leadCode` | Lead identifiers. |
| `name`, `phone`, `school`, `source` | Student name, phone, high school, source or campaign title. |
| `status` / `processingStatus` | Processing status enum (`NEW` … `CLOSED`); both keys hold the same value. |
| `result` | Resolution: `MATCHED`, `CREATED`, `DUPLICATE`, `INVALID`, `SPAM`, `FAILED` or `PENDING`. |
| `owner`, `ownerUserId`, `owningTeam`, `owningTeamId` | Current assignee and team. |
| `revision`, `ownershipRevision` | Version to send back with state changes. |
| `createdAt` | Creation time, ISO-8601. |

`meta` carries `total` (rows matching the filters), `totalAll` (all rows in
scope), `pendingNew`, `readyToAssign`, `page`, `pageSize`, `totalPages`,
`hasNextPage`, the echoed filters, and `statusOptions` / `resolutionOptions`
for the filter controls. Contact counters are not part of the list row.

## Lead detail activity

The detail page loads its tabs lazily from permission-scoped endpoints:

| Tab | Endpoint |
| --- | --- |
| Overview | `GET /api/v1/leads/{id}` and `GET /api/v1/leads/{id}/timeline` |
| Calls | `GET /api/v1/leads/{id}/calls` (and `POST` to log a call). Works before conversion; after conversion calls linked to the student are included. |
| Notes | The shared note resource `/api/v1/notes` (`GET`, `POST`, `GET/PATCH/DELETE /{id}`) with `referenceDoctype=CRM Lead` and `referenceDocname=<lead id>`; `POST /api/v1/leads/{id}/notes` also adds one. |
| Comments | `POST /api/v1/leads/{id}/comments` |
| Audit | `GET /api/v1/leads/{id}/audit-logs?start=0&pageLength=100` — see [student-audit](student-audit.md). |

Notes need non-empty text up to 20,000 characters. The audit response is read-only.

## Lead commands

`POST /api/v1/leads/{id}/process`, `/status`, `/reopen`, `/assign`,
`GET /api/v1/leads/{id}/assignment-targets`, `POST /api/v1/leads/auto-assign`,
`POST /api/v1/leads/process-new` and `/process-new/preview`. Bodies carry the
`revision` read earlier; a stale value answers `409`.

## Convert lead to student

`POST /api/v1/leads/{id}/convert` (no body).

Only `Sale`, `CTV Sale` and `Lead Sale` may call it. Sale and CTV Sale may convert
only their own leads; Lead Sale may convert any lead in scope. The lead must be
`ASSIGNED` with complete conversion data (including high school and major). The
conversion is transactional and idempotent: a failed conversion leaves the lead
assigned and creates no partial student, and converting an already converted lead
answers the existing student with `meta.replayed: true`.

Success answers `{ data: <student>, meta: { requestId, replayed? } }`. The dashboard
(`convertLeadToStudent`) maps it back to the summary the screen shows (`student_stage` defaults to `New`):

```json
{ "status": "CLOSED", "resolution": "CREATED", "lead": "HS-2026-HCM-000091", "student": "STU-2026-000001", "student_stage": "New" }
```

Errors: `403 FORBIDDEN` (profile), `404 LEAD_NOT_FOUND`, `409 LEAD_NOT_ASSIGNED`.