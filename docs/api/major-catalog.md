# Major catalog frontend contract

The dashboard manages the `Major Group → Major` hierarchy through
`/api/v1/major-catalog`. Lead and student forms read their option lists from
`GET /api/v1/options/{field}`; major options carry optional `groupName` and
`groupLabel` metadata.

Major fields stay single-value links. The shared selector only uses a chip/tag
presentation and a grouped popover; it does not turn a single major field into a
multi-select.

## Endpoints

| Method | Path | Notes |
| --- | --- | --- |
| `GET` | `/api/v1/major-catalog/groups` | Query: `search`, `enabled`, `includeDisabled`, `start`, `pageLength`. Answers `{ groups, total, start, pageLength }`. |
| `POST` | `/api/v1/major-catalog/groups` | Body: the group fields. |
| `PATCH` | `/api/v1/major-catalog/groups/{code}` | Body: `{ data, expectedModified }`. |
| `DELETE` | `/api/v1/major-catalog/groups/{code}` | Query: `expectedModified`. Answers `{ deleted }`. |
| `GET` | `/api/v1/major-catalog/majors` | Query: `search`, `group`, `isActive`, `includeInactive`, `start`, `pageLength`. Answers `{ majors, total, start, pageLength }`. |
| `POST` | `/api/v1/major-catalog/majors` | Body: the major fields. |
| `PATCH` | `/api/v1/major-catalog/majors/{id}` | Body: `{ data, expectedModified }`. |
| `DELETE` | `/api/v1/major-catalog/majors/{id}` | Query: `expectedModified`. Answers `{ deleted }`. |

Types: `src/services/api/major-catalog/types.ts`. Caller: `src/services/api/major-catalog/index.ts`.

## Screens

- `/director/admin/majors` lists the major groups.
- `/director/admin/majors/[groupId]` lists the majors of the selected group.