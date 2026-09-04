---
title: CRM Notes CSRF fix
date: 2026-09-04
status: completed
---

# CRM Notes CSRF fix

## Context

The Director student dashboard received `CSRFTokenError` while loading notes from
`crm.api.note.list_notes`.

## What happened

The CRM Notes service sent every Frappe RPC as `POST`, while CSRF headers were only
resolved for write operations. Consequently, read operations used an unsafe HTTP
method without a CSRF token.

## Decision

Read operations (`list_notes` and `get_note`) now use `GET` query parameters.
Create, update, and delete operations remain `POST` and keep the existing CSRF flow.

## Verification

- CRM Notes tests: 7 passed.
- Full Vitest suite: 136 passed.
- ESLint and TypeScript checks passed.
- Next.js production build passed.

## Next

Deploy `dashboard-crm` and verify the Director student Notes tab against the production
Frappe session.
