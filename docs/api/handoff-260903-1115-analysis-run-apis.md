# Handoff — API Student 360 / School 360 / NBA

Chỉ mô tả hợp đồng API. Không kèm hướng dẫn giao diện.

- Ngày: 2026-09-03
- Nguồn: `crm/api/intelligence_runs.py`, `crm/fcrm/intelligence_runs.py`,
  `crm/api/director_next_best_action.py` (frappe-crm) · `app/api/v1/analysis_runs.py` (crm-agents)
- Kiểm chứng bằng run thật `hlsbr0f6gi` (student `ENR-2026-03728`).

---

## 0. Quy ước chung

| Mục | Giá trị |
|---|---|
| Base URL Frappe | `NEXT_PUBLIC_FRAPPE_URL` (vd `http://localhost:8001`) |
| Base URL crm-agents | `http://localhost:7999` |
| Bọc response Frappe | Mọi method trả về `{"message": <payload>}` — payload nằm trong `message` |
| Auth Frappe (đọc) | Cookie session (`sid`), gửi kèm `credentials: "include"` |
| Auth Frappe (ghi/POST) | Cookie session + header `X-Frappe-CSRF-Token` (lấy từ cookie `csrf_token` hoặc `GET /api/method/crm.api.session.me` → `message.csrf_token`) |
| Auth crm-agents | Chat-auth: `X-API-Key` + `X-Frappe-Delegation` (HS256, ≤120s) + Bearer OAuth Frappe |
| Lỗi Frappe | HTTP 4xx/5xx + body `{"exception": "...", "_server_messages": "[...]"}` |
| Lỗi crm-agents | HTTP 4xx/5xx + body `{"detail": "..."}` |

### Enum dùng chung

```
run status      : queued | running | completed | abstained | failed | dead_lettered
                  (queued/running = đang chạy; còn lại = terminal)
stage_kind      : student_360 | next_best_action | school_360
claim.kind      : fact | inference | uncertainty | recommendation
claim.visibility: shareable | source_scoped
report item kind: risk | recommendation | opportunity
```

### Kiểu `Stage`

```jsonc
{
  "name": "3f9c…",                 // id stage
  "stage_kind": "student_360",
  "status": "completed",
  "claims": [ Claim, … ],          // đã lọc theo quyền xem provenance
  "report": Report | null,         // chỉ stage *_360 có; next_best_action luôn null
  "terminal_reason": null,         // vd "evidence_access_denied" khi abstained
  "policy_revision": "student-360-analysis-r1",
  "model_revision": "global.anthropic.claude-haiku-4-5-20251001-v1:0"
}
```

### Kiểu `Claim`

```jsonc
{
  "kind": "recommendation",
  "text": "Đặt buổi tư vấn chuyên sâu về 'Scholarship' cho học viên ở MQL.",
  "provenance_ids": ["student:ENR-2026-03728"],
  "visibility": "shareable"
}
```

### Kiểu `Report` (chỉ ở stage `student_360` / `school_360`)

```jsonc
{
  "title": "Học sinh khách quan tâm, ý định học bổng, cần xác minh và tương tác sâu",
  "summary": "Học sinh đã bước vào giai đoạn sàng lọc (MQL)…",
  "risks": [
    {
      "kind": "risk",
      "headline": "Nguồn liên hệ chưa được xác minh",
      "detail": "Cả hai lần liên hệ gần đây … cần xác nhận tính xác thực.",
      "confidence": 0.9,                       // 0..1, có thể null
      "provenance_ids": ["student:ENR-2026-03728"]
    }
  ],
  "recommendations": [                          // gồm cả item kind "opportunity", opportunity xếp sau
    {
      "kind": "recommendation",
      "headline": "Xác minh lại liên hệ gần đây và cập nhật kênh truyền thông",
      "detail": "Liên hệ trực tiếp … thực hiện trong tuần tới.",
      "confidence": 0.95,
      "provenance_ids": ["student:ENR-2026-03728"]
    }
  ]
}
```

---

## 1. Student 360 + NBA (một run, hai stage)

Một lần "phân tích học sinh" = **1 run** `CRM Student Analysis Run` chứa **2 stage** chạy tuần tự:
`student_360` → `next_best_action` (NBA đọc kết quả 360 làm ngữ cảnh).

- **360** = `Report` của stage `student_360`.
- **NBA** = các `Claim` `kind = "recommendation"` của stage `next_best_action`, **xếp ưu tiên cao → thấp theo thứ tự trong mảng** (không có field rank riêng). Thực tế trả 1–3 claim.

