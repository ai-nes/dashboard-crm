---
title: "Student Dashboard — Golden Seed Fixture"
status: "reference"
updated: "2026-09-06"
scope: "local-only"
---

# Student Dashboard — Golden Seed Fixture

## Overview

Tài liệu này là contract cho một hồ sơ `CRM Student` có đủ dữ liệu để kiểm thử
các màn hình Student List, Student 360, Activities, Zalo, Calls, Notes, Tasks,
Audit, Ownership, NBA và AI Analysis của `dashboard-crm`.

Fixture chỉ dùng cho site local/disposable. Không dùng số điện thoại, email,
CMND/CCCD hoặc dữ liệu thật trong production.

## Trạng thái seed hiện tại

`crm.demo.seed_student_detail.seed` hiện mới tạo Student, academic profile,
interaction Website/Event/Form-style, assessment, parent authority, guardian và
consent. Script hiện tại **không tạo Zalo, Call Log hoặc Task**, nên chưa đủ để
kiểm thử toàn bộ dashboard.

Nguồn hiện tại:

- Backend seed: `frappe-crm/crm/demo/seed_student_detail.py`
- Backend Student API: `frappe-crm/crm/api/director_students.py`
- Frontend Student API/types: `dashboard-crm/src/services/api/students/`
- Frontend dashboard API docs: `dashboard-crm/docs/api/director-student-detail.md`

Các mục trong tài liệu này là dataset bắt buộc cho bản full seed. Khi triển khai
seed code, phải giữ namespace, idempotency và các invariant ở cuối tài liệu.

## 1. Fixture identity

| Key | Value |
|---|---|
| Site | `crm.localhost` |
| Namespace | `crm-demo-student-dashboard:gia-uyen` |
| Student alias | `gia-uyen` |
| Student ID | `ENR-2026-04561` nếu đã tồn tại; nếu không dùng `student` từ seed manifest |
| Student display name | `Lê Gia Uyên` |
| Email local | `gia-uyen.student@example.test` |
| Phone local | `0900004561` |
| Admission year | `2026` |
| Expected list stage | `Tư vấn` |
| Expected priority | `Cao` |
| Timezone | `Asia/Ho_Chi_Minh` |

Mọi API phải dùng `student_id = <seed_result.student>` thay vì tự đoán tên
Frappe được sinh từ naming series.

### 1.1. Student profile tối thiểu

```yaml
student:
  doctype: CRM Student
  name: ENR-2026-04561
  student_name: Lê Gia Uyên
  phone: 0900004561
  email: gia-uyen.student@example.test
  gender: Nữ
  date_of_birth: 2009-04-16
  enrollment_status: PROSPECT
  lifecycle_stage: MQL                 # projection, không ghi trực tiếp
  current_grade: "10"
  study_stage: grade_10
  high_school: THPT Rạch Gầm-Xoài Mút
  province: Đồng Tháp
  major: Artificial Intelligence
  source: Reference
  advertising_channel: Website tuyển sinh
  admission_year: "2026"
  admission_method: TRANSCRIPT_REVIEW
  branch: FPTU Ho Chi Minh Campus
  aspiration: Artificial Intelligence
  step: 3
  graduation_score: 8.6
  transcript_score: 8.8
  english_converted_score: 7.0
  total_score: 24.4
  alt_name: Phụ huynh Demo Gia Uyên
  alt_phone: 0900004562
  alt_address: Địa chỉ local demo
  id_number: 000000000000
  id_issued_date: 2025-05-20
  id_issued_place: LOCAL FIXTURE
  notes: Hồ sơ demo local cho Student 360; rào cản chính là học phí và học bổng.
  import_source_id: crm-demo-student-dashboard:gia-uyen:student
```

Các field projection/read-only như `lifecycle_stage`, `owner_staff`,
`assigned_to`, `latest_score`, `assessment_status`, `privacy_status`,
`ownership_revision` và `student_context_revision` phải được tạo qua service
hiện có. Không dùng `db_set` để giả lập chúng nếu seed cần test audit hoặc
concurrency.

### 1.2. Child tables và master data

