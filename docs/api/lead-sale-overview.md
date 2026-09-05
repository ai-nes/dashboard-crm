# API cho `/lead-sale` — Tổng quan Lead Sales

Tài liệu này mô tả contract backend cho dashboard **Lead Sales · Tổng quan**.
Màn hình dành cho trưởng nhóm Sale, dùng để theo dõi phân công, các nhóm cần
can thiệp, hiệu suất từng thành viên, trạng thái hồ sơ và kết quả của cả team.

> Trạng thái: **đã triển khai**. Backend cung cấp snapshot tại
> `crm.api.lead_sale.get_lead_sale_overview`; route `/lead-sale` tải dữ liệu qua
> service/query hook và không còn đọc fixture số liệu.

## 1. Phạm vi màn hình

Dashboard cần một snapshot thống nhất cho các vùng sau:

| Vùng UI | Dữ liệu API | Ghi chú |
|---|---|---|
| Header | `meta.viewer`, `meta.date`, `meta.asOf` | Tên người xem và ngày không hard-code |
| 6 KPI | `kpis[]` | Đang phụ trách, mới nhận, chưa phân công, cần xử lý, quá hạn, hồ sơ chờ |
| Cần can thiệp | `interventions.items[]` | 4 nhóm cần trưởng nhóm quyết định hoặc hỗ trợ |
| Hiệu suất đội ngũ | `teamPerformance.items[]` | Chỉ các thành viên thuộc team của Lead Sales |
| Trạng thái học sinh | `studentStatus` | Phân bổ mutually exclusive trên toàn team |
| Xu hướng kết quả | `resultTrend` | Hai range `4w` và `3m`; tư vấn hoàn tất và nhập học |

Nguồn tham chiếu trong frontend:

- [lead-sale/page.tsx](<../../src/app/(with-layouts)/(dashboard)/lead-sale/page.tsx>)
- [lead-sale-dashboard.tsx](<../../src/app/(with-layouts)/(dashboard)/lead-sale/_components/lead-sale-dashboard.tsx>)
- [data.ts](<../../src/app/(with-layouts)/(dashboard)/lead-sale/_components/data.ts>)
- [intervention-panel.tsx](<../../src/app/(with-layouts)/(dashboard)/lead-sale/_components/intervention-panel.tsx>)
- [team-performance.tsx](<../../src/app/(with-layouts)/(dashboard)/lead-sale/_components/team-performance.tsx>)
- [student-status-chart.tsx](<../../src/app/(with-layouts)/(dashboard)/lead-sale/_components/student-status-chart.tsx>)
- [result-trend-chart.tsx](<../../src/app/(with-layouts)/(dashboard)/lead-sale/_components/result-trend-chart.tsx>)

## 2. Nguyên tắc tích hợp

Route nên gọi một endpoint overview duy nhất. Không tách request cho từng KPI,
từng nhóm can thiệp hoặc từng biểu đồ; các section phải dùng cùng `meta.asOf`,
kỳ tuyển sinh, timezone và team scope.

Frontend chỉ map `id` sang label, màu, icon và href. Backend không trả Tailwind
class, CSS variable, tên icon hoặc đường dẫn UI.

## 3. Endpoint và quyền truy cập

Endpoint production đề xuất:

```http
GET {NEXT_PUBLIC_FRAPPE_URL}/api/method/crm.api.lead_sale.get_lead_sale_overview
Cookie: sid=<Frappe session cookie>
Accept: application/json
```

Frappe bọc payload thành công trong key `message`.

Quy tắc scope bắt buộc:

- Chỉ role **Lead Sales** được gọi endpoint này theo route hiện tại.
- Team phải được suy ra từ session của Lead Sales; không tin `teamId`, `leadId`,
  `saleId`, `owner` hoặc `assignedTo` do browser gửi để mở rộng phạm vi.
- Response chỉ gồm hồ sơ, task, interaction và thành viên thuộc team mà Lead
  Sales hiện tại quản lý.
- Permission phải được áp dụng trước khi tính KPI, trend và tỷ lệ; không
  tính toàn hệ thống rồi lọc kết quả ở frontend.