### 1.1 Tạo / lấy run (bất đồng bộ — cần worker nền)

```
POST {FRAPPE}/api/method/crm.api.intelligence_runs.request_student_analysis_run
Headers: X-Frappe-CSRF-Token, Idempotency-Key: <chuỗi ≤140, [A-Za-z0-9._:-]>
Body:    { "student": "ENR-2026-03728", "force_reason": null }
```

- `Idempotency-Key` **bắt buộc**. Cùng key + cùng payload → trả lại receipt cũ; khác payload → 4xx.
- `force_reason` (10–500 ký tự) chỉ dành cho role được cấu hình (mặc định `System Manager`); buộc chạy lại một revision đã terminal.
- **Tái sử dụng:** một request thường sẽ trả về run terminal đã có cho revision nguồn hiện tại **mà không tốn thêm lượt gọi model**. Chỉ có 1 run active trên mỗi học sinh.
- **Quota:** mặc định 3 request / 60 phút / người dùng / học sinh.

**Response** (trong `message`):

```jsonc
{
  "receipt": "b1d2…",           // id receipt (có khi gọi qua request_*)
  "run_id": "hlsbr0f6gi",
  "run_type": "CRM Student Analysis Run",
  "status": "completed",         // xem enum
  "stages": [ Stage, Stage ]     // student_360, next_best_action
}
```

### 1.2 Poll trạng thái run

```
GET {FRAPPE}/api/method/crm.api.intelligence_runs.get_analysis_run
    ?run_type=CRM Student Analysis Run&run_id=hlsbr0f6gi
```

Trả `{ run_id, run_type, status, stages: [Stage…] }` (không có `receipt`).
Poll lại khi `status ∈ {queued, running}` hoặc có stage `status ∈ {queued, running}`.

### 1.3 Chạy đồng bộ (crm-agents — KHÔNG cần worker nền)

Chạy `student_360` rồi `next_best_action` ngay trong 1 request (~10–15s), trả về run đã settle.

```
POST {AGENTS}/api/v1/analysis-runs/student/{student_id}/next-best-action
Headers: X-API-Key, X-Frappe-Delegation, Authorization: Bearer …, Idempotency-Key
Body:    { "force_rerun_reason": null }
```

Response = **cùng shape** mục 1.1 (`{run_id, status, stages:[…]}`).
Sau khi chạy xong, request bất đồng bộ ở 1.1 sẽ tự nhặt lại đúng run này (nhờ cơ chế tái sử dụng revision).

Lỗi: `403` target không được phép · `409` request/stage không được nhận · `422` request không hợp lệ · `503` dịch vụ tạm không sẵn sàng.

### 1.4 Ví dụ dữ liệu thật (rút gọn) — run `hlsbr0f6gi`

```jsonc
{
  "run_id": "hlsbr0f6gi", "run_type": "CRM Student Analysis Run", "status": "completed",
  "stages": [
    {
      "stage_kind": "next_best_action", "status": "completed", "report": null,
      "policy_revision": "student-next-task-v2",
      "claims": [
        { "kind": "recommendation", "text": "Giải quyết nhu cầu Scholarship của học sinh ở giai đoạn quan tâm sơ bộ và thống nhất một bước tiếp theo được kiểm soát.", "provenance_ids": ["student:ENR-2026-03728"], "visibility": "shareable" },
        { "kind": "recommendation", "text": "Đặt buổi tư vấn chuyên sâu về 'Scholarship' cho học viên ở MQL.", "provenance_ids": ["student:ENR-2026-03728"], "visibility": "shareable" },
        { "kind": "recommendation", "text": "Yêu cầu học viên bổ sung giấy tờ còn thiếu cho 'Scholarship'.", "provenance_ids": ["student:ENR-2026-03728"], "visibility": "shareable" }
      ]
    },
    {
      "stage_kind": "student_360", "status": "completed",
      "policy_revision": "student-360-analysis-r1",
      "claims": [ /* 3 inference/uncertainty + 3 recommendation, cùng shape Claim */ ],
      "report": {
        "title": "Học sinh khách quan tâm, ý định học bổng, cần xác minh và tương tác sâu",
        "summary": "Học sinh đã bước vào giai đoạn sàng lọc (MQL) từ 3/9 …",
        "risks": [
          { "kind": "risk", "headline": "Nguồn liên hệ chưa được xác minh", "detail": "…", "confidence": 0.9, "provenance_ids": ["student:ENR-2026-03728"] },
          { "kind": "risk", "headline": "Mức tương tác thực tế còn yếu dù đã sàng lọc", "detail": "…", "confidence": 0.75, "provenance_ids": ["student:ENR-2026-03728"] },
          { "kind": "risk", "headline": "Không có hồ sơ đăng ký học hoặc cam kết từ học sinh", "detail": "…", "confidence": 0.85, "provenance_ids": ["student:ENR-2026-03728"] }
        ],
        "recommendations": [
          { "kind": "recommendation", "headline": "Xác minh lại liên hệ gần đây và cập nhật kênh truyền thông", "detail": "…", "confidence": 0.95, "provenance_ids": ["student:ENR-2026-03728"] },
          { "kind": "recommendation", "headline": "Mở cuộc đối thoại về ý định học bổng và rào cản tiềm ẩn", "detail": "…", "confidence": 0.9, "provenance_ids": ["student:ENR-2026-03728"] },
          { "kind": "recommendation", "headline": "Hướng dẫn nộp hồ sơ đăng ký học nếu tiêu chí phù hợp được xác nhận", "detail": "…", "confidence": 0.85, "provenance_ids": ["student:ENR-2026-03728"] }
        ]
      }
    }
  ]
}
```

