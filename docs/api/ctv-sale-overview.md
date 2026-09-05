# API cho `/ctv-sale` — Tổng quan

Tài liệu này mô tả contract production đề xuất cho màn **CTV Sale · Tổng quan**. Màn hình giúp một cộng tác viên Sale theo dõi hồ sơ được giao, task cần xử lý, trạng thái hồ sơ và hiệu quả liên hệ.

## 1. Phạm vi màn hình

| Vùng UI | Dữ liệu API cần | Ghi chú |
|---|---|---|
| Header | `meta.viewer`, `meta.asOf`, `meta.timezone`, số task ưu tiên | Không hard-code tên người dùng, ngày hoặc số task |
| KPI công việc | `kpis[]` | 4 KPI: được giao, chưa liên hệ, cần follow-up, sẵn sàng chuyển Sale |
| Việc cần xử lý | `tasks.priority` | Trả các task chưa hoàn tất có độ ưu tiên cao nhất |
| Tiến độ công việc | `tasks.summary` | Hôm nay, quá hạn, sắp tới và tiến độ hoàn thành |
| Trạng thái học sinh | `studentStatus` | Phân bổ các hồ sơ đang thuộc CTV |
| Xu hướng liên hệ | `contacts.trend` | Hai series: tổng liên hệ và đã kết nối, range `7d`/`30d` |
| Kết quả liên hệ | `contacts.outcomes` | Phân bổ kết quả trong cùng snapshot báo cáo |

Nguồn tham chiếu:

- [page.tsx](<../../src/app/(with-layouts)/(dashboard)/ctv-sale/page.tsx>)
- [ctv-sale-dashboard.tsx](<../../src/app/(with-layouts)/(dashboard)/ctv-sale/_components/ctv-sale-dashboard.tsx>)
- [data.ts](<../../src/app/(with-layouts)/(dashboard)/ctv-sale/_components/data.ts>)
- [priority-tasks.tsx](<../../src/app/(with-layouts)/(dashboard)/ctv-sale/_components/priority-tasks.tsx>)
- [task-summary.tsx](<../../src/app/(with-layouts)/(dashboard)/ctv-sale/_components/task-summary.tsx>)

## 2. Tình trạng tích hợp hiện tại

Route `/ctv-sale` hiện chưa gọi API. Các component đang import fixture trực tiếp từ `_components/data.ts`; chưa có service trong `src/services/api/ctv-sale`, hook query hoặc mock handler riêng.

Contract bên dưới là contract production đề xuất. Khi tích hợp, toàn bộ section phải dùng cùng `meta.asOf`, CTV, timezone và phạm vi dữ liệu. Không để KPI, biểu đồ và task đọc từ các snapshot khác nhau.

## 3. Endpoint và quyền truy cập

~~~
GET {NEXT_PUBLIC_FRAPPE_URL}/api/method/crm.api.ctv_sale.get_ctv_sale_overview
Cookie: sid=<Frappe session cookie>
Accept: application/json
~~~

Frappe bọc response thành công trong `message`.

Quy tắc scope:

- Với CTV Sale thông thường, endpoint luôn lấy CTV từ session hiện tại; không tin một `ctvId` do client gửi.
- `ctvId` chỉ là query tùy chọn cho role quản lý đã được cấp quyền xem CTV khác. Backend phải kiểm tra permission và scope trước khi query.
- Aggregate phải được tính sau khi áp dụng permission. Không cho client dùng `ctvId` để vượt phạm vi được cấp.
- Response có thể trả tên học sinh để phục vụ danh sách task, nhưng không trả số điện thoại, email hoặc dữ liệu nhạy cảm không cần cho overview.

## 4. Request

Ví dụ tải overview cho CTV đang đăng nhập:

~~~
GET /api/method/crm.api.ctv_sale.get_ctv_sale_overview?date=2026-09-05&trendRange=7d&outcomeRange=30d&timezone=Asia%2FHo_Chi_Minh
~~~

| Tên | Kiểu | Bắt buộc | Mặc định | Ràng buộc / mô tả |
|---|---|---:|---|---|
| `date` | date `YYYY-MM-DD` | Không | Ngày hiện tại theo timezone | Ngày dùng để tính task hôm nay, quá hạn và snapshot; không được nằm ngoài phạm vi dữ liệu được phép |
| `trendRange` | enum | Không | `7d` | Nhận `7d`, `30d`; xác định range mặc định của biểu đồ |
| `outcomeRange` | enum | Không | `30d` | Nhận `7d`, `30d`; cửa sổ tính phân bổ kết quả liên hệ |
| `timezone` | IANA timezone | Không | `Asia/Ho_Chi_Minh` | Dùng để cắt ngày và format bucket; backend phải trả lại trong `meta` |
| `ctvId` | string | Không | CTV trong session | Chỉ cho role quản lý; là ID canonical của user/CTV, không phải tên hiển thị |
| `priorityLimit` | integer | Không | `3` | `1..10`; chỉ giới hạn `tasks.priority.items`, không làm thay đổi aggregate |