- `teamPerformance.items[]` không được bao gồm thành viên ngoài team hoặc user
  đã inactive, trừ khi backend công bố rõ semantics của snapshot lịch sử.
- Chỉ trả dữ liệu tối thiểu cho dashboard overview; không nhúng số điện thoại,
  email hoặc nội dung trao đổi nhạy cảm của học sinh.

Route-level role hiện được khai báo tại [rbac.ts](<../../src/components/common/auth/rbac.ts>)
và ma trận nghiệp vụ mô tả Lead Sales là quyền **Team** tại
[rbac-permission-matrix.md](../../docs/rbac-permission-matrix.md).

## 4. Request

Ví dụ tải overview cho team của Lead Sales đang đăng nhập:

```http
GET /api/method/crm.api.lead_sale.get_lead_sale_overview?admissionYear=2026&date=2026-09-05&trendRange=4w&timezone=Asia%2FHo_Chi_Minh&teamMemberLimit=20
```

| Tên | Kiểu | Bắt buộc | Mặc định | Ràng buộc / mô tả |
|---|---|---:|---|---|
| `admissionYear` | integer | Không | Kỳ hiện hành | Kỳ mà Lead Sales được phép xem |
| `date` | date `YYYY-MM-DD` | Không | Ngày hiện tại theo timezone | Dùng tính “hôm nay”, quá hạn và snapshot |
| `trendRange` | enum | Không | `4w` | Nhận `4w`, `3m`; chỉ xác định range hiển thị ban đầu |
| `timezone` | IANA timezone | Không | `Asia/Ho_Chi_Minh` | Dùng cắt ngày và tạo bucket trend |
| `teamMemberLimit` | integer | Không | `20` | Giá trị `1..50`; chỉ giới hạn danh sách hiệu suất, không đổi aggregate |

Request không có body. Không hỗ trợ `teamId` hoặc `memberId` cho Lead Sales thông
thường. Nếu có role quản lý được phép xem nhiều team, cần contract scope riêng
và permission check ở backend; không mở rộng ngầm endpoint này.

`trendRange` chỉ thay đổi range mặc định. Response phải trả cả `4w` và `3m` để
frontend chuyển lựa chọn mà không cần request lại.

## 5. Response `200 OK`

### 5.1. Shape tổng quát

```text
{
  message: LeadSaleOverviewResponse
}
```

Ví dụ rút gọn:

```json
{
  "message": {
    "meta": {
      "viewer": {
        "id": "USR-LEAD-SALE-001",
        "displayName": "Nguyễn Minh Anh"
      },
      "team": {
        "id": "TEAM-SALE-01",
        "name": "Đội Sale Hà Nội"
      },
      "admissionYear": 2026,
      "date": "2026-09-05",
      "asOf": "2026-09-05T09:15:00+07:00",
      "timezone": "Asia/Ho_Chi_Minh",
      "status": "available",
      "warnings": []
    },
    "kpis": [
      { "id": "active", "value": 184 },
      { "id": "new", "value": 24 },
      { "id": "unassigned", "value": 18 },
      { "id": "needs-action", "value": 27 },
      { "id": "overdue", "value": 6 },
      { "id": "documents", "value": 14 }
    ],
    "interventions": {
      "items": [
        { "id": "unassigned", "count": 18 },
        { "id": "not-contacted", "count": 12 },
        { "id": "at-risk", "count": 8 },
        { "id": "blocked", "count": 5 }
      ]
    },
    "teamPerformance": {
      "items": [
        {
          "id": "USR-SALE-001",
          "displayName": "Nguyễn Minh Anh",
          "activeStudents": 46,
          "consulted": 31,
          "admitted": 8,
          "status": "on-track"
        }
      ]
    },
    "studentStatus": {
      "total": 184,
      "items": [
        { "id": "consulting", "label": "Đang tư vấn", "count": 72, "share": 39.1 },
        { "id": "waiting", "label": "Chờ phản hồi", "count": 48, "share": 26.1 },
        { "id": "documents", "label": "Đang làm hồ sơ", "count": 29, "share": 15.8 },
        { "id": "admission", "label": "Chờ nhập học", "count": 17, "share": 9.2 },
        { "id": "new", "label": "Mới nhận", "count": 18, "share": 9.8 }
      ]
    },
    "resultTrend": {
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
              "consulted": 68,
              "admitted": 9
            }
          ]
        },
        "3m": {
          "from": "2026-06-05",
          "to": "2026-09-05",
          "points": [
            {
              "label": "Tháng 1",
              "periodStart": "2026-06-05",
              "periodEnd": "2026-07-04",
              "consulted": 214,
              "admitted": 42
            }
          ]
        }
      }
    }
  }
}
```

