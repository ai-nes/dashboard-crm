# API cho /lead-sale/student-assignment

Tài liệu này định nghĩa contract backend cần có để thay thế fixture của màn
hình **Phân công học sinh**. Màn hình dành cho role **Lead Sales**, dùng để
theo dõi luồng phân công tự động, xem kết quả/giải thích, xử lý hồ sơ chưa thể
tự động phân công và xem kết quả phân công theo từng học sinh.

> Trạng thái: **đã triển khai backend và dashboard**. Dữ liệu hồ sơ, summary,
> candidates và mutation lấy từ API; React Flow vẫn dùng pipeline tĩnh trong
> `student-assignment/_components/data.ts` để mô tả nghiệp vụ, chỉ phủ metrics
> snapshot lên các node.

## 1. Phạm vi màn hình

| Vùng UI | Dữ liệu cần | API sử dụng |
|---|---|---|
| Header/KPI | Tổng tiếp nhận, đã phân công, cần xử lý, thời điểm snapshot, trạng thái automation | get_student_assignment_workspace |
| Sơ đồ workflow | Các bước, điều kiện, metric từng bước, trạng thái automation | get_student_assignment_workspace |
| Review queue | Số hồ sơ no_match, missing_data và tên các hồ sơ cần xử lý | get_student_assignment_workspace |
| Lịch sử phân công | Danh sách, tìm kiếm, filter, pagination và kết quả gần nhất của từng hồ sơ | get_student_assignment_workspace |
| Drawer chi tiết | Thông tin hồ sơ, owner, match score, lý do, ứng viên được cân nhắc | get_student_assignment_detail |
| Form xử lý thủ công | Chọn owner, bổ sung khu vực, ghi lý do | resolve_student_assignment |
| Nút "Chạy thử luồng" | Animation mô phỏng 5 bước trên giao diện | Không gọi API trong v1 |

Nguồn tham chiếu frontend:

- [assignment-workspace.tsx](<../../src/app/(with-layouts)/(dashboard)/lead-sale/student-assignment/_components/assignment-workspace.tsx>)
- [assignment-header.tsx](<../../src/app/(with-layouts)/(dashboard)/lead-sale/student-assignment/_components/assignment-header.tsx>)
- [workflow-section.tsx](<../../src/app/(with-layouts)/(dashboard)/lead-sale/student-assignment/_components/workflow-section.tsx>)
- [review-queue.tsx](<../../src/app/(with-layouts)/(dashboard)/lead-sale/student-assignment/_components/review-queue.tsx>)
- [assignment-history.tsx](<../../src/app/(with-layouts)/(dashboard)/lead-sale/student-assignment/_components/assignment-history.tsx>)
- [assignment-detail.tsx](<../../src/app/(with-layouts)/(dashboard)/lead-sale/student-assignment/_components/assignment-detail.tsx>)
- [types.ts](<../../src/app/(with-layouts)/(dashboard)/lead-sale/student-assignment/_components/types.ts>)

## 2. Nguyên tắc tích hợp

### 2.1. Frappe RPC và authentication

Các endpoint dùng Frappe method:

~~~http
GET  {NEXT_PUBLIC_FRAPPE_URL}/api/method/{method}
POST {NEXT_PUBLIC_FRAPPE_URL}/api/method/{method}
Cookie: sid=<Frappe session cookie>
Accept: application/json
~~~

Request POST cần thêm:

~~~http
Content-Type: application/json
X-Frappe-CSRF-Token: <csrf-token>
Idempotency-Key: <unique-command-key>
~~~

Response thành công được Frappe bọc trong message. Frontend phải unwrap
json.message; không fallback về fixture khi API trả lỗi hoặc response sai
contract.

### 2.2. Quyền và team scope

- Chỉ role **Lead Sales** được truy cập route và các method trên.
- Team được suy ra từ session của user; không tin teamId, leadId hoặc ownerId do
  query gửi lên để mở rộng phạm vi.
