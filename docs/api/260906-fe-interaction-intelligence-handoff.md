---
title: "FE handoff: Interaction Intelligence"
description: "Mục đích API, cách hiển thị và nghiệp vụ Interaction Intelligence cho màn hình Student."
status: "reference"
updated: "2026-09-06"
---

# FE handoff: Interaction Intelligence

## 1. Tóm tắt

Interaction Intelligence giúp Sale trả lời nhanh ba câu hỏi:

1. Student vừa có tương tác gì?
2. Student đang quan tâm hoặc vướng mắc gì?
3. Sale nên làm gì tiếp theo?

`CRM Interaction` là lớp dữ liệu trung gian được chuẩn hóa từ các activity
gốc. AI phân tích Interaction khi có đủ evidence. Interaction không thay thế
Note, Task, Call Log, Zalo hoặc Audit API.

Luồng chính:

```text
Activity gốc -> CRM Interaction -> AI analysis -> Intent/Score/Evidence
```

## 2. Quyết định UI

Không tạo thêm tab riêng chỉ để lặp lại Note, Task, Zalo và Call.

Giữ các tab activity hiện có:

| Tab | Nội dung chính | API chính |
|---|---|---|
| Tất cả hoạt động | Timeline các activity gốc | `crm.api.activities.get_activities` |
| Ghi chú | Nội dung Note đầy đủ | `crm.api.note.list_notes` |
| Task | Task, hạn xử lý, người phụ trách, trạng thái | `crm.api.task.list_tasks` |
| Zalo | Tin nhắn Zalo đầy đủ | API Zalo/Chatwoot hoặc adapter hiện có |
| Cuộc gọi | Call Log, thời lượng, recording, trạng thái | Call Log API/linked calls |
| Lịch sử hoạt động | Ai thay đổi dữ liệu gì | `crm.api.audit.get_student_audit_logs` |

Mỗi item có thể có một vùng thu gọn **Phân tích AI** ở bên dưới:

```text
[Activity gốc]
Tiêu đề, người thực hiện, thời gian, kênh, nội dung tóm tắt

[Phân tích AI, nếu có]
Tóm tắt | Intent | Rào cản | Tác động điểm | Hành động tiếp theo
```

Hiển thị vùng AI theo `analysis_state`:

- `intent_bearing`: có intent, hiển thị insight và evidence.
- `no_intent`: đã phân tích nhưng không tìm thấy intent.
- `unknown`: cần xem xét thêm.
- `failed`: phân tích lỗi.
- `null`: chưa có kết quả phân tích.

Không hiển thị `Counseling` như một nguồn activity độc lập. Nếu activity là
cuộc gọi tư vấn, tiêu đề nên là **Cuộc gọi tư vấn**; `Counseling` chỉ là
purpose/badge.

## 3. Phân biệt các lớp dữ liệu

| Lớp | Ý nghĩa | Ví dụ |
|---|---|---|
| Activity gốc | Bản ghi người dùng hoặc hệ thống tạo ra | Note, Task, Call Log, Zalo message |
| Interaction | Phiên/sự kiện nghiệp vụ đã chuẩn hóa | `PHONE_CALL`, `MESSAGE`, `NOTE` |
| AI analysis | Kết quả AI đọc Interaction/evidence | Summary, intent, confidence |
| Score effect | Tác động của rule đến điểm Student | `score_change`, reason |
| Evidence | Dữ liệu chứng minh cho phân tích | Transcript, message turns |
| Audit | Lịch sử thay đổi dữ liệu | Version, created, deleted |

`Interaction` không đồng nghĩa với “AI đã thực hiện hành động”. Một Sale có
thể tạo Call hoặc Note; AI chỉ phân tích sau đó.

## 4. Quy tắc mapping activity

| Activity gốc | Interaction tạo ra | AI có thể phân tích | Dữ liệu chi tiết lấy từ |
|---|---|---|---|
| Note | `NOTE` | Có nếu nội dung đủ thông tin | Note API |
| Call Log có Student/Contact reference | `PHONE_CALL` | Có nếu có transcript/evidence | Call Log API + evidence |
| Zalo/Chatwoot message | `MESSAGE`, `channel=zalo` | Có nếu có message turns | Zalo/Chatwoot + evidence |
| Task đã `Done` có reference | `SYSTEM_ACTIVITY` | Có thể, nếu có description/result | Task API |
| Task đang mở | Không tự tạo Interaction | Không | Task API |
| Audit update/delete | Không tự tạo Interaction đầy đủ | Không thay thế audit | Audit API |

### 4.1 `Counseling`, `Connected` và dữ liệu cũ

