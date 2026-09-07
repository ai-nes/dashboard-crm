---
title: Lead list live workflow columns
status: in-progress
created: 2026-09-07
---

# Lead list live workflow columns

## Goal

Replace the mock values used by the Lead list for processing status, result,
contact-attempt counts, and creation date with a permission-scoped API
projection from Frappe CRM.

## Contract

`crm.api.director_leads.get_director_leads` keeps its existing auth, filters,
pagination, and envelope. Each row additionally returns:

- `result`: the Lead resolution code, or an empty value while pending;
- `contactNoAnswer`: count of failed/no-answer call attempts;
- `contactSuccess`: count of connected call attempts;
- `status` / `statusCode` map the `CRM Lead.lead_status` enum used by the status
  column; existing `processingStatus` remains the source for the internal
  processing workflow and result editability.
- `createdAt` remains the source for the creation-date column.

Call Logs linked to the Lead are counted first. CRM Interaction phone-call
records fill any remaining history, with Call Log references de-duplicated.
Missing optional tables or unreadable history produce zero counts and do not
break the Lead list response.

## Implementation

1. Extend `crm/api/director_leads.py` with `resolution` and a bulk contact
   count projection; map those fields into the list/detail row contract.
2. Add focused backend tests for resolution/count mapping, Call Log and
   Interaction aggregation, de-duplication, and the existing list envelope.
3. Extend `src/services/api/lead-sale/leads.ts` types and normalization for the
   new fields, preserving safe defaults for older responses.
4. Remove `defaultLeadOverlay` from the main Lead list and use API fields for
   all four columns. Map the Lead status enum to the status column and keep
   local status/result overrides only for the existing UI controls, since no
   mutation endpoint is in scope.
5. Update the campaign-detail Lead adapter to preserve API result/count data
   and remove its mock generator dependency.
6. Add/update focused Vitest coverage and run backend/frontend checks.

## Acceptance criteria

- The eight-column Lead list renders status, result, contact count, and date
  from the API response; no deterministic mock values are used in those cells.
- A pending resolution renders `Chưa có kết quả`; absent call history renders
  `0`, without throwing or fabricating counts.
- Existing authentication, filters, pagination, loading/error/empty states,
  responsive layout, and control accessibility remain intact.
- Main Lead and campaign-detail Lead lists use the same live row contract.
