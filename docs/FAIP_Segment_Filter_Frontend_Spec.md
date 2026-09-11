# FAIP Segment Filter — Dashboard contract

Dashboard CRM lấy danh sách segment, field metadata, preview và lifecycle từ Frappe
CRM. Frontend không giữ mock segment store và không tự tính membership.

## Filter fields

Chỉ hiển thị năm field nghiệp vụ:

| UI                   | Frappe field    | Value source                                                  |
| -------------------- | --------------- | ------------------------------------------------------------- |
| Giai đoạn tuyển sinh | `student_stage` | `New`, `Attempting`, `Connected`, `Qualified`, `Disqualified` |
| Tiềm năng            | `potential`     | `HIGH`, `MEDIUM`, `LOW`                                       |
| Ý định               | `intent`        | `HIGH`, `MEDIUM`, `LOW`                                       |
| Nhu cầu              | `need`          | active `CRM Need` names                                       |
| Thẻ                  | `tag`           | active `CRM Tag` names                                        |

Need và Tag được lấy từ hai API catalog riêng. Các nhóm hiển thị dưới Nhu cầu/Thẻ
chỉ là nhãn UI từ `group_name`; khi chọn, các term name thực tế được gửi vào đúng
field `need` hoặc `tag`.

## Filter payload

Builder cho phép chọn `AND` hoặc `OR` ở cả hai tầng: logic ngoài nối các group, còn
logic trong từng group nối các condition.
Mỗi group có thể đặt tên riêng; tên được gửi cùng `groups[].name` và được lưu trong
Frappe để hiển thị lại khi mở segment.

```json
{
  "logic": "OR",
  "groups": [
    {
      "logic": "AND",
      "name": "Học sinh cần tư vấn học phí",
      "conditions": [
        { "field": "potential", "operator": "=", "value": "HIGH" },
        { "field": "need", "operator": "in", "value": ["<need-name>"] }
      ]
    }
  ]
}
```

UI operator mapping:

- `IS_ANY_OF` → `in`
- `IS_NONE_OF` → `not in`
- `EQUAL` → `=`
- `NOT_EQUAL` → `!=`

## API methods

Frontend gọi `/api/method/<method>` qua `src/services/api/segments`:

- `crm.api.student_segment.get_fields`
- `crm.api.student_segment.list_segments`
- `crm.api.student_segment.get_segment`
- `crm.api.student_segment.get_segment_by_code`
- `crm.api.student_segment.preview_segment`
- `crm.api.student_segment.create_segment`
- `crm.api.student_segment.update_segment`
- `crm.api.student_segment.transition_segment`
- `crm.api.student_segment.delete_segment`
- `crm.api.student_classification.list_needs`
- `crm.api.student_classification.list_tags`

CRUD sử dụng React Query để cache/invalidate list, detail và preview. Mọi mutation gửi
`expected_revision`; lỗi permission, validation và revision conflict được hiển thị cho
người dùng.

Mỗi Segment có `segment_code` do backend sinh theo dạng
`SEG-YYMMDD-{SHORT_ID}`. `name` vẫn là định danh Frappe nội bộ; dashboard
chỉ hiển thị `segment_code` làm mã nghiệp vụ. Các mã legacy có username vẫn được
đọc tương thích trong thời gian chuyển đổi.

Preview nhận `total` là số học sinh đã lọc, `total_students` là tổng số học sinh trong
phạm vi quyền hiện tại và `students` là tối đa 25 kết quả đầu tiên để xem trước. Tỷ lệ
hiển thị trên dashboard được tính bằng `total / total_students`.
