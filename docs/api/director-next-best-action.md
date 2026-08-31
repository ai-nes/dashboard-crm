# API cho `/director/ai/next-best-action`

Tài liệu này mô tả API cho màn **Việc cần xử lý** của Director: hàng đợi hành động được AI đề xuất, lý do/xác suất, tình trạng SLA, kết quả các loại hành động và các lệnh giao việc, trì hoãn hoặc bỏ đề xuất.

## 1. Phạm vi màn hình

| Vùng UI | Dữ liệu cần | Nguồn hiện tại |
|---|---|---|
| Header | Kỳ tuyển sinh, mốc SLA 8 giờ, trạng thái dữ liệu | Text tĩnh |
| Hàng đợi | Danh sách action, ưu tiên, hạn xử lý, người phụ trách đề xuất | `recommendedActions` |
| Chi tiết action | Hồ sơ, đề xuất, impact, confidence, evidence, talking points, activity | `RecommendedAction` |
| Tình trạng thời hạn | Còn trong hạn, sắp đến hạn, đã quá hạn | `slaStatusBuckets` từ route `/director/sla` |
| Hồ sơ có nguy cơ bỏ lỡ | Hồ sơ điểm cao nhưng im lặng lâu | `slaRiskCases` từ route `/director/sla` |
| Nguyên nhân chậm xử lý | Tỷ trọng nguyên nhân trong nhóm quá hạn | `slaRiskReasons` từ route `/director/sla` |
| Kết quả đề xuất | Đã trình, chấp nhận, thực hiện, chuyển bước, tỷ lệ chuyển bước trong 30 ngày | `actionOutcomes` |
| Quy tắc thực hiện | Mức tự động/kiểm tra/cần duyệt | Text tĩnh |

Nguồn tham chiếu trực tiếp:

- [page.tsx](../../src/app/(with-layouts)/(dashboard)/director/ai/next-best-action/page.tsx)
- [next-best-action-workspace.tsx](../../src/app/(with-layouts)/(dashboard)/director/ai/next-best-action/_components/next-best-action-workspace.tsx)
- [types.ts](../../src/app/(with-layouts)/(dashboard)/director/ai/next-best-action/_components/types.ts)
- [data.ts](../../src/app/(with-layouts)/(dashboard)/director/ai/next-best-action/_components/data.ts)
- [SLA data.ts](../../src/app/(with-layouts)/(dashboard)/director/sla/_components/data.ts)

## 2. Tình trạng API hiện tại

Route chưa gọi API. Hàng đợi, outcome và các component SLA đang đọc fixture trực tiếp từ frontend. Các nút `Làm mới`, `Giao việc`, `Trì hoãn` và `Bỏ đề xuất` hiện chỉ thay đổi state cục bộ hoặc hiển thị toast; chưa có request backend.

Contract bên dưới là contract production đề xuất. Một lần tải màn hình nên lấy một snapshot duy nhất để action queue và SLA không bị lệch thời điểm. Khi AI hoặc nguồn đánh giá không khả dụng, không được hiển thị recommendation cũ như thể đang còn hiệu lực.

## 3. Endpoint đọc dữ liệu và quyền truy cập

```http
GET {NEXT_PUBLIC_FRAPPE_URL}/api/method/crm.api.director_next_best_action.get_director_next_best_action
Cookie: sid=<Frappe session cookie>
Accept: application/json
```

Frappe bọc response thành công trong `message`.

Endpoint trả dữ liệu hồ sơ có định danh nên phải áp dụng field-level authorization. Chỉ trả những field cần cho việc ra quyết định; không trả phone, email, nội dung trao đổi riêng tư hoặc dữ liệu nhạy cảm trong response hàng đợi.

Quyền tối thiểu:

- `Administrator` hoặc `System Manager` có quyền phù hợp;
- profile nghiệp vụ `Admissions Director` hoặc role được allowlist;
- user chỉ được xem action và hồ sơ thuộc `scope` được cấp.

## 4. Request đọc

Ví dụ:

```http
GET /api/method/crm.api.director_next_best_action.get_director_next_best_action?admissionYear=2026&scope=all&queueFilter=all&page=1&pageSize=20&outcomePeriod=30d
```

### Query parameters