Tạo hoặc resolve bằng helper master-data hiện có, không chèn duplicate theo tên:

| Doctype | Dữ liệu cần có |
|---|---|
| `CRM High School` | `THPT Rạch Gầm-Xoài Mút` |
| `CRM Province` | `Đồng Tháp` |
| `CRM Major` | `Artificial Intelligence` |
| `CRM Lead Source` | `Reference` |
| `CRM Admission Year` | `2026` và đang active |
| `CRM Campus` | `FPTU Ho Chi Minh Campus` nếu field `branch` được dùng |
| `CRM Aspiration` | `Artificial Intelligence` nếu field `aspiration` được dùng |
| `CRM Student Case Key` | case key canonical của Student |
| `CRM Admission Offering` | offering 2026 cho Artificial Intelligence tại campus |
| `CRM Admission Method` | `TRANSCRIPT_REVIEW` |
| `CRM Student Academic Result` | 2024–2025, lớp 10, GPA 8.8, Khá |
| `CRM Student Language Certificate` | IELTS Academic, 7.0, còn hạn đến 2028-03-15 |

## 2. Canonical related-data graph

Đây là số lượng tối thiểu sau khi seed thành công. Có thể có thêm dữ liệu do
site dùng chung, nhưng fixture của student phải đạt ít nhất các ngưỡng này.

| Nhóm dữ liệu | Doctype/nguồn | Tối thiểu | Dùng bởi |
|---|---|---:|---|
| Contact | `CRM Contact` | 1 | parent profile, consent, scope |
| Guardian | `CRM Student Guardian` | 1 active | Student 360 family |
| Parent authority | `CRM Parent Contact Authority` | 1 active | contactability |
| Consent | `CRM Contact Consent Event` | 1 Granted | consent badge, privacy |
| Interaction | `CRM Interaction` | 10 | detail, chart, journey, engagement |
| Assessment | `CRM Student Assessment` | 5, bản cuối `confirmed` | classification, probability |
| Score history | `CRM Score History` | 5 | list score delta, trend |
| Application | `CRM Admission Application` | 1 | application/readiness |
| Intent | `CRM Intent` | 3 | interaction intelligence, NBA |
| Outcome | `CRM Student Outcome` | 1 | next action, activity |
| Notes | `FCRM Note` | 2 | Notes tab, activity |
| Tasks | `CRM Action Item` | 3 | Tasks tab, NBA/action queue |
| Calls | `Call Log` | 2 | Calls tab, detail fallback |
| Chatwoot/Zalo | `CRM Interaction` loại Chatwoot | 3 | Zalo tab |
| Interaction evidence | `CRM Interaction Evidence` | 2 | interaction detail/evidence |
| Audit | `Version` của Student | >= 4 changes | Audit tab |
| Ownership | `CRM Staff`, Team, Pool, assignment event | 1 owner + 1 team/pool | ownership APIs |
| Analysis | `CRM Student Analysis Run` + stages | 1 completed | AI Analysis panel |
| NBA evaluation | `CRM NBA Evaluation` + `CRM Recommendation` | 1 + 3 pending | NBA worklist |

## 3. Timeline fixture

Tất cả `interaction_datetime`, `assessed_at`, `due_at` và `occurred_at` phải
khác nhau, tăng dần theo nghiệp vụ và dùng timezone CRM. `creation`/`modified`
có thể do Frappe quản lý; không dùng chúng thay cho thời gian nghiệp vụ.

