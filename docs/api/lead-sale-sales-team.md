# API cho /lead-sale/sales-team

Tài liệu này định nghĩa contract backend cần có để thay thế fixture của màn
hình **Quản lý đội ngũ Sale**. Màn hình dành cho role **Lead Sales**, dùng để
theo dõi số lượng học sinh đang phụ trách, khả năng tiếp nhận, hiệu suất,
trạng thái làm việc và các thành viên cần hỗ trợ.

> Trạng thái: **đã triển khai**. Backend cung cấp hai snapshot GET và frontend
> route `lead-sale/sales-team` tải dữ liệu qua service/query hook, không còn
> đọc fixture thành viên.

## 1. Phạm vi màn hình

| Vùng UI | Dữ liệu cần | API sử dụng |
|---|---|---|
| Header | Người xem, team, kỳ/ngày snapshot, thời điểm cập nhật | get_sales_team_workspace |
| 4 KPI | Số thành viên, số học sinh đang phụ trách, thành viên cần hỗ trợ, hồ sơ quá hạn liên hệ | get_sales_team_workspace |
| Cần hỗ trợ | Thành viên health=support, lý do và số hồ sơ quá hạn | get_sales_team_workspace |
| Phân bổ học sinh | Tổng active students/capacity, load rate, top thành viên đang tải cao | get_sales_team_workspace |
| Danh sách thành viên | Search, filter availability, sort và các chỉ số chính | get_sales_team_workspace |
| Drawer chi tiết | Email, trạng thái, chỉ số, phạm vi phụ trách, lý do cần hỗ trợ | get_sales_team_member_detail |
| Nút Xem học sinh | Mở danh sách học sinh theo owner | Dùng lại API list student của Lead Sales |

Nguồn tham chiếu frontend:

- [sales-team-workspace.tsx](<../../src/app/(with-layouts)/(dashboard)/lead-sale/sales-team/_components/sales-team-workspace.tsx>)
- [team-header.tsx](<../../src/app/(with-layouts)/(dashboard)/lead-sale/sales-team/_components/team-header.tsx>)
- [team-overview.tsx](<../../src/app/(with-layouts)/(dashboard)/lead-sale/sales-team/_components/team-overview.tsx>)
- [team-attention.tsx](<../../src/app/(with-layouts)/(dashboard)/lead-sale/sales-team/_components/team-attention.tsx>)
- [team-load-summary.tsx](<../../src/app/(with-layouts)/(dashboard)/lead-sale/sales-team/_components/team-load-summary.tsx>)
- [team-member-table.tsx](<../../src/app/(with-layouts)/(dashboard)/lead-sale/sales-team/_components/team-member-table.tsx>)
- [team-member-detail.tsx](<../../src/app/(with-layouts)/(dashboard)/lead-sale/sales-team/_components/team-member-detail.tsx>)
- [types.ts](<../../src/app/(with-layouts)/(dashboard)/lead-sale/sales-team/_components/types.ts>)

Màn hình hiện tại không có thao tác thay đổi team member, capacity, phạm vi phụ
trách hoặc ownership. Do đó v1 chỉ cần hai API GET; không tạo mutation chỉ để
phục vụ thao tác đọc.

## 2. Nguyên tắc tích hợp

### 2.1. Frappe RPC và authentication

Các endpoint dùng Frappe method:

~~~http
GET {NEXT_PUBLIC_FRAPPE_URL}/api/method/{method}
Cookie: sid=<Frappe session cookie>
Accept: application/json
~~~

Response thành công được Frappe bọc trong message. Frontend phải unwrap
json.message; không fallback về fixture khi API trả lỗi hoặc response sai
contract.

### 2.2. Quyền và team scope

- Chỉ role **Lead Sales** được truy cập route và các method.
- Team được suy ra từ session của user; không nhận teamId hoặc leadId từ
  browser để mở rộng phạm vi.
- Chỉ trả thành viên active trong team Lead Sales hiện tại. Thành viên có
  availability=away hoặc leave vẫn được trả nếu còn thuộc team và có dữ liệu
  assignment cần theo dõi.
