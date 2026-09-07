# Director Lead list API

Endpoint: `GET /api/method/crm.api.director_leads.get_director_leads`

The endpoint returns the existing `{ data, meta }` envelope and keeps the
current authentication, search, status, campaign, sorting, and pagination
parameters.

Each `data` row includes the fields used by the Lead list:

| Field | Meaning |
| --- | --- |
| `status` / `statusCode` | Form Submission Status enum, sourced from `CRM Lead.processing_status`: `NEW`, `PROCESSED`, `ASSIGNED`, or `CLOSED`. |
| `result` | Lead resolution from `CRM Lead.resolution`: `MATCHED`, `CREATED`, `DUPLICATE`, `INVALID`, `SPAM`, `FAILED`, or `""` while pending. |
| `processingStatus` | Backward-compatible alias of the server-managed status value. |
| `contactNoAnswer` | Number of failed/no-answer call attempts. |
| `contactSuccess` | Number of connected call attempts. |
| `createdAt` | Lead creation timestamp in ISO-8601 format. |

Contact counts are assembled in batch from Call Logs linked to the Lead and
CRM Interaction phone-call records. Interactions referencing an already
counted Call Log are ignored to avoid double counting. Missing optional call
history returns zero counts and does not make the Lead list unavailable.