| # | Thời điểm | Nguồn | `interaction_type`/evidence | Nội dung bắt buộc | Kết quả |
|---:|---|---|---|---|---|
| 1 | 2026-08-18 09:10 | Website | `Website Visit` | Xem trang ngành Trí tuệ nhân tạo | `Captured` |
| 2 | 2026-08-21 18:20 | Event | `Event Participation` | Đăng ký ngày hội AI | `Captured` |
| 3 | 2026-08-24 10:05 | Form | `Form Submission` | Hoàn tất biểu mẫu tư vấn | `Resolved` |
| 4 | 2026-08-25 15:30 | Email | `Email` | Gửi brochure và checklist hồ sơ | `Captured` |
| 5 | 2026-08-27 20:15 | Website | `Website Visit` | Xem học phí và học bổng | `Follow Up Needed` |
| 6 | 2026-08-30 08:40 | Event | `Event Participation` | Tham dự ngày hội tư vấn AI | `Captured` |
| 7 | 2026-09-01 19:10 | Chatwoot | `Tin nhắn Chatwoot` | Phụ huynh hỏi điều kiện học bổng | `Follow Up Needed` |
| 8 | 2026-09-02 09:20 | Call | `Connected` | Tư vấn ngành và phương án tài chính | `Captured` |
| 9 | 2026-09-02 16:20 | Form | `Application Update` | Bổ sung kết quả học tập | `Captured` |
| 10 | 2026-09-03 16:11 | Website | `Website Visit` | Xác nhận nhu cầu ngành AI | `Follow Up Needed` |

Mỗi Interaction phải có `student`, `summary`, `notes`, `channel`, `direction`,
`actor`, `source_namespace`, `source_record_id` và `external_id` ổn định. Các
record tự tạo từ Note, Call Log hoặc Task phải có `reference_doctype` và
`reference_docname` trỏ trực tiếp về Student.

## 4. Zalo/Chatwoot dataset

Backend detail hiện tương thích với cả `CHATWOOT_INTERACTION_TYPE` và mã legacy
`TIN_NHAN_CHATWOOT`; API `get_student_chatwoot_interactions` lọc theo loại
Chatwoot. Vì vậy không được chỉ tạo Interaction loại `MESSAGE` rồi kỳ vọng tab
Zalo có dữ liệu.

Tạo tối thiểu ba row `CRM Interaction` có:

```yaml
interaction_type: Tin nhắn Chatwoot
student: ENR-2026-04561
channel: webchat
direction: inbound # hoặc outbound
conversation_id: chatwoot-demo-gia-uyen-01
agent_id: Administrator
actor: Administrator
episode_state: sealed
summary: Phụ huynh hỏi điều kiện học bổng 50%
notes: Gia đình cần bảng học phí và mốc xác nhận.
source_namespace: crm-demo-student-dashboard:gia-uyen
```

Nội dung cần có cả inbound và outbound để frontend kiểm tra direction, sender,
recipient, status, conversation title và attachment:

| Message | Direction | Sender | Recipient | Status | Content |
|---|---|---|---|---|---|
| `zalo-01` | inbound | Phụ huynh Demo Gia Uyên | Tư vấn tuyển sinh | `read` | Gia đình muốn biết điều kiện học bổng 50%. |
| `zalo-02` | outbound | Tư vấn tuyển sinh | Phụ huynh Demo Gia Uyên | `delivered` | Em gửi bảng học phí và checklist hồ sơ ạ. |
| `zalo-03` | inbound | Phụ huynh Demo Gia Uyên | Tư vấn tuyển sinh | `read` | Có thể gọi lại sau 19:00 không? |

Tối thiểu hai Interaction Chatwoot phải có `CRM Interaction Evidence` để
`interaction_read.get_interaction_detail` trả `has_evidence=true`,
`evidence_refs` và `get_interaction_evidence` có thể đọc metadata.

## 5. Call Log dataset

Tạo trực tiếp bằng `Call Log`, không chỉ tạo Interaction mô phỏng cuộc gọi.
Điều kiện bắt buộc để detail nhận diện call:

```yaml
doctype: Call Log
reference_doctype: CRM Student
reference_docname: ENR-2026-04561
from: 0900004562
to: 0900004561
type: Outgoing
status: Completed # record thứ hai dùng No Answer
start_time: 2026-09-02 09:20:00
end_time: 2026-09-02 09:32:00
duration: 720
medium: Phone
recording_url: null
caller: Administrator
note: <FCRM Note nếu có>
```

| Call | Type | Status | Expected normalized outcome | Mục đích |
|---|---|---|---|---|
| `call-demo-gia-uyen-01` | `Outgoing` | `No Answer` | `no-answer` | tạo trạng thái chưa kết nối |
| `call-demo-gia-uyen-02` | `Outgoing` | `Completed` | `connected` | có duration, topic và summary |

