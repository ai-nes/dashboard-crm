# API cho `/sale` — Tổng quan Sale

Tài liệu này mô tả contract backend cần để hiển thị dashboard **Sale · Tổng quan** tại route `/sale`.

> Trạng thái: **đã triển khai**. Backend cung cấp snapshot tại `crm.api.sale.get_sale_overview`; route `/sale` tải dữ liệu qua service/query hook và không còn đọc fixture số liệu.

## 1. Phạm vi màn hình

Dashboard `/sale` cần một snapshot thống nhất cho các vùng sau:

| Vùng UI | Dữ liệu API | Ghi chú |
|---|---|---|
| Header chào buổi sáng | `meta.viewer`, `meta.date`, `tasks.summary.today.total` | Tên, ngày và số task không hard-code |
| 5 KPI pipeline | `kpis[]` | `assigned`, `consulting`, `qualified`, `documents`, `admission` |
| Task ưu tiên | `tasks.priority` | Danh sách task mở, sắp theo hạn và mức ưu tiên |
| Phễu tuyển sinh | `pipeline.stages[]` | 7 bước từ phân công đến nhập học |
| Học sinh cần chú ý | `attention.items[]` | Hồ sơ có nguy cơ, ý định cao hoặc bị kẹt |
| Xu hướng chuyển đổi | `conversionTrend` | Hai range `4w` và `12w`; series tư vấn hoàn tất và nhập học |
| Trạng thái học sinh | `studentStatus` | Phân bổ độc quyền trên tập hồ sơ đang phụ trách |
| Việc & hồ sơ cần xử lý | `operations` | Task quá hạn và hồ sơ thiếu giấy tờ |

Nguồn tham chiếu trong frontend:

- [sale/page.tsx](<../../src/app/(with-layouts)/(dashboard)/sale/page.tsx>)
- [sale-dashboard.tsx](<../../src/app/(with-layouts)/(dashboard)/sale/_components/sale-dashboard.tsx>)
- [data.ts](<../../src/app/(with-layouts)/(dashboard)/sale/_components/data.ts>)
- [stat-cards.tsx](<../../src/app/(with-layouts)/(dashboard)/sale/_components/stat-cards.tsx>)
- [priority-tasks.tsx](<../../src/app/(with-layouts)/(dashboard)/sale/_components/priority-tasks.tsx>)
- [funnel-overview.tsx](<../../src/app/(with-layouts)/(dashboard)/sale/_components/funnel-overview.tsx>)
- [conversion-trend-chart.tsx](<../../src/app/(with-layouts)/(dashboard)/sale/_components/conversion-trend-chart.tsx>)
- [student-status-chart.tsx](<../../src/app/(with-layouts)/(dashboard)/sale/_components/student-status-chart.tsx>)
- [operations-summary.tsx](<../../src/app/(with-layouts)/(dashboard)/sale/_components/operations-summary.tsx>)

## 2. Tình trạng tích hợp hiện tại

Route `/sale` gọi một lần `crm.api.sale.get_sale_overview` qua:

- `src/services/api/sale/index.ts`
- `src/services/api/sale/types.ts`
- `src/hooks/use-sale-overview-query.ts`

Các component nhận dữ liệu từ cùng response snapshot; label, màu, icon và href
vẫn được map ở frontend. Không còn dùng fixture số liệu cho dashboard Sale.

Không nên tạo một request riêng cho từng card. Backend nên trả một snapshot duy nhất để KPI, task, funnel, biểu đồ và trạng thái học sinh cùng dùng `meta.asOf` và cùng phạm vi dữ liệu.

## 3. Endpoint và quyền truy cập

Endpoint production đề xuất:

```http
GET {NEXT_PUBLIC_FRAPPE_URL}/api/method/crm.api.sale.get_sale_overview
Cookie: sid=<Frappe session cookie>
Accept: application/json
```

Frappe bọc payload thành công trong key `message`.

Quy tắc scope bắt buộc:

- API này phục vụ role **Sale** và mặc định lấy Sale từ session hiện tại.
- Không tin `saleId`, `owner` hoặc `assignedTo` do browser gửi để xác định phạm vi dữ liệu.
- Chỉ trả học sinh, task, tương tác và hồ sơ thuộc Sale hiện tại theo permission backend.
- Bộ lọc scope phải được áp dụng trước khi tính aggregate. Không tính KPI toàn hệ thống rồi lọc kết quả ở frontend.
- Nếu muốn dùng chung endpoint cho Lead Sales, phải thêm một scope rõ ràng và kiểm tra quyền team ở backend; không tự động mở rộng quyền từ contract này.
- `meta.viewer` phải phản ánh user đã xác thực, không lấy từ query string.

