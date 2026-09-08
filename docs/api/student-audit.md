# Student / Lead audit API

## Read-only endpoints

Both endpoints return the same additive audit projection. The Lead endpoint keeps
`lead_id` in the response for compatibility:

- `crm.api.audit.get_student_audit_logs` with `student`
- `crm.api.audit.get_lead_audit_logs` with `lead_id`

Supported query parameters are `start` and `page_length` (maximum `100`). The
backend checks read permission for the requested Lead/Student and related records.

The projection combines a Lead and its canonical Student when linked. It includes
document creation, Version changes, status/assignment history, deleted documents,
Comment, Communication/Email, File attachments, Call Log, FCRM Note, Task, CRM
Action Item, CRM Interaction, and lifecycle, ownership, outcome, marketing, SLA,
decision, consent and conversion events.

Rows keep the existing audit envelope and may contain `content`, `subject`, and
source-specific `metadata`. The API is read-only and does not modify related data.