Không ghi recording URL production; dùng đường dẫn local hoặc `null`.

## 6. Notes và Tasks

### 6.1. Notes

Tạo hai `FCRM Note` có `reference_doctype = CRM Student` và
`reference_docname = <student_id>`:

| Note | Nội dung |
|---|---|
| `note-01` | Đã trao đổi với học sinh về ngành AI; phụ huynh demo muốn so sánh học phí và học bổng. |
| `note-02` | Gửi checklist hồ sơ và hẹn gọi phụ huynh demo sau 19:00 ngày 04/09/2026. |

Dùng Note API hoặc service hiện có để tạo Note nếu cần test side-effect tạo
`CRM Interaction` loại `NOTE`. Không tạo Interaction NOTE thủ công lần thứ hai.

### 6.2. Tasks

Task API đọc task của Student qua `CRM Action Item`; doctype legacy `Task` chỉ
là fallback cho reference không resolve được Student. Vì vậy seed chính phải
đi qua canonical action/task service và để `CRM Action Item.student` trỏ tới
Student.

| Task | Action | Priority | State | Due | Assignee |
|---|---|---|---|---|---|
| `task-scholarship` | Gửi phương án học bổng | `high` | `pending` | 2026-09-04 19:00 | owner staff |
| `task-checklist` | Kiểm tra checklist hồ sơ | `medium` | `in-progress` | 2026-09-05 10:00 | owner staff |
| `task-follow-up` | Gọi lại xác nhận nhu cầu | `low` | `completed` | 2026-09-02 09:30 | owner staff |

Các row cần có `objective`, `description`, `action_type`, `priority`, `due_at`,
`action_owner`, `origin`, `execution_status`, `current_slot`,
`action_revision` và `linked_interaction` khi có liên kết.

Task `completed` phải liên kết với một Interaction để activity aggregate có thể
hiển thị `SYSTEM_ACTIVITY`; task đang mở chỉ xuất hiện trong Tasks tab.

## 7. Assessment, application và derived Student 360

### 7.1. Assessment history

Tạo năm assessment theo thứ tự `42 -> 55 -> 64 -> 76 -> 90`, trong đó row cuối:

```yaml
status: confirmed
assessment_source: manual
interest: High
interest_confidence: 88
fit: High
fit_confidence: 84
primary_barrier: Cost
barrier_confidence: 78
enrollment_probability: 90
signal_score: 90
recommendation: Gửi checklist hồ sơ cùng phương án học bổng trong ngày.
reason: Học sinh đã xác nhận ngành quan tâm; rào cản còn lại là phương án tài chính.
evidence_references:
  - CRM Interaction:<latest-interaction>
```

Row cuối phải cập nhật projection của Student (`latest_score`,
`assessment_status`, `interest_level`, `fit_level`, `primary_barrier`) bằng
service đánh giá hiện có.

### 7.2. Application

Tạo một `CRM Admission Application` liên kết Student:

```yaml
student: ENR-2026-04561
case_key: <student_case_key>
application_attempt_key: crm-demo-student-dashboard:gia-uyen:application:2026:1
offering: <admission_offering_2026_ai>
admission_year: "2026"
preference_order: 1
preference: Primary
major: Artificial Intelligence
campus: FPTU Ho Chi Minh Campus
admission_method: TRANSCRIPT_REVIEW
status: Under Review
document_total: 5
document_completed: 3
scholarship_percentage: 50
deadline: 2026-09-15
```

Tạo thêm ít nhất hai document/application evidence để `documents`, `readiness`,
`application`, `journey` và probability trend không rơi vào empty state.

### 7.3. Expected Student 360 values

`get_director_student` phải trả các collection sau, không dùng mock fallback:

```yaml
student:
  initials: LU
  name: Lê Gia Uyên
  code: ENR-2026-04561
  grade: Lớp 10
  major: Artificial Intelligence
  priority: Cao
  verificationStatus: Đã xác thực
  contactConsent:
    status: Đã đồng ý
    channels: [Điện thoại, Email]
readiness: [Hồ sơ, Gia đình, Tương tác]
classification_dimensions: [journey, interest, fit, barrier]
probabilityTrend: non-empty
channelPerformance: non-empty
documents: non-empty
notes: non-empty
tasks: non-empty
zaloMessages: non-empty
calls: non-empty
auditEvents: non-empty
```

