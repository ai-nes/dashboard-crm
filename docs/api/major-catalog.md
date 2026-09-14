# Major catalog frontend contract

The Dashboard CRM uses `crm.api.major_catalog` for managing the
`Major Group → Major` hierarchy. Lead and Student forms continue to use
`crm.api.student_school.get_field_options`; Major options now include optional
`groupName` and `groupLabel` metadata.

Major fields remain single-value Frappe Link fields. The shared selector only
uses a chip/tag-style presentation and grouped popover; it does not turn a
single Major field into a multi-select field.

The management UI is split into two levels:

- `/director/admin/majors` lists the Major Group table.
- `/director/admin/majors/[groupId]` is the separate Major table scoped to the
  selected group. Clicking a group name opens this detail screen.