Các collection (`items`, `points`, `warnings`) có thể rỗng nhưng không trả
`null`. Ví dụ chỉ hiển thị một phần team và bucket; response thật phải trả đủ
item trong giới hạn `teamMemberLimit` và đủ bucket của cả hai range.

### 5.2. TypeScript contract

```typescript
type LeadSaleOverviewStatus = "available" | "partial" | "unavailable";
type LeadSaleTrendRange = "4w" | "3m";

type LeadSaleOverviewMeta = {
  viewer: { id: string; displayName: string };
  team: { id: string; name: string };
  admissionYear: number;
  date: string; // YYYY-MM-DD theo timezone
  asOf: string; // ISO-8601 có timezone
  timezone: string;
  status: LeadSaleOverviewStatus;
  warnings: string[];
};

type LeadSaleKpiId =
  | "active"
  | "new"
  | "unassigned"
  | "needs-action"
  | "overdue"
  | "documents";

type LeadSaleKpi = { id: LeadSaleKpiId; value: number };

type LeadSaleInterventionId =
  | "unassigned"
  | "not-contacted"
  | "at-risk"
  | "blocked";

type LeadSaleIntervention = {
  id: LeadSaleInterventionId;
  count: number;
};

type LeadSaleTeamMemberStatus = "on-track" | "needs-support";

type LeadSaleTeamMember = {
  id: string;
  displayName: string;
  activeStudents: number;
  consulted: number;
  admitted: number;
  status: LeadSaleTeamMemberStatus;
};

type LeadSaleStudentStatusId =
  | "consulting"
  | "waiting"
  | "documents"
  | "admission"
  | "new";

type LeadSaleStudentStatus = {
  total: number;
  items: Array<{
    id: LeadSaleStudentStatusId;
    label: string;
    count: number;
    share: number | null; // 0..100; null khi total = 0
  }>;
};

type LeadSaleTrendPoint = {
  label: string;
  periodStart: string; // YYYY-MM-DD
  periodEnd: string; // YYYY-MM-DD
  consulted: number;
  admitted: number;
};

type LeadSaleTrendRangeData = {
  from: string;
  to: string;
  points: LeadSaleTrendPoint[];
};

type LeadSaleResultTrend = {
  defaultRange: LeadSaleTrendRange;
  ranges: Record<LeadSaleTrendRange, LeadSaleTrendRangeData>;
};

type LeadSaleOverviewResponse = {
  meta: LeadSaleOverviewMeta;
  kpis: LeadSaleKpi[];
  interventions: { items: LeadSaleIntervention[] };
  teamPerformance: { items: LeadSaleTeamMember[] };
  studentStatus: LeadSaleStudentStatus;
  resultTrend: LeadSaleResultTrend;
};
```

`initials`, label hiển thị của team member, tone, icon và href là presentation
của frontend. `studentStatus.items[].label` có thể do backend trả để bảo đảm
policy hiển thị nhất quán, nhưng frontend không được dùng label làm key.

## 6. Định nghĩa nghiệp vụ và invariant

### 6.1. KPI và nhóm can thiệp

