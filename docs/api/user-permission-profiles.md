# User permission profiles API

The CRM user-management permission tab reads and updates the existing Frappe
`CRM Permission Profile` records. Frappe remains the authorization source of
truth and synchronizes managed `DocPerm` rows after a successful update.

## Authentication

Both methods require the authenticated Frappe session to be a System Manager.
The platform `Administrator` session is accepted by Frappe's existing system
manager authority.

## Session permissions for UI actions

`GET /api/method/crm.api.session.me` also returns the effective DocType flags
for the authenticated session in `crm_doctype_permissions`:

```json
{
  "crm_doctype_permissions": {
    "CRM Student": {
      "row_scope": "assigned",
      "read": true,
      "write": true,
      "create": false,
      "delete": false,
      "export": false
    }
  }
}
```

The dashboard uses `create`, `write`, and `delete` from this payload to render
or hide CUD controls. It must not infer those flags from role names. The
backend remains authoritative and can still return `403` for a stale or
manipulated client session.

## List profiles

`GET /api/method/crm.api.permission_profile.list_permission_profiles`

Query parameters:

- `role` (optional): selected managed CRM role. When omitted, the first active
  managed profile is selected.
- `start` (default `0`): zero-based offset in the selected role's DocType
  matrix.
- `page_length` (default `8`, maximum `100`): number of DocType rows to return.

Response envelope:

```json
{
  "message": {
    "selected_role": "Sale",
    "total": 32,
    "start": 0,
    "page_length": 8,
    "profiles": [
      {
        "name": "Sale",
        "role": "Sale",
        "row_scope": "assigned",
        "delete_requires_ownership": true,
        "is_system_managed": true,
        "applicable_doctypes": [
          {
            "document_type": "CRM Student",
            "read": true,
            "write": true,
            "create": false,
            "delete": false,
            "export": false
          }
        ]
      }
    ]
  }
}
```

The response includes active managed CRM roles only. Profile metadata is
returned for every role, while `applicable_doctypes` contains the requested
page only for `selected_role`; other profiles return an empty matrix so the
role selector can be populated without loading every matrix. A row remains in
the matrix when all five permission flags are false so zero-grant compatibility
profiles remain visible and round-trip safely.

## Update a profile

`POST /api/method/crm.api.permission_profile.update_permission_profile`

Request body:

```json
{
  "role": "Sale",
  "row_scope": "assigned",
  "delete_requires_ownership": true,
  "replace_applicable_doctypes": false,
  "applicable_doctypes": [
    {
      "document_type": "CRM Student",
      "read": true,
      "write": true,
      "create": false,
      "delete": false,
      "export": false
    }
  ]
}
```

The server validates the role, row scope, existing DocTypes, duplicate rows,
and boolean flags. At least one DocType row is required. With
`replace_applicable_doctypes: false`, submitted rows are merged into the
existing profile, which allows the paginated UI to save one page without
removing rows from other pages. The default is `true` for compatibility with
full-matrix updates. A successful response returns the complete saved profile.