- Response chỉ gồm học sinh thuộc team mà Lead Sales hiện tại quản lý và kỳ
  tuyển sinh được chọn.
- ownerId trong mutation phải là nhân sự active thuộc team đó. Không nhận tên
  hiển thị làm định danh.
- Backend kiểm tra permission trước khi tính summary, workflow metrics và
  candidates; không lấy toàn hệ thống rồi lọc ở frontend.
- Chỉ trả các trường cần cho màn hình assignment. Không trả số điện thoại,
  email, nội dung trao đổi hoặc PII khác nếu màn hình không dùng đến.

### 2.3. Snapshot thống nhất

meta.asOf, meta.admissionYear, meta.date và meta.timezone phải được dùng chung
cho summary, workflow metrics và danh sách. Summary/metrics không bị thay đổi
khi user tìm kiếm, đổi filter hoặc chuyển trang; các thao tác đó chỉ lọc items.

## 3. API tổng hợp workspace

### GET crm.api.lead_sale.get_student_assignment_workspace

Đây là endpoint duy nhất cho lần tải đầu của màn hình. Frontend gọi lại cùng
endpoint khi thay đổi từ khóa, filter hoặc pagination.

~~~http
GET /api/method/crm.api.lead_sale.get_student_assignment_workspace?admissionYear=2026&date=2026-09-05&timezone=Asia%2FHo_Chi_Minh&filter=all&q=nguyen&page=1&pageSize=20&sort=receivedAt&order=desc
~~~

Không có request body.

### 3.1. Query parameters

| Tên | Kiểu | Bắt buộc | Mặc định | Ràng buộc / mô tả |
|---|---|---:|---|---|
| admissionYear | integer | Không | Kỳ active | Kỳ tuyển sinh Lead Sales được phép xem |
| date | YYYY-MM-DD | Không | Ngày hiện tại theo timezone | Dùng cho snapshot và phạm vi "hôm nay" |
| timezone | IANA timezone | Không | Asia/Ho_Chi_Minh | Dùng cắt ngày và format thời gian nghiệp vụ |
| filter | enum | Không | all | all, assigned, review, no_match, missing_data, error; review là alias của các hồ sơ chưa có owner |
| q | string | Không | "" | Tìm không phân biệt hoa thường/dấu trong mã, tên học sinh, trường, owner |
| page | integer | Không | 1 | Bắt đầu từ 1 |
| pageSize | integer | Không | 20 | Giá trị 1..100; UI có thể chọn page size riêng |
| sort | enum | Không | receivedAt | receivedAt, name, status, owner, matchScore |
| order | enum | Không | desc | asc hoặc desc |

Quy tắc filter/search:

- q được trim trước khi tìm và áp dụng trên studentId, name, school,
  owner.displayName; không tìm trên các field PII không trả về UI.
- filter=assigned tương đương status=assigned và có owner.
- filter=review gồm mọi record chưa có owner, tối thiểu là no_match,
  missing_data và error.
- Filter và q kết hợp bằng AND.
- Thứ tự phải ổn định. Khi hai dòng có cùng giá trị sort, dùng studentId asc
  làm tie-breaker.