| Tên | Kiểu | Bắt buộc | Mặc định | Ràng buộc / mô tả |
|---|---|---:|---|---|
| `admissionYear` | integer | Không | Kỳ active duy nhất | Năm 4 chữ số trong khoảng `2000..2100` |
| `scope` | string | Không | `all` | `all`, campus ID hoặc territory ID được user cấp quyền |
| `queueFilter` | enum | Không | `all` | `all` hoặc `urgent`; `urgent` gồm `today` và `overdue` |
| `page` | integer | Không | `1` | `>= 1` |
| `pageSize` | integer | Không | `20` | `1..100` |
| `outcomePeriod` | enum | Không | `30d` | Hiện hỗ trợ `30d`; có thể mở rộng `7d`, `90d`, `season` |

Hàng đợi phải được sắp xếp ổn định theo mức độ khẩn, hạn xử lý, priority và điểm xếp hạng. Frontend không nên dùng tên hiển thị để sort hoặc tính trạng thái quá hạn.

Nếu không truyền `admissionYear`, backend chỉ được tự chọn kỳ khi có đúng một kỳ tuyển sinh active; nếu không, trả `422 INVALID_ADMISSION_YEAR`.

## 5. Response `200 OK`

Shape tổng quát:

```text
{
  message: {
    meta: NextBestActionMeta,
    queue: ActionQueue,
    sla: SlaOverview,
    outcomes: ActionOutcomes,
    controlPolicy: ActionControlPolicy
  }
}
```

Ví dụ response rút gọn:

```json
{
  "message": {
    "meta": {
      "admissionYear": 2026,
      "scope": "all",
      "scopeLabel": "Toàn bộ cơ sở",
      "asOf": "2026-08-31T10:00:00+07:00",
      "timezone": "Asia/Ho_Chi_Minh",
      "status": "available",
      "aiStatus": "available",
      "modelVersion": "nba-2026.08",
      "policyVersion": "action-policy-2026.08"
    },
    "queue": {
      "actions": [
        {
          "id": "nba-mai-thi-an",
          "studentId": "STU-2026-00021",
          "studentName": "Mai Thị An",
          "initials": "MA",
          "schoolId": "SCH-00018",
          "school": "THPT Chu Văn An",
          "interest": "Kinh doanh quốc tế",
          "recommendationCode": "scholarship-counselling",
          "recommendation": "Tư vấn học bổng 20%",
          "summary": "Đủ điều kiện học bổng 20% nhưng chưa nhận thông tin chi tiết.",
          "dueAt": "2026-08-31T17:00:00+07:00",
          "dueLabel": "Xử lý hôm nay",
          "status": "today",
          "priority": "high",
          "impact": "Tăng khả năng nhập học từ 82% lên 89%",
          "currentProbability": 82,
          "projectedProbability": 89,
          "confidence": 76,
          "suggestedAssigneeId": "USR-0007",
          "suggestedAssignee": "Trần Minh Anh",
          "evidence": [
            "Đạt học lực Giỏi 3 năm và IELTS 6.5.",
            "Đã xem trang học bổng 20% hai lần trong tuần này."
          ],
          "talkingPoints": [
            "Xác nhận mối quan tâm về chương trình Kinh doanh quốc tế.",
            "Giải thích điều kiện duy trì và giá trị thực tế của học bổng."
          ],
          "recentActivity": [
            {
              "id": "evt-001",
              "label": "Mở email: Thông tin học bổng",
              "occurredAt": "2026-08-31T09:42:00+07:00",
              "time": "Hôm nay, 09:42"
            }
          ],
          "controlLevel": "approval",
          "state": "proposed",
          "generatedAt": "2026-08-31T08:00:00+07:00",
          "expiresAt": "2026-08-31T17:00:00+07:00",
          "version": 3
        }
      ],
      "counts": {
        "all": 4,
        "urgent": 2,
        "today": 1,
        "overdue": 1,
        "soon": 2
      },
      "pagination": {
        "page": 1,
        "pageSize": 20,
        "total": 4,
        "hasNext": false
      }
    },
    "sla": {
      "responseWindowHours": 8,
      "onTimeRate": 86.2,
      "onTimeDetail": "Mốc phản hồi 8 giờ làm việc",
      "statusBuckets": [
        {
          "id": "within-sla",
          "label": "Còn trong hạn",
          "count": 8420,
          "share": 95.1,
          "detail": "Có thể xử lý theo lịch hiện tại",
          "tone": "success"
        },
        {
          "id": "due-soon",
          "label": "Sắp đến hạn",
          "count": 312,
          "share": 3.5,
          "detail": "Còn dưới 60 phút trước mốc phản hồi",
          "tone": "warning"
        },
        {
          "id": "overdue",
          "label": "Đã quá hạn",
          "count": 125,
          "share": 1.4,
          "detail": "Cần điều phối ngay",
          "tone": "error"
        }
      ],
      "riskCases": [
        {
          "studentId": "STU-2026-00042",
          "name": "Nguyễn T. Hà",
          "school": "THPT Bùi Hữu Nghĩa",
          "probability": 68,
          "silentForHours": 552,
          "silentFor": "23 ngày",
          "ownerId": "USR-0011",
          "owner": "Nguyễn T. Hà",
          "priority": "high",
          "href": "/director/students/STU-2026-00042"
        }
      ],
      "riskReasons": [
        {
          "id": "unassigned",
          "label": "Thiếu người phụ trách",
          "percentage": 48,
          "detail": "Tập trung ở đội có tải cao"
        },
        {
          "id": "no-next-step",
          "label": "Chưa có bước tiếp theo",
          "percentage": 31,
          "detail": "Đã liên hệ nhưng chưa ghi nhận kết quả"
        }
      ]
    },
    "outcomes": {
      "period": "30d",
      "rows": [
        {
          "id": "parent-call",
          "label": "Gọi phụ huynh",
          "submitted": 142,
          "accepted": 128,
          "executed": 121,
          "progressed": 74,
          "transitionRate": 61.2
        },
        {
          "id": "scholarship",
          "label": "Tư vấn học bổng",
          "submitted": 96,
          "accepted": 91,
          "executed": 88,
          "progressed": 52,
          "transitionRate": 59.1
        }
      ]
    },
    "controlPolicy": {
      "version": "action-policy-2026.08",
      "rows": [
        {
          "level": "automatic",
          "label": "Tự động",
          "actionTypes": ["reminder", "internal-update"],
          "detail": "Nhắc lịch và cập nhật nội bộ",
          "execution": "system"
        },
        {
          "level": "review",
          "label": "Cần kiểm tra",
          "actionTypes": ["assign", "schedule", "invite"],
          "detail": "Giao việc, đặt lịch, mời sự kiện",
          "execution": "business-rule"
        },
        {
          "level": "approval",
          "label": "Cần duyệt",
          "actionTypes": ["send-message", "change-stage", "bulk-action"],
          "detail": "Gửi nội dung hoặc thay đổi hồ sơ",
          "execution": "human-confirmation"
        }
      ]
    }
  }
}
```

