---
title: Lead Sale sales team API integration
status: in-progress
created: 2026-09-05
---

# Lead Sale sales team API integration

## Overview

Implement the contract in `docs/api/lead-sale-sales-team.md` across the Frappe
backend and the Next.js dashboard. The backend derives the current Lead Sales
team from the authenticated session; the dashboard consumes the two read-only
endpoints and removes the sales-team fixture from the rendered route.

## Requirements

- Add `crm.api.lead_sale.get_sales_team_workspace` with team-scoped summary,
  attention, load summary, filtered/sorted/paginated members, stable snapshot
  metadata, and the documented validation/error behavior.
- Add `crm.api.lead_sale.get_sales_team_member_detail` with a rechecked team
  scope, compatible member shape, health assessment, metric window, and student
  viewing permission.
- Add backend tests for access control, empty/filter/pagination behavior,
  stable sorting, zero capacity, and detail scope.
- Add a typed dashboard service that serializes all workspace/detail params,
  unwraps `message`, validates the contract, and surfaces typed API errors.
- Add React Query keys/hooks for workspace and member detail; use them from the
  sales-team route with URL-independent local filter state and refetch on
  selection/filter changes.
- Map API member fields to the existing presentation model, render server
  snapshot metadata, loading/error states, and preserve the owner link.
- Extend the Lead Sales students request/backend scope with `ownerId`, so the
  detail drawer link cannot read a member outside the current team.

## Architecture

Backend reuses existing Lead Sales access, team membership, student, task,
interaction, and application helpers. A small sales-team read-model layer will
assemble one canonical snapshot and share the member projection between list
and detail. No mutation or parallel assignment storage is introduced.

Frontend keeps presentation labels/icons/colors in the existing components and
uses `src/services/api/lead-sale` for transport/normalization. React Query
owns server state; the UI's search, availability, sort, and selected member
state remain local to the route.

## Phases

1. Backend contract and tests.
2. Dashboard API service, hooks, and student owner filter.
3. Sales-team UI migration and states.
4. Verification with focused Vitest, backend tests where Bench is available,
   TypeScript/lint/build checks.

## Acceptance criteria

- A Lead Sales user sees live sales-team data from Frappe with no fixture
  fallback when the API is configured or fails.
- KPI/attention/load sections remain team-wide while the member table follows
  search, availability, sort, and pagination query parameters.
- Selecting a member loads detail by ID and displays the compatible aggregate;
  out-of-scope members return the documented error.
- API payloads are validated and malformed responses produce a typed 502 error.
- Existing unrelated working-tree changes remain intact.
