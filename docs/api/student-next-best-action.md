# Student detail — Next Best Action API

## Mục đích

Student detail chỉ cần hiển thị **một NBA gần nhất của đúng student đang mở**. Endpoint `list_actions_for_record` hiện trả về danh sách `CRM Action`, vì vậy đề xuất thêm một method đọc một action đã được chọn ở backend.

Method không tạo, giao, hoàn tất hoặc thay đổi action. Đây chỉ là read API có kiểm tra permission của session hiện tại.

## Endpoint đề xuất

```http
GET /api/method/crm.api.student_worklist.get_next_best_action_for_student
  ?student_id=<STUDENT_ID>
```

Ví dụ:

```http
GET /api/method/crm.api.student_worklist.get_next_best_action_for_student?student_id=STU-2026-00042
Accept: application/json
Cookie: sid=<Frappe session cookie>
```

`student_id` là `name` canonical của `CRM Student`, không phải tên hiển thị, slug URL hoặc tên người phụ trách.

## Quy tắc chọn NBA gần nhất

Backend nên áp dụng thứ tự sau:

1. Kiểm tra user không phải `Guest` và có quyền đọc `CRM Student`/`CRM Action`.
2. Chỉ tìm action có `student = student_id` và thuộc action đang còn hiệu lực.
3. Loại các state kết thúc: `completed`, `cancelled`, `rejected`, `superseded`.
4. Sắp xếp `creation desc`, sau đó `modified desc`, và lấy đúng một record đầu tiên.

Nếu student tồn tại nhưng chưa có action đang mở, trả HTTP `200` với `nba: null`. Không tự sinh NBA ở endpoint đọc.

## Response 200

```json
{
  "message": {
    "student_id": "STU-2026-00042",
    "nba": {
      "name": "ACT-2026-00128",
      "student": "STU-2026-00042",
      "action_type": "CALL",
      "objective": "Resolve the student's Tuition need at the Applicant stage and agree one governed next step.",
      "state": "pending",
      "execution_status": "planned",
      "priority": "medium",
      "due_at": "2026-09-03 16:00:00",
      "action_owner": null,
      "origin": "ai",
      "revision": 1,
      "is_today": true,
      "is_overdue": false
    },
    "policy_version": "worklist-v1"
  }
}
```

Khi chưa có NBA:

```json
{
  "message": {
    "student_id": "STU-2026-00042",
    "nba": null,
    "policy_version": "worklist-v1"
  }
}
```

### Field contract

| Field                  | Type             | Required | Ý nghĩa                                                        |
| ---------------------- | ---------------- | -------: | -------------------------------------------------------------- |
| `student_id`           | `string`         |       Có | Mã canonical của student được query                            |
| `nba`                  | `object \| null` |       Có | Một action gần nhất còn mở; `null` nếu không có                |
| `nba.name`             | `string`         |       Có | ID ổn định của `CRM Action`                                    |
| `nba.student`          | `string`         |       Có | Student liên kết; phải bằng `student_id`                       |
| `nba.action_type`      | `string \| null` |       Có | Ví dụ `CALL`, `EMAIL`, `COUNSELING`                            |
| `nba.objective`        | `string`         |       Có | Nội dung NBA hiển thị nổi bật trên student detail              |
| `nba.state`            | `string`         |       Có | State nghiệp vụ hiện tại                                       |
| `nba.execution_status` | `string \| null` |       Có | Trạng thái thực thi                                            |
| `nba.priority`         | `string`         |       Có | `high`, `medium` hoặc `low`                                    |
| `nba.due_at`           | `string \| null` |       Có | Datetime server, định dạng `YYYY-MM-DD HH:mm:ss` hoặc ISO-8601 |
| `nba.action_owner`     | `string \| null` |       Có | Người phụ trách nếu đã phân công                               |
| `nba.origin`           | `string \| null` |       Có | Nguồn tạo action, ví dụ `ai` hoặc `manual`                     |
| `nba.revision`         | `number`         |       Có | Revision dùng để tránh đọc nhầm action đã thay đổi             |
| `nba.is_today`         | `boolean`        |       Có | Tính theo timezone của CRM                                     |
| `nba.is_overdue`       | `boolean`        |       Có | `due_at < now` và action chưa ở state kết thúc                 |
| `policy_version`       | `string`         |       Có | Version policy dùng khi chọn action                            |

## Error response

Student không tồn tại hoặc user không được phép biết record đó tồn tại:

```http
404 Not Found
```

```json
{
  "error": {
    "code": "STUDENT_NOT_FOUND",
    "message": "Không tìm thấy hồ sơ học sinh."
  }
}
```

Các lỗi còn lại:

|  HTTP | Code                      | Khi dùng                                          |
| ----: | ------------------------- | ------------------------------------------------- |
| `400` | `INVALID_STUDENT_ID`      | Thiếu hoặc sai format `student_id`                |
| `401` | `UNAUTHENTICATED`         | Session hết hạn hoặc chưa đăng nhập               |
| `403` | `FORBIDDEN`               | Không có quyền đọc student/action                 |
| `404` | `STUDENT_NOT_FOUND`       | Student không tồn tại trong scope được phép xem   |
| `503` | `STUDENT_NBA_UNAVAILABLE` | Read model/action service tạm thời không sẵn sàng |

## Pseudocode Frappe

```python
@frappe.whitelist()
def get_next_best_action_for_student(student_id: str) -> dict:

    if frappe.session.user == "Guest":
        frappe.throw(_("Authentication is required."), frappe.PermissionError)

    if not isinstance(student_id, str) or not student_id.strip():
        frappe.throw(_("A valid Student is required."), frappe.ValidationError)

    student_id = student_id.strip()
    frappe.has_permission("CRM Student", "read", user=frappe.session.user, throw=True)
    frappe.has_permission("CRM Action", "read", user=frappe.session.user, throw=True)

    if not frappe.db.exists("CRM Student", student_id):
        frappe.throw(_("Student not found."), frappe.DoesNotExistError)

    rows = frappe.get_list(
        "CRM Action",
        filters={
            "student": student_id,
            "state": ["not in", ["completed", "cancelled", "rejected", "superseded"]],
        },
        fields=[
            "name", "student", "action_type", "objective", "state",
            "execution_status", "priority", "due_at", "action_owner",
            "origin", "action_revision",
        ],
        order_by="creation desc, modified desc",
        limit_page_length=1,
    )

    row = rows[0] if rows else None
    return {
        "student_id": student_id,
        "nba": _serialize_nba(row),
        "policy_version": "worklist-v1",
    }
```

`_serialize_nba` cần tính `is_today` và `is_overdue` ở server, kèm timezone CRM. Không trả phone/email hoặc dữ liệu nhạy cảm trong object NBA này.

## Frontend mapping

Student detail chỉ cần đọc:

```ts
const objective = response.message.nba?.objective ?? null;
```

Không dùng `student_id` từ query để hiển thị lại thay cho giá trị server trả về; dùng `nba.student` để kiểm tra response đúng record trước khi render.