`classification.dimensions` phải có đủ bốn id `journey`, `interest`, `fit`,
`barrier`. `insight.signalScore`, `insight.probability`, `insight.evidence` và
`insight.recommendation` phải lấy từ assessment/score thật, không hard-code ở
frontend.

## 8. Ownership và permission context

Để các API ownership và dashboard scope hoạt động, fixture phải có:

| Dữ liệu | Yêu cầu |
|---|---|
| `CRM Staff` | một Sale active, có user local và profile hợp lệ |
| `CRM Team` | team tuyển sinh local |
| `CRM Student Pool` | pool thuộc team |
| Membership | staff thuộc team/pool |
| Student ownership | `owner_staff`, `owning_team`, `owning_pool` được projection qua command |
| Assignment history | ít nhất một lần assignment để audit/ownership context có dữ liệu |

Seed actor dùng `Administrator` hoặc account local do `seed_role_accounts` tạo;
không tạo credential production trong file này.

Kiểm thử đọc:

```http
GET /api/method/crm.api.student_ownership.get_student_ownership?student=ENR-2026-04561
GET /api/method/crm.api.student_ownership.get_eligible_ownership_targets?student=ENR-2026-04561
GET /api/method/crm.api.student_ownership.get_assignable_sales?studentId=ENR-2026-04561
```

Kiểm thử write phải lấy `revision` từ response hiện tại, gửi
`expectedRevision`, `idempotencyKey` và `correlationId`; không dùng revision cố
định.

## 9. NBA và AI Analysis

### 9.1. NBA

Seed action catalog trước, sau đó tạo một evaluation đã hoàn tất với ba
recommendation đang `pending`/`active` và cùng target Student:

```yaml
evaluation:
  doctype: CRM NBA Evaluation
  student: ENR-2026-04561
  status: completed
  disposition: RECOMMEND
recommendations:
  - rank: 1
    action: CALL
    priority: high
    decision_status: pending
  - rank: 2
    action: EMAIL
    priority: medium
    decision_status: pending
  - rank: 3
    action: ADVISE_CAREER
    priority: low
    decision_status: pending
```

Mỗi recommendation cần có `recommendation_key`, `target_id`, `evaluation`,
`action`, `rank`, `ai_payload`, `explanation`, `evidence`, `recommended_at`,
`expires_at`, `lifecycle_status`, `decision_status` và `execution_status`.

Tạo ít nhất một `CRM Action Item` current/pending để endpoint detail trả NBA
gần nhất. Recommendation queue và Action Item là hai projection khác nhau:

- `list_student_worklist`: đọc recommendation chờ quyết định.
- `list_actions_for_record`: đọc canonical Action Item của Student.
- `get_next_best_action_for_student`: lấy một Action Item active mới nhất.

### 9.2. Student Analysis

Tạo một `CRM Student Analysis Run` với stage `student_360`. Ở backend hiện
tại, NBA là projection riêng qua `CRM NBA Evaluation`; không tự chèn stage
`next_best_action` vào `CRM Analysis Run Stage` vì schema Frappe hiện chỉ
cho phép `student_360`, `school_360` và `interaction_analysis`.

| Stage | Status | Nội dung |
|---|---|---|
| `student_360` | `completed` | report có advisory signals, risks, opportunities, recent changes |

`report_json`, `claims`, `policy_revision`, `model_revision`,
`expected_source_revision`, `expected_source_digest` và `result_digest` phải
có giá trị. Không dùng report tĩnh trong frontend.

## 10. API coverage matrix

