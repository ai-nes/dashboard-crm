# Mapping badge và màu sắc Dashboard Lead Sale

## Tổng quan

Tài liệu này mô tả mapping giữa mã nghiệp vụ từ API tổng quan Lead Sale, nhãn hiển thị trên UI và màu semantic của dashboard.

Màu sắc chỉ là lớp trình bày để thể hiện mức độ ưu tiên hoặc trạng thái xử lý. Màu không thay thế cho các trạng thái core của Student.

API nguồn:

```text
crm.api.lead_sale.get_lead_sale_overview
```

## Quy ước màu

| Tone UI | Màu hiển thị | Ý nghĩa |
| --- | --- | --- |
| `danger` / `error` | Đỏ | Vấn đề nghiêm trọng, cần xử lý gấp |
| `warning` | Cam | Cần chú ý hoặc cần cập nhật |
| `primary` | Xanh dương | Trạng thái trung tính hoặc hành động tiếp theo |
| `success` | Xanh lá | Kết quả tốt hoặc đã đạt |
| `violet` | Tím | Phân loại nghiệp vụ đặc biệt |
| `gray` | Xám | Đang xử lý, không có cảnh báo nổi bật |

## Badge của hồ sơ ưu tiên

Backend tạo `dashboard.priorityQueue` từ Student, Interaction và Task. Mỗi hồ sơ được gán một `issueCode` và `nextAction`.

| `issueCode` | Nhãn UI | Tone | Ý nghĩa và điều kiện |
| --- | --- | --- | --- |
| `overdue` | Quá hạn xử lý | Đỏ | Deadline hoặc task đang mở đã quá hạn |
| `missing-documents` | Thiếu giấy tờ | Tím | Hồ sơ còn thiếu tài liệu |
| `uncontacted` | Chưa có tương tác | Cam | Chưa có liên hệ/tư vấn và hồ sơ đã tồn trên 1 ngày |
| `aging` | Tồn lâu, cần cập nhật | Cam | Hồ sơ bị đứng lâu và cần cập nhật bước tiếp theo |
| Mã không xác định | Cần rà soát | Cam | Fallback khi chưa có mapping |

### Bước tiếp theo của hồ sơ

| Điều kiện | `nextAction` |
| --- | --- |
| Có deadline hoặc task quá hạn | `Xử lý công việc quá hạn` |
| Có tài liệu còn thiếu | `Nhắc bổ sung hồ sơ` |
| Chưa có tương tác | `Thực hiện tương tác` |
| Các trường hợp còn lại bị stalled | `Rà soát và chốt bước tiếp theo` |

## Nhóm cần xử lý

Các action được trả về trong `dashboard.actions`.

| Action ID | Nhãn UI | Tone | Cách tính / ý nghĩa |
| --- | --- | --- | --- |
| `overdue` | Công việc quá hạn | Đỏ | Số deadline đã quá hạn |
| `unassigned` | Lead chưa phân công | Tím | Số hồ sơ active chưa có nhân viên phụ trách |
| `due-today` | Liên hệ hôm nay | Xanh dương | Số hồ sơ có lịch follow-up trong ngày báo cáo |
| `aging` | Hồ sơ tồn lâu | Cam | Số hồ sơ active có tuổi hồ sơ từ 6 ngày trở lên |

## Trạng thái trong phễu tuyển sinh

Đây là các trạng thái core của Student được chuẩn hóa ở backend. Tone bên dưới dùng để nhận diện giai đoạn, không phải mức độ cảnh báo.

| Stage ID | Nhãn | Tone nhận diện |
| --- | --- | --- |
| `new` | Lead mới | Xanh dương |
| `attempting` | Đang liên hệ | Cam |
| `connected` | Đã kết nối | Tím |
| `qualified` | Đủ điều kiện | Xanh lá |

## Badge trạng thái của từng giai đoạn

Badge ở cuối mỗi thẻ stage được tính từ dữ liệu chuyển bước và số hồ sơ cần xử lý.

| Badge | Màu | Điều kiện |
| --- | --- | --- |
| Chuyển bước thấp | Đỏ | Giai đoạn có tỷ lệ chuyển sang bước tiếp theo thấp nhất |
| Cần xử lý | Cam | Giai đoạn có `actionItemCount > 0` |
| Kết quả | Xanh lá | Giai đoạn cuối, không còn bước tiếp theo (`nextStepConversion === null`) |
| Đang xử lý | Xám | Có bước tiếp theo và chưa phát hiện cảnh báo |

Nếu một giai đoạn vừa có tỷ lệ chuyển bước thấp nhất vừa có action item, badge ưu tiên hiển thị là **Chuyển bước thấp** màu đỏ.

## Màu của nhóm tuổi hồ sơ

| Aging bucket | Nhãn | Tone | Ý nghĩa |
| --- | --- | --- | --- |
| `0-2-days` | 0–2 ngày | Xanh lá | Đang trong mốc xử lý |
| `3-5-days` | 3–5 ngày | Cam | Cần theo dõi sát |
| `6-10-days` | 6–10 ngày | Đỏ | Hồ sơ đã tồn lâu |
| `over-10-days` | Trên 10 ngày | Đỏ | Hồ sơ tồn rất lâu, cần ưu tiên xử lý |

## Lưu ý khi đọc màu

- Badge **Quá hạn xử lý** màu đỏ phản ánh vấn đề deadline/task của hồ sơ, không phải một Student stage.
- Badge **Cần xử lý** màu cam phản ánh `actionItemCount`, không phải tên trạng thái core.
- Màu xanh dương của **Bước tiếp theo** chỉ biểu thị hành động có thể thực hiện; không có nghĩa hồ sơ đang ở trạng thái tốt.
- Màu xanh lá biểu thị kết quả hoặc trạng thái đạt, không dùng cho các hồ sơ đang cần can thiệp.
- `record-minh-khoi`, `record-thao-nguyen`, `record-gia-han` chỉ là ID điều hướng nội bộ của UI; tên hồ sơ thực tế lấy từ `priorityQueue` của API.

## Nguồn triển khai

- Backend: `crm/api/lead_sale.py`, phần xây dựng stage, action và `priorityQueue`.
- API adapter: `src/services/api/lead-sale/index.ts`.
- Mapping dữ liệu và tone: `src/app/(with-layouts)/(dashboard)/lead-sale/_components/lead-sale-dashboard-adapter.ts`.
- Badge hồ sơ và detail: `src/app/(with-layouts)/(dashboard)/lead-sale/_components/lead-sale-detail-sheet.tsx`.
- Badge phễu và trạng thái can thiệp: `src/app/(with-layouts)/(dashboard)/lead-sale/_components/stage-pipeline-overview.tsx`.
