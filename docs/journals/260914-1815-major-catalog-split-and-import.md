---
title: Split Major catalog pages and import source data
date: 2026-09-14
---

# Split Major catalog pages and import source data

## Context

The previous management screen combined Major Group and Major in one
two-column view, while the supplied CSV had not been loaded into Frappe.

## Change

- Keep the Major Group table on `/director/admin/majors` and move the Major
  table to a separate scoped detail page.
- Link each group name to `/director/admin/majors/[groupId]`, which shows only
  that group's Majors.
- Fix the all-groups Major query so the full Major table loads without a group
  filter.
- Add the idempotent Frappe import patch for `docs/Ngành_học (5).csv`.

## Verification

Imported 6 groups and 41 CSV Majors. A second import created and updated zero
records. Backend API tests, frontend unit tests, lint, and Next.js production
build pass.