`trendRange` chỉ thay đổi range mở đầu. Response nên trả cả `7d` và `30d` để dropdown chuyển range không cần request lại.

## 5. Response `200 OK`

Shape Frappe:

~~~
{ message: CtvSaleOverviewResponse }
~~~

Ví dụ response:

~~~json
{
  "message": {
    "meta": {
      "viewer": {
        "id": "USR-CTV-001",
        "displayName": "Nguyễn Văn A"
      },
      "date": "2026-09-05",
      "asOf": "2026-09-05T09:15:00+07:00",
      "timezone": "Asia/Ho_Chi_Minh",
      "status": "available",
      "warnings": []
    },
    "kpis": [
      {
        "id": "assigned",
        "value": 48,
        "deltaValue": 6,
        "deltaUnit": "count",
        "comparisonPeriod": "current-week",
        "direction": "up",
        "ratioOfAssigned": 1,
        "tone": "primary"
      },
      {
        "id": "uncontacted",
        "value": 5,
        "deltaValue": null,
        "deltaUnit": "count",
        "comparisonPeriod": null,
        "direction": null,
        "ratioOfAssigned": 0.1042,
        "tone": "warning"
      },
      {
        "id": "follow-up",
        "value": 14,
        "deltaValue": null,
        "deltaUnit": "count",
        "comparisonPeriod": null,
        "direction": null,
        "ratioOfAssigned": 0.2917,
        "tone": "info"
      },
      {
        "id": "transfer",
        "value": 8,
        "deltaValue": 2,
        "deltaUnit": "count",
        "comparisonPeriod": "previous-week",
        "direction": "up",
        "ratioOfAssigned": 0.1667,
        "tone": "success"
      }
    ],
    "tasks": {
      "priority": {
        "overdueCount": 2,
        "items": [
          {
            "id": "TASK-2026-0001",
            "studentId": "STU-2026-00042",
            "studentName": "Nguyễn Minh An",
            "taskType": "call",
            "taskTypeLabel": "Gọi lại",
            "dueAt": "2026-09-05T10:30:00+07:00",
            "detail": "Quan tâm ngành Công nghệ thông tin",
            "priority": "high",
            "status": "todo",
            "isOverdue": false
          }
        ]
      },
      "summary": {
        "today": {
          "total": 6,
          "pending": 2,
          "completed": 4
        },
        "overdue": {
          "count": 2
        },
        "upcoming": {
          "count": 4,
          "horizonDays": 7
        },
        "completion": {
          "completed": 4,
          "total": 6,
          "rate": 66.7
        }
      }
    },
    "studentStatus": {
      "total": 48,
      "items": [
        { "id": "new", "label": "Mới nhận", "count": 16, "share": 33.3 },
        { "id": "consulting", "label": "Đang tư vấn", "count": 18, "share": 37.5 },
        { "id": "connected", "label": "Đã kết nối", "count": 10, "share": 20.8 },
        { "id": "transferred", "label": "Đã chuyển Sale", "count": 4, "share": 8.3 }
      ]
    },
    "contacts": {
      "trend": {
        "defaultRange": "7d",
        "ranges": {
          "7d": {
            "from": "2026-08-30",
            "to": "2026-09-05",
            "points": [
              {
                "label": "T2",
                "periodStart": "2026-08-31",
                "periodEnd": "2026-08-31",
                "contacts": 8,
                "connected": 5
              }
            ],
            "totals": { "contacts": 87, "connected": 60 }
          },
          "30d": {
            "from": "2026-08-07",
            "to": "2026-09-05",
            "points": [
              {
                "label": "Tuần 1",
                "periodStart": "2026-08-07",
                "periodEnd": "2026-08-13",
                "contacts": 48,
                "connected": 31
              }
            ],
            "totals": { "contacts": 239, "connected": 163 }
          }
        }
      },
      "outcomes": {
        "from": "2026-08-07",
        "to": "2026-09-05",
        "total": 77,
        "connectedRate": 41.6,
        "items": [
          { "id": "connected", "label": "Đã kết nối", "count": 32, "share": 41.6 },
          { "id": "missed", "label": "Không bắt máy", "count": 18, "share": 23.4 },
          { "id": "follow-up", "label": "Follow-up", "count": 16, "share": 20.8 },
          { "id": "qualified", "label": "Có nhu cầu", "count": 11, "share": 14.3 }
        ]
      }
    }
  }
}
~~~

Các mảng `points`, `items` và `warnings` có thể rỗng nhưng không trả `null`. Ví dụ trên được rút gọn; response thật phải trả đủ bucket của cả `7d` và `30d`, cùng toàn bộ item trong giới hạn `priorityLimit`.