- pagination.total là tổng số item sau filter/search, không phải số item của
  trang hiện tại.

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
      "received": 184,
      "assigned": 166,
      "pending": 18,
      "byStatus": {
        "assigned": 166,
        "no_match": 12,
        "missing_data": 6,
        "error": 0
      }
    },
    "health": {
      "automationEnabled": true,
      "automationRate": 90.2,
      "successRate": 90.2,
      "reviewCount": 18,
      "errorCount": 0,
      "averageProcessingMs": 1800,
      "policyVersion": "student-assignment-r1"
    },
    "workflow": {
      "mode": "read-only",
      "version": "student-assignment-r1",
      "steps": [
        {
          "id": "input",
          "order": 1,
          "title": "Tiếp nhận học sinh",
          "description": "Website · Ngày hội tư vấn",
          "detail": "Tiếp nhận thông tin học sinh mới từ các nguồn tuyển sinh của đội.",
          "rules": [
            "Mỗi học sinh được ghi nhận một lần.",
            "Lưu nguồn tuyển sinh và thời điểm tiếp nhận."
          ],
          "status": "success",
          "metrics": {
            "processedCount": 184,
            "successCount": 184,
            "warningCount": 0,
            "errorCount": 0
          }
        },
        {
          "id": "validation",
          "order": 2,
          "title": "Kiểm tra thông tin",
          "description": "Đủ thông tin để phân công",
          "detail": "Kiểm tra thông tin liên hệ, khu vực và bản ghi trùng.",
          "rules": [
            "Có thông tin liên hệ hợp lệ.",
            "Có khu vực để xác định người phụ trách.",
            "Thiếu thông tin hoặc nghi trùng: chuyển sang cần xử lý."
          ],
          "status": "warning",
          "metrics": {
            "processedCount": 184,
            "successCount": 178,
            "warningCount": 6,
            "errorCount": 0
          }
        }
      ],
      "connections": [
        { "source": "input", "target": "validation", "label": null },
        { "source": "validation", "target": "classification", "label": "Đủ thông tin" },
        { "source": "validation", "target": "review", "label": "Cần bổ sung" },
        { "source": "classification", "target": "matching", "label": null },
        { "source": "matching", "target": "assignment", "label": "Phù hợp" },
        { "source": "matching", "target": "review", "label": "Chưa phù hợp" },
        { "source": "review", "target": "assignment", "label": "Sau xử lý" }
      ]
    },
    "items": [
      {
        "studentId": "HS-001",
        "name": "Nguyễn Minh An",
        "school": "THPT Châu Văn Liêm",
        "region": "Cần Thơ",
        "interest": "Công nghệ thông tin",
        "source": "Website tuyển sinh",
        "receivedAt": "2026-09-05T09:42:00+07:00",
        "status": "assigned",
        "owner": {
          "id": "USR-SALE-001",
          "displayName": "Nguyễn Minh Anh"
        },
        "matchScore": 92,
        "method": "automatic",
        "reason": null,
        "revision": 3,
        "executionId": "ASSIGN-EXEC-0001"
      },
      {
        "studentId": "HS-003",
        "name": "Phạm Minh Khang",
        "school": "THPT Trần Đại Nghĩa",
        "region": "Vĩnh Long",
        "interest": "Công nghệ thông tin",
        "source": "Website tuyển sinh",
        "receivedAt": "2026-09-05T09:36:00+07:00",
        "status": "no_match",
        "owner": null,
        "matchScore": null,
        "method": "automatic",
        "reason": "Không có Sale đạt ngưỡng phù hợp tối thiểu.",
        "revision": 1,
        "executionId": "ASSIGN-EXEC-0003"
      }
    ],
    "pagination": {
      "page": 1,
      "pageSize": 20,
      "total": 184,
      "totalPages": 10,
      "hasNextPage": true
    }
  }
}
~~~

Response trên rút gọn workflow.steps và items; response thật phải trả đủ 6
step hiện đang hiển thị trong route: input, validation, classification,
matching, review, assignment.

### 3.3. TypeScript contract

~~~typescript
type AssignmentWorkspaceStatus = "available" | "partial" | "unavailable";
type AssignmentItemStatus =
  | "assigned"
  | "no_match"
  | "missing_data"
  | "error";
type AssignmentFilter =
  | "all"
  | "assigned"
  | "review"
  | "no_match"
  | "missing_data"
  | "error";
type AssignmentMethod = "automatic" | "manual";
type WorkflowNodeStatus = "idle" | "running" | "success" | "warning" | "error";

