# Admin catalog command API

The primary dashboard admin workspace is `/director/admin/catalogs`. It uses
explicit Frappe command boundaries under `crm.api.admin_catalog` instead of
generic DocType writes.

## Admission and policy catalogs

- `list/create/update/delete_admission_year`
- `list/create/update/delete_academic_year_config`
- `list/create/update/delete_admission_offering`
- `transition_admission_offering` — `Active` always goes through the approval command.
- `list/get/create/update/delete_score_template` (`list_score_templates` accepts
  `search`, `start` and `page_length`)

All update and delete commands accept `expected_modified` for stale-write
protection. Admission Year and Academic Year Config enforce active-year,
one-config-per-year and duplicate line invariants on the backend.

The dashboard editors submit structured line/rule arrays. Search fields are
server-side and paginated; the UI sends `start` and `page_length` instead of
loading an unbounded catalog.

## Governed references

`list_governed_values`, `create_governed_value`, `list_governed_changes`,
`propose_governed_change` and `approve_governed_change` cover `CRM Campus`,
`CRM Lead Source` and `CRM Platform`. These calls retain the Phase 9
owner/approval gate; the dashboard must not call generic Frappe CRUD for them.

## Campaign channel types

`crm.api.campaign_channel_type` now also exposes
`create_campaign_channel_type`, `update_campaign_channel_type` and
`delete_campaign_channel_type`. Channel codes are immutable and every record
must support Online or Offline mode.