`COUNSELING` và `CONNECTED` là các loại Interaction legacy. Chúng đang được
giữ để đọc dữ liệu cũ và có thể xuất hiện trong dữ liệu demo hoặc Interaction
được tạo trực tiếp.

Không dùng chúng làm loại activity chính trong UI mới:

- `COUNSELING` thường có nghĩa là mục đích tư vấn, không cho biết nguồn là
  Call, Note hay Meeting.
- `CONNECTED` thường mô tả kết quả/kết nối, không phải một activity source.
- `MESSAGE_CHATWOOT` là tên cũ; luồng mới dùng `MESSAGE` và channel đã
  normalize.

FE nên ưu tiên `interaction_label`, `semantic.channel`,
`semantic.purpose` và `semantic.disposition`. Không tự suy diễn từ raw code.

## 5. API Interaction Intelligence

Các API dưới đây dùng Frappe session cookie. FE phải gửi request cùng session,
ví dụ `credentials: "include"`, và backend vẫn kiểm tra quyền trên Student
hoặc Contact.

### 5.1 Danh sách Interaction

```http
GET /api/method/crm.api.interaction_read.list_interactions
```

Request tối thiểu:

```text
?student=CRM-STU-00001&limit=20
```

Chỉ truyền đúng một trong `student` hoặc `contact`.

Query hỗ trợ:

| Parameter | Ý nghĩa |
|---|---|
| `student` / `contact` | Đối tượng cần đọc, bắt buộc một giá trị |
| `channel` | Lọc theo channel |
| `direction` | `inbound`, `outbound`, `internal` |
| `status` | `open` hoặc `sealed` |
| `family` | Lọc theo purpose, ví dụ `Conversation`, `Counseling`, `Application` |
| `from_date`, `to_date` | Khoảng thời gian |
| `cursor` | Cursor từ response trước |
| `limit` | 1 đến 100, mặc định 20 |

Response chỉ là summary, không chứa raw content:

```json
{
  "contract_version": "interaction.read:v1",
  "items": [
    {
      "id": "INTX-2026-00001",
      "occurred_at": "2026-09-06T02:30:00+00:00",
      "interaction_type": "MESSAGE",
      "interaction_label": "Tin nhắn",
      "channel": "zalo",
      "direction": "inbound",
      "outcome": null,
      "summary": "zalo inbound",
      "episode_state": "sealed",
      "analysis_state": "intent_bearing",
      "semantic": {
        "channel": "Chat",
        "purpose": "Conversation",
        "disposition": "Received",
        "is_direct_touchpoint": true,
        "evidence_kind": "interaction"
      },
      "source_revision": 1,
      "has_evidence": true
    }
  ],
  "next_cursor": null
}
```

FE dùng endpoint này để dựng danh sách/timeline Interaction. Không dùng nó để
render toàn bộ nội dung Note, Task, Call hoặc Audit.

Lưu ý: endpoint hiện chưa có filter `interaction_type` và chưa trả
`source_type/source_id`. Nếu FE cần gắn chính xác khối AI vào từng Note, Call
hoặc Zalo item, BE cần bổ sung source reference hoặc trả relation tương ứng.

### 5.2 Chi tiết Interaction

```http
GET /api/method/crm.api.interaction_read.get_interaction_detail?interaction=INTX-2026-00001
```

Response gồm:

```json
{
  "contract_version": "interaction.read:v1",
  "interaction": {},
  "revision": {
    "source_revision": 1,
    "evidence_digest": "..."
  },
  "analysis": {},
  "intents": [],
  "score_effects": [],
  "evidence_ref": "EVID-2026-00001",
  "evidence_refs": []
}
```

Ý nghĩa:

- `interaction`: summary của Interaction.
- `analysis`: trạng thái và phiên bản phân tích AI; có thể `null`.
- `intents`: intent, polarity, importance, confidence; có thể rỗng.
- `score_effects`: các lần scoring bị tác động; có thể rỗng.
- `evidence_refs`: metadata evidence dùng cho phân tích.

FE chỉ gọi detail khi người dùng mở rộng item, không gọi detail cho toàn bộ
list ngay từ đầu.

### 5.3 Evidence

```http
GET /api/method/crm.api.interaction_read.get_interaction_evidence?evidence=EVID-2026-00001&include_content=1
```

`content` có thể là `null` nếu user không có quyền đọc raw content. Khi đó
`content_redacted=true`. FE phải hiển thị “Không có quyền xem nội dung gốc”
và không tự tìm fallback từ payload khác.

Không dùng evidence API để đọc nội dung Note. Note vẫn phải đọc bằng Note API.

## 6. API activity gốc

### Note

```http
GET /api/method/crm.api.note.list_notes
```

Request:

```text
?reference_doctype=CRM%20Student&reference_docname=CRM-STU-00001&start=0&page_length=20
```