---

## 2. School 360

Một run `CRM School Analysis Run` chứa **1 stage** `school_360` (chỉ có `Report`, không có NBA).

### 2.1 Tạo / lấy run

```
POST {FRAPPE}/api/method/crm.api.intelligence_runs.request_school_analysis_run
Headers: X-Frappe-CSRF-Token, Idempotency-Key
Body:    { "high_school": "01-001-062", "admission_year": 2026, "force_reason": null }
```

- `high_school` nhận **cả** id ngoài chuẩn (vd `01-001-062`) **lẫn** tên document `CRM High School`.
- `admission_year` tuỳ chọn (2000–2099).
- Cơ chế idempotency / tái sử dụng / quota / force giống hệt Student (mục 1.1).

**Response** (trong `message`): `{ receipt?, run_id, run_type: "CRM School Analysis Run", status, stages: [Stage] }`.

### 2.2 Poll trạng thái

```
GET {FRAPPE}/api/method/crm.api.intelligence_runs.get_analysis_run
    ?run_type=CRM School Analysis Run&run_id=<run_id>
```

### 2.3 Chạy đồng bộ (crm-agents)

Endpoint đồng bộ hiện chỉ có cho Student NBA. School dùng đường bất đồng bộ:

```
POST {AGENTS}/api/v1/analysis-runs/school
Body: { "high_school": "01-001-062", "admission_year": 2026, "force_rerun_reason": null }
→ 202 { run_id, status, stages }

GET  {AGENTS}/api/v1/analysis-runs/{run_id}?run_kind=school   // poll
GET  {AGENTS}/api/v1/analysis-requests/{request_id}           // tra receipt
```

---

## 3. NBA tổng toàn CRM (Director Next Best Action)

Khác hoàn toàn phần NBA per-student ở mục 1. Đây là **read model tổng hợp** do team backend sở hữu,
**dựng hàng đợi thuần từ doctype `CRM Recommendation`** (không đọc Analysis Run). Nếu chưa có
`CRM Recommendation` nào ở trạng thái mở → `queue.actions = []`.

### 3.1 Lấy snapshot

```
GET {FRAPPE}/api/method/crm.api.director_next_best_action.get_director_next_best_action
    ?admissionYear=2026
    &scope=all
    &queueFilter=all            // all | urgent
    &page=1
    &pageSize=8
    &outcomePeriod=30d          // 7d | 30d | 90d (xem OUTCOME_PERIODS)
```

Yêu cầu quyền Admissions Director. Tham số đều tuỳ chọn (có default).

**Response** (trong `message`):

