# API Detail Student theo `student_id`

API này phục vụ trang `/director/students/{studentId}`, ví dụ `/director/students/nguyen-minh-an` hoặc mã hồ sơ `ENR-2026-00005`.

## 1. Endpoint

### RPC Method Frappe / CRM

```http
GET /api/method/crm.api.director_students.get_director_student
```

Ví dụ:

```http
GET /api/method/crm.api.director_students.get_director_student?student_id=ENR-2026-00005
```

Hoặc theo ID slug:

```http
GET /api/method/crm.api.director_students.get_director_student?student_id=nguyen-minh-an
```

Handler hiện có tại [route.ts](../../src/app/api/method/[...method]/route.ts) và [mock route.ts](../../src/app/api/mock/[...resource]/route.ts). Handler gọi `getStudent360(student_id)` và trả về object `Student360Data` bọc trong `message` theo chuẩn Frappe RPC method.

## 2. Request

```http
GET /api/method/crm.api.director_students.get_director_student?student_id=ENR-2026-00005
Authorization: Bearer <access-token>
Accept: application/json
```

Request không có body.

### Query parameters

| Tên | Kiểu | Bắt buộc | Mô tả |
|---|---|---:|---|
| `student_id` | string | Có | Mã hoặc ID học sinh, ví dụ `ENR-2026-00005`, `STU-2026-04821` hoặc `nguyen-minh-an` |

Mock ID / Code hiện có:

```text
ENR-2026-00005
nguyen-minh-an
tran-ngoc-bao-chau
le-gia-huy
pham-khanh-linh
vo-minh-khang
do-ngoc-mai
nguyen-hoang-nam
bui-thanh-ha
```

## 3. Response `200 OK`

Response là `Student360Data` trực tiếp:

```text
{
  student: StudentIdentity,
  readiness: ReadinessItem[],
  profile: KeyValueItem[],
  academics: KeyValueItem[],
  family: KeyValueItem[],
  classification: Classification,
  acquisition: Acquisition,
  segmentation: Segmentation,
  parentProfile: ParentProfile,
  insight: Insight,
  journey: JourneyEvent[],
  engagement: EngagementItem[],
  application: ApplicationItem[]
}
```

> Đây là shape rút gọn để mô tả type. Response JSON thực tế phải trả đầy đủ field bắt buộc trong các object bên dưới.

## 4. Response example

Ví dụ rút gọn cho `GET /api/method/crm.api.director_students.get_director_student?student_id=ENR-2026-00005`:

```json
{
  "student": {
    "initials": "MA",
    "name": "Nguyễn Minh An",
    "code": "STU-2026-04821",
    "school": "THPT Châu Văn Liêm, Cần Thơ",
    "grade": "Lớp 12 · học kỳ 2",
    "major": "Trí tuệ nhân tạo",
    "phone": "09•• ••• 412",
    "email": "a••••@gmail.com",
    "province": "Cần Thơ",
    "counselor": "Trần Quốc Bảo"
  },
  "readiness": [
    {
      "label": "Hồ sơ",
      "value": 42,
      "tone": "warning",
      "detail": "Chưa chuyển sang bước nộp hồ sơ"
    },
    {
      "label": "Gia đình",
      "value": 78,
      "tone": "success",
      "detail": "Bố tham gia ở mức cao"
    },
    {
      "label": "Tương tác",
      "value": 86,
      "tone": "success",
      "detail": "+13 điểm tín hiệu gần nhất"
    }
  ],
  "profile": [
    { "label": "Ngày sinh", "value": "20/07/2007" },
    { "label": "Giới tính", "value": "Nữ" },
    { "label": "Khu vực", "value": "Cần Thơ" },
    { "label": "Nguồn", "value": "Career Talk 28/05" }
  ],
  "academics": [
    { "label": "GPA lớp 11", "value": "8.7 / 10" },
    { "label": "Tiếng Anh", "value": "IELTS 6.5" },
    { "label": "Điểm mạnh", "value": "Toán, Tin học" },
    { "label": "Sở thích", "value": "AI, lập trình, robotics" }
  ],
  "family": [
    { "label": "Người liên hệ chính", "value": "Nguyễn Văn Minh · Bố" },
    { "label": "Vai trò quyết định", "value": "Người đồng quyết định chính", "emphasis": true },
    { "label": "Mối quan tâm", "value": "Học phí & phương án tài chính", "emphasis": true },
    { "label": "Kênh phù hợp", "value": "Cuộc gọi 16:00–18:00" }
  ],
  "classification": {
    "dimensions": [
      {
        "id": "journey",
        "label": "Giai đoạn hành trình",
        "value": "Cân nhắc nghiêm túc",
        "description": "Đã trao đổi với tư vấn viên và đang tháo gỡ điều kiện quyết định.",
        "evidence": ["Mốc 4/7 của phễu chuẩn", "Trạng thái CRM: Tư vấn"],
        "tone": "primary"
      },
      {
        "id": "interest",
        "label": "Mức độ quan tâm",
        "value": "Cao",
        "description": "Có tín hiệu chủ động, cụ thể và lặp lại trong thời gian gần.",
        "evidence": ["Điểm tín hiệu 82/100", "+13 điểm gần nhất"],
        "tone": "success"
      },
      {
        "id": "fit",
        "label": "Mức độ phù hợp",
        "value": "Phù hợp cao",
        "description": "Đánh giá theo ngành, hồ sơ học tập, phương thức xét tuyển, chi phí và địa lý.",
        "evidence": ["Ngành Trí tuệ nhân tạo có trong danh mục", "Hồ sơ học tập khả thi"],
        "tone": "sky",
        "fitFactors": [
          { "label": "Ngành", "value": "Trí tuệ nhân tạo trong danh mục", "tone": "success" },
          { "label": "Hồ sơ học tập", "value": "Nền tảng khả thi", "tone": "success" },
          { "label": "Phương thức xét tuyển", "value": "Có phương thức khả thi", "tone": "success" },
          { "label": "Chi phí", "value": "Cần phương án học bổng", "tone": "warning" },
          { "label": "Địa lý", "value": "Cần làm rõ di chuyển", "tone": "warning" }
        ]
      },
      {
        "id": "barrier",
        "label": "Rào cản chính",
        "value": "Chi phí",
        "description": "Gia đình cần phương án học phí và học bổng cụ thể trước khi quyết định.",
        "evidence": ["Phụ huynh hỏi học bổng", "Xem trang học phí nhiều lần"],
        "tone": "warning"
      }
    ],
    "combination": "Quan tâm cao + Phù hợp cao + Rào cản chi phí",
    "interpretation": "Ưu tiên xử lý chi phí.",
    "action": "Gọi phụ huynh về học phí",
    "updatedAt": "4 phút trước",
    "updateTrigger": "Sau tín hiệu: Gọi phụ huynh về học phí",
    "reviewStatus": "Đã xác nhận",
    "reviewedBy": "Trần Quốc Bảo"
  },
  "acquisition": {
    "firstTouch": "Career Talk 28/05",
    "sourceGroup": "Thực địa",
    "campaign": "Career Talk 28/05 · Cần Thơ",
    "capturedAt": "28/05/2026 · 09:42",
    "attributionModel": "Nguồn đầu tiên được ghi tại điểm thu",
    "consent": "Đồng ý tư vấn tuyển sinh qua biểu mẫu sự kiện"
  },
  "segmentation": {
    "learningStage": "Lớp 12 · học kỳ 2",
    "approachGoal": "Hỗ trợ quyết định và mở hồ sơ",
    "geographyTier": "Tỉnh lân cận",
    "geographyImplication": "Cần làm rõ chi phí sinh hoạt, ký túc xá và phương án di chuyển.",
    "schoolTier": "Trường có lịch sử nhập học tốt",
    "economicContext": "Gia đình chủ động chia sẻ cần phương án đóng học phí theo kỳ",
    "economicUsage": "Chỉ dùng để tư vấn hỗ trợ, không dùng để giảm mức ưu tiên chăm sóc."
  },
  "parentProfile": {
    "name": "Nguyễn Văn Minh",
    "relation": "Bố",
    "involvement": "Cao",
    "role": "Người đồng quyết định chính",
    "concerns": [
      "Học phí & phương án tài chính",
      "Điều kiện học bổng",
      "Cơ hội việc làm sau tốt nghiệp"
    ],
    "preferredChannel": "Cuộc gọi",
    "bestContactTime": "16:00–18:00",
    "consentStatus": "Đã đồng ý nhận tư vấn",
    "lastInteraction": "4 phút trước"
  },
  "insight": {
    "summary": "Nguyễn Minh An đang ở giai đoạn cân nhắc nghiêm túc, mức quan tâm cao với ngành Trí tuệ nhân tạo. Rào cản chính là chi phí; bố là người đồng quyết định cần được tiếp cận đúng kênh.",
    "signalScore": 82,
    "probability": 76,
    "scoreDelta": 13,
    "baseline": 41,
    "confidence": 76,
    "concern": "Chi phí",
    "decisionMaker": "Bố · Người đồng quyết định chính",
    "evidence": [
      "Mốc 4/7 của phễu chuẩn",
      "Trạng thái CRM: Tư vấn",
      "Điểm tín hiệu 82/100",
      "+13 điểm gần nhất"
    ],
    "recommendation": "Gọi phụ huynh về học phí"
  },
  "journey": [
    {
      "id": "source",
      "date": "28/05 · 09:42",
      "title": "Career Talk 28/05",
      "description": "Ghi nhận quan tâm ban đầu tới ngành Trí tuệ nhân tạo",
      "channel": "Sự kiện",
      "status": "completed"
    },
    {
      "id": "form",
      "date": "28/05 · 09:46",
      "title": "Để lại thông tin tư vấn",
      "description": "Đồng ý nhận tư vấn và cung cấp nguyện vọng ưu tiên",
      "channel": "Hồ sơ",
      "status": "completed"
    },
    {
      "id": "next",
      "date": "Tiếp theo",
      "title": "Gọi phụ huynh về học phí",
      "description": "Cuộc gọi · 16:00–18:00",
      "channel": "Cuộc gọi",
      "status": "current"
    }
  ],
  "engagement": [
    { "label": "Website & landing page", "value": "22 lượt truy cập / 30 ngày", "level": "Cao" },
    { "label": "Sự kiện", "value": "Open Day · đã tham gia", "level": "Cao" },
    { "label": "Email & Zalo", "value": "Mở 5/6 nội dung gần nhất", "level": "Cao" },
    { "label": "Cuộc gọi", "value": "2 cuộc gọi · phản hồi trong ngày", "level": "Trung bình" }
  ],
  "application": [
    { "label": "Nguyện vọng", "value": "Trí tuệ nhân tạo", "status": "primary" },
    { "label": "Kỳ tuyển sinh", "value": "Đợt 2 · 2026" },
    { "label": "Trạng thái hồ sơ", "value": "Chưa bắt đầu · 0/5 tài liệu", "status": "warning" },
    { "label": "Học bổng", "value": "Đề xuất mức 30%", "status": "success" },
    { "label": "Hạn hoàn tất", "value": "Còn 12 ngày", "status": "warning" }
  ]
}
```

