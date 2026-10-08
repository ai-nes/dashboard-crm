# Activity Log API contract

This document describes the contract used by the Admin Activity Log screen at
`/director/admin/activity-logs`.

Sources of truth:

- Backend: the `activity-logs` module of `crm-backend`.
- Frontend service and types: `src/services/api/activity-log/index.ts` and
  `src/services/api/activity-log/types.ts`.
- Frontend route: `src/app/(with-layouts)/(dashboard)/director/admin/activity-logs/page.tsx`.

## Endpoint and access

```http
GET /api/v1/activity-logs
Cookie: <Better Auth session cookie>
Accept: application/json
```

The endpoint is read-only and requires an administrator session. The frontend
route uses the same gate. Other users receive `403 FORBIDDEN` before any activity
source is queried.

## Request

Query parameters:

| Field | Type | Required | Semantics |
|---|---|---:|---|
| `module` | string | Yes | One of `all`, `auth`, `lead_student`, `segment`, `campaign_nba`, `permissions`. `all` combines every module. |
| `actor` | string | No | Partial search against the actor's name or email. |
| `role` | string | No | Filters by the user's current role; historical roles are not reconstructed. |
| `severity` | `info \| critical` | No | Filters by the classified severity. |
| `startDate` | date/datetime string | No | Defaults to seven days before the effective end. |
| `endDate` | date/datetime string | No | Defaults to now. A date-only value includes the whole calendar day. |
| `start` | non-negative integer | No | Offset; defaults to `0`. |
| `pageLength` | positive integer | No | Page size; defaults to `50`, capped at `100`. |

`startDate` must not be after `endDate`. Results are sorted newest first by
`occurredAt`, then `eventId`, and pagination is applied after combining the
sources.

## Module coverage

| Module | Sources | Notes |
|---|---|---|
| `auth` | Recorded sign-ins (`login_recorded`, category `authentication`). | `tracked: true`. |
| `lead_student` | Lead processing-status changes, lead and student ownership changes. | `tracked: true`. |
| `permissions` | User role changes and permission-profile changes (`permissions_changed`). | `tracked: true`. |
| `segment` | Not recorded as events by the backend yet. | Always `logs: []`, `tracked: false`. |
| `campaign_nba` | Not recorded as events by the backend yet. | Always `logs: []`, `tracked: false`. |
| `all` | Every tracked source above. | `tracked: true`. |

The API derives entries from the event tables the backend already keeps; there is
no generic field-version store to replay, so it never reconstructs events those
tables do not hold. The per-record views ([student-audit](student-audit.md)) cover
more sources (timeline, tasks, attachments, SLA).

## Response

Entries use camelCase. The dashboard service also accepts snake_case keys and
normalizes both to `ActivityLogEntry` (`snake_case` below is the normalized UI shape).

```json
{
  "logs": [
    {
      "eventId": "auth:7f3a",
      "action": "created",
      "changeType": null,
      "doctype": "Session",
      "docname": "user-id",
      "fieldname": null,
      "fieldLabel": null,
      "oldValue": null,
      "newValue": "Success",
      "owner": "user-id",
      "ownerFullName": "Example User",
      "occurredAt": "2026-09-10T10:00:00.000Z",
      "source": "Session",
      "sourceName": "7f3a",
      "eventType": "login_recorded",
      "category": "authentication",
      "severity": "info",
      "content": null,
      "subject": null,
      "reason": null,
      "metadata": null
    }
  ],
  "total": 1,
  "start": 0,
  "pageLength": 50,
  "module": "auth",
  "tracked": true
}
```

`total` is the number of combined matching events before pagination; `start` and
`pageLength` echo the effective pagination. `module` echoes the validated module.
`tracked` is `false` for the modules the backend does not record yet.
### `ActivityLogEntry`

| Field | Type | Semantics |
|---|---|---|
| `event_id` | string | Stable id of the event, prefixed by its source. |
| `action` | `created \| updated \| deleted` | `created` for sign-in and creation events. |
| `change_type` | string/null | `added`, `removed` or `changed` for field changes; `null` for record and auth events. |
| `doctype` / `docname` | string/null | Referenced record type and id; `null` for authentication events. |
| `fieldname` / `field_label` | string/null | Changed field and its label; `null` when no field changed. |
| `old_value` / `new_value` | any/null | Values before and after a field change. |
| `owner` / `owner_full_name` | string/null | Actor identifier and display name. |
| `occurred_at` | datetime string | Event timestamp. |
| `event_type` | string | For example `assignment_changed`, `processing_status_changed`, `permissions_changed`, `login_recorded`. |
| `category` | string | `assignment`, `processing`, `permissions`, `record` or `authentication`. |
| `severity` | `info \| critical` | Classified by the backend: `critical` for permission and ownership changes, otherwise `info`. |

The exact severity classification stays backend-owned.

## Errors

The error envelope is `{ "error": { "code", "message" } }`. Expect it for missing
or insufficient administrator access, an unknown `module`, a negative `start`,
an invalid `pageLength`, or `startDate` later than `endDate`.

The frontend maps transport failures to `ActivityLogApiError`; it must keep the
empty result and `tracked: false` states instead of substituting mock activity.