```jsonc
{
  "meta": {
    "admissionYear": 2026,
    "scope": "all", "scopeLabel": "Toàn bộ cơ sở",
    "asOf": "2026-09-03T04:11:00+07:00", "timezone": "Asia/Ho_Chi_Minh",
    "status": "available",         // available | partial | ai_unavailable
    "aiStatus": "available",       // available | degraded | unavailable
    "modelVersion": null, "policyVersion": "action-policy-2026.08",
    "warnings": null               // hoặc [string]
  },
  "queue": {
    "actions": [ ActionDTO, … ],
    "counts": { "all": 0, "urgent": 0, "today": 0, "overdue": 0, "soon": 0 },
    "pagination": { "page": 1, "pageSize": 8, "total": 0, "hasNext": false }
  },
  "sla": {
    "responseWindowHours": 8,
    "onTimeRate": null,            // % hoặc null
    "onTimeDetail": "Mốc phản hồi 8 giờ làm việc",
    "statusBuckets": { … },
    "riskCases": [ { "studentId","name","school","probability","silentForHours","silentFor","ownerId","owner","priority","href" }, … ],  // tối đa 10
    "riskReasons": [ { … }, … ]
  },
  "outcomes": {
    "period": "30d",
    "rows": [ { "id","submitted","accepted","executed","progressed","transitionRate", … }, … ]
  },
  "controlPolicy": { "version": "action-policy-2026.08", "rows": [ … ] }
}
```

### 3.2 `ActionDTO` (một dòng hàng đợi)

```jsonc
{
  "id": "REC-0001",                     // = actionId để gửi lệnh
  "studentId": "ENR-2026-03728",
  "studentName": "…", "initials": "NA",
  "schoolId": "01-001-062", "school": "…",
  "interest": "…",                      // tên ngành
  "recommendationCode": "COUNSELING",
  "recommendation": "Tư vấn gói học bổng trong hôm nay",
  "summary": "…",                       // reason
  "dueAt": "2026-09-03T09:00:00+07:00", "dueLabel": "Quá hạn 2 giờ",
  "status": "overdue",                  // today | overdue | soon | later
  "priority": "high",                   // high | medium | low
  "impact": "…",
  "currentProbability": 64, "projectedProbability": 78,   // % hoặc null
  "confidence": 86,                     // %
  "suggestedAssigneeId": "HR-STAFF-01", "suggestedAssignee": "…",
  "evidence": ["…", "…"],
  "talkingPoints": ["…", "…"],
  "recentActivity": [ { … }, … ],       // tối đa 5
  "controlLevel": "review",             // approval | review
  "state": "proposed",                  // proposed | assigned | deferred
  "generatedAt": "2026-09-03T02:00:00+07:00",
  "expiresAt": "2026-09-10T02:00:00+07:00",
  "version": 0                          // = expectedVersion để gửi lệnh
}
```

### 3.3 Áp lệnh lên một dòng

```
POST {FRAPPE}/api/method/crm.api.director_next_best_action.apply_action_command
Headers: X-Frappe-CSRF-Token
Body: {
  "actionId": "REC-0001",
  "command": "assign",            // assign | defer | dismiss
  "assigneeId": "HR-STAFF-01",    // bắt buộc khi assign
  "deferUntil": "2026-09-05T09:00:00+07:00",  // tuỳ chọn khi defer
  "reason": "…",                  // bắt buộc khi dismiss
  "expectedVersion": 0,           // = ActionDTO.version (optimistic lock)
  "idempotencyKey": "…"
}
```

**Response** (trong `message`):

```jsonc
{
  "actionId": "REC-0001", "command": "assign",
  "state": "assigned",           // assigned | deferred | dismissed
  "version": 1,
  "appliedAt": "2026-09-03T04:20:00+07:00",
  "deferUntil": null,
  "replayed": false,
  "audit": { "eventId": "…", "actorId": "…", "occurredAt": "…" }
}
```

Lỗi thường gặp: `STALE_ACTION_VERSION` (version lệch — load lại snapshot), `INVALID_COMMAND`,
`EXPIRED` (recommendation hết hạn).

---

## 4. Phụ thuộc dữ liệu (đọc trước khi test)

| Trang / API | Đọc từ | Điều kiện có dữ liệu |
|---|---|---|
| Student 360 + NBA (mục 1) | `CRM Student Analysis Run` + stages | Đã chạy analysis (async worker **hoặc** endpoint đồng bộ 1.3) |
| School 360 (mục 2) | `CRM School Analysis Run` + stages | Đã chạy analysis cho trường |
| Director NBA (mục 3) | `CRM Recommendation` (+ `CRM Student Assessment` confirmed, `CRM Action`) | Có ≥1 `CRM Recommendation` trạng thái mở; sinh qua producer/seed, **không** sinh từ Analysis Run |

Trạng thái hạ tầng hiện tại (site demo `crm.localhost`): `ANALYSIS_RUN_WORKER_ENABLED=false`
→ chỉ chạy analysis qua endpoint đồng bộ 1.3. `CRM Recommendation = 0` → Director NBA (mục 3)
trả queue rỗng cho tới khi có nguồn sinh recommendation.
