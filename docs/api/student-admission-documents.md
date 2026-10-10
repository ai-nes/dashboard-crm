# Student admission document upload API

## Endpoint

`POST /api/v1/admission-profile/documents`

The request is `multipart/form-data`:

| Field | Type | Required | Description |
|---|---|---:|---|
| `student` | string | Yes | Canonical CRM student reference. |
| `profile` | string | Yes | Student admission profile id. |
| `document_type` | string | Yes | Document type id from the active profile checklist. |
| `application` | string | No | Application id; when supplied it must belong to the profile. |
| `file` | file | Yes | Uploaded private document. |

The endpoint verifies that the profile belongs to the student and that the
document type is allowed by the profile template. Each upload creates the next
document version; earlier versions are kept.

## Response

```json
{
  "document": {
    "id": "SDOC-2026-00001",
    "student": "CRMC-2026-00001",
    "profile": "SAP-2026-00001",
    "documentType": "DOC-2026-00013",
    "application": "CAA-2026-00001",
    "file": "/private/files/enrollment-form.pdf",
    "isPrivate": true,
    "status": "Uploaded",
    "version": 1
  },
  "file": {
    "id": "file-hash",
    "fileName": "enrollment-form.pdf",
    "fileUrl": "/private/files/enrollment-form.pdf",
    "isPrivate": true
  },
  "documentCompleteness": { "total": 7, "completed": 1 }
}
```

Send the session cookie (`credentials: "include"`); no CSRF token is needed. Do not
set `Content-Type` yourself, so the browser adds the multipart boundary. Document links
in the UI resolve relative `fileUrl` values against the API origin.

Related application commands under `/api/v1/admission-profile`:

| Method | Path | Body |
| --- | --- | --- |
| `POST` | `/applications` | `{ student, values, expectedRevision, idempotencyKey }` |
| `PUT` | `/applications/{id}` | `{ values }` |
| `PUT` | `/applications/{id}/preference` | `{ preference }` |