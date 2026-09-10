# Student admission document upload API

## Endpoint

`POST /api/method/crm.api.student_documents.upload_document`

The request uses `multipart/form-data` and must include:

| Field | Type | Required | Description |
|---|---|---:|---|
| `student` | string | Yes | Canonical CRM Student reference. |
| `profile` | string | Yes | `CRM Student Admission Profile` name. |
| `document_type` | string | Yes | `CRM Document Type` name from the active profile checklist. |
| `application` | string | No | Optional application; when supplied it must belong to the profile. |
| `file` | file | Yes | Uploaded private document. |

The endpoint verifies that the profile belongs to the student and that the
document type is allowed by the selected Profile Template. Each upload creates
the next `CRM Student Document.version`; previous versions are retained.

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
  "documentCompleteness": {
    "total": 7,
    "completed": 1
  }
}
```

The browser client must send the session cookie and Frappe CSRF token. The
Dashboard service handles both automatically.
