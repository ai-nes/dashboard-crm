# Activity Log API contract

This document describes the contract used by the Admin Activity Log screen at
`/director/admin/activity-logs`.

Sources of truth:

- Backend method: `frappe-crm/crm/api/activity_log.py`
- Frontend service and types: `src/services/api/activity-log/index.ts` and
  `src/services/api/activity-log/types.ts`
- Frontend route: `src/app/(with-layouts)/(dashboard)/director/admin/activity-logs/page.tsx`

## Endpoint and access

```http
POST {FRAPPE}/api/method/crm.api.activity_log.get_activity_logs
Cookie: sid=<Frappe session cookie>
X-Frappe-CSRF-Token: <csrf token>
Accept: application/json
Content-Type: application/json
```

The successful response is wrapped by Frappe under `message`. The endpoint is
read-only and requires the session to have the `System Manager` or
`Administrator` role. The frontend route uses the same role gate. Other users
receive a permission error before activity sources are queried.

## Request

```json
{
  "module": "segment",
  "actor": "user@example.com",
  "role": "System Manager",
  "severity": "critical",
  "start_date": "2026-09-01",
  "end_date": "2026-09-10",
  "start": 0,
  "page_length": 50
}
```

| Field | Type | Required | Semantics |
|---|---|---:|---|
| `module` | string | Yes | One of `all`, `auth`, `lead_student`, `segment`, `campaign_nba`, `permissions`. `all` combines every module. |
| `actor` | string | No | Partial search against the actor’s full name or email/username. |
| `role` | string | No | Filters by the user’s current Frappe role membership; historical roles are not reconstructed. |
| `severity` | `info \| critical` | No | Filters by the classified activity severity. |
| `start_date` | date/datetime string | No | Defaults to seven days before the effective end. |
| `end_date` | date/datetime string | No | Defaults to the current time. A date-only value includes the whole calendar day by advancing the exclusive upper bound by one day. |
| `start` | non-negative integer | No | Offset; defaults to `0`. |
| `page_length` | positive integer | No | Page size; defaults to `50`, capped at `100`. |

`start_date` must not be after `end_date`. Results are sorted newest first by
`occurred_at`, then `event_id`, and pagination is applied after combining the
available sources.

## Module coverage

| Module | Backend sources |
|---|---|
| `auth` | Frappe `Activity Log` login/logout rows, when the table exists. |
| `all` | All sources listed below, including authentication rows. |
| `lead_student` | `Version` and `Deleted Document` for `CRM Lead` and `CRM Student`. |
| `segment` | `Version` and `Deleted Document` for `CRM Segment`. |
| `campaign_nba` | `Version` and `Deleted Document` for `CRM Campaign` and `CRM Action Item`. |
| `permissions` | `Version` and `Deleted Document` for `User`; only `roles` and `enabled` changes are exposed from `Version`. |

The API reads existing audit sources. It does not create a second event store
or retroactively reconstruct events that those sources do not contain.

## Response

```json
{
  "message": {
    "logs": [
      {
        "event_id": "Version-0001:0",
        "action": "updated",
        "change_type": "changed",
        "doctype": "CRM Segment",
        "docname": "SEG-0001",
        "fieldname": "is_public",
        "field_label": "Is Public",
        "old_value": 0,
        "new_value": 1,
        "owner": "user@example.com",
        "owner_full_name": "Example User",
        "occurred_at": "2026-09-10 10:00:00",
        "source": "Version",
        "source_name": "Version-0001",
        "event_type": "field_changed",
        "category": "data",
        "severity": "critical"
      }
    ],
    "total": 1,
    "start": 0,
    "page_length": 50,
    "module": "segment",
    "tracked": true
  }
}
```

`logs` is an array of normalized entries. `total` is the number of combined
matching events before pagination; `start` and `page_length` echo the effective
pagination values. `module` echoes the validated module. `tracked` is `false`
when the selected module has a mapped DocType whose `track_changes` setting is
disabled or cannot be read. For `auth`, `tracked` remains true because the
module is not backed by a tracked DocType.

### `ActivityLogEntry`

| Field | Type | Semantics |
|---|---|---|
| `event_id` | string | Stable UI key within the source record, such as `Version name:index` or `deletion:name`. |
| `action` | string | `updated` for field changes, `deleted` for deleted records, `created` for login, and `updated` for logout. |
| `change_type` | string/null | `added`, `removed`, or `changed` for field changes; `null` for record/auth events. |
| `doctype` | string/null | Referenced DocType; `null` for authentication events. |
| `docname` | string/null | Referenced document name; `null` for authentication events. |
| `fieldname` / `field_label` | string/null | Changed field and its label; `null` when there is no field change. |
| `old_value` / `new_value` | any/null | Values before and after a field change. Auth events use `new_value` for the source status. |
| `owner` / `owner_full_name` | string/null | Actor identifier and cached display name. |
| `occurred_at` | datetime string | Source creation timestamp. |
| `event_type` | string | Classification such as `field_changed`, `assignment_changed`, `permissions_changed`, `record_deleted`, or `<login|logout>_recorded`. |
| `category` | string | Classification such as `data`, `assignment`, `permissions`, `record`, or `authentication`. |
| `severity` | `info \| critical` | `critical` for deletions and selected sensitive fields; otherwise `info`. |

Sensitive field classifications include ownership/team/pool changes on Lead and
Student, `is_public`/`status` changes on Segment, Campaign status changes, and
User `roles`/`enabled` changes. The exact field metadata remains backend-owned.

## Errors

The endpoint returns a Frappe error response for:

- missing or insufficient administrator access;
- an unknown `module`;
- non-integer or negative `start`;
- non-positive or otherwise invalid `page_length`;
- `start_date` later than `end_date`.

The frontend maps transport failures to `ActivityLogApiError`; it must preserve
the empty result and `tracked: false` states instead of silently substituting
mock activity data.