Route-level role hiện được khai báo tại [rbac.ts](<../../src/components/common/auth/rbac.ts>) là `Sale`. Ma trận nghiệp vụ mô tả quyền dữ liệu tương ứng là **Own** tại [rbac-permission-matrix.md](../../docs/rbac-permission-matrix.md).

## 4. Request

Ví dụ tải overview cho Sale đang đăng nhập:

```http
GET /api/method/crm.api.sale.get_sale_overview?admissionYear=2026&date=2026-09-05&trendRange=4w&timezone=Asia%2FHo_Chi_Minh&priorityLimit=4
```

| Tên | Kiểu | Bắt buộc | Mặc định | Ràng buộc / mô tả |
|---|---|---:|---|---|
| `admissionYear` | integer | Không | Kỳ tuyển sinh hiện hành | Kỳ dùng cho pipeline và tập hồ sơ; phải là kỳ Sale được phép xem |
| `date` | date `YYYY-MM-DD` | Không | Ngày hiện tại theo timezone | Ngày dùng để tính task hôm nay, quá hạn và snapshot báo cáo |
| `trendRange` | enum | Không | `4w` | Nhận `4w`, `12w`; xác định range mở đầu của biểu đồ |
| `timezone` | IANA timezone | Không | `Asia/Ho_Chi_Minh` | Dùng để cắt ngày, tính quá hạn và tạo bucket biểu đồ |
| `priorityLimit` | integer | Không | `4` | Giá trị từ `1..10`; chỉ giới hạn danh sách task ưu tiên |

`trendRange` chỉ xác định lựa chọn ban đầu. Response nên trả cả hai range để người dùng chuyển `4w`/`12w` mà không cần request lại.

Request không có body. Với request server-side, service phải chuyển tiếp cookie `sid`; với request browser cross-origin, dùng session cookie và cơ chế CSRF của Frappe theo quy ước hiện tại của repo.

## 5. Response `200 OK`

### 5.1. Shape tổng quát

```text
{
  message: SaleOverviewResponse
}
```

Ví dụ rút gọn:

```json
{
  "message": {
    "meta": {
      "viewer": {
        "id": "USR-SALE-001",
        "displayName": "Nguyễn Văn A"
      },
      "admissionYear": 2026,
      "date": "2026-09-05",
      "asOf": "2026-09-05T09:15:00+07:00",
      "timezone": "Asia/Ho_Chi_Minh",
      "status": "available",
      "warnings": []
    },
    "kpis": [
      { "id": "assigned", "value": 128 },
      { "id": "consulting", "value": 42 },
      { "id": "qualified", "value": 26 },
      { "id": "documents", "value": 18 },
      { "id": "admission", "value": 9 }
    ],
    "tasks": {
      "priority": {
        "overdueCount": 3,
        "items": [
          {
            "id": "TASK-2026-0001",
            "studentId": "STU-2026-00042",
            "studentName": "Nguyễn Minh An",
            "title": "Tư vấn học phí + học bổng",
            "type": "call",
            "startAt": "2026-09-05T16:00:00+07:00",
            "dueAt": "2026-09-05T18:00:00+07:00",
            "context": "Đã để lại yêu cầu tư vấn chi tiết",
            "priority": "High",
            "status": "Todo",
            "isOverdue": false
          }
        ]
      },
      "summary": {
        "today": { "total": 10, "pending": 7, "completed": 3 },
        "overdue": { "count": 3 },
        "upcoming": { "count": 6, "horizonDays": 7 }
      }
    },
    "pipeline": {
      "stages": [
        { "id": "assigned", "label": "Đang phụ trách", "count": 128 },
        { "id": "contacted", "label": "Đã liên hệ", "count": 96 },
        { "id": "consulted", "label": "Đã tư vấn", "count": 64 },
        { "id": "interested", "label": "Có nhu cầu", "count": 38 },
        { "id": "documents", "label": "Đang làm hồ sơ", "count": 18 },
        { "id": "confirmed", "label": "Đã xác nhận", "count": 12 },
        { "id": "admitted", "label": "Nhập học", "count": 9 }
      ]
    },
    "attention": {
      "items": [
        { "id": "at-risk", "count": 5 },
        { "id": "high-intent", "count": 8 },
        { "id": "blocked", "count": 4 }
      ]
    },
    "conversionTrend": {
      "defaultRange": "4w",
      "ranges": {
        "4w": {
          "from": "2026-08-10",
          "to": "2026-09-05",
          "points": [
            { "label": "Tuần 1", "periodStart": "2026-08-10", "periodEnd": "2026-08-16", "consulted": 22, "admitted": 3 },
            { "label": "Tuần 2", "periodStart": "2026-08-17", "periodEnd": "2026-08-23", "consulted": 28, "admitted": 5 }
          ]
        },
        "12w": {
          "from": "2026-06-15",
          "to": "2026-09-05",
          "points": [
            { "label": "T1", "periodStart": "2026-06-15", "periodEnd": "2026-06-21", "consulted": 18, "admitted": 2 }
          ]
        }
      }
    },
    "studentStatus": {
      "total": 128,
      "items": [
        { "id": "new", "label": "Mới phân công", "count": 24, "share": 18.8 },
        { "id": "consulting", "label": "Đang tư vấn", "count": 42, "share": 32.8 },
        { "id": "waiting", "label": "Chờ phản hồi", "count": 35, "share": 27.3 },
        { "id": "documents", "label": "Đang làm hồ sơ", "count": 18, "share": 14.1 },
        { "id": "admission", "label": "Chờ nhập học", "count": 9, "share": 7.0 }
      ]
    },
    "operations": {
      "total": 5,
      "items": [
        { "id": "overdue-tasks", "count": 3 },
        { "id": "missing-documents", "count": 2 }
      ]
    }
  }
}
```