Ví dụ rút gọn chỉ chứa một action, một risk case, hai outcome và hai nguyên nhân SLA. Response production trả toàn bộ bản ghi trong trang hiện tại và các summary/count tương ứng.

## 6. Data contract chi tiết

### 6.1. `meta`

```typescript
type NextBestActionMeta = {
  admissionYear: number;
  scope: string;
  scopeLabel: string;
  asOf: string; // ISO-8601, có timezone
  timezone: string;
  status: "available" | "partial" | "ai_unavailable";
  aiStatus: "available" | "degraded" | "unavailable";
  modelVersion: string | null;
  policyVersion: string;
  warnings?: string[];
};
```

`modelVersion`, `policyVersion` và `asOf` cần được lưu cùng recommendation để có thể giải thích và đối soát sau này. `ai_unavailable` không đồng nghĩa với việc dùng recommendation cũ; khi AI không sẵn sàng, queue phải rỗng hoặc chỉ chứa raw fact đã được đánh dấu là không phải recommendation.

### 6.2. `queue`

```typescript
type ActionStatus = "today" | "soon" | "overdue";
type ActionPriority = "high" | "medium" | "low";
type ActionControlLevel = "automatic" | "review" | "approval";
type ActionState = "proposed" | "assigned" | "deferred" | "dismissed" | "expired";

type RecommendedAction = {
  id: string;
  studentId: string;
  studentName: string;
  initials: string;
  schoolId?: string | null;
  school: string;
  interest: string | null;
  recommendationCode: string;
  recommendation: string;
  summary: string;
  dueAt: string | null;
  dueLabel: string;
  status: ActionStatus;
  priority: ActionPriority;
  impact: string;
  currentProbability?: number | null;
  projectedProbability?: number | null;
  confidence: number; // 0..100
  suggestedAssigneeId: string | null;
  suggestedAssignee: string | null;
  evidence: string[];
  talkingPoints: string[];
  recentActivity: Array<{
    id: string;
    label: string;
    occurredAt: string;
    time?: string;
  }>;
  controlLevel: ActionControlLevel;
  state: ActionState;
  generatedAt: string;
  expiresAt: string | null;
  version: number;
};
```