interface AssignmentWorkspaceResponse {
  meta: {
    viewer: { id: string; displayName: string };
    team: { id: string; name: string };
    admissionYear: number;
    date: string;
    asOf: string;
    timezone: string;
    status: AssignmentWorkspaceStatus;
    warnings: string[];
  };
  summary: {
    received: number;
    assigned: number;
    pending: number;
    byStatus: Record<
      "assigned" | "no_match" | "missing_data" | "error",
      number
    >;
  };
  health: {
    automationEnabled: boolean;
    automationRate: number | null;
    successRate: number | null;
    reviewCount: number;
    errorCount: number;
    averageProcessingMs: number | null;
    policyVersion: string;
  };
  workflow: {
    mode: "read-only";
    version: string;
    steps: AssignmentWorkflowStep[];
    connections: AssignmentWorkflowConnection[];
  };
  items: AssignmentItem[];
  pagination: AssignmentPagination;
}

interface AssignmentWorkflowStep {
  id: "input" | "validation" | "classification" | "matching" | "review" | "assignment";
  order: number;
  title: string;
  description: string;
  detail: string;
  rules: string[];
  status: WorkflowNodeStatus;
  metrics: {
    processedCount: number;
    successCount: number;
    warningCount: number;
    errorCount: number;
  };
}

interface AssignmentWorkflowConnection {
  source: AssignmentWorkflowStep["id"];
  target: AssignmentWorkflowStep["id"];
  label: string | null;
}

interface AssignmentOwner {
  id: string;
  displayName: string;
}

interface AssignmentItem {
  studentId: string;
  name: string;
  school: string;
  region: string | null;
  interest: string | null;
  source: string | null;
  receivedAt: string;
  status: AssignmentItemStatus;
  owner: AssignmentOwner | null;
  matchScore: number | null;
  method: AssignmentMethod;
  reason: string | null;
  revision: number;
  executionId: string | null;
}

interface AssignmentPagination {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
}
~~~

initials, nhãn tiếng Việt, màu badge, icon, time dạng 09:42 và chuỗi metric
như "12 học sinh chờ phân công" là presentation của frontend. Backend chỉ trả
ID, dữ liệu canonical và timestamp ISO-8601.

status=error dành cho lỗi kỹ thuật của execution. UI hiện tại mới có mapping
cho assigned, no_match và missing_data; khi backend bật status này, frontend
phải bổ sung trạng thái lỗi hoặc map nó vào nhánh review có warning.

### 3.4. Invariant

- summary.received = summary.assigned + summary.pending khi không có record lỗi
  chưa được phân loại; nếu có error, pending vẫn bao gồm error.
- summary.byStatus.assigned bằng số item assigned trong toàn bộ snapshot, không
  chỉ trong page hiện tại.
- summary.pending là số hồ sơ chưa có owner.
- byStatus là số liệu mutually exclusive; không cộng các metric của workflow
  để suy ra summary.
- Mọi count là số nguyên không âm. automationRate, successRate nằm trong
  0..100 hoặc null khi chưa đủ dữ liệu.
- items[].revision tăng sau mỗi mutation làm thay đổi ownership hoặc dữ liệu
  được dùng để quyết định assignment.
- Record deleted/archived hoặc ngoài team scope không xuất hiện trong summary,
  workflow metrics hay items.
- meta.status = partial phải kèm warning chỉ rõ section/field bị thiếu;
  collection thiếu dữ liệu trả [], không trả null.

## 4. API chi tiết và explainability

### GET crm.api.lead_sale.get_student_assignment_detail

Gọi khi user mở drawer từ review queue hoặc history. Response trả luôn danh sách
ứng viên để form không phải gọi thêm endpoint riêng.

~~~http
GET /api/method/crm.api.lead_sale.get_student_assignment_detail?studentId=HS-003&admissionYear=2026
~~~

Query:

| Tên | Kiểu | Bắt buộc | Mô tả |
|---|---|---:|---|
| studentId | string | Có | Mã hồ sơ/học sinh cần xem |
| admissionYear | integer | Không | Dùng kiểm tra kỳ; backend vẫn phải kiểm tra student thuộc kỳ nào |

Response rút gọn:

