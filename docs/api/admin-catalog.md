# Admin catalog command API

The admin workspace is `/director/admin/catalogs`. Every write is an explicit
command on a dedicated endpoint; the dashboard never writes generic records.
All update and delete commands carry the version read earlier
(`expectedModified`) so a stale write answers `409`.

## Admission and policy catalogs

| Resource | Endpoint |
| --- | --- |
| Admission years | `/api/v1/reference-data/admission-years` (`GET`, `POST`, `PATCH /{id}`, `DELETE /{id}`) |
| Academic year configs | `/api/v1/academic-year-configs` (`GET`, `POST`, `PATCH /{id}`, `DELETE /{id}`) |
| Admission offerings | `/api/v1/admission-offerings` (`GET`, `POST`, `PATCH /{id}`, `DELETE /{id}`, `POST /{id}/transition`) |
| Score templates | `/api/v1/score-config/templates` (`GET`, `GET /{name}`, `POST`, `PATCH /{name}`, `DELETE /{name}`) |
| Score signals | `GET /api/v1/score-config/signals` |

- `POST /admission-offerings/{id}/transition` takes `{ status, expectedModified }`;
  moving to `Active` always goes through the approval command.
- Lists are paginated on the server: `search`, `start`, `page_length`.
- Admission year and academic year config enforce the active-year,
  one-config-per-year and duplicate-line rules on the backend. The editors submit
  structured line and rule arrays.

## Governed references

`CRM Campus`, `CRM Lead Source` and `CRM Platform` are governed catalogs:

| Method | Path |
| --- | --- |
| `GET`, `POST` | `/api/v1/governed-values/{campus\|lead-source\|platform}` |
| `GET`, `POST` | `/api/v1/governed-values/{catalog}/changes` (propose and list changes) |
| `POST` | `/api/v1/governed-values/changes/{name}/approve` |

The owner/approval gate stays: the dashboard proposes a change and an approver
confirms it; there is no direct write.

## Campaign channel types

`/api/v1/campaign-channel-types` (`GET`, `POST`, `PATCH /{code}`, `DELETE /{code}`).
Codes are immutable and every record supports Online or Offline mode.
See [campaign-channel-types](campaign-channel-types.md).