- Không trả member thuộc team khác, user đã bị deactivate hoặc account kỹ
  thuật không phải nhân sự Sale.
- Email là dữ liệu được UI hiển thị, nhưng chỉ trả email công việc cần thiết;
  không trả số điện thoại hoặc thông tin cá nhân khác.
- Quyền xem chi tiết và link danh sách học sinh phải được kiểm tra ở backend,
  không chỉ ẩn nút ở frontend.

### 2.3. Snapshot và phạm vi thời gian

meta.asOf, meta.admissionYear, meta.date và meta.timezone phải thống nhất giữa
summary, attention, loadSummary và members.

- activeStudents là số học sinh đang active và được gán cho member trong kỳ
  tuyển sinh.
- consultedToday là số hồ sơ có event tư vấn hợp lệ trong ngày meta.date.
- admittedThisMonth là số event nhập học trong tháng chứa meta.date.
- overdue là số học sinh có ít nhất một task/liên hệ quá hạn; đếm hồ sơ, không
  đếm số task.
- conversionRate phải dùng đúng cùng scope và policy mà backend công bố.

## 3. API tổng hợp workspace

### GET crm.api.lead_sale.get_sales_team_workspace

Đây là endpoint cho lần tải đầu của màn hình và các lần thay đổi search, filter
hoặc sort. Summary, attention và loadSummary luôn tính trên toàn bộ team scope;
chỉ members bị ảnh hưởng bởi query danh sách.

~~~http
GET /api/method/crm.api.lead_sale.get_sales_team_workspace?admissionYear=2026&date=2026-09-05&timezone=Asia%2FHo_Chi_Minh&availability=all&q=nguyen&page=1&pageSize=50&sort=support&order=desc
~~~

Không có request body.

### 3.1. Query parameters

| Tên | Kiểu | Bắt buộc | Mặc định | Ràng buộc / mô tả |
|---|---|---:|---|---|
| admissionYear | integer | Không | Kỳ active | Kỳ tuyển sinh cần xem |
| date | YYYY-MM-DD | Không | Ngày hiện tại theo timezone | Dùng cho KPI theo ngày/tháng và snapshot |
| timezone | IANA timezone | Không | Asia/Ho_Chi_Minh | Dùng cắt ngày và tháng nghiệp vụ |
| availability | enum | Không | all | all, active, away, leave |
| q | string | Không | "" | Tìm theo memberId, displayName hoặc email công việc |
| page | integer | Không | 1 | Bắt đầu từ 1 |
| pageSize | integer | Không | 50 | Giá trị 1..100; summary không phụ thuộc page |
| sort | enum | Không | support | support, load, name |
| order | enum | Không | desc | asc hoặc desc; name mặc định nên là asc nếu client không gửi order |

Quy tắc search/sort:

- q được trim và tìm không phân biệt hoa thường/dấu.
- availability chỉ lọc members, không làm thay đổi summary toàn team. Nếu
  business muốn KPI theo filter, cần thêm scope rõ ràng vào contract khác.
- sort=support: health=support trước, sau đó overdue desc, loadRate desc,
  displayName asc, id asc.
- sort=load: loadRate desc, activeStudents desc, displayName asc, id asc.
- sort=name: displayName theo locale vi, sau đó id asc.
- Nếu client gửi order=asc/desc, order áp dụng cho tiêu chí chính; tie-breaker
  vẫn phải ổn định bằng id asc.
- pagination.total là số thành viên sau q và availability.

### 3.2. Response 200 OK