~~~json
{
  "message": {
    "item": {
      "studentId": "HS-003",
      "name": "Phạm Minh Khang",
      "school": "THPT Trần Đại Nghĩa",
      "region": "Vĩnh Long",
      "interest": "Công nghệ thông tin",
      "source": "Website tuyển sinh",
      "receivedAt": "2026-09-05T09:36:00+07:00",
      "status": "no_match",
      "owner": null,
      "matchScore": null,
      "method": "automatic",
      "reason": "Không có Sale đạt ngưỡng phù hợp tối thiểu.",
      "revision": 1,
      "executionId": "ASSIGN-EXEC-0003"
    },
    "issue": {
      "code": "NO_MATCH",
      "message": "Chưa có nhân sự đạt điều kiện phụ trách khu vực này.",
      "missingFields": []
    },
    "candidates": [
      {
        "id": "USR-SALE-001",
        "displayName": "Nguyễn Minh Anh",
        "activeStudents": 28,
        "capacity": 40,
        "remainingCapacity": 12,
        "matchScore": 68,
        "eligible": false,
        "reasons": [
          "Đang phụ trách khu vực Cần Thơ, không khớp khu vực Vĩnh Long."
        ]
      },
      {
        "id": "USR-SALE-003",
        "displayName": "Lê Hoàng Nam",
        "activeStudents": 41,
        "capacity": 45,
        "remainingCapacity": 4,
        "matchScore": 64,
        "eligible": false,
        "reasons": ["Điểm phù hợp thấp hơn ngưỡng tự động."]
      }
    ],
    "explainability": {
      "policyVersion": "student-assignment-r1",
      "matchScore": null,
      "reasons": ["Không có Sale đạt điểm phù hợp tối thiểu 70/100."],
      "criteria": [
        {
          "code": "region",
          "label": "Khu vực",
          "result": "no_match",
          "detail": "Chưa tìm thấy phạm vi phụ trách phù hợp."
        }
      ]
    },
    "events": [],
    "permissions": {
      "canResolve": true,
      "canReassign": false
    }
  }
}
~~~

Quy tắc response:

- issue bắt buộc với no_match, missing_data hoặc error; assigned có thể trả
  null.
- issue.missingFields dùng mã máy đọc được, ví dụ region, phone; frontend tự
  map label.
- candidates sắp xếp theo matchScore desc, sau đó remainingCapacity desc và
  id asc; nên trả tối đa 3 ứng viên tốt nhất.
- eligible=false vẫn có thể được chọn thủ công nếu Lead Sales có quyền
  override; mutation phải yêu cầu reason và ghi audit.
- explainability chỉ mô tả rule/policy đã chạy, không trả trọng số nội bộ nếu
  backend chưa cam kết đó là contract ổn định.
- events là các event assignment liên quan đến hồ sơ, có thể rỗng. Event tối
  thiểu gồm eventId, type, actor, fromOwner, toOwner, reason, occurredAt.

Với missing_data, candidates có thể trả [] cho đến khi mutation gửi đủ region.
Không được tự suy đoán region từ tên trường hoặc địa chỉ chưa được xác thực.

## 5. API command xử lý thủ công

### POST crm.api.lead_sale.resolve_student_assignment

Dùng cho nút **Xác nhận phân công thử** hiện tại. Tên nút ở UI là "bản thử"
nhưng khi kết nối backend thật, command này là mutation thật và phải có confirm,
audit và xử lý xung đột.

~~~http
POST /api/method/crm.api.lead_sale.resolve_student_assignment
Cookie: sid=<Frappe session cookie>
Content-Type: application/json
Accept: application/json
X-Frappe-CSRF-Token: <csrf-token>
Idempotency-Key: assign:HS-003:20260905:01
~~~

Request:

~~~json
{
  "studentId": "HS-003",
  "ownerId": "USR-SALE-001",
  "region": "Vĩnh Long",
  "reason": "Đã thống nhất với Sale phụ trách khu vực lân cận để hỗ trợ hồ sơ này.",
  "expectedRevision": 1
}
~~~