`journey` trong ví dụ được rút gọn còn ba event; response thật phải trả toàn bộ event timeline mà backend có.

## 5. Data contract chi tiết

Schema nguồn hiện tại nằm tại [types.ts](../../src/services/api/students/types.ts).

### 5.1. `student`

| Field | Kiểu | Bắt buộc | Dùng ở UI |
|---|---|---:|---|
| `initials` | string | Có | Avatar |
| `name` | string | Có | Header và hồ sơ |
| `code` | string | Có | Mã hồ sơ |
| `school` | string | Có | Trường THPT và địa bàn |
| `grade` | string | Có | Lớp/giai đoạn học tập |
| `major` | string | Có | Ngành quan tâm/nguyện vọng |
| `phone` | string | Có | Liên hệ; production phải theo policy PII |
| `email` | string | Có | Liên hệ; production phải theo policy PII |
| `province` | string | Có | Khu vực |
| `counselor` | string | Có | Người phụ trách |

### 5.2. `readiness[]`

Mỗi item:

| Field | Kiểu | Quy tắc |
|---|---|---|
| `label` | string | Nhãn chỉ số, hiện gồm `Hồ sơ`, `Gia đình`, `Tương tác` |
| `value` | number | Điểm phần trăm, `0..100` |
| `tone` | `success \| warning \| error` | Màu trạng thái |
| `detail` | string | Lý do/diễn giải ngắn |

