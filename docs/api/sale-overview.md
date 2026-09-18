# API `/sale` — Tổng quan Sale

`crm.api.sale.get_sale_overview` trả về một snapshot duy nhất cho dashboard Sale.
Dashboard chỉ dùng dữ liệu của các DocType core CRM và không tạo số liệu thay thế
khi nguồn không có dữ liệu.

## Phạm vi dữ liệu

API chỉ đọc dữ liệu thuộc Sale hiện tại, được scope từ session backend:

- `CRM Student`: hồ sơ, `admission_year`, `student_stage` và hoạt động gần nhất.
- `CRM Lead`: các Lead gần đây do Sale phụ trách.
- `CRM Interaction`: số tương tác tư vấn hoàn tất theo tuần.
- `CRM Action Item`: task ưu tiên, việc quá hạn và NBA đang mở.

Dashboard không dùng `CRM Admission Application`, target, forecast hoặc SLA.
Các section legacy như `kpis`, `pipeline`, `studentStatus`, `attention`,
`operations` và `performance` không còn thuộc contract.

## Endpoint

```http
GET {NEXT_PUBLIC_FRAPPE_URL}/api/method/crm.api.sale.get_sale_overview
Cookie: sid=<Frappe session cookie>
Accept: application/json
```

Query params:

| Tên | Kiểu | Mặc định | Mô tả |
|---|---|---|---|
| `admissionYear` | integer | Năm tuyển sinh hiện hành | Lọc `CRM Student` và `CRM Lead` theo kỳ được phép xem |
| `date` | `YYYY-MM-DD` | Ngày hiện tại theo timezone | Dùng để tính task hôm nay, quá hạn và bucket xu hướng |
| `trendRange` | `4w` \| `12w` | `4w` | Range được chọn ban đầu trên biểu đồ |
| `timezone` | IANA timezone | `Asia/Ho_Chi_Minh` | Dùng cho cắt ngày và hiển thị thời gian |
| `priorityLimit` | integer `1..10` | `4` | Số Action Item ưu tiên trả về |

`admissionYear` chỉ là trường kỳ/năm tuyển sinh của core CRM, không biểu thị
một trạng thái nhập học.

## Response

Frappe bọc payload thành công trong `message`:

```json
{
  "message": {
    "meta": {
      "viewer": { "id": "sale@example.com", "displayName": "Nguyễn Văn A" },
      "admissionYear": 2026,
      "date": "2026-09-05",
      "asOf": "2026-09-05T09:15:00+07:00",
      "timezone": "Asia/Ho_Chi_Minh",
      "status": "available",
      "warnings": []
    },
    "tasks": {
      "priority": { "overdueCount": 1, "items": [] },
      "summary": {
        "today": { "total": 3, "pending": 2, "completed": 1 },
        "overdue": { "count": 1 },
        "upcoming": { "count": 2, "horizonDays": 7 }
      }
    },
    "conversionTrend": {
      "defaultRange": "4w",
      "ranges": {
        "4w": {
          "from": "2026-08-10",
          "to": "2026-09-05",
          "points": [
            {
              "label": "Tuần 1",
              "periodStart": "2026-08-10",
              "periodEnd": "2026-08-16",
              "consulted": 22
            }
          ]
        },
        "12w": { "from": "2026-06-15", "to": "2026-09-05", "points": [] }
      }
    },
    "studentStages": {
      "total": 128,
      "items": [
        { "stage": "New", "label": "Mới", "count": 24, "share": 18.8 },
        { "stage": "Attempting", "label": "Đang liên hệ", "count": 35, "share": 27.3 },
        { "stage": "Connected", "label": "Đã kết nối", "count": 42, "share": 32.8 },
        { "stage": "Qualified", "label": "Đủ điều kiện", "count": 18, "share": 14.1 },
        { "stage": "Disqualified", "label": "Không đủ điều kiện", "count": 9, "share": 7.0 }
      ]
    },
    "studentActions": [],
    "recentLeads": [],
    "recentStudents": [],
    "health": {
      "followUpDue": 2,
      "overdue": 1,
      "noActivity": 4,
      "agingBuckets": [
        { "id": "0-2d", "label": "0–2 ngày", "count": 8 },
        { "id": "3-5d", "label": "3–5 ngày", "count": 4 },
        { "id": "6-10d", "label": "6–10 ngày", "count": 2 },
        { "id": "10d-plus", "label": "Trên 10 ngày", "count": 1 }
      ]
    }
  }
}
```