Quy ước:

- `id` là recommendation ID ổn định, còn `studentId` là ID hồ sơ canonical; không dùng tên học sinh làm định danh hoặc React key.
- `dueAt` là nguồn để tính trạng thái; `dueLabel` chỉ là chuỗi hiển thị. `overdue` nghĩa là `dueAt < asOf` và chưa hoàn tất/được trì hoãn.
- `confidence` là độ tin cậy của recommendation, không phải xác suất nhập học. Xác suất hiện tại/dự kiến nếu có phải nằm ở các field số riêng.
- `evidence` chỉ chứa các tín hiệu đã được phép hiển thị cho Director. Evidence cần có nguồn/audit reference ở backend dù UI hiện tại chỉ hiển thị text.
- `recentActivity.occurredAt` dùng để sort/audit; `time` chỉ là display label.
- `state = proposed` là đề xuất chưa có command thành công. Sau khi giao việc, trì hoãn hoặc bỏ, backend phải cập nhật state và tạo audit event.
- `expiresAt` dùng để từ chối command trên recommendation đã stale. Không thực hiện action sau thời điểm hết hạn nếu chưa revalidate.

`queue.counts` phải được tính trên toàn bộ kết quả sau khi áp dụng quyền và filter, không chỉ trên page hiện tại:

```typescript
type ActionQueue = {
  actions: RecommendedAction[];
  counts: {
    all: number;
    urgent: number; // today + overdue
    today: number;
    overdue: number;
    soon: number;
  };
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    hasNext: boolean;
  };
};
```

UI hiện tại lọc `urgent` ở client bằng `today` và `overdue`; backend vẫn nên trả counts riêng để tab không phụ thuộc số item của page đầu.

### 6.3. `sla`

```typescript
type SlaOverview = {
  responseWindowHours: number;
  onTimeRate: number | null;
  onTimeDetail: string;
  statusBuckets: Array<{
    id: "within-sla" | "due-soon" | "overdue";
    label: string;
    count: number;
    share: number;
    detail: string;
    tone: "success" | "warning" | "error";
  }>;
  riskCases: Array<{
    studentId: string;
    name: string;
    school: string;
    probability: number | null;
    silentForHours: number | null;
    silentFor: string;
    ownerId: string | null;
    owner: string;
    priority: "high" | "watch";
    href: string;
  }>;
  riskReasons: Array<{
    id: string;
    label: string;
    percentage: number;
    detail: string;
  }>;
};
```

`statusBuckets.share` là phần trăm trên cùng một tổng SLA và nên tổng bằng `100` sau khi làm tròn. `riskReasons.percentage` có denominator là nhóm hồ sơ đã quá hạn, không phải toàn bộ queue. Nếu denominator bằng `0`, trả `[]` hoặc `null` theo schema đã thống nhất, không tạo phần trăm giả.

Các route `/director/sla` và `/director/ai/next-best-action` phải đọc cùng định nghĩa SLA, `asOf`, kỳ tuyển sinh và scope. Không copy một bộ số SLA khác vào frontend của NBA.

### 6.4. `outcomes`

```typescript
type ActionOutcomes = {
  period: "7d" | "30d" | "90d" | "season";
  rows: Array<{
    id: string;
    label: string;
    submitted: number;
    accepted: number;
    executed: number;
    progressed: number;
    transitionRate: number | null;
  }>;
};
```

`transitionRate = progressed / executed * 100`. `submitted`, `accepted`, `executed` và `progressed` là các trạng thái của recommendation/action đã ghi nhận; không lấy số lần render hoặc số lần click frontend. Khi `executed = 0`, trả `null`.

Chart hiện tại sắp xếp row theo `transitionRate` giảm dần và hiển thị 5 loại action. Backend có thể trả tất cả loại action đã có trong kỳ; frontend giới hạn hiển thị nếu cần.

### 6.5. `controlPolicy`

```typescript
type ActionControlPolicy = {
  version: string;
  rows: Array<{
    level: "automatic" | "review" | "approval";
    label: string;
    actionTypes: string[];
    detail: string;
    execution: "system" | "business-rule" | "human-confirmation";
  }>;
};
```

Policy tối thiểu:

