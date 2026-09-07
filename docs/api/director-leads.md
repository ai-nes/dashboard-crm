# Director Lead list API

Endpoint: `GET /api/method/crm.api.director_leads.get_director_leads`

The endpoint returns the existing `{ data, meta }` envelope and keeps the
current authentication, search, processing status, resolution, campaign, sorting, and pagination
parameters.

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