### TypeScript shape

```typescript
type SaleOverviewResponse = {
  meta: {
    viewer: { id: string; displayName: string };
    admissionYear: number;
    date: string;
    asOf: string;
    timezone: string;
    status: "available" | "partial" | "unavailable";
    warnings: string[];
  };
  tasks: SaleTasks;
  conversionTrend: {
    defaultRange: "4w" | "12w";
    ranges: Record<"4w" | "12w", {
      from: string;
      to: string;
      points: Array<{
        label: string;
        periodStart: string;
        periodEnd: string;
        consulted: number;
      }>;
    }>;
  };
  studentStages: {
    total: number;
    items: Array<{
      stage: "New" | "Attempting" | "Connected" | "Qualified" | "Disqualified";
      count: number;
      share: number | null;
    }>;
  };
  studentActions: SaleStudentAction[];
  recentLeads: SaleRecentLead[];
  recentStudents: SaleRecentStudent[];
  health: {
    followUpDue: number;
    overdue: number;
    noActivity: number;
    agingBuckets: Array<{ id: string; label: string; count: number }>;
  };
};
```

## Quy tắc nghiệp vụ

- `studentStages` dùng đúng năm option canonical của `CRM Student`; `share` là
  `count / total * 100`, làm tròn một chữ số và là `null` khi `total = 0`.
- `studentActions` chỉ chứa hồ sơ có `CRM Action Item` còn mở. Không có việc mở
  thì trả mảng rỗng; không suy diễn NBA từ số liệu khác.
- `tasks.priority.items` và `studentActions` đều lấy từ Action Item; trạng thái
  quá hạn được tính tại server theo `meta.asOf`.
- `conversionTrend.consulted` là số tương tác tư vấn hoàn tất trong từng bucket,
  không phải số dư hồ sơ.
- `health.overdue` là số Action Item mở đã quá hạn; `noActivity` là hồ sơ chưa
  có `CRM Interaction` và chưa có `first_contact_time`; aging dựa trên hoạt động
  gần nhất hoặc thời điểm tạo hồ sơ.
- Collection không có dữ liệu trả `[]`; count luôn là số nguyên không âm.
- Không trả dữ liệu ngoài scope Sale hiện tại.

## Lỗi và trạng thái dữ liệu

| HTTP | Code | Ý nghĩa |
|---:|---|---|
| `400` | `INVALID_QUERY` | Query param không hợp lệ |
| `401` | `UNAUTHENTICATED` | Session không tồn tại hoặc hết hạn |
| `403` | `FORBIDDEN` | User không có quyền Sale |
| `404` | `ADMISSION_YEAR_NOT_FOUND` | Không tìm thấy năm tuyển sinh được chọn |

`meta.status = "partial"` phải đi kèm `warnings` chỉ rõ nguồn bị thiếu. Frontend
hiển thị loading, error và empty state; không dùng mock data để che lỗi API.

## Files tích hợp

- [sale-dashboard.tsx](<../../src/app/(with-layouts)/(dashboard)/sale/_components/sale-dashboard.tsx>)
- [sale/index.ts](<../../src/services/api/sale/index.ts>)
- [sale/types.ts](<../../src/services/api/sale/types.ts>)
- [use-sale-overview-query.ts](<../../src/hooks/use-sale-overview-query.ts>)