- `automatic`: nhắc lịch hoặc cập nhật nội bộ, không tạo tác động bên ngoài;
- `review`: giao việc, đặt lịch, mời sự kiện, chỉ thực hiện sau khi qua luật nghiệp vụ;
- `approval`: gửi Zalo/email, nội dung học phí/học bổng, đổi trạng thái hồ sơ hoặc thao tác hàng loạt, bắt buộc người duyệt.

Dashboard không được tự gửi tin nhắn, tự gọi, đổi lifecycle hoặc ghi trực tiếp vào bảng nghiệp vụ chỉ vì một recommendation xuất hiện.

## 7. Command giao việc/trì hoãn/bỏ đề xuất

Các nút trong detail là mutation, không dùng `GET`. Dùng một command endpoint chung để policy, optimistic concurrency, idempotency và audit được xử lý thống nhất:

```http
POST {NEXT_PUBLIC_FRAPPE_URL}/api/method/crm.api.director_next_best_action.apply_action_command
Cookie: sid=<Frappe session cookie>
Content-Type: application/json
Accept: application/json
Idempotency-Key: <unique-command-key>
```

Request chung:

```typescript
type ActionCommandRequest = {
  actionId: string;
  command: "assign" | "defer" | "dismiss";
  assigneeId?: string;
  deferUntil?: string;
  reason?: string;
  expectedVersion: number;
  idempotencyKey: string;
};
```

Ví dụ giao việc cho người được đề xuất:

```json
{
  "actionId": "nba-mai-thi-an",
  "command": "assign",
  "assigneeId": "USR-0007",
  "expectedVersion": 3,
  "idempotencyKey": "cmd-01J-assign-nba-mai-thi-an"
}
```

Ví dụ trì hoãn:

```json
{
  "actionId": "nba-mai-thi-an",
  "command": "defer",
  "deferUntil": "2026-09-02T09:00:00+07:00",
  "reason": "Chờ học sinh hoàn thành hồ sơ học bổng",
  "expectedVersion": 3,
  "idempotencyKey": "cmd-01J-defer-nba-mai-thi-an"
}
```

Ví dụ bỏ đề xuất:

```json
{
  "actionId": "nba-mai-thi-an",
  "command": "dismiss",
  "reason": "Đề xuất không phù hợp với bối cảnh gia đình",
  "expectedVersion": 3,
  "idempotencyKey": "cmd-01J-dismiss-nba-mai-thi-an"
}
```

Quy tắc command:

- `assigneeId` là bắt buộc với `assign`; không nhận tên hiển thị làm định danh.
- `deferUntil` phải là ISO-8601 có timezone và nằm trong policy cho phép. Nếu không truyền, backend chỉ được dùng default policy rõ ràng và phải trả thời điểm đã áp dụng.
- `reason` nên bắt buộc với `dismiss` và các command thuộc `approval`, để phục vụ audit.
- `expectedVersion` chống ghi đè khi recommendation đã được user khác xử lý hoặc đã hết hạn.
- `Idempotency-Key` phải duy nhất theo actor/command; retry cùng key phải trả cùng kết quả, không tạo thêm ownership/audit event.
- Command chỉ cập nhật recommendation/ownership projection thông qua command layer. Không cho client gửi trực tiếp `state`, `owner`, `lifecycle` hoặc field AI khác.

Response thành công:

```json
{
  "message": {
    "actionId": "nba-mai-thi-an",
    "command": "assign",
    "state": "assigned",
    "version": 4,
    "appliedAt": "2026-08-31T10:05:00+07:00",
    "audit": {
      "eventId": "audit-01J...",
      "actorId": "USR-DIRECTOR-01",
      "occurredAt": "2026-08-31T10:05:00+07:00"
    }
  }
}
```

Sau mutation thành công, frontend nên refetch GET snapshot hoặc cập nhật cache theo response rồi refetch background. Không chỉ xoá item khỏi local array mà không xác nhận backend.

## 8. Quy tắc AI, audit và dữ liệu