| Field | Kiểu | Bắt buộc | Ràng buộc |
|---|---|---:|---|
| studentId | string | Có | Hồ sơ phải thuộc team và kỳ được phép xem |
| ownerId | string | Có | User active thuộc team; không nhận display name |
| region | string | Có khi hồ sơ thiếu region | Trim, độ dài tối đa do backend công bố; phải là địa bàn hợp lệ |
| reason | string | Có | Trim, tối thiểu 10 và tối đa 500 ký tự |
| expectedRevision | integer | Có | CAS token lấy từ list/detail |

Quy tắc command:

- Chỉ xử lý record chưa có owner (no_match, missing_data hoặc error).
- Không cho command này ghi đè owner đã tồn tại. Nếu có nhu cầu chuyển hồ sơ,
  cần command/policy riêng và một control rõ ràng trên UI; không dùng lại nút
  xử lý review hiện tại để chuyển ngầm.
- region bắt buộc với missing_data; với no_match, chỉ ghi nếu là dữ liệu bổ
  sung hợp lệ và vẫn phải kiểm tra lại policy.
- Backend tự đặt method = manual, appliedBy và appliedAt; client không được gửi
  các field này để giả mạo audit.
- Nếu owner được chọn không eligible, vẫn có thể cho phép override theo quyền
  Lead Sales nhưng bắt buộc lưu override=true và reason.
- expectedRevision sai phải trả 409 STALE_REVISION; frontend refetch detail rồi
  yêu cầu user xác nhận lại, không tự retry bằng revision cũ.
- Idempotency-Key bắt buộc, dài 8–140 ký tự, match
  [A-Za-z0-9._:-]. Retry cùng key và cùng payload trả cùng kết quả, không tạo
  thêm ownership hoặc audit event. Cùng key nhưng payload khác trả lỗi 409.

Response thành công 200 OK:

~~~json
{
  "message": {
    "studentId": "HS-003",
    "command": "resolve",
    "assignment": {
      "owner": {
        "id": "USR-SALE-001",
        "displayName": "Nguyễn Minh Anh"
      },
      "status": "assigned",
      "method": "manual",
      "reason": "Đã thống nhất với Sale phụ trách khu vực lân cận để hỗ trợ hồ sơ này.",
      "appliedAt": "2026-09-05T09:50:12+07:00"
    },
    "revision": 2,
    "audit": {
      "eventId": "AUDIT-ASSIGN-0004",
      "actorId": "USR-LEAD-SALE-001",
      "occurredAt": "2026-09-05T09:50:12+07:00"
    }
  }
}
~~~

Frontend nên dùng assignment trong response để cập nhật drawer, sau đó refetch
get_student_assignment_workspace để đồng bộ summary, workflow metrics, review
queue và pagination. Không chỉ xóa item khỏi local array.

## 6. Error contract

~~~json
{
  "error": {
    "code": "STALE_REVISION",
    "message": "Hồ sơ đã được cập nhật bởi người dùng khác. Vui lòng tải lại.",
    "fields": {},
    "requestId": "req_01J..."
  }
}
~~~

| HTTP | Code | API | Khi dùng |
|---:|---|---|---|
| 400 | INVALID_QUERY / INVALID_PAYLOAD | GET/POST | Query/body sai kiểu, thiếu field hoặc filter không hợp lệ |
| 401 | UNAUTHENTICATED | GET/POST | Session không tồn tại hoặc hết hạn |
| 403 | FORBIDDEN | GET/POST | Không phải Lead Sales, ngoài team scope hoặc không có quyền override |
| 404 | STUDENT_NOT_FOUND | Detail/POST | Không tìm thấy hồ sơ trong scope |
| 404 | ASSIGNMENT_OWNER_NOT_FOUND | POST | ownerId không tồn tại hoặc không thuộc team |
| 409 | STALE_REVISION | POST | Hồ sơ đã thay đổi sau lần đọc cuối |
| 409 | ALREADY_ASSIGNED | POST | Hồ sơ đã có owner; không được ghi đè bằng command resolve |
| 409 | IDEMPOTENCY_KEY_REUSED | POST | Cùng key nhưng payload khác request trước |
| 422 | INVALID_ASSIGNMENT | POST | Region/owner không hợp lệ hoặc không đạt policy bắt buộc |
| 502 | INVALID_ASSIGNMENT_RESPONSE | GET/POST | Backend trả payload thiếu field/sai kiểu |
| 503 | STUDENT_ASSIGNMENT_UNAVAILABLE | GET/POST | Không đọc được dữ liệu học sinh, team, rule hoặc assignment store |

