# Admission catalog administration API

The admin student configuration screen uses these authenticated Frappe methods to manage the
master data referenced by admission profile templates.

## Document types

- `crm.api.admission_catalog.list_admission_document_types`
  - Query: `search?`, `include_archived?` (`1`/`0`)
  - Response: `{ "documentTypes": [{ "id", "code", "name", "category", "description", "conditionalKey", "status", "isActive", "modified" }] }`
- `crm.api.admission_catalog.create_admission_document_type`
- `crm.api.admission_catalog.update_admission_document_type`
- `crm.api.admission_catalog.delete_admission_document_type`

Create and update accept a `data` object with `code`, `label`, `category`, `description`,
`conditional_key`, `status`, and `is_active`. Updates and deletes also accept `name` and the
optional `expected_modified` value used for optimistic concurrency. Document type codes are
immutable. A referenced document type cannot be deleted; archive it instead.

## Admission methods

- `crm.api.admission_catalog.list_admission_methods`
  - Query: `search?`, `include_disabled?` (`1`/`0`)
  - Response: `{ "methods": [{ "id", "code", "name", "description", "enabled", "sortOrder", "modified" }] }`
- `crm.api.admission_catalog.create_admission_method`
- `crm.api.admission_catalog.update_admission_method`
- `crm.api.admission_catalog.delete_admission_method`

Create and update accept a `data` object with `code`, `display_name`, `description`, `enabled`,
and `sort_order`. Updates and deletes also accept `name` and the optional `expected_modified`
value. Admission method codes are immutable. A referenced method cannot be deleted; disable it
instead.

All mutation methods require an authenticated user and enforce the DocType permissions in Frappe.
