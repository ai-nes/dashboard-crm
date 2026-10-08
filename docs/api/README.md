# CRM API documents

The dashboard talks only to the NestJS CRM backend (`crm-backend`). Its origin is
`NEXT_PUBLIC_CRM_API_URL` (for example `http://localhost:3001`). Every browser-facing
endpoint is REST under `/api/v1`; sign-in lives under `/api/auth` (Better Auth).

## Conventions

- **Authentication**: a Better Auth session cookie. Send requests with
  `credentials: "include"`. There is no CSRF token and no `Authorization` header;
  state-changing requests are protected by the origin check.
- **Errors**: `{ "error": { "code": "FORBIDDEN", "message": "..." } }` with the matching
  HTTP status (400 validation, 401 signed out, 403 not permitted, 404, 409 revision or
  duplicate conflict, 502 invalid upstream payload).
- **Optimistic concurrency**: updates and deletes carry the version read earlier
  (`expectedModified` or `expectedRevision`). A stale value answers `409`.
- **Pagination**: list endpoints take `start` and `pageLength` (some older ones keep
  `page_length`; each document says which) and answer `total`, `start`, `pageLength`.
- **Client code**: services live in `src/services/api/<domain>/`; the Nest request
  helper is `src/services/api/nest/nest-client.ts` (`nestRequest`). Domain adapters
  (`nest-*-router.ts`) turn each service call into the REST requests below.

## Reading the live contract

- Swagger UI: `<API origin>/api/docs`; raw spec: `<API origin>/api/openapi.json`.
  The spec lists routes and summaries; request and response shapes are in the
  documents below and in the TypeScript types next to each service.
- Route-by-route status against the old system:
  `crm-backend/plans/261005-0525-replace-frappe-with-nestjs/api-parity-matrix.md`.

## Documents

| Area | Document |
| --- | --- |
| Overview screens | [sale-overview](sale-overview.md), [ctv-sale-overview](ctv-sale-overview.md), [lead-sale-overview](lead-sale-overview.md), [director-admission-overview](director-admission-overview.md), [director-admission-funnel](director-admission-funnel.md), [director-regional-performance](director-regional-performance.md), [director-revenue-forecast](director-revenue-forecast.md), [director-school-field-activity](director-school-field-activity.md), [director-market-intelligence](director-market-intelligence.md), [director-campaign-intelligence](director-campaign-intelligence.md), [director-demographics](director-demographics.md) |
| Students and leads | [director-students](director-students.md), [director-student-detail](director-student-detail.md), [director-school-detail](director-school-detail.md), [director-leads](director-leads.md), [student-audit](student-audit.md), [activity-log](activity-log.md), [student-admission-documents](student-admission-documents.md) |
| Lead assignment | [lead-sale-student-assignment](lead-sale-student-assignment.md), [lead-sale-sales-team](lead-sale-sales-team.md), [lead-student-assignment-backend-contract](lead-student-assignment-backend-contract.md) |
| Next best action and AI | [student-next-best-action](student-next-best-action.md), [director-next-best-action](director-next-best-action.md), [260906-fe-handoff-nba-recommendation-response](260906-fe-handoff-nba-recommendation-response.md), [260906-fe-interaction-intelligence-handoff](260906-fe-interaction-intelligence-handoff.md), [ai-analysis-response-contract](ai-analysis-response-contract.md), [handoff-260903-1115-analysis-run-apis](handoff-260903-1115-analysis-run-apis.md), [handoff-260904-nba-ui](handoff-260904-nba-ui.md), [handoff-260905-fe-sync-api](handoff-260905-fe-sync-api.md) |
| Administration | [admin-catalog](admin-catalog.md), [admission-catalog](admission-catalog.md), [campaign-channel-types](campaign-channel-types.md), [major-catalog](major-catalog.md), [user-permission-profiles](user-permission-profiles.md) |