## 6. Data contract chi tiết

### 6.1. `meta`

~~~typescript
type CtvSaleOverviewMeta = {
  viewer: {
    id: string;
    displayName: string;
  };
  date: string; // YYYY-MM-DD theo timezone
  asOf: string; // ISO-8601 có timezone
  timezone: string;
  status: "available" | "partial" | "unavailable";
  warnings: string[];
};
~~~

`viewer.displayName` dùng cho lời chào. Ngày hiển thị trong header phải được format từ `meta.date`; không trả hoặc lưu một chuỗi kiểu `Thứ Bảy, 05/09/2026` làm nguồn dữ liệu duy nhất.

### 6.2. `kpis[]`

~~~typescript
type CtvSaleKpiId = "assigned" | "uncontacted" | "follow-up" | "transfer";

type CtvSaleKpi = {
  id: CtvSaleKpiId;
  value: number;
  deltaValue: number | null;
  deltaUnit: "count" | "percent";
  comparisonPeriod: "previous-day" | "previous-week" | "current-week" | null;
  direction: "up" | "down" | "flat" | null;
  ratioOfAssigned: number | null; // 0..1
  tone: "primary" | "info" | "warning" | "success";
};
~~~

Ý nghĩa KPI:

| ID | Định nghĩa |
|---|---|
| `assigned` | Số hồ sơ đang active và thuộc CTV tại thời điểm snapshot |
| `uncontacted` | Hồ sơ active chưa có contact attempt hợp lệ |
| `follow-up` | Hồ sơ có bước chăm sóc tiếp theo đang mở hoặc đến hạn |
| `transfer` | Hồ sơ đạt điều kiện bàn giao Sale theo policy hiện hành |

`label`, `note` và màu UI là presentation của frontend. Không trả Tailwind class, CSS variable hoặc tên icon từ backend. Nếu cần hiển thị trend, frontend format `deltaValue`, `deltaUnit`, `comparisonPeriod`.

### 6.3. `tasks`

~~~typescript
type PriorityTask = {
  id: string;
  studentId: string;
  studentName: string;
  taskType: "call" | "follow-up" | "message" | "other";
  taskTypeLabel: string;
  dueAt: string; // ISO-8601 có timezone
  detail: string;
  priority: "high" | "medium" | "low";
  status: "todo" | "in-progress" | "done" | "canceled";
  isOverdue: boolean;
};

type TaskSummary = {
  today: { total: number; pending: number; completed: number };
  overdue: { count: number };
  upcoming: { count: number; horizonDays: number };
  completion: { completed: number; total: number; rate: number | null };
};
~~~

Quy tắc tính:

- `today.total` là task không bị hủy có `dueAt` nằm trong ngày `meta.date`; `completed` là task hoàn tất trong cùng ngày.
- `overdue.count` là task chưa ở trạng thái kết thúc và có `dueAt` trước thời điểm `asOf`.
- `upcoming.count` là task chưa hoàn tất, có hạn từ ngày kế tiếp đến hết `horizonDays` ngày sau `meta.date`.
- `completion.rate = completed / total * 100`; trả `null` khi `total = 0`.
- `tasks.priority.items` sắp xếp theo `isOverdue desc`, `dueAt asc`, `priority desc`, sau đó `id asc` để kết quả ổn định.
- Nút hoàn thành task không thuộc GET overview. Khi persist trạng thái, dùng task API hiện có và refetch overview sau khi thành công.

### 6.4. `studentStatus`

~~~typescript
type StudentStatusId = "new" | "consulting" | "connected" | "transferred";

type StudentStatus = {
  total: number;
  items: Array<{
    id: StudentStatusId;
    label: string;
    count: number;
    share: number | null; // phần trăm trên total
  }>;
};
~~~

Các status phải dùng cùng một classification policy và cùng snapshot. Nếu status là mutually exclusive thì `sum(items[].count) = total` và `total = kpis[id=assigned].value`. `share` bằng `null` khi `total = 0`, không trả `0` để giả lập dữ liệu.

### 6.5. `contacts.trend`

~~~typescript
type ContactTrendPoint = {
  label: string;
  periodStart: string; // YYYY-MM-DD
  periodEnd: string; // YYYY-MM-DD
  contacts: number;
  connected: number;
};

type ContactTrendRange = {
  from: string;
  to: string;
  points: ContactTrendPoint[];
  totals: {
    contacts: number;
    connected: number;
  };
};

type ContactTrend = {
  defaultRange: "7d" | "30d";
  ranges: {
    "7d": ContactTrendRange;
    "30d": ContactTrendRange;
  };
};
~~~