Danh sách rỗng là response hợp lệ 200 OK, ví dụ:

~~~json
{
  "message": {
    "items": [],
    "pagination": {
      "page": 1,
      "pageSize": 20,
      "total": 0,
      "totalPages": 0,
      "hasNextPage": false
    }
  }
}
~~~

Trong response workspace đầy đủ, meta, summary và workflow vẫn phải có dù
items rỗng để canvas workflow tiếp tục hiển thị.

## 7. Những thao tác không tạo API trong v1

### 7.1. "Chạy thử luồng"

Theo màn hình hiện tại, nút này chỉ chạy animation tuần tự qua
input → validation → classification → matching → assignment trong React state.
Nó không chạy lại rule backend, không tạo execution, không thay đổi ownership và
không cần POST /run.

Nếu sau này cần chạy automation thật cho một cohort, phải thiết kế riêng
command bất đồng bộ với preview/confirm, idempotency, progress và quyền bulk;
không dùng endpoint mô phỏng của v1.

### 7.2. Chuyển hồ sơ đã có owner

Current UI chỉ xử lý hồ sơ chưa phân công. Không expose quyền chuyển ngầm trong
resolve_student_assignment. Khi có UX cho chuyển hồ sơ, bổ sung command riêng
với fromOwnerId, toOwnerId, reason, expectedRevision và policy/audit tương ứng.

## 8. Luồng gọi API của frontend

~~~text
Mở trang
  └─ GET get_student_assignment_workspace
       ├─ header + health + workflow canvas
       ├─ review queue
       └─ history items + pagination

Đổi search/filter/page
  └─ GET get_student_assignment_workspace với query mới

Mở drawer
  └─ GET get_student_assignment_detail?studentId=...
       └─ owner / candidates / explainability / permissions

Xác nhận xử lý hồ sơ chờ
  └─ POST resolve_student_assignment
       ├─ cập nhật drawer từ response
       └─ refetch workspace để đồng bộ toàn trang
~~~

Query key nên bao gồm toàn bộ tham số ảnh hưởng đến response:

~~~text
["lead-sale", "student-assignment", admissionYear, date, timezone,
 filter, q, page, pageSize, sort, order]
~~~

Không cache lâu hơn snapshot policy nếu dữ liệu assignment thay đổi thường
xuyên. Sau mutation, invalidate mọi query workspace của cùng admissionYear,
date, timezone; detail của hồ sơ vừa xử lý cũng phải được refetch hoặc cập nhật
từ response command.

## 9. Checklist backend/FE handoff

- [ ] Tạo crm.api.lead_sale.get_student_assignment_workspace với team scope
  lấy từ session.
- [ ] Tạo crm.api.lead_sale.get_student_assignment_detail và trả top
  candidates + explainability trong cùng response.
- [ ] Tạo crm.api.lead_sale.resolve_student_assignment với CSRF,
  Idempotency-Key, CAS revision và audit.
- [ ] Summary/workflow metrics dùng cùng meta.asOf, không phụ thuộc page hoặc
  filter của danh sách.
- [ ] Bảo đảm ownerId chỉ nhận user active trong team; không nhận display name.
- [ ] Bổ sung response validation/normalizer tại src/services/api/lead-sale
  và hook query cho workspace/detail.
- [ ] Thêm test cho permission scope, empty state, missing region,
  no-match/manual override, stale revision, retry idempotency và invariant count.
- [ ] Không tạo API cho "Chạy thử luồng" cho đến khi có yêu cầu chạy automation
  thật.