`points`, `items` và `warnings` có thể rỗng nhưng không trả `null`. Ví dụ trên chỉ hiển thị một phần bucket của trend; response thật phải trả đủ bucket cho cả `4w` và `12w`.

### 5.2. TypeScript contract

```typescript
type SaleOverviewStatus = "available" | "partial" | "unavailable";
type SaleTrendRange = "4w" | "12w";

type SaleOverviewMeta = {
  viewer: { id: string; displayName: string };
  admissionYear: number;
  date: string; // YYYY-MM-DD theo timezone
  asOf: string; // ISO-8601 có timezone
  timezone: string;
  status: SaleOverviewStatus;
  warnings: string[];
};

type SaleKpiId =
  | "assigned"
  | "consulting"
  | "qualified"
  | "documents"
  | "admission";

type SaleKpi = {
  id: SaleKpiId;
  value: number;
};

type SaleTask = {
  id: string;
  studentId: string;
  studentName: string;
  title: string;
  type: "call" | "document" | "message" | "other";
  startAt: string | null;
  dueAt: string | null;
  context: string | null;
  priority: "Low" | "Medium" | "High";
  status: "Backlog" | "Todo" | "In Progress" | "Done" | "Canceled";
  isOverdue: boolean;
};

type SaleTasks = {
  priority: {
    overdueCount: number;
    items: SaleTask[];
  };
  summary: {
    today: { total: number; pending: number; completed: number };
    overdue: { count: number };
    upcoming: { count: number; horizonDays: number };
  };
};

type SalePipelineStage = {
  id:
    | "assigned"
    | "contacted"
    | "consulted"
    | "interested"
    | "documents"
    | "confirmed"
    | "admitted";
  label: string;
  count: number;
};

type SaleAttentionItem = {
  id: "at-risk" | "high-intent" | "blocked";
  count: number;
};

type SaleTrendPoint = {
  label: string;
  periodStart: string; // YYYY-MM-DD
  periodEnd: string; // YYYY-MM-DD
  consulted: number;
  admitted: number;
};

type SaleTrendRangeData = {
  from: string;
  to: string;
  points: SaleTrendPoint[];
};

type SaleConversionTrend = {
  defaultRange: SaleTrendRange;
  ranges: Record<SaleTrendRange, SaleTrendRangeData>;
};

type SaleStudentStatusItem = {
  id: "new" | "consulting" | "waiting" | "documents" | "admission";
  label: string;
  count: number;
  share: number | null; // phần trăm trên total, 0..100
};

type SaleStudentStatus = {
  total: number;
  items: SaleStudentStatusItem[];
};

type SaleOperations = {
  total: number;
  items: Array<{
    id: "overdue-tasks" | "missing-documents";
    count: number;
  }>;
};

type SaleOverviewResponse = {
  meta: SaleOverviewMeta;
  kpis: SaleKpi[];
  tasks: SaleTasks;
  pipeline: { stages: SalePipelineStage[] };
  attention: { items: SaleAttentionItem[] };
  conversionTrend: SaleConversionTrend;
  studentStatus: SaleStudentStatus;
  operations: SaleOperations;
};
```