`7d` dùng bucket theo ngày; `30d` dùng bucket theo tuần hoặc bucket calendar được backend công bố nhất quán. `label` chỉ để hiển thị, còn `periodStart`/`periodEnd` là khóa thời gian canonical. `connected <= contacts` ở từng bucket và tổng range.

`contacts` là số lượt contact attempt hợp lệ; `connected` là số attempt có kết quả kết nối thành công. Không đếm một lần gọi/nhắn tin nhiều lần nếu upstream đã có `interaction_id` canonical.

### 6.6. `contacts.outcomes`

~~~typescript
type ContactOutcomes = {
  from: string;
  to: string;
  total: number;
  connectedRate: number | null;
  items: Array<{
    id: "connected" | "missed" | "follow-up" | "qualified" | string;
    label: string;
    count: number;
    share: number | null;
  }>;
};
~~~

Các outcome trong response phải là các bucket mutually exclusive và exhaustive trên `total`; mỗi contact update chỉ được tính một lần. Nếu nghiệp vụ cần nhiều outcome trên một interaction, đổi tên denominator thành `totalOutcomeUpdates` và công bố rõ semantics thay vì dùng `total` gây hiểu nhầm.

`connectedRate = count(id = connected) / total * 100`; trả `null` khi `total = 0`. `share` là phần trăm trên `total`, tổng share có thể lệch nhẹ do làm tròn nhưng count phải khớp.

## 7. Quy tắc consistency và dữ liệu thiếu

- Tất cả số đếm là số nguyên không âm; phần trăm nằm trong `0..100`.
- Không dùng số liệu của trang hiện tại hoặc số item trong `tasks.priority.items` để tính KPI tổng.
- `meta.asOf` là thời điểm snapshot server, không phải thời điểm request nhận ở browser.
- Tất cả date/time phải dùng ISO-8601 hoặc `YYYY-MM-DD` theo field đã quy định; timezone phải nhất quán.
- Dữ liệu unavailable dùng `null` cho metric có thể thiếu và thêm mã cảnh báo vào `meta.warnings`; collection dùng `[]`.
- Khi `meta.status = "partial"`, warning phải chỉ rõ section/field bị ảnh hưởng. Không fallback im lặng về fixture.
- Snapshot phải loại record đã xóa, archived hoặc không còn thuộc scope của CTV.
- `studentStatus.total`, `kpis.assigned.value` và denominator trạng thái phải cùng định nghĩa “hồ sơ đang phụ trách”.

## 8. Error contract

~~~json
{
  "error": {
    "code": "CTV_SALE_OVERVIEW_UNAVAILABLE",
    "message": "Không thể tải dữ liệu tổng quan CTV Sale.",
    "details": {},
    "requestId": "req_01J..."
  }
}
~~~

| HTTP | Code | Khi dùng |
|---:|---|---|
| `400` | `INVALID_QUERY` | `date`, range, timezone hoặc limit không hợp lệ |
| `401` | `UNAUTHENTICATED` | Session không tồn tại hoặc hết hạn |
| `403` | `FORBIDDEN` | Không có quyền xem CTV/scope được yêu cầu |
| `404` | `CTV_NOT_FOUND` | `ctvId` không tồn tại hoặc không còn active |
| `409` | `SNAPSHOT_NOT_READY` | Snapshot đang được tổng hợp |
| `502` | `INVALID_CTV_SALE_OVERVIEW_RESPONSE` | Upstream thiếu field bắt buộc hoặc sai kiểu |
| `503` | `CTV_SALE_OVERVIEW_UNAVAILABLE` | Không đọc được nguồn task, student hoặc interaction |

## 9. Việc cần làm khi tích hợp

1. Tạo Frappe method `crm.api.ctv_sale.get_ctv_sale_overview` và áp dụng scope từ session.
2. Tạo service adapter trong `src/services/api/ctv-sale` để gọi endpoint, unwrap `message`, validate response và chuẩn hóa lỗi.
3. Thay fixture trong `ctv-sale/_components/data.ts` bằng một query overview duy nhất; giữ label/màu/icon ở presentation layer.
4. Nối `trendRange` với dữ liệu `contacts.trend.ranges`; không gọi API riêng cho từng card.
5. Persist thao tác hoàn thành task bằng task API hiện có, sau đó invalidate/refetch overview.
6. Bổ sung test cho query serialization, permission error, empty data, partial snapshot và các invariant count/rate.

## 10. Request tối thiểu

~~~
GET /api/method/crm.api.ctv_sale.get_ctv_sale_overview?trendRange=7d&outcomeRange=30d
~~~

Response tối thiểu để render đúng `/ctv-sale` phải có `meta.viewer`, `meta.date`, `meta.asOf`, đủ 4 KPI, `tasks.priority`, `tasks.summary`, `studentStatus`, cả hai range trong `contacts.trend` và `contacts.outcomes`.