~~~json
{
  "message": {
    "meta": {
      "viewer": {
        "id": "USR-LEAD-SALE-001",
        "displayName": "Nguyễn Minh Anh"
      },
      "team": {
        "id": "TEAM-SALE-01",
        "name": "Đội Sale Cần Thơ"
      },
      "admissionYear": 2026,
      "date": "2026-09-05",
      "asOf": "2026-09-05T09:45:00+07:00",
      "timezone": "Asia/Ho_Chi_Minh",
      "status": "available",
      "warnings": []
    },
    "summary": {
      "memberCount": 6,
      "activeMemberCount": 5,
      "assignedStudents": 184,
      "totalCapacity": 280,
      "loadRate": 65.7,
      "supportMemberCount": 2,
      "overdueStudents": 6
    },
    "attention": {
      "count": 2,
      "items": [
        {
          "memberId": "USR-SALE-003",
          "displayName": "Lê Hoàng Nam",
          "availability": "active",
          "health": "support",
          "activeStudents": 35,
          "capacity": 40,
          "loadRate": 87.5,
          "overdue": 3,
          "supportReason": "3 hồ sơ chưa được liên hệ đúng hạn"
        },
        {
          "memberId": "USR-SALE-004",
          "displayName": "Phạm Gia Hân",
          "availability": "active",
          "health": "support",
          "activeStudents": 31,
          "capacity": 40,
          "loadRate": 77.5,
          "overdue": 2,
          "supportReason": "Đang gần chạm mức tiếp nhận và còn 2 hồ sơ quá hạn"
        }
      ]
    },
    "loadSummary": {
      "assignedStudents": 184,
      "totalCapacity": 280,
      "loadRate": 65.7,
      "topMembers": [
        {
          "memberId": "USR-SALE-003",
          "displayName": "Lê Hoàng Nam",
          "activeStudents": 35,
          "capacity": 40,
          "loadRate": 87.5,
          "health": "support"
        },
        {
          "memberId": "USR-SALE-004",
          "displayName": "Phạm Gia Hân",
          "activeStudents": 31,
          "capacity": 40,
          "loadRate": 77.5,
          "health": "support"
        }
      ]
    },
    "members": [
      {
        "id": "USR-SALE-001",
        "displayName": "Nguyễn Minh Anh",
        "email": "minhanh@ai-nes.edu.vn",
        "availability": "active",
        "health": "good",
        "activeStudents": 46,
        "capacity": 60,
        "loadRate": 76.7,
        "consultedToday": 31,
        "admittedThisMonth": 8,
        "overdue": 1,
        "conversionRate": 17.4,
        "regions": ["Cần Thơ"],
        "specialties": ["Công nghệ thông tin", "Quản trị kinh doanh"],
        "lastActivityAt": "2026-09-05T09:44:12+07:00",
        "supportReason": null
      },
      {
        "id": "USR-SALE-003",
        "displayName": "Lê Hoàng Nam",
        "email": "hoangnam@ai-nes.edu.vn",
        "availability": "active",
        "health": "support",
        "activeStudents": 35,
        "capacity": 40,
        "loadRate": 87.5,
        "consultedToday": 21,
        "admittedThisMonth": 4,
        "overdue": 3,
        "conversionRate": 11.4,
        "regions": ["Đồng Tháp"],
        "specialties": ["Công nghệ thông tin", "Kế toán"],
        "lastActivityAt": "2026-09-05T09:41:02+07:00",
        "supportReason": "3 hồ sơ chưa được liên hệ đúng hạn"
      },
      {
        "id": "USR-SALE-006",
        "displayName": "Đỗ Anh Quân",
        "email": "anhquan@ai-nes.edu.vn",
        "availability": "away",
        "health": "good",
        "activeStudents": 11,
        "capacity": 40,
        "loadRate": 27.5,
        "consultedToday": 11,
        "admittedThisMonth": 1,
        "overdue": 0,
        "conversionRate": 9.1,
        "regions": ["Cần Thơ"],
        "specialties": ["Công nghệ thông tin"],
        "lastActivityAt": "2026-09-05T08:45:00+07:00",
        "supportReason": null
      }
    ],
    "pagination": {
      "page": 1,
      "pageSize": 50,
      "total": 6,
      "totalPages": 1,
      "hasNextPage": false
    }
  }
}
~~~

Response trên rút gọn members và topMembers; response thật phải trả đủ item
trong page. attention.items nên trả toàn bộ thành viên cần hỗ trợ, hoặc tối
thiểu đủ các item dùng cho card Cần hỗ trợ.

### 3.3. TypeScript contract