`label`, `context` và nội dung mô tả là dữ liệu hiển thị; `tone`, màu, icon, Tailwind class và href không thuộc response API. Frontend tự map `id` sang presentation phù hợp.

## 6. Quy tắc nghiệp vụ và consistency

### 6.1. KPI và trạng thái hồ sơ

| ID | Định nghĩa |
|---|---|
| `assigned` | Số hồ sơ active thuộc Sale hiện tại trong kỳ tuyển sinh |
| `consulting` | Hồ sơ active đang ở giai đoạn tư vấn |
| `qualified` | Hồ sơ đã được xác định có nhu cầu/đủ điều kiện theo qualification policy |
| `documents` | Hồ sơ đang hoàn thiện hoặc bổ sung giấy tờ |
| `admission` | Hồ sơ đã đủ điều kiện và đang chờ bước nhập học |

`studentStatus.items` là các nhóm **mutually exclusive** của tập hồ sơ active. Vì vậy:

- `sum(items[].count) = studentStatus.total`;
- `studentStatus.total = kpis[id=assigned].value`;
- `share = count / total * 100`, làm tròn tối đa một chữ số;
- khi `total = 0`, `share` là `null` thay vì dùng số giả lập.

`pipeline.stages` là funnel theo cohort/kỳ tuyển sinh, không phải phân bổ trạng thái hiện tại. Mỗi hồ sơ chỉ được tính một lần ở mỗi stage mà hồ sơ đã đạt; không cộng các stage để suy ra tổng Sale. Nếu backend chọn semantics khác, phải ghi rõ trong contract trước khi tích hợp.

### 6.2. Task

- `today.total` là task không ở trạng thái `Canceled` có thời điểm xử lý nằm trong ngày `meta.date` theo `meta.timezone`.
- `today.completed` là task trong tập trên đã chuyển sang `Done`; `pending = total - completed`.
- `overdue.count` là task chưa ở trạng thái `Done`/`Canceled` và `dueAt < meta.asOf`.
- `upcoming.count` là task chưa hoàn tất, có hạn từ ngày kế tiếp đến hết `horizonDays` ngày sau `meta.date`.
- `priority.overdueCount` là tổng task quá hạn trong scope, không bị giới hạn bởi số item trả về.
- `priority.items` loại task đã `Done`/`Canceled` và sắp theo `isOverdue desc`, `dueAt asc`, `priority desc`, sau đó `id asc` để kết quả ổn định.
- `isOverdue` được tính ở server theo `meta.asOf`, không tính theo đồng hồ của browser.
- Nút **Thực hiện** chỉ điều hướng tới `/sale/tasks?task={id}`. Persist trạng thái dùng task API dùng chung, sau đó invalidate/refetch overview.

### 6.3. Pipeline và trend

- `pipeline.stages` trả đúng 7 stage và đúng code ổn định; frontend không dùng label để làm key.
- `count` là số nguyên không âm. Nếu funnel là cumulative, count của stage sau không được lớn hơn stage trước.
- `conversionTrend.ranges["4w"]` và `ranges["12w"]` phải dùng cùng timezone và cùng định nghĩa event.
- `consulted` là số hồ sơ hoàn tất tư vấn trong bucket; `admitted` là số hồ sơ ghi nhận nhập học trong bucket. Đây là count theo bucket, không phải số dư cuối kỳ.
- `periodStart`/`periodEnd` là khóa thời gian canonical; `label` chỉ phục vụ hiển thị.
- Không trả chuỗi đã format theo locale làm dữ liệu thời gian duy nhất.

### 6.4. Dữ liệu thiếu và snapshot

