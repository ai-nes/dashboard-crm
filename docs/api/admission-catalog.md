# Admission catalog administration API

The admin student-configuration screen manages the master data behind admission
profile templates. All paths are under `/api/v1/admission-catalog`; every request
needs the session cookie.

## Document types

| Method | Path | Notes |
| --- | --- | --- |
| `GET` | `/document-types` | Query: `search`, `include_archived` (`1`/`0`), `status`, `start`, `page_length`. Answers `{ documentTypes: [{ id, code, name, category, description, conditionalKey, status, isActive, modified }], total, start, pageLength }`. |
| `POST` | `/document-types` | Body: `{ data }` with `code`, `label`, `category`, `description`, `conditional_key`, `status`, `is_active`. |
| `PATCH` | `/document-types/{id}` | Body: `{ data, expectedModified }`. |
| `DELETE` | `/document-types/{id}` | Query: `expectedModified`. Answers `{ deleted }`. |

Codes are immutable. A referenced document type cannot be deleted; archive it.

## Admission methods

| Method | Path | Notes |
| --- | --- | --- |
| `GET` | `/methods` | Query: `search`, `include_disabled` (`1`/`0`), `enabled`, `start`, `page_length`. Answers `{ methods: [{ id, code, name, description, enabled, sortOrder, modified }], total, start, pageLength }`. |
| `POST` | `/methods` | Body: `{ data }` with `code`, `display_name`, `description`, `enabled`, `sort_order`. |
| `PATCH` | `/methods/{id}` | Body: `{ data, expectedModified }`. |
| `DELETE` | `/methods/{id}` | Query: `expectedModified`. |

Codes are immutable. A referenced method cannot be deleted; disable it.

## Profile templates and catalog

| Method | Path | Notes |
| --- | --- | --- |
| `GET` | `/profile-templates` | Query: `status`, `search`, `template_kind`, `start`, `page_length`. Answers `{ templates, documentTypes, total, start, pageLength }`. |
| `POST` | `/profile-templates` | Body: `{ data }`. |
| `PATCH` | `/profile-templates/{id}` | Body: `{ data, expectedModified }`. |
| `POST` | `/profile-templates/{id}/transition` | Body: `{ status, expectedModified }`. |
| `DELETE` | `/profile-templates/{id}` | Query: `expectedModified`. |
| `GET` | `/profile-catalog` | Query: `admission_year`, `search`. Answers `{ methods, years, offerings, documentTypes, templates, specialTemplates }`. |

Mutations require an authenticated user with the matching permission profile.
Types: `src/services/api/admission-profile-catalog/types.ts`.