### 5.3. `profile`, `academics`, `family`

Các collection này dùng cùng shape:

```typescript
{
  label: string;
  value: string;
  emphasis?: boolean; // chỉ có ở family
}
```

`profile` hiện được dùng cho ngày sinh, giới tính, khu vực và nguồn. `academics` dùng cho GPA, tiếng Anh, điểm mạnh và sở thích. `family` dùng cho người liên hệ, vai trò quyết định, mối quan tâm và kênh phù hợp.

### 5.4. `classification`

| Field | Kiểu | Bắt buộc | Mô tả |
|---|---|---:|---|
| `dimensions` | `StudentClassificationDimension[]` | Có | Bốn chiều: `journey`, `interest`, `fit`, `barrier` |
| `combination` | string | Có | Tóm tắt tổ hợp phân loại |
| `interpretation` | string | Có | Diễn giải ưu tiên |
| `action` | string | Có | Hành động tiếp theo |
| `updatedAt` | string | Có | Thời điểm cập nhật; production nên bổ sung timestamp ISO |
| `updateTrigger` | string | Có | Tín hiệu làm thay đổi đánh giá |
| `reviewStatus` | enum | Có | `Đã xác nhận` hoặc `Chờ xác nhận` |
| `reviewedBy` | string | Có | Người xác nhận/chờ xác nhận |

Một `dimension`:

```typescript
{
  id: "journey" | "interest" | "fit" | "barrier";
  label: string;
  value: string;
  description: string;
  evidence: string[];
  tone: "primary" | "success" | "warning" | "sky" | "gray";
  fitFactors?: {
    label: "Ngành" | "Hồ sơ học tập" | "Phương thức xét tuyển" | "Chi phí" | "Địa lý";
    value: string;
    tone: "primary" | "success" | "warning" | "sky" | "gray";
  }[];
}
```

### 5.5. `acquisition`

| Field | Kiểu | Mô tả |
|---|---|---|
| `firstTouch` | string | Điểm chạm đầu tiên |
| `sourceGroup` | enum | `Trực tuyến chủ động`, `Trực tuyến qua quảng cáo`, `Thực địa`, `Giới thiệu` |
| `campaign` | string | Campaign/nguồn gắn với hồ sơ |
| `capturedAt` | string | Thời điểm thu thập consent/lead |
| `attributionModel` | string | Mô hình attribution |
| `consent` | string | Nội dung/trạng thái đồng ý liên hệ |

### 5.6. `segmentation`

| Field | Kiểu | Mô tả |
|---|---|---|
| `learningStage` | string | Giai đoạn học tập |
| `approachGoal` | string | Mục tiêu tiếp cận |
| `geographyTier` | string | Nhóm địa lý |
| `geographyImplication` | string | Hàm ý tư vấn theo địa lý |
| `schoolTier` | string | Nhóm trường |
| `economicContext` | string | Ngữ cảnh kinh tế do người dùng chia sẻ |
| `economicUsage` | string | Quy tắc sử dụng dữ liệu kinh tế |

### 5.7. `parentProfile`

| Field | Kiểu | Bắt buộc | Mô tả |
|---|---|---:|---|
| `name` | string | Có | Tên phụ huynh/người liên hệ |
| `relation` | string | Có | Quan hệ với học sinh |
| `involvement` | enum | Có | `Cao`, `Trung bình`, `Thấp`, `Chưa xác định` |
| `role` | string | Có | Vai trò quyết định |
| `concerns` | string[] | Có | Các mối quan tâm |
| `preferredChannel` | string | Có | Kênh liên hệ phù hợp |
| `bestContactTime` | string | Có | Khung giờ liên hệ |
| `consentStatus` | string | Có | Quyền/trạng thái đồng ý liên hệ |
| `lastInteraction` | string | Có | Tương tác gần nhất |

### 5.8. `insight`

| Field | Kiểu | Bắt buộc | Mô tả |
|---|---|---:|---|
| `summary` | string | Có | Tóm tắt insight |
| `signalScore` | number | Có | Điểm tín hiệu, thường `0..100` |
| `probability` | number | Có | Xác suất nhập học, `%` |
| `scoreDelta` | number | Không | Thay đổi điểm gần nhất |
| `baseline` | number | Không | Điểm baseline của biểu đồ |
| `confidence` | number | Không | Độ tin cậy insight, `%` |
| `concern` | string | Có | Rào cản cần xử lý |
| `decisionMaker` | string | Có | Người ra quyết định |
| `evidence` | string[] | Có | Tối đa các bằng chứng nổi bật |
| `recommendation` | string | Có | Khuyến nghị hành động |

### 5.9. `journey[]`

| Field | Kiểu | Mô tả |
|---|---|---|
| `id` | string | ID event |
| `date` | string | Nhãn ngày hiển thị hiện tại; nên bổ sung `occurredAt` ISO |
| `title` | string | Tên điểm chạm |
| `description` | string | Mô tả/tóm tắt kết quả |
| `channel` | enum | `Website`, `Sự kiện`, `Cuộc gọi`, `Zalo`, `Hồ sơ` |
| `status` | enum | `completed`, `current`, `upcoming` |

### 5.10. `engagement[]`

| Field | Kiểu | Mô tả |
|---|---|---|
| `label` | string | Kênh/nhóm tín hiệu |
| `value` | string | Tóm tắt số lượt/tỷ lệ hiện tại |
| `level` | enum | `Cao`, `Trung bình`, `Thấp` |

### 5.11. `application[]`

| Field | Kiểu | Bắt buộc | Mô tả |
|---|---|---:|---|
| `label` | string | Có | `Nguyện vọng`, `Kỳ tuyển sinh`, `Trạng thái hồ sơ`, `Học bổng`, `Hạn hoàn tất` |
| `value` | string | Có | Giá trị hiển thị |
| `status` | enum | Không | `success`, `warning`, `primary` |

## 6. Field bổ sung để detail không còn hard-code

Response `Student360Data` hiện đủ cho các phần chính, nhưng một số component còn đọc fixture tĩnh:

| Dữ liệu UI | Nguồn hard-code hiện tại | Contract nên bổ sung |
|---|---|---|
| Dữ liệu biểu đồ xác suất | `student-charts-section.tsx` | `behavior.probabilityTrend[]` với `date`, `probability`, `touches` |
| Hiệu suất theo kênh | `student-charts-section.tsx` | `behavior.channelPerformance[]` với `channel`, `touches`, `response` |
| Tổng điểm chạm/ngày hoạt động/kênh tốt nhất | `student-engagement-tab.tsx` | `engagementSummary` |
| Danh sách tài liệu | `student-tab-data.ts` | `documents[]` với `name`, `type`, `status`, `date`, `tone`, `fileUrl?` |
| Ghi chú tư vấn | `student-tab-data.ts` | `notes[]` với `id`, `author`, `createdAt`, `content` |
| Nhật ký xử lý | `student-audit-card.tsx` | `auditEvents[]` với `actor`, `action`, `occurredAt`, `status`, `tone` |

Nếu cần API trả toàn bộ dữ liệu cho detail page, có thể mở rộng response như sau:

```json
{
  "behavior": {
    "probabilityTrend": [
      { "date": "2026-06-06", "probability": 76, "touches": 18 }
    ],
    "channelPerformance": [
      { "channel": "Website", "touches": 22, "response": 82 }
    ]
  },
  "engagementSummary": {
    "touches": 18,
    "activeDays": 9,
    "activeDaysDelta": 2,
    "bestChannel": "Cuộc gọi",
    "bestChannelResponseRate": 100,
    "period": "30d"
  },
  "documents": [],
  "notes": [],
  "auditEvents": []
}
```

Các field bổ sung này là mở rộng production, không có trong `Student360Data` hiện tại và không bắt buộc để giữ tương thích mock.

## 7. Error response

### Không tìm thấy học sinh

```http
HTTP/1.1 404 Not Found
```

```json
{
  "error": {
    "code": "STUDENT_NOT_FOUND",
    "message": "Không tìm thấy hồ sơ học sinh."
  }
}
```

Status production nên thống nhất thêm:

| Status | Code | Khi dùng |
|---:|---|---|
| `200` | - | Trả hồ sơ thành công |
| `400` | `INVALID_STUDENT_ID` | ID rỗng/sai format |
| `401` | `UNAUTHENTICATED` | Thiếu hoặc hết hạn access token |
| `403` | `FORBIDDEN` | Hồ sơ không thuộc phạm vi Director/team/territory |
| `404` | `STUDENT_NOT_FOUND` | Không tồn tại hoặc không được phép nhìn thấy |
| `500` | `INTERNAL_ERROR` | Lỗi không dự kiến phía server |

Vì response có phone, email và thông tin phụ huynh, server phải filter quyền truy cập trước khi trả dữ liệu. Không ghi PII đầy đủ vào log, cache public hoặc error message.

## 8. Quy ước thời gian và dữ liệu nhạy cảm

- Các field thời gian hiện tại như `updatedAt`, `lastInteraction`, `journey.date` đang là chuỗi display-ready. Production nên bổ sung field ISO-8601, ví dụ `updatedAtIso`, `occurredAt`, `lastInteractionAt`.
- Frontend có thể tiếp tục dùng chuỗi hiện tại trong giai đoạn chuyển đổi, nhưng không nên dùng chuỗi display-ready để sort hoặc tính SLA.
- Phone/email trong mock đã được mask. Production cần áp dụng masking hoặc field-level authorization theo role.
- `economicContext` chỉ phục vụ tư vấn hỗ trợ, không dùng làm lý do tự động giảm ưu tiên nếu chưa có policy được phê duyệt.

## 9. Tóm tắt tích hợp

```http
GET /api/method/crm.api.director_students.get_director_student?student_id=ENR-2026-00005
```

Frontend cần:

1. Gửi `student_id` (ví dụ `ENR-2026-00005` hoặc `studentId` từ URL `/director/students/{studentId}`).
2. Nhận object `Student360Data` bọc trong `response.message` (chuẩn Frappe) hoặc JSON trực tiếp.
3. Hiển thị `student`, `classification`, `acquisition`, `segmentation`, `parentProfile`, `insight`, `journey`, `engagement` và `application`.
4. Xử lý `404 STUDENT_NOT_FOUND` bằng trang `notFound` hoặc trạng thái không tìm thấy hồ sơ.
5. Không gọi thêm API để render các section chính; chỉ cần mở rộng response nếu muốn thay thế các fixture đang hard-code cho chart, documents, notes và audit.
