# Director Lead list API

Endpoint: `GET /api/method/crm.api.director_leads.get_director_leads`

The endpoint returns the existing `{ data, meta }` envelope and keeps the
current authentication, search, processing status, resolution, campaign, sorting, and pagination
parameters.

Rows are grouped by the processing workflow in this order: `NEW`, `PROCESSING`,
`PROCESSED`, `ASSIGNED`, then `CLOSED`. Within each status, the requested `order`
is applied to `modified`, followed by `name` as a stable tie-breaker. Grouping is
performed by the backend before pagination so statuses do not become mixed between pages.

Each `data` row includes the fields used by the Lead list:

| Field | Meaning |
| --- | --- |
| `status` / `statusCode` | Lead processing status enum, sourced from `CRM Lead.processing_status`: `NEW`, `PROCESSING`, `PROCESSED`, `ASSIGNED`, or `CLOSED`. |
| `result` | Lead resolution from `CRM Lead.resolution`: `MATCHED`, `CREATED`, `DUPLICATE`, `INVALID`, `SPAM`, `FAILED`, or `""` while pending. |
| `processingStatus` | Backward-compatible alias of the server-managed status value. |
| `contactNoAnswer` | Number of failed/no-answer call attempts. |
| `contactSuccess` | Number of connected call attempts. |
| `createdAt` | Lead creation timestamp in ISO-8601 format. |

Contact counts are assembled in batch from Call Logs linked to the Lead and
CRM Interaction phone-call records. Interactions referencing an already
counted Call Log are ignored to avoid double counting. Missing optional call
history returns zero counts and does not make the Lead list unavailable.

List filters:

- `q`: searches Lead id/code, student name, phone, email, high school, owner, and source.
- `status`: filters `CRM Lead.processing_status` by `NEW`, `PROCESSING`, `PROCESSED`, `ASSIGNED`, or `CLOSED`.
- `resolution`: filters `CRM Lead.resolution` by `PENDING`, `MATCHED`, `CREATED`, `DUPLICATE`, `INVALID`, `SPAM`, or `FAILED`.

## Lead detail activity

The Lead detail page loads activity tabs lazily with these permission-scoped
endpoints:

- Calls: `GET /api/method/crm.api.director_students.get_lead_call_logs?lead_id=<id>`
- Notes: the dashboard uses the permission-scoped generic methods
  `crm.api.note.list_notes`, `create_note`, `update_note`, and `delete_note`
  with `reference_doctype=CRM Lead`; the Lead-specific aliases
  `list_lead_notes`, `get_lead_note`, `create_lead_note`, `update_lead_note`,
  and `delete_lead_note` are available for integrations.
- Audit: `GET /api/method/crm.api.audit.get_lead_audit_logs?lead_id=<id>&start=0&page_length=100`

Notes require non-empty text content up to 20,000 characters. The audit
response is read-only and includes creation, tracked field changes, lifecycle,
assignment, processing, and deletion events for the Lead.

## Convert Lead to Student

Endpoint: `POST /api/method/crm.api.lead_processing.convert_to_student`

Request body:

```json
{ "lead": "HS-2026-HCM-000091" }
```

Only `Sale`, `CTV Sale`, and `Lead Sale` may call this endpoint. `Sale` and `CTV Sale`
may convert only their assigned Leads; `Lead Sale` may convert any Lead in scope. The
backend also accepts only a Lead with `processing_status=ASSIGNED` and complete
conversion data, including `high_school` and `major`. It creates a new `CRM Student`
with `student_stage=New`, then closes the Lead with `resolution=CREATED`. The operation
is transactional: a failed conversion leaves the Lead assigned and does not leave a
partial Student.

Successful response (inside Frappe's `message` envelope):

```json
{
  "status": "CLOSED",
  "resolution": "CREATED",
  "lead": "HS-2026-HCM-000091",
  "student": "STU-2026-000001",
  "student_stage": "New"
}
```
