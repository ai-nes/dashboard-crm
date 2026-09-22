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
- `start` (default `0`): zero-based offset in the selected role's business
  object matrix.
- `page_length` (default `8`, maximum `100`): number of business-object rows to
  return.
- `view_mode` (default `grouped`): use `detailed` to return each visible
  physical DocType instead of business-object groups.

Response envelope:

```json
{
  "message": {
    "selected_role": "Sale",
    "total": 8,
    "start": 0,
    "page_length": 8,
    "view_mode": "grouped",
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
            "label": "Học sinh",
            "description": "Bao gồm hồ sơ tuyển sinh và tài liệu của học sinh.",
            "included_doctypes": [
              "CRM Student",
              "CRM Student Admission Profile",
              "CRM Student Document"
            ],
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
role selector can be populated without loading every matrix. Each row is a
business object, not necessarily a physical Frappe DocType. `included_doctypes`
describes the real DocTypes affected when that row is updated. For example,
the `CRM Student` row also controls `CRM Student Admission Profile` and
`CRM Student Document`. A row remains in the matrix when all five permission
flags are false so zero-grant compatibility profiles remain visible and
round-trip safely.

When `view_mode` is `detailed`, the same endpoint returns each physical
business DocType separately. Each detailed row includes `group_label` so the
screen can show which business-object group owns it. System and implementation
DocTypes remain hidden in both modes.

System and implementation DocTypes are intentionally omitted from this matrix
and remain managed by the system. They are preserved in the stored permission
profile, but cannot be edited from the CRM admin screen. Only the configured
business-object groups are visible to the administrator.

## Update a profile

`POST /api/method/crm.api.permission_profile.update_permission_profile`

Request body:

```json
{
  "role": "Sale",
  "row_scope": "assigned",
  "delete_requires_ownership": true,
  "replace_applicable_doctypes": false,
  "view_mode": "grouped",
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
business-object membership, and boolean flags. A submitted row may use either
a business-object primary DocType or one of its included physical DocTypes;
the server normalizes it to the primary object and expands it back to every
included DocType before saving. At least one visible business-object row is
required. Pass `view_mode: "detailed"` to update one physical DocType without
changing the other members of its group. With
`replace_applicable_doctypes: false`, submitted rows are merged into the
existing profile, which allows the paginated UI to save one page without
removing rows from other pages. The default is `true` for compatibility with
full-matrix updates. A successful response returns the complete saved profile.