~~~typescript
type TeamWorkspaceStatus = "available" | "partial" | "unavailable";
type MemberAvailability = "active" | "away" | "leave";
type MemberHealth = "good" | "support";
type TeamAvailabilityFilter = "all" | MemberAvailability;
type TeamSort = "support" | "load" | "name";

interface SalesTeamWorkspaceResponse {
  meta: {
    viewer: { id: string; displayName: string };
    team: { id: string; name: string };
    admissionYear: number;
    date: string;
    asOf: string;
    timezone: string;
    status: TeamWorkspaceStatus;
    warnings: string[];
  };
  summary: {
    memberCount: number;
    activeMemberCount: number;
    assignedStudents: number;
    totalCapacity: number;
    loadRate: number | null;
    supportMemberCount: number;
    overdueStudents: number;
  };
  attention: {
    count: number;
    items: TeamAttentionItem[];
  };
  loadSummary: {
    assignedStudents: number;
    totalCapacity: number;
    loadRate: number | null;
    topMembers: TeamLoadItem[];
  };
  members: SalesTeamMember[];
  pagination: TeamPagination;
}

interface SalesTeamMember {
  id: string;
  displayName: string;
  email: string;
  availability: MemberAvailability;
  health: MemberHealth;
  activeStudents: number;
  capacity: number;
  loadRate: number | null;
  consultedToday: number;
  admittedThisMonth: number;
  overdue: number;
  conversionRate: number | null;
  regions: string[];
  specialties: string[];
  lastActivityAt: string | null;
  supportReason: string | null;
}

interface TeamAttentionItem {
  memberId: string;
  displayName: string;
  availability: MemberAvailability;
  health: "support";
  activeStudents: number;
  capacity: number;
  loadRate: number | null;
  overdue: number;
  supportReason: string;
}

interface TeamLoadItem {
  memberId: string;
  displayName: string;
  activeStudents: number;
  capacity: number;
  loadRate: number | null;
  health: MemberHealth;
}

interface TeamPagination {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
}
~~~

initials, nhãn tiếng Việt, màu badge, icon, chuỗi "Đang hoạt động",
"Ngoại tuyến · 1 giờ trước", "Ổn định" và "Cần hỗ trợ" là presentation của
frontend. Backend trả availability/health code và lastActivityAt.

supportReason là nội dung giải thích nghiệp vụ nên backend có thể trả; không
dùng supportReason làm key hoặc điều kiện filter.

## 4. API chi tiết thành viên

### GET crm.api.lead_sale.get_sales_team_member_detail

Gọi khi user chọn một thành viên từ bảng hoặc card Cần hỗ trợ. API detail phải
kiểm tra lại team scope, không tin memberId chỉ vì ID xuất hiện trong response
list trước đó.

~~~http
GET /api/method/crm.api.lead_sale.get_sales_team_member_detail?memberId=USR-SALE-003&admissionYear=2026&date=2026-09-05&timezone=Asia%2FHo_Chi_Minh
~~~

Query:

| Tên | Kiểu | Bắt buộc | Mô tả |
|---|---|---:|---|
| memberId | string | Có | ID user/nhân sự Sale |
| admissionYear | integer | Không | Kỳ tuyển sinh dùng tính activeStudents và admissions |
| date | YYYY-MM-DD | Không | Ngày dùng tính consultedToday |
| timezone | IANA timezone | Không | Múi giờ nghiệp vụ |

Response:

~~~json
{
  "message": {
    "meta": {
      "admissionYear": 2026,
      "date": "2026-09-05",
      "asOf": "2026-09-05T09:45:00+07:00",
      "timezone": "Asia/Ho_Chi_Minh"
    },
    "member": {
      "id": "USR-SALE-003",
      "displayName": "Lê Hoàng Nam",
      "email": "hoangnam@ai-nes.edu.vn",
      "availability": "active",
      "health": "support",
      "activeStudents": 35,
      "capacity": 40,
      "loadRate": 87.5,
      "consultedToday": 21,
      "admittedThisMonth": 4,
      "overdue": 3,
      "conversionRate": 11.4,
      "regions": ["Đồng Tháp"],
      "specialties": ["Công nghệ thông tin", "Kế toán"],
      "lastActivityAt": "2026-09-05T09:41:02+07:00",
      "supportReason": "3 hồ sơ chưa được liên hệ đúng hạn"
    },
    "healthAssessment": {
      "status": "support",
      "evaluatedAt": "2026-09-05T09:45:00+07:00",
      "reasons": [
        {
          "code": "OVERDUE_CONTACTS",
          "label": "Hồ sơ quá hạn liên hệ",
          "value": 3,
          "detail": "Có 3 hồ sơ chưa được liên hệ đúng hạn."
        }
      ]
    },
    "metricWindow": {
      "admissionYear": 2026,
      "today": {
        "from": "2026-09-05T00:00:00+07:00",
        "to": "2026-09-05T23:59:59+07:00"
      },
      "month": {
        "from": "2026-09-01T00:00:00+07:00",
        "to": "2026-09-30T23:59:59+07:00"
      }
    },
    "permissions": {
      "canViewStudents": true
    }
  }
}
~~~

Quy tắc detail:

- Shape member phải tương thích với item trong workspace để frontend không có
  hai cách render cùng một chỉ số.
- healthAssessment.reasons có thể rỗng khi health=good. supportReason có thể
  null khi không cần hỗ trợ.
- Nếu member availability=away hoặc leave, các chỉ số vẫn là snapshot của
  kỳ/ngày đã chọn; không tự reset về 0.
- Không trả danh sách học sinh trong detail. Drawer hiện tại chỉ cần aggregate;
  nút Xem học sinh dùng API list student với owner filter.
- Nếu member đã ra khỏi team nhưng còn dữ liệu lịch sử, trả 404 trong scope hiện
  tại; không dùng route này để xem lịch sử ngoài team.

## 5. Liên kết Xem học sinh

Nút trong drawer mở:

~~~text
/lead-sale/students?owner=USR-SALE-003
~~~

Đây không phải API mới của màn hình sales-team. API danh sách học sinh dùng lại
contract Lead Sales students, với filter owner:

~~~http
GET /api/method/crm.api.lead_sale.get_students?admissionYear=2026&ownerId=USR-SALE-003&page=1&pageSize=20
~~~

Nếu frontend tiếp tục dùng adapter chung
crm.api.director_students.get_director_students, backend bắt buộc phải:

- hỗ trợ ownerId như một filter chính thức;
- áp dụng team scope theo role Lead Sales trước khi tính list và summary;
- không dùng nhánh guest/public của Director để mở toàn bộ dữ liệu;
- không cho client gửi ownerId của member ngoài team để đọc dữ liệu.

Chi tiết contract của danh sách/Student 360 được tách tại
[director-students.md](./director-students.md). Màn hình sales-team chỉ cần
truyền ID member, không cần gọi trước một API khác để lấy students.

## 6. Error contract

~~~json
{
  "error": {
    "code": "FORBIDDEN",
    "message": "Bạn không có quyền xem dữ liệu đội ngũ này.",
    "fields": {},
    "requestId": "req_01J..."
  }
}
~~~

| HTTP | Code | API | Khi dùng |
|---:|---|---|---|
| 400 | INVALID_QUERY | GET | Query sai kiểu, enum, date, timezone hoặc pagination |
| 401 | UNAUTHENTICATED | GET | Session không tồn tại hoặc hết hạn |
| 403 | FORBIDDEN | GET | Không phải Lead Sales hoặc truy cập ngoài team scope |
| 404 | TEAM_NOT_FOUND | Workspace | Team trong session không còn khả dụng |
| 404 | TEAM_MEMBER_NOT_FOUND | Detail | Member không tồn tại trong team scope hiện tại |
| 422 | ADMISSION_YEAR_NOT_FOUND | GET | Kỳ tuyển sinh không tồn tại/không được phép xem |
| 502 | INVALID_SALES_TEAM_RESPONSE | GET | Payload thiếu field bắt buộc hoặc sai kiểu |
| 503 | SALES_TEAM_UNAVAILABLE | GET | Không đọc được user/team/assignment/task data |