- `meta.asOf` là thời điểm snapshot phía server.
- Các collection thiếu dữ liệu dùng `[]`; metric không thể tính dùng `null` theo type đã công bố.
- `meta.status = "partial"` phải kèm warning chỉ rõ section/field bị ảnh hưởng.
- Không dùng fixture hoặc số liệu của section khác để bù im lặng khi API unavailable.
- Loại record archived, deleted hoặc không còn thuộc Sale khỏi mọi aggregate.
- Tất cả count là số nguyên không âm; phần trăm nằm trong `0..100`.

## 7. Error contract

```json
{
  "error": {
    "code": "SALE_OVERVIEW_UNAVAILABLE",
    "message": "Không thể tải dữ liệu tổng quan Sale.",
    "details": {},
    "requestId": "req_01J..."
  }
}
```

| HTTP | Code | Khi dùng |
|---:|---|---|
| `400` | `INVALID_QUERY` | `admissionYear`, `date`, `timezone`, range hoặc limit không hợp lệ |
| `401` | `UNAUTHENTICATED` | Session không tồn tại hoặc đã hết hạn |
| `403` | `FORBIDDEN` | User không có role Sale hoặc request vượt scope own |
| `404` | `ADMISSION_YEAR_NOT_FOUND` | Kỳ tuyển sinh không tồn tại/không khả dụng |
| `502` | `INVALID_SALE_OVERVIEW_RESPONSE` | Nguồn dữ liệu trả thiếu field bắt buộc hoặc sai kiểu |
| `503` | `SALE_OVERVIEW_UNAVAILABLE` | Không đọc được nguồn student, task, interaction hoặc document |

Frontend nên giữ `requestId` trong log client-side có kiểm soát, nhưng không log PII của học sinh.

## 8. API cho các route con của `/sale`

Các route con hiện tái sử dụng component của Director. Chúng cần contract riêng hoặc adapter riêng để không vô tình mở rộng scope của Sale:

| Route | API hiện có / cần dùng | Ghi chú |
|---|---|---|
| `/sale/students` | `crm.api.director_students.get_director_students`, `get_director_student` | Bắt buộc lọc `assigned_to` theo Sale ở backend; tham khảo [director-students.md](./director-students.md) và [director-student-detail.md](./director-student-detail.md) |
| `/sale/tasks` | `crm.api.task.list_tasks`, `get_task`, `create_task`, `update_task`, `delete_task` | CRUD task phải kiểm tra owner/assignment; service hiện có tại [crm-tasks/index.ts](<../../src/services/api/crm-tasks/index.ts>) |
| `/sale/next-best-action` | NBA recommendation/operational APIs hiện có | Chỉ trả recommendation của student thuộc Sale; tham khảo [director-next-best-action.md](./director-next-best-action.md) |
| `/sale/demographics` | `director_demographics` overview/segment | Nếu cho Sale xem, backend phải áp dụng scope own trước khi aggregate; không dùng mặc định `scope=all` |

Chi tiết các API dùng chung không được copy lại vào contract overview. Dashboard `/sale` chỉ dùng `studentId`/`taskId` để điều hướng sang các route này.

## 9. Checklist tích hợp

1. [x] Tạo Frappe method `crm.api.sale.get_sale_overview` với permission scope từ session.
2. [x] Tạo adapter tại `src/services/api/sale` để serialize query, unwrap `message`, validate response và chuẩn hóa lỗi.
3. [x] Tạo `useSaleOverviewQuery` với query key gồm `admissionYear`, `date`, `timezone` và `trendRange`.
4. [x] Thay các import fixture trong `sale/_components` bằng dữ liệu từ overview query; giữ label presentation, màu và icon ở frontend.
5. [x] Dùng cùng snapshot cho mọi section; không gọi API riêng cho từng KPI hoặc từng stage.
6. Sau thao tác cập nhật task hoặc document ở route con, invalidate query overview của Sale.
7. Bổ sung test cho query serialization, own-scope, empty data, partial snapshot, timezone, sorting task và các invariant count/share.

Request tối thiểu để render đúng dashboard:

```http
GET /api/method/crm.api.sale.get_sale_overview?admissionYear=2026&trendRange=4w
```

Response tối thiểu phải có `meta.viewer`, `meta.date`, `meta.asOf`, đủ 5 KPI, `tasks.priority`, `tasks.summary`, 7 pipeline stages, `attention`, cả hai trend range, `studentStatus` và `operations`.