| ID | Định nghĩa |
|---|---|
| `active` | Hồ sơ đang active, đã phân công cho một thành viên trong team, thuộc kỳ tuyển sinh |
| `new` | Hồ sơ mới được tiếp nhận hoặc phân công trong ngày `meta.date` |
| `unassigned` | Hồ sơ thuộc phạm vi team nhưng chưa có Sale phụ trách |
| `needs-action` | Hồ sơ đang có hành động chăm sóc hoặc xử lý cần thực hiện theo policy hiện hành |
| `overdue` | Task chưa hoàn tất có hạn trước `meta.asOf` trong team scope |
| `documents` | Hồ sơ đang chờ giấy tờ, xác nhận hoặc bổ sung hồ sơ |

Các KPI có thể chồng lấn về nghiệp vụ; chỉ `studentStatus` là phân bổ độc quyền.
`interventions.items[]` cũng có thể chồng lấn nếu một hồ sơ đồng thời vi phạm
nhiều rule, vì vậy không cộng các nhóm này để suy ra tổng hồ sơ.

| ID | Rule tối thiểu |
|---|---|
| `unassigned` | Chưa có Sale được gán tại thời điểm snapshot |
| `not-contacted` | Sau 24 giờ kể từ lúc nhận/phân công nhưng chưa có contact hợp lệ |
| `at-risk` | Không phản hồi hoặc giảm tương tác theo ngưỡng risk policy |
| `blocked` | Bị chặn bởi giấy tờ thiếu, task chưa xử lý hoặc dependency nghiệp vụ |

Ngưỡng “at risk”, “cần xử lý” và “blocked” phải là policy có version hoặc cấu
hình được backend công bố; không để frontend tự suy đoán từ count.

### 6.2. Hiệu suất team

- `activeStudents`, `consulted` và `admitted` đều tính trong cùng
  `admissionYear`, team scope và snapshot `meta.asOf`.
- `consulted` và `admitted` là số hồ sơ đã đạt event tương ứng, không phải số
  task hoặc số lượt gọi.
- `status` dùng mã ổn định `on-track` / `needs-support`; label tiếng Việt và
  badge màu do frontend map. Ngưỡng phân loại phải nhất quán với policy team.
- Thứ tự danh sách nên ổn định: `status` cần hỗ trợ trước, sau đó theo
  `activeStudents desc`, rồi `id asc`.

### 6.3. Trạng thái học sinh

- Các item phải mutually exclusive và exhaustive trên tập hồ sơ active của team.
- `sum(studentStatus.items[].count) = studentStatus.total`.
- `studentStatus.total = kpis[id=active].value`.
- `share = count / total * 100`, làm tròn tối đa một chữ số; khi `total = 0`,
  trả `null`.
- Không dùng số hồ sơ trong một section khác làm denominator.

### 6.4. Xu hướng kết quả

- `ranges["4w"]` có bốn bucket theo tuần; `ranges["3m"]` có ba bucket theo
  tháng hoặc calendar bucket đã được backend công bố nhất quán.
- `consulted` là số hồ sơ hoàn tất tư vấn trong bucket; `admitted` là số hồ sơ
  ghi nhận nhập học trong bucket. Đây là event count, không phải số dư cuối kỳ.
- `periodStart` và `periodEnd` là khóa thời gian canonical; `label` chỉ phục vụ
  hiển thị.
- Tất cả bucket dùng `meta.timezone`, có khoảng thời gian không chồng lấn và
  được sắp xếp tăng dần.

### 6.5. Snapshot và dữ liệu thiếu

- `meta.asOf` là thời điểm snapshot phía server; `meta.date` là ngày theo
  `meta.timezone`, không phải ngày trên đồng hồ browser.
- Loại record deleted, archived hoặc đã ra khỏi team khỏi mọi aggregate.
- Collection thiếu dữ liệu dùng `[]`; metric không thể tính dùng `null` theo
  type đã công bố.
- `meta.status = "partial"` phải kèm warning chỉ rõ section/field bị ảnh hưởng.
- Không fallback im lặng về fixture hoặc số liệu của snapshot khác khi API lỗi.
- Tất cả count là số nguyên không âm; `share` nằm trong `0..100`.

## 7. Error contract

