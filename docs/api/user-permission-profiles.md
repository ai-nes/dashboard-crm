# User, CRM profile and permission-profile API

The user-management screens use the Nest `users`, `permission-profiles` and
`staff-capacity` resources. Sign-in and the session are Better Auth
(`/api/auth`); the session cookie is the only credential.

## Authentication and access

All endpoints below need a signed-in session. Reading and changing profiles and
users is limited to administrators (identity role `admin`); everyone else gets
`403 FORBIDDEN`.

`GET /api/v1/me` answers the signed-in account: `data` holds `email`, `name`,
`identityRole` (`admin` or `user`), `crmProfile` (`sales`, `ctv_sale`,
`lead_sales`, `pr`, `pr_manager`, `marketing`, `lead_marketing`,
`admissions_director`, `ceo` or `null`), `leadScope` (`all` or `own`) and
`capabilities`. The dashboard turns this into the `CurrentUser` shape in
`src/services/api/nest/nest-auth.ts`: role names come from `crmProfile`
(`Sale`, `CTV Sale`, `Lead Sale`, `Promoter`, `Lead Promoter`, `Marketing`,
`Lead Marketing`, `Admissions Director`, `Administrator`) and the
create/write/delete flags used to show or hide controls come from `leadScope`
and `capabilities`. The dashboard must not infer those flags from role names; the
backend stays authoritative and can still answer `403` for a stale session.

## Users

| Method | Path | Notes |
| --- | --- | --- |
| `GET` | `/api/v1/users` | Query: `page`, `pageSize` (max 100), `search`, `crmProfile`. Answers `{ data: [{ id, email, name, identityRole, crmProfile, emailVerified, status }], meta.pagination }`. |
| `POST` | `/api/v1/users` | Header `Idempotency-Key`. Body: `{ email, name, password }`. |
| `PUT` | `/api/v1/users/{userId}/crm-profile` | Body: `{ crmProfile }`; `null` removes the CRM profile. |
| `PATCH` | `/api/v1/users/{userId}/profile` | Body: `{ fullName?, newPassword? }`. |
| `GET` | `/api/v1/users/role-logs` | Query: `user`, `page`, `pageSize` (max 200). Each row: `{ id, userId, action: role_changed \| removed, previousRole, newRole, actorEmail, occurredAt }`. |
| `GET` | `/api/v1/staff-capacity` | Active-student capacity per user: `{ data: { [userId]: { limit, active, remaining, configured } } }`. |
| `PUT` | `/api/v1/staff-capacity/{userId}` | Body: `{ maxActiveStudents, reason }`. |

## Permission profiles

### List

`GET /api/v1/permission-profiles`

Query parameters:

- `role` (optional): selected managed CRM profile. When omitted the first active
  managed profile is selected.
- `start` (default `0`): zero-based offset in the selected role's business-object matrix.
- `pageSize` (default `8`, maximum `100`): number of business-object rows to return.
- `viewMode` (default `grouped`): `detailed` returns each visible physical record
  type instead of business-object groups.

```json
{
  "data": {
    "selectedRole": "sales",
    "viewMode": "grouped",
    "profiles": [
      {
        "name": "sales",
        "role": "sales",
        "rowScope": "assigned",
        "deleteRequiresOwnership": true,
        "isSystemManaged": true,
        "applicableDoctypes": [
          {
            "documentType": "CRM Student",
            "label": "Học sinh",
            "description": "Bao gồm hồ sơ tuyển sinh và tài liệu của học sinh.",
            "includedDoctypes": ["CRM Student", "CRM Student Admission Profile", "CRM Student Document"],
            "read": true,
            "write": true,
            "create": false,
            "delete": false,
            "export": false
          }
        ]
      }
    ]
  },
  "meta": { "pagination": { "total": 8, "start": 0, "pageSize": 8 } }
}
```

Profile metadata is returned for every managed role, while `applicableDoctypes`
holds the requested page only for `selectedRole`; the other profiles return an
empty matrix so the role selector can be filled without loading every matrix.
Each row is a business object, not necessarily one record type:
`includedDoctypes` lists the real record types affected when the row is updated
(the student row also controls its admission profile and documents). A row stays
in the matrix when all five flags are false so zero-grant profiles round-trip safely.
With `viewMode=detailed` each record type is its own row and carries `groupLabel`.
System and implementation record types are omitted in both modes; they stay in
the stored profile but cannot be edited from the admin screen.

### Update

`PUT /api/v1/permission-profiles/{role}`

```json
{
  "rowScope": "assigned",
  "deleteRequiresOwnership": true,
  "replaceApplicableDoctypes": false,
  "viewMode": "grouped",
  "applicableDoctypes": [
    { "documentType": "CRM Student", "read": true, "write": true, "create": false, "delete": false, "export": false }
  ]
}
```

The server validates the role, row scope, record types, duplicate rows,
business-object membership and boolean flags. A submitted row may use a
business object's primary record type or one of its included types; the server
normalizes it to the primary object and expands it to every included type before
saving. At least one visible business-object row is required. With
`replaceApplicableDoctypes: false` submitted rows merge into the existing profile,
so the paginated UI can save one page without removing rows from other pages
(the default is `true` for full-matrix updates). `viewMode: "detailed"` updates
one physical type without touching the rest of its group. The response is the
complete saved profile.