Response có `name`, `content`, `owner`, `creation`, `modified` và reference.
Khi tạo Note, FE chỉ gọi `crm.api.note.create_note`. Backend tự tạo một
Interaction `NOTE`; FE không tạo Interaction thứ hai.

### Task

```http
GET /api/method/crm.api.task.list_tasks
```

Task trả về dữ liệu thao tác như `title`, `description`, `action_code`, `status`,
`due_date`, `assigned_to` và reference. Với task tạo từ `CRM Action Item`,
`action_code` lấy từ `action`, fallback sang `action_type`. Chỉ Task đã hoàn thành mới được hook tạo
Interaction `SYSTEM_ACTIVITY`; danh sách Task vẫn phải lấy từ Task API.

### Audit

```http
GET /api/method/crm.api.audit.get_student_audit_logs
```

Audit trả về create/update/delete, field thay đổi, giá trị cũ/mới, người thay
đổi và thời gian. `SYSTEM_ACTIVITY` không thay thế được Audit API.

### Tất cả hoạt động

```http
GET /api/method/crm.api.activities.get_activities
```

Đây là aggregate reader cho activity cũ của hồ sơ, gồm các nhóm như version,
call, note, task và attachment tùy loại hồ sơ. Dùng cho tab “Tất cả hoạt
động”, không dùng thay cho Interaction Intelligence detail.

## 7. Nghiệp vụ end-to-end

### 7.1 Note

```text
Sale tạo Note
    -> FCRM Note được lưu
    -> backend tạo CRM Interaction NOTE
    -> AI có thể phân tích nội dung Note
    -> FE hiển thị Note gốc + Phân tích AI bên dưới
```

### 7.2 Zalo/Chatwoot

```text
Chatwoot gửi webhook đã ký
    -> backend resolve Student/Contact
    -> tạo MESSAGE + channel=zalo
    -> lưu evidence turns
    -> tạo analysis run
    -> FE hiển thị tin nhắn + insight AI khi có kết quả
```

### 7.3 Cuộc gọi

```text
Call Log có reference Student/Contact
    -> backend tạo PHONE_CALL
    -> nếu có transcript/evidence thì AI phân tích
    -> FE lấy metadata từ Call API và insight từ Interaction detail
```

### 7.4 Task

```text
Task đang mở -> chỉ hiển thị trong tab Task
Task chuyển Done -> có thể tạo SYSTEM_ACTIVITY
```

### 7.5 Audit

```text
Student/Contact thay đổi
    -> Version/Deleted Document
    -> audit.get_student_audit_logs
```

Audit dùng để truy vết thay đổi, không đưa vào cùng nhóm insight AI trừ khi có
business event cụ thể cần hiển thị.

## 8. Quyền và lỗi

- FE dùng session hiện tại, không truyền API token riêng cho browser.
- Mọi API đều phải kiểm tra quyền đọc Student/Contact theo scope của user.
- User chỉ đọc được Interaction của Student/Contact mà mình được phép xem.
- Evidence raw content có quyền chặt hơn metadata.
- `403` thường do thiếu quyền trên Student/Contact hoặc Interaction scope, dù
  user đã đăng nhập.
- Khi `analysis` là `null`, không coi đó là lỗi API; hiển thị “Chưa phân tích”.
- Khi `intents` hoặc `score_effects` rỗng, không hiển thị dữ liệu giả.

## 9. FE checklist

- [ ] Dùng API gốc cho Note, Task, Zalo, Call và Audit.
- [ ] Dùng `interaction_read` để lấy Interaction summary và AI insight.
- [ ] Hiển thị AI dưới activity tương ứng, không tạo tab trùng lặp.
- [ ] Chỉ gọi detail/evidence khi người dùng mở rộng item.
- [ ] Hiển thị `analysis_state` đúng trạng thái.
- [ ] Dùng `interaction_label` và semantic mapping, không hard-code raw code.
- [ ] Không hiển thị `COUNSELING` như một source activity mới.
- [ ] Không hiển thị raw evidence nếu bị redacted.
- [ ] Không dùng Interaction để thay thế Audit log.

## 10. Tiêu chí hoàn thành

FE được coi là tích hợp đúng khi:

1. Sale xem được activity gốc trong đúng tab tương ứng.
2. Mỗi activity có thể mở rộng phần Phân tích AI nếu có Interaction liên quan.
3. Activity chưa có phân tích vẫn hiển thị bình thường với trạng thái phù hợp.
4. Note, Task, Call, Zalo và Audit vẫn giữ đầy đủ thao tác/dữ liệu riêng.
5. Không có item legacy `Counseling` bị hiểu nhầm là một loại activity source.
6. User không thể xem dữ liệu ngoài scope Student/Contact của mình.