| API | Request kiểm tra | Điều kiện pass của fixture |
|---|---|---|
| `crm.api.director_students.get_director_students` | `?admissionYear=2026&page=1&pageSize=20&q=Gia Uyên&sort=score&order=desc` | `data` có Student; `summary`, `actionSummary`, `meta` đầy đủ |
| `crm.api.director_students.get_director_student` | `?student_id=<student_id>` | detail có profile, classification, family, trend, channel, notes, tasks, Zalo, calls |
| `crm.api.director_students.get_student_interactions` | `?student_id=<student_id>` | có `calls`, `zalo_messages`, `total_interactions > 0` |
| `crm.api.director_students.get_student_chatwoot_interactions` | `?student_id=<student_id>&page=1&page_size=50` | `data >= 3`, `zalo_messages >= 3`, `meta.total >= 3` |
| `crm.api.interaction_read.list_interactions` | `?student=<student_id>&limit=20` | trả Interaction summary và `has_evidence` đúng |
| `crm.api.interaction_read.get_interaction_detail` | `?interaction=<interaction_id>` | có intents/analysis/evidence refs hoặc empty state hợp lệ |
| `crm.api.interaction_read.get_interaction_evidence` | `?evidence=<evidence_id>&include_content=1` | trả evidence local; không expose PII production |
| `crm.api.note.list_notes` / `get_note` | `reference_doctype=CRM Student&reference_docname=<student_id>` | có 2 Note đúng reference |
| `crm.api.task.list_tasks` / `get_task` | `reference_doctype=CRM Student&reference_docname=<student_id>` | có 3 Task-shaped rows, gồm open và completed |
| `crm.api.audit.get_student_audit_logs` | `?student=<student_id>&start=0&page_length=50` | `read_only=true`, có create và >= 4 changes |
| `crm.api.student_ownership.get_student_ownership` | `?student=<student_id>` | có owner, team/pool và revision |
| `crm.api.student_ownership.get_eligible_ownership_targets` | `?student=<student_id>` | có ít nhất một Sale/CTV Sale target |
| `crm.api.student_worklist.list_actions_for_record` | `?doctype=CRM%20Student&name=<student_id>&page_size=50` | có Action Item cùng student, không terminal |
| `crm.api.student_worklist.get_next_best_action_for_student` | `?student_id=<student_id>` | HTTP 200 và `nba != null` |
| `crm.api.student_worklist.list_student_worklist` | `?student_id=<student_id>&page_size=20` | có recommendation pending và policy version |
| `crm.api.director_next_best_action.get_director_recommendations` | `?limit=50` | có tối thiểu 3 recommendation của student |
| `crm.api.copilot_delegation.get_analysis_run` | `?run_kind=student&run_id=<run_id>` | trả đủ stage/report |
| `crm.api.copilot_delegation.run_student_analysis` | POST `student_id=<student_id>` | idempotent; trả run đã complete hoặc queued hợp lệ |
| `crm.api.copilot_delegation.run_student_nba_evaluation` | POST `student_id=<student_id>` | trả evaluation và recommendations |
| `crm.api.student_school.get_student` | `?name=<student_id>` | đọc được source/profile fields |
| `crm.api.student_school.get_field_options` | `?doctype=CRM%20Student&fieldname=major` | options gồm major fixture |
| `crm.api.student_school.update_student` | PUT/POST `name + fields` | update được field được phép và tăng audit revision |
| `crm.api.activities.get_activities` | reference Student | aggregate có Note, Task, Call và Version activity nếu feature bật |
| `crm.api.lead_sale.get_student_assignment_workspace` | workspace query của role Lead Sale | Student xuất hiện trong assignment scope |
| `crm.api.lead_sale.get_student_assignment_detail` | `?studentId=<student_id>` | có assignment, owner, audit, candidates và permissions |
| `crm.api.lead_sale.run_student_assignment_pipeline` | POST pipeline request cho Student | trả pipeline result deterministic, không mất assignment hiện tại |
| `crm.api.lead_sale.resolve_student_assignment` | POST `studentId + owner/team + reason` | ghi assignment và audit khi actor có quyền |

Các mutation `create/update/delete` của Note/Task, ownership assignment và NBA
decision cần chạy trong session có role phù hợp. Seed phải cung cấp dữ liệu để
render trạng thái thành công, nhưng không tự động thực hiện mutation destructive
trong bước verify.

## 11. Request examples