```json
{
  "error": {
    "code": "LEAD_SALE_OVERVIEW_UNAVAILABLE",
    "message": "Không thể tải dữ liệu tổng quan Lead Sales.",
    "details": {},
    "requestId": "req_01J..."
  }
}
```

| HTTP | Code | Khi dùng |
|---:|---|---|
| `400` | `INVALID_QUERY` | Kỳ, ngày, timezone, range hoặc limit không hợp lệ |
| `401` | `UNAUTHENTICATED` | Session không tồn tại hoặc đã hết hạn |
| `403` | `FORBIDDEN` | User không có role Lead Sales hoặc truy cập ngoài team scope |
| `404` | `ADMISSION_YEAR_NOT_FOUND` | Kỳ tuyển sinh không tồn tại/không khả dụng |
| `502` | `INVALID_LEAD_SALE_OVERVIEW_RESPONSE` | Nguồn dữ liệu thiếu field bắt buộc hoặc sai kiểu |
| `503` | `LEAD_SALE_OVERVIEW_UNAVAILABLE` | Không đọc được nguồn student, task, interaction hoặc document |

Frontend nên giữ `requestId` trong log có kiểm soát, nhưng không log PII của học
sinh.

## 8. API cho các route con của `/lead-sale`

Các route con phải dùng cùng team scope của Lead Sales. Không dùng quyền
`scope=all` của Director chỉ vì frontend đang tái sử dụng component:

| Route | API | Trạng thái / yêu cầu |
|---|---|---|
| `/lead-sale/students` | `crm.api.director_students.get_director_students`, `get_director_student` | Có thể dùng adapter chung nhưng backend bắt buộc lọc hồ sơ theo team Lead Sales |
| `/lead-sale/tasks` | `crm.api.task.list_tasks`, `get_task`, `create_task`, `update_task`, `delete_task` | CRUD chỉ trong team scope; tham khảo [crm-tasks/index.ts](<../../src/services/api/crm-tasks/index.ts>) |
| `/lead-sale/next-best-action` | NBA read/action APIs hiện có | Recommendation và mutation chỉ dành cho hồ sơ thuộc team |
| `/lead-sale/demographics` | `director_demographics` overview/segment | Nếu cho phép xem, aggregate phải lọc team trước khi tính |
| `/lead-sale/student-assignment` | API assignment riêng | Cần GET danh sách hồ sơ chưa phân công và POST command gán/chuyển hồ sơ; route hiện mới là placeholder |
| `/lead-sale/sales-team` | API team performance/detail riêng hoặc mở rộng overview | Route hiện mới là placeholder; không suy ra quyền từ dữ liệu client |

Thao tác gán/chuyển hồ sơ là mutation, không thực hiện qua GET. Mutation cần
kiểm tra team scope, optimistic concurrency nếu hồ sơ có thể bị gán đồng thời,
ghi audit và invalidate/refetch overview sau khi thành công.

## 9. Checklist tích hợp

1. [x] Tạo Frappe method `crm.api.lead_sale.get_lead_sale_overview` với team
   scope lấy từ session.
2. [x] Tạo adapter tại `src/services/api/lead-sale` để serialize query, unwrap
   `message`, validate response và chuẩn hóa lỗi.
3. [x] Tạo query hook với query key gồm `admissionYear`, `date`, `timezone` và
   `trendRange`.
4. [x] Thay fixture trong `lead-sale/_components` bằng một overview query duy nhất;
   giữ label, màu, icon và href ở presentation layer.
5. [x] Bổ sung test cho permission scope, query serialization, empty/partial data,
   timezone, sorting team member và các invariant count/share.
6. Sau mutation ở assignment, task hoặc hồ sơ, invalidate query overview của
   Lead Sales.

Request tối thiểu để render đúng dashboard:

```http
GET /api/method/crm.api.lead_sale.get_lead_sale_overview?admissionYear=2026&trendRange=4w
```

Response tối thiểu phải có `meta.viewer`, `meta.team`, `meta.date`, `meta.asOf`,
đủ 6 KPI, 4 intervention item, `teamPerformance`, `studentStatus` và cả hai
range trong `resultTrend`.