Danh sách rỗng là response hợp lệ 200 OK. Trong trường hợp q hoặc
availability không khớp, vẫn trả meta, summary, attention, loadSummary và
pagination với members=[]; không trả 404.

## 7. Invariant và định nghĩa chỉ số

- summary.memberCount là tổng thành viên thuộc team và còn active trong hệ
  thống, bao gồm availability active, away và leave.
- summary.activeMemberCount là số thành viên có availability=active.
- summary.assignedStudents bằng tổng activeStudents của toàn bộ member trong
  team; một học sinh chỉ thuộc một owner chính nên không được đếm trùng.
- summary.totalCapacity bằng tổng capacity của toàn bộ member trong team.
- loadRate = assignedStudents / totalCapacity * 100, làm tròn tối đa một chữ
  số; trả null khi totalCapacity=0.
- supportMemberCount bằng số member có health=support.
- overdueStudents là tổng overdue của member trong team.
- member.conversionRate phải nằm trong 0..100 hoặc null khi chưa có mẫu số.
  Backend phải công bố mẫu số và thời gian áp dụng; không để frontend tự tính
  từ các count khác nhau.
- regions và specialties là mảng, có thể rỗng nhưng không trả null.
- warnings là mảng, có thể rỗng nhưng không trả null.
- meta.status=partial phải kèm warning chỉ rõ section/field bị ảnh hưởng.
- Mọi count là số nguyên không âm; capacity không âm; loadRate/conversionRate
  không vượt 100.
- lastActivityAt là ISO-8601 có timezone và có thể null nếu chưa có hoạt
  động. Frontend không dùng chuỗi tương đối từ backend để sort.
- Summary/attention/loadSummary không thay đổi theo q, availability, page hoặc
  pageSize.

## 8. Luồng gọi API frontend

~~~text
Mở trang
  └─ GET get_sales_team_workspace
       ├─ header + 4 KPI
       ├─ attention card
       ├─ load summary
       └─ members table

Đổi search/filter/sort
  └─ GET get_sales_team_workspace với query mới

Chọn thành viên
  └─ GET get_sales_team_member_detail?memberId=...

Click Xem học sinh
  └─ chuyển đến /lead-sale/students?owner=...
       └─ dùng API students với ownerId + team scope
~~~

Query key nên bao gồm toàn bộ tham số ảnh hưởng đến danh sách:

~~~text
["lead-sale", "sales-team", admissionYear, date, timezone,
 availability, q, page, pageSize, sort, order]
~~~

Detail query key:

~~~text
["lead-sale", "sales-team", "member", memberId, admissionYear, date, timezone]
~~~

Không cần mutation hoặc optimistic update cho màn hình này. Khi assignment,
task hoặc user/team scope thay đổi từ màn hình khác, invalidate workspace và
detail liên quan để số liệu không bị stale.

## 9. Checklist backend/FE handoff

- [x] Tạo crm.api.lead_sale.get_sales_team_workspace với team scope lấy từ
  session.
- [x] Trả summary, attention và loadSummary trên toàn team, độc lập với filter
  và pagination của members.
- [x] Tạo crm.api.lead_sale.get_sales_team_member_detail với cùng member shape
  và healthAssessment.
- [x] Thống nhất định nghĩa consultedToday, admittedThisMonth, overdue và
  conversionRate; trả timestamp canonical theo timezone.
- [x] Không trả PII ngoài email công việc cần cho UI.
- [x] Bổ sung response validation/normalizer tại src/services/api/lead-sale
  và hook query cho workspace/detail.
- [x] Bổ sung ownerId filter cho API students của Lead Sales để link Xem học
  sinh không vượt team scope.
- [x] Thêm test cho permission scope, empty result, availability filter,
  sorting, capacity=0, partial response và timezone.
- [x] Không tạo mutation cho capacity/regions/specialties/assignment từ route
  này; các thao tác đó phải thuộc màn hình/policy riêng.