- Recommendation phải có `modelVersion`, `policyVersion`, `generatedAt`, `expiresAt` và snapshot input `asOf` để giải thích được vì sao action được xếp hạng.
- Evidence phải trỏ được về event/assessment canonical ở backend; không suy diễn lý do chỉ từ text hiển thị.
- AI chỉ đề xuất. Human approval là bắt buộc trước tác động trực tiếp tới học sinh/phụ huynh, đặc biệt là nội dung học phí, học bổng, email/Zalo, thay đổi trạng thái và bulk action.
- Kết quả `accepted`, `executed` và `progressed` phải đến từ event/command receipt canonical, không lấy từ toast hoặc state frontend.
- Khi một nguồn AI lỗi, trả raw SLA facts nếu còn đọc được và đánh dấu `ai_unavailable`; không fallback sang recommendation stale.
- Không trả phone/email, thông tin tài chính gia đình hoặc thuộc tính nhạy cảm trong queue aggregate. Drill-down dùng Student 360 với quyền và consent riêng.
- `asOf` luôn kèm timezone. Không dùng `Hôm nay`, `Trong 1 ngày` hoặc `23 ngày` làm field duy nhất để tính SLA.

## 9. Error contract

Lỗi đọc dữ liệu:

```json
{
  "message": {
    "error": {
      "code": "DIRECTOR_NEXT_BEST_ACTION_UNAVAILABLE",
      "message": "Không thể tải danh sách việc cần xử lý.",
      "details": {}
    },
    "meta": {
      "requestId": "req_01J..."
    }
  }
}
```

Lỗi command dùng cùng format và thêm `actionId`/`currentVersion` khi phù hợp.

| HTTP | Code | Khi dùng |
|---:|---|---|
| `400` | `INVALID_QUERY` / `INVALID_COMMAND` | Query/body sai format hoặc command thiếu field |
| `401` | `UNAUTHENTICATED` | Thiếu hoặc hết hạn session |
| `403` | `FORBIDDEN` | User không có quyền xem hoặc thực hiện command |
| `404` | `ACTION_NOT_FOUND` | Recommendation không tồn tại hoặc không thuộc scope |
| `409` | `STALE_ACTION_VERSION` | `expectedVersion` không khớp hoặc action đã đổi state |
| `409` | `ACTION_EXPIRED` | Recommendation đã quá `expiresAt` |
| `422` | `INVALID_ADMISSION_YEAR` / `INVALID_DEFER_UNTIL` | Kỳ tuyển sinh hoặc thời điểm trì hoãn không hợp lệ |
| `502` | `INVALID_NEXT_BEST_ACTION_RESPONSE` | Upstream trả schema không hợp lệ |
| `503` | `DIRECTOR_NEXT_BEST_ACTION_UNAVAILABLE` | Không đọc được aggregate hoặc AI service unavailable |

`503` do AI không khả dụng không được tự động biến thành dữ liệu mock. Nếu SLA facts còn dùng được, response có thể trả `meta.aiStatus = "unavailable"`, `queue.actions = []` và `sla` với trạng thái nguồn tương ứng.

## 10. API chưa cần cho lần tải đầu

- Approve/reject recommendation độc lập: hiện UI chỉ có giao việc, trì hoãn và bỏ đề xuất. Nếu bổ sung, dùng command `approve`/`reject` và bắt buộc audit.
- Thực thi gửi Zalo/email/gọi tự động: phải do phân hệ chuyên trách thực hiện sau policy/approval, không gọi trực tiếp từ dashboard.
- Bulk action: mockup có đề cập nhưng route hiện tại chưa mount. Khi triển khai, cần endpoint/job riêng, preview danh sách ảnh hưởng và xác nhận hai bước.
- Student detail: dùng endpoint Student 360 hiện có; không nhúng toàn bộ hồ sơ hoặc contact information vào GET queue.

## 11. Request tối thiểu để tích hợp

Đọc snapshot:

```http
GET /api/method/crm.api.director_next_best_action.get_director_next_best_action?admissionYear=2026&scope=all&queueFilter=all&page=1&pageSize=20&outcomePeriod=30d
```

Response tối thiểu phải có:

1. `meta.admissionYear`, `meta.scopeLabel`, `meta.asOf`, `meta.status`, `meta.aiStatus`.
2. `queue.actions` với đủ field để render list/detail và `queue.counts`/`pagination`.
3. `sla.statusBuckets`, `sla.riskCases`, `sla.riskReasons` để render các block SLA đang được reuse.
4. `outcomes.period` và `outcomes.rows` để render chart 30 ngày.
5. `controlPolicy.version` và các rule áp dụng cho action.

Command mutation phải dùng `POST /api/method/crm.api.director_next_best_action.apply_action_command` với `expectedVersion` và idempotency key. Khi backend sẵn sàng, frontend không nên tiếp tục dùng fixture hoặc chỉ xoá action khỏi state cục bộ sau khi bấm nút.
