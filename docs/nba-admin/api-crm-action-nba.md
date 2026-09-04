# API: CRM Action & NBA Doctypes

Các whitelisted method dưới đây nằm trong `crm/api/action.py`, `crm/api/action_type.py`,
`crm/api/nba_read.py`. Có thể xem interactive tại **`/swagger`** (đọc trực tiếp từ
docstring các hàm này qua `crm.api.swagger.get_openapi_spec`).

Gọi qua Frappe RPC: `POST /api/method/<dotted.path>`, kèm session cookie + CSRF token
(giống mọi API khác trong app). Từ frontend dùng `call()` (frappe-ui) với dotted path.

---

## 1. `crm.api.action` — CRM Action (catalog 79 mã hành động)

Field: `code` (unique, = `name`), `display_name`, `action_type` (Link → CRM Action Type),
`description`, `purpose`, `default_channel`, `allowed_actors` (JSON), `requires_approval`,
`auto_execute`, `execution_type`, `ai_allowed`, `enabled`, `sort_order`.

`code`/`action_type` phải khớp 1 trong 79 mã canonical (`crm.fcrm.action_type_catalog`) —
được validate ở tầng controller (`crm_action.py`), API không tự nới lỏng.

Quyền: read cho Sale / Lead Sales / Marketing / Promoter / Admissions Director;
create/write/delete chỉ **System Manager**.

| Method | HTTP | Params |
|---|---|---|
| `list_actions` | GET/POST | `action_type?`, `enabled? (0/1)`, `search?`, `start=0`, `page_length=20` |
| `get_action` | GET/POST | `name` (= `code`) |
| `create_action` | POST | `code`, `display_name`, `action_type`, `purpose`, `default_channel`, `allowed_actors`, `requires_approval?`, `auto_execute?`, `execution_type?`, `ai_allowed?`, `enabled?`, `sort_order` |
| `update_action` | POST/PUT | `name` + field ghi được ở trên (trừ `code` — immutable sau khi tạo) |
| `delete_action` | DELETE/POST | `name` |

`list_actions` trả về `{total, start, page_length, actions: [...]}`.

---

## 2. `crm.api.action_type` — CRM Action Type (nhóm category dùng chung)

Field: `action_type` (unique code, = `name`), `display_name`, `enabled`, `sort_order`.

Quyền: read cho Sale / Lead Sales / Marketing / Promoter / Admissions Director;
create/write/delete chỉ **System Manager**.

| Method | HTTP | Params |
|---|---|---|
| `list_action_types` | GET/POST | `enabled?`, `search?`, `start=0`, `page_length=20` |
| `get_action_type` | GET/POST | `name` (= `action_type` code) |
| `create_action_type` | POST | `action_type`, `display_name`, `enabled?`, `sort_order` |
| `update_action_type` | POST/PUT | `name` + field ghi được (trừ `action_type` — immutable) |
| `delete_action_type` | DELETE/POST | `name` |

`list_action_types` trả về `{total, start, page_length, action_types: [...]}`.

---

## 3. `crm.api.nba_read` — read-only cho vòng đời NBA (Next Best Action)

CRM Recommendation, CRM Recommendation Feedback, CRM Action Execution, CRM Action
Execution Attempt, CRM Action Outcome là các aggregate **immutable**, chỉ được tạo/sửa
qua service layer nội bộ (`crm.fcrm.nba`, Phase 6 command service) — controller của
chúng gate write bằng cờ nội bộ (`nba_service_write`, `from_phase6_command`). Vì vậy
module này **chỉ có list/get**, cố tình không có create/update/delete để tránh bypass
idempotency/invariant đã thiết kế.

Mọi `list_*` nhận thêm `start=0`, `page_length=20`, trả về
`{total, start, page_length, rows: [...]}`. Quyền đọc theo scope student (own/team/
director) đã wire sẵn qua `permission_query_conditions`/`has_permission` trong
`crm/hooks.py`.

| Doctype | List method | Get method | Filter params |
|---|---|---|---|
| CRM Recommendation | `list_recommendations` | `get_recommendation` | `student?`, `status?`, `decision_status?`, `execution_status?` |
| CRM Recommendation Feedback | `list_recommendation_feedback` | `get_recommendation_feedback` | `recommendation?`, `student?` |
| CRM Action Execution | `list_action_executions` | `get_action_execution` | `recommendation?`, `action?`, `student?`, `status?` |
| CRM Action Execution Attempt (System Manager only) | `list_action_execution_attempts` | `get_action_execution_attempt` | `action?`, `nba_execution?`, `status?` |
| CRM Action Outcome | `list_action_outcomes` | `get_action_outcome` | `execution?`, `recommendation?`, `action?`, `student?` |

Ghi feedback (write) vẫn qua endpoint có sẵn `crm.api.nba.record_feedback` (POST),
không thuộc module read-only này.

---

## Ví dụ gọi từ frontend (frappe-ui `call`)

```js
// list
const res = await call('crm.api.action.list_actions', { action_type: 'CONTACT', page_length: 20 })

// get
const rec = await call('crm.api.nba_read.get_recommendation', { name: 'REC-xxxxx' })

// create (System Manager)
await call('crm.api.action_type.create_action_type', {
  action_type: 'CONTACT', display_name: 'Liên hệ', sort_order: 1
})

// list NBA recommendations của 1 student
await call('crm.api.nba_read.list_recommendations', { student: 'STU-0001', status: 'new' })
```

## Shared helper

`crm/api/_pagination.py::paged_list(doctype, fields, filters=None, or_filters=None,
start=0, page_length=20, order_by=None)` — dùng chung logic đếm tổng + phân trang cho
cả 3 file trên, tránh lặp lại query `count(name)`.