```http
GET /api/method/crm.api.director_students.get_director_students?admissionYear=2026&page=1&pageSize=20&q=Gia%20Uyên
GET /api/method/crm.api.director_students.get_director_student?student_id=<student_id>
GET /api/method/crm.api.director_students.get_student_chatwoot_interactions?student_id=<student_id>&page=1&page_size=50
GET /api/method/crm.api.note.list_notes?reference_doctype=CRM%20Student&reference_docname=<student_id>&start=0&page_length=20
GET /api/method/crm.api.task.list_tasks?reference_doctype=CRM%20Student&reference_docname=<student_id>&start=0&page_length=20
GET /api/method/crm.api.audit.get_student_audit_logs?student=<student_id>&start=0&page_length=50
GET /api/method/crm.api.student_worklist.list_actions_for_record?doctype=CRM%20Student&name=<student_id>&page_size=50
GET /api/method/crm.api.student_worklist.get_next_best_action_for_student?student_id=<student_id>
```

Frappe có thể bọc response trong `message`; frontend phải đọc được cả
`response.message` và payload trực tiếp theo contract hiện hành.

## 12. Seed order và idempotency

1. Kiểm tra site local allowlist trước mọi write.
2. Resolve master data: school, province, major, source, admission year, campus,
   team, pool, staff và action catalog.
3. Tạo hoặc resolve Student bằng `import_source_id` + email/name fallback.
4. Hoàn thiện profile và child tables bằng `save()` qua DocType/service.
5. Tạo Contact, guardian, parent authority và consent.
6. Tạo interaction timeline; tạo Chatwoot rows bằng interaction type tương thích.
7. Tạo evidence, intent, assessment history, score history, outcome và application.
8. Tạo Notes, Call Logs và canonical Action Items.
9. Ghi nhận ownership qua ownership command để có revision/history đúng.
10. Tạo hoặc settle Student Analysis Run và NBA Evaluation qua service contract.
11. Commit theo từng fixture boundary và trả manifest gồm tất cả generated names.
12. Chạy read-only verification theo coverage matrix.

Mỗi row phải có marker namespace ổn định. Re-run không được nhân bản Student,
Contact, Interaction, Note, Task, evidence, assessment, recommendation hoặc
analysis run. Không xóa dữ liệu site và không dùng `task reset`, `task seed-fresh`
hoặc câu lệnh tương đương.

## 13. Verification checklist

- [ ] Seed chỉ chạy trên `crm.localhost` hoặc site được allowlist explicit.
- [ ] `student_id` lấy từ manifest, không hard-code generated name trong test.
- [ ] List API trả đúng Student ở admission year 2026.
- [ ] Detail API không phụ thuộc mock data của frontend.
- [ ] `classification.dimensions` có đủ bốn chiều.
- [ ] `probabilityTrend`, `channelPerformance`, `documents`, `notes`, `tasks`,
      `zaloMessages`, `calls` và `auditEvents` không bị thiếu ngoài chủ ý.
- [ ] Chatwoot endpoint trả được ít nhất ba row với `interaction_type` đúng.
- [ ] Calls gồm cả `no-answer` và `connected`.
- [ ] Notes và Tasks có reference trực tiếp về Student.
- [ ] Audit có create event và update events từ `Version`.
- [ ] Ownership trả owner/team/pool và revision hợp lệ.
- [ ] Có ít nhất một Action Item active và ba Recommendation pending.
- [ ] Analysis Run có report Student 360 hoàn tất.
- [ ] Re-run idempotent và không làm tăng số lượng fixture rows.
- [ ] PII chỉ là dữ liệu giả local; không ghi secret/token/production URL.

## References

- [Director Students API](./director-students.md)
- [Director Student Detail API](./director-student-detail.md)
- [Interaction Intelligence handoff](./260906-fe-interaction-intelligence-handoff.md)
- [Student NBA API](./student-next-best-action.md)
- `frappe-crm/crm/demo/seed_student_detail.py`
- `frappe-crm/crm/demo/seed_golden_local.py`
- `frappe-crm/crm/api/director_students.py`
- `frappe-crm/crm/api/student_worklist.py`
- `frappe-crm/crm/api/student_ownership.py`
