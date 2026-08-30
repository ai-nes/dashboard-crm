# API cho `/director/students`

Tài liệu này tổng hợp dữ liệu cần để hiển thị trang danh sách học sinh của Director và contract backend đang được sử dụng trong repo.

> Cập nhật `2026-08-31`: backend đã triển khai hai Frappe method public cho list/detail, không yêu cầu JWT. Browser chỉ được phép gọi cross-origin từ `http://localhost:3000` và `https://faip.pro`.

## 1. Phạm vi màn hình

Trang `/director/students` hiện có các vùng dữ liệu sau:

| Vùng UI | Dữ liệu cần | Trạng thái hiện tại |
|---|---|---|
| Header | nhãn kỳ tuyển sinh, tiêu đề, mô tả | `meta.admissionYear`, còn title/mô tả là UI |
| KPI strip | tổng học sinh, hồ sơ ý định cao, hồ sơ cần hành động, khả năng nhập học trung bình | `summary` từ API, có fallback khi request lỗi |
| Action banner | số hồ sơ cần xử lý, số hồ sơ giảm tương tác, số hồ sơ sẵn sàng trao đổi với phụ huynh | `actionSummary` từ API |
| Positive signal | số hồ sơ ý định cao và tỷ lệ phần trăm | `summary.highIntentStudents`, `summary.highIntentRate` |
| Toolbar | từ khóa, giai đoạn, địa bàn, số lượng kết quả | Gửi vào API qua query parameters |
| Student list | danh sách học sinh và các trường hiển thị trong từng dòng | `data[]` từ API |
| Link `Mở 360°` | `studentId` để mở hồ sơ chi tiết | Dùng API detail khi chuyển trang |

Nguồn tham chiếu:

- [students-overview-dashboard.tsx](../../src/app/(with-layouts)/(dashboard)/director/students/_components/students-overview-dashboard.tsx)
- [student-list-toolbar.tsx](../../src/app/(with-layouts)/(dashboard)/director/students/_components/student-list-toolbar.tsx)
- [student-list.tsx](../../src/app/(with-layouts)/(dashboard)/director/students/_components/student-list.tsx)
- [types.ts](../../src/services/api/students/types.ts)

## 2. Tình trạng API hiện tại

Trang danh sách hiện gọi API qua `useDirectorStudentsQuery`. Khi chạy trên browser, service gọi Frappe method `crm.api.director_students.get_director_students`; nếu chưa có cấu hình Frappe hoặc đang chạy ngoài browser, service fallback về `computeDirectorStudents()` từ dữ liệu mock.

Backend production/local hiện có hai method chính:

```http
GET /api/method/crm.api.director_students.get_director_students
GET /api/method/crm.api.director_students.get_director_student?student_id={studentId}
```

Hai method đã bật `allow_guest=True`, vì vậy request không cần JWT hoặc `Authorization` header. Frappe bọc kết quả method trong `message`; service frontend đã unwrap bằng `json.message || json`.

CORS backend đang allowlist các origin sau:

```text
http://localhost:3000
https://faip.pro
```

Các origin khác không được trả `Access-Control-Allow-Origin`. `allow_guest` chỉ bỏ yêu cầu đăng nhập, không thay thế CORS và cũng không ngăn request trực tiếp bằng cURL/Postman.

Mock HTTP handler hiện có tại `src/app/api/mock/[...resource]/route.ts`.

### 2.1. Lấy danh sách

```http
GET /api/mock/students
```

Request hiện tại:

- Không có request body.
- Không có query parameter filter/pagination thực sự được áp dụng cho nhánh danh sách.
- Query `q` chỉ có tác dụng với endpoint `suggestions`, không có tác dụng với `GET /api/mock/students`.

Response `200 OK`:

```json
{
  "data": [
    {
      "id": "nguyen-minh-an",
      "initials": "MA",
        "name": "Nguyễn Minh An",
        "code": "STU-2026-04821",
        "school": "THPT Châu Văn Liêm",
        "province": "Cần Thơ",
        "major": "Trí tuệ nhân tạo",
        "stage": "Tư vấn",
        "score": 82,
        "scoreDelta": 13,
        "lastActivity": "4 phút trước",
        "nextAction": "Gọi phụ huynh về học phí",
        "owner": "Trần Quốc Bảo",
        "source": "Career Talk 28/05",
        "priority": "Cao"
      }
    ],
  "meta": {
    "total": 8
  }
}
```

Ví dụ trên rút gọn `data` còn một phần tử; response mock thực tế có 8 bản ghi. `meta.total` là tổng số bản ghi trả về.

### 2.2. Gợi ý tìm kiếm

Endpoint này chưa được dùng bởi toolbar hiện tại, nhưng đã được mock handler hỗ trợ và có thể dùng cho autocomplete sau này.

```http
GET /api/mock/students/suggestions?q=nguyen&limit=8
```

Query:

| Tên | Kiểu | Bắt buộc | Mặc định | Quy tắc |
|---|---|---:|---:|---|
| `q` | string | Không | `""` | Tìm không phân biệt hoa thường và dấu tiếng Việt trong tên, mã, trường, địa bàn, ngành |
| `limit` | integer | Không | `8` | Tối đa `20`, giá trị nhỏ nhất là `1` |

Response `200 OK`:

```json
{
  "data": [
    {
      "id": "nguyen-minh-an",
      "initials": "MA",
      "name": "Nguyễn Minh An",
      "code": "STU-2026-04821",
      "school": "THPT Châu Văn Liêm",
      "province": "Cần Thơ",
      "major": "Trí tuệ nhân tạo",
      "stage": "Tư vấn",
      "score": 82,
      "scoreDelta": 13,
      "lastActivity": "4 phút trước",
      "nextAction": "Gọi phụ huynh về học phí",
      "owner": "Trần Quốc Bảo",
      "source": "Career Talk 28/05",
      "priority": "Cao"
    }
  ],
  "meta": {
    "total": 1,
    "query": "nguyen"
  }
}
```

### 2.3. Hồ sơ Student 360

Không cần gọi endpoint này để render lần đầu `/director/students`. Nó được gọi khi người dùng mở `/director/students/{studentId}`.

Contract detail đầy đủ được tách tại [director-student-detail.md](./director-student-detail.md).

```http
GET /api/mock/students/{studentId}
```

Ví dụ:

```http
GET /api/mock/students/nguyen-minh-an
```

Response `200 OK` là object `Student360Data` trực tiếp, không bọc trong `data`. Shape rút gọn:

```text
{
  "student": StudentIdentity,
  "readiness": ReadinessItem[],
  "profile": KeyValueItem[],
  "academics": KeyValueItem[],
  "family": KeyValueItem[],
  "classification": Classification,
  "acquisition": Acquisition,
  "segmentation": Segmentation,
  "parentProfile": ParentProfile,
  "insight": Insight,
  "journey": JourneyEvent[],
  "engagement": EngagementItem[],
  "application": ApplicationItem[]
}
```

Các field nested đầy đủ được định nghĩa trong [Student360Data](../../src/services/api/students/types.ts). Response thực tế hiện có dữ liệu đầy đủ cho các collection/object trên. Nếu không tìm thấy học sinh:

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

## 3. Contract backend đã triển khai cho trang danh sách

Sử dụng endpoint RPC method Frappe/CRM để lần tải đầu có đủ KPI, banner và danh sách:

```http
GET /api/method/crm.api.director_students.get_director_students
```

### 3.1. Request

```http
GET /api/method/crm.api.director_students.get_director_students?admissionYear=2026&page=1&pageSize=20&q=nguyen&stage=counselling&province=can-tho&sort=score&order=desc
Accept: application/json
Origin: https://faip.pro
```

Không có request body.

Không cần gửi JWT/API key cho endpoint hiện tại. Vì API đang public, không đưa dữ liệu PII đầy đủ vào cache public hoặc log phía frontend.

Ví dụ dùng mã ổn định cho `stage` và `province`. API có thể accept thêm label tiếng Việt hiện tại để tương thích frontend mock, nhưng response nên trả cả code và label nếu backend cần phân biệt hai lớp này.

Query parameters:

| Tên | Kiểu | Bắt buộc | Mặc định | Mô tả |
|---|---|---:|---:|---|
| `admissionYear` | integer | Không | Kỳ đang active | Kỳ tuyển sinh cần xem; nếu bỏ trống, backend chọn kỳ active mới nhất |
| `page` | integer | Không | `1` | Trang, bắt đầu từ `1` |
| `pageSize` | integer | Không | `20` | Số dòng/trang; backend nên giới hạn tối đa `100` |
| `q` | string | Không | `""` | Tìm theo tên, mã học sinh, trường, ngành, người phụ trách |
| `stage` | enum | Không | Không lọc | Dùng `interested`, `exploring`, `counselling`, `applying`, `enrolled`; có thể dùng label tiếng Việt tương ứng |
| `province` | string | Không | Không lọc | Mã/ID địa bàn hoặc tên hiển thị; ví dụ `can-tho` |
| `sort` | enum | Không | `score` | `score`, `priority`, `lastActivityAt`, `nextActionDueAt` |
| `order` | enum | Không | `desc` | `asc` hoặc `desc` |

Quy tắc filter cần thống nhất với UI hiện tại:

- `q` được trim khoảng trắng và tìm bằng điều kiện `like` trên `name`, `student_name`, `case_key`, `high_school`, `province`, `major`, `owner_staff` và `source`.
- `stage` và `province` kết hợp theo điều kiện `AND` với `q`.
- `meta.total` là tổng số kết quả sau filter, không phải chỉ số dòng của trang hiện tại.
- Endpoint hiện tại là public guest endpoint; không áp dụng scope theo Director/team/territory.
- `meta.totalAll` và KPI được tính trên toàn bộ dữ liệu của kỳ tuyển sinh được chọn.

### 3.2. Response thực tế

Theo chuẩn Frappe RPC method, response trả về qua wrapper `message`. Service frontend unwrap bằng `json.message || json`.

```json
{
  "message": {
    "data": [
      {
        "id": "nguyen-minh-an",
        "initials": "MA",
        "name": "Nguyễn Minh An",
      "code": "STU-2026-04821",
      "school": "THPT Châu Văn Liêm",
      "province": "Cần Thơ",
      "major": "Trí tuệ nhân tạo",
      "stage": "Tư vấn",
      "score": 82,
      "scoreDelta": 13,
      "lastActivity": "4 phút trước",
      "lastActivityAt": "2026-06-06T09:56:00+07:00",
      "nextAction": "Gọi phụ huynh về học phí",
      "nextActionDueAt": "2026-06-06T16:00:00+07:00",
      "owner": "Trần Quốc Bảo",
      "source": "Career Talk 28/05",
      "priority": "Cao",
      "priorityCode": "high",
      "stageCode": "counselling"
    }
  ],
  "summary": {
    "trackedStudents": 2846,
    "trackedStudentsDeltaPercent": 12.4,
    "highIntentStudents": 486,
    "highIntentRate": 17.1,
    "actionsDueToday": 64,
    "averageEnrollmentProbability": 68,
    "averageEnrollmentProbabilityDelta": 5
  },
  "actionSummary": {
    "actionsDueToday": 64,
    "decliningInteractionStudents": 18,
    "familyReadyStudents": 27
  },
  "meta": {
    "total": 1,
    "totalAll": 2846,
    "page": 1,
    "pageSize": 20,
    "totalPages": 1,
    "hasNextPage": false,
    "admissionYear": 2026,
    "query": "nguyen",
    "filters": {
      "stage": "Tư vấn",
      "province": "Cần Thơ"
    },
    "sort": {
      "field": "score",
      "order": "desc"
    },
    "asOf": "2026-06-06T10:00:00+07:00"
  }
}
}
```

Ý nghĩa `meta`:

- `total`: tổng kết quả sau filter, dùng cho số lượng hồ sơ hiển thị.
- `totalAll`: tổng tệp trong kỳ tuyển sinh hiện tại. Endpoint đang public nên không có scope theo user/team/territory.
- `asOf`: thời điểm snapshot của KPI và danh sách; phải trả theo ISO-8601 có timezone.
- `filters`, `sort`: giá trị server thực tế đã áp dụng, giúp frontend đồng bộ URL/state.

Các số liệu trong ví dụ chỉ minh họa shape; `trackedStudents`, `totalAll` và KPI thực tế phụ thuộc dữ liệu của kỳ tuyển sinh được chọn. `averageEnrollmentProbabilityDelta`, `decliningInteractionStudents` và `familyReadyStudents` hiện có thể là `null` khi backend chưa có dữ liệu chuẩn.

`filterOptions` chưa được backend trả về vì các giai đoạn đang là enum cố định và địa bàn đang được khai báo trong component. Nếu danh sách địa bàn cần lấy động, có thể bổ sung:

```json
{
  "filterOptions": {
    "stages": [
      { "value": "Quan tâm", "label": "Quan tâm", "count": 412 },
      { "value": "Tìm hiểu", "label": "Tìm hiểu", "count": 731 }
    ],
    "provinces": [
      { "value": "Cần Thơ", "label": "Cần Thơ", "count": 184 }
    ]
  }
}
```

### 3.3. Mapping KPI, action banner và tín hiệu tích cực

Các số liệu trong phần đầu màn hình đều đi trong cùng response `get_director_students`. Không cần tạo API riêng cho từng card.

| UI | Field API | Ví dụ trên màn hình | Ghi chú |
|---|---|---:|---|
| Học sinh đang theo dõi | `summary.trackedStudents` | `2.846` | Format `vi-VN` ở frontend |
| Thay đổi tệp theo dõi | `summary.trackedStudentsDeltaPercent` | `+12,4% so với tháng trước` | Đơn vị phần trăm |
| Ý định cao | `summary.highIntentStudents` | `486` | Dùng lại cho positive signal |
| Tỷ lệ ý định cao | `summary.highIntentRate` | `17,1% tổng tệp học sinh` | Không làm tròn trước khi frontend format |
| Trạng thái ý định cao | Không có field riêng | Badge `Ổn định` | Hiện là nhãn UI cố định khi render KPI success |
| Cần hành động hôm nay | `summary.actionsDueToday` | `64` | KPI tổng quan |
| Helper SLA | Không có field riêng | `Theo SLA tư vấn hiện tại` | Hiện là nhãn UI cố định; có thể bổ sung `actionsDueHelper` nếu SLA thay đổi theo tenant |
| Khả năng nhập học TB | `summary.averageEnrollmentProbability` | `68%` | Điểm phần trăm, `0..100` |
| Thay đổi khả năng nhập học | `summary.averageEnrollmentProbabilityDelta` | `+5 điểm trong 7 ngày` | Đơn vị điểm phần trăm |
| Hồ sơ cần xử lý banner | `actionSummary.actionsDueToday` | `64 hồ sơ cần xử lý hôm nay` | Có thể bằng KPI nhưng thuộc nhóm action |
| Hồ sơ giảm tương tác | `actionSummary.decliningInteractionStudents` | `18` | Banner action |
| Hồ sơ sẵn sàng trao đổi phụ huynh | `actionSummary.familyReadyStudents` | `27` | Banner action |
| Tỷ lệ tín hiệu tích cực | `summary.highIntentRate` | Vòng tròn `17%` | Component hiện làm tròn bằng `Math.round()` |

Response tối thiểu để render đúng phần trong ảnh:

```json
{
  "message": {
    "summary": {
      "trackedStudents": 2846,
      "trackedStudentsDeltaPercent": 12.4,
      "highIntentStudents": 486,
      "highIntentRate": 17.1,
      "actionsDueToday": 64,
      "averageEnrollmentProbability": 68,
      "averageEnrollmentProbabilityDelta": 5
    },
    "actionSummary": {
      "actionsDueToday": 64,
      "decliningInteractionStudents": 18,
      "familyReadyStudents": 27
    },
    "meta": {
      "admissionYear": 2026,
      "asOf": "2026-06-06T10:00:00+07:00"
    }
  }
}
```

Trong response đầy đủ, `message` cũng có `data[]` và `meta` pagination như phần trên. `summary` là số liệu của toàn bộ kỳ tuyển sinh, không phải tổng số dòng của page hiện tại. `data[]` có thể chỉ có 20 dòng nhưng KPI vẫn phải hiển thị tổng tệp của kỳ.

Nhãn `Ổn định`, `Theo SLA tư vấn hiện tại`, nội dung câu action và link `Mở trung tâm SLA` hiện chưa phải dữ liệu API. Nếu cần cấu hình theo kỳ/tenant, bổ sung object `presentation` hoặc field helper riêng, không nhồi các nhãn này vào `StudentListItem`.

## 4. Data contract của một dòng danh sách

Kiểu tương thích trực tiếp với frontend hiện tại là `StudentListItem`:

| Field | Kiểu | Bắt buộc | Dùng ở UI |
|---|---|---:|---|
| `id` | string | Có | React key và URL detail |
| `initials` | string | Có | Avatar chữ cái |
| `name` | string | Có | Tên học sinh |
| `code` | string | Có | Mã học sinh |
| `school` | string | Có | Tên trường |
| `province` | string | Có | Địa bàn và filter |
| `major` | string | Có | Ngành quan tâm |
| `stage` | enum string | Có | Badge giai đoạn |
| `score` | number | Có | Điểm tiềm năng và progress bar, khoảng `0..100` |
| `scoreDelta` | number | Có | Thay đổi điểm trong 7 ngày |
| `lastActivity` | string \| null | Có | Thời gian hoạt động gần nhất dạng hiển thị |
| `lastActivityAt` | string \| null | Có | Timestamp ISO-8601 để sort/timezone |
| `nextAction` | string \| null | Có | Hành động tiếp theo |
| `nextActionDueAt` | string \| null | Có | Hạn hành động dạng ISO-8601 |
| `owner` | string \| null | Có | Người phụ trách và search |
| `source` | string \| null | Có | Nguồn acquisition; hiện không hiển thị trong dòng |
| `priority` | enum string \| null | Có | Badge `Cao`, `Trung bình`, `Thấp` |
| `priorityCode` | enum string \| null | Có | `high`, `medium`, `low` |
| `stageCode` | enum string \| null | Có | `interested`, `exploring`, `counselling`, `applying`, `enrolled` |

Enum hiện tại:

```text
stage:    Quan tâm | Tìm hiểu | Tư vấn | Ứng tuyển | Nhập học
priority: Cao | Trung bình | Thấp
```

Các field máy đọc được backend hiện đang trả:

```json
{
  "lastActivityAt": "2026-06-06T09:56:00+07:00",
  "nextActionDueAt": "2026-06-06T16:00:00+07:00",
  "stageCode": "counselling",
  "priorityCode": "high"
}
```

`lastActivity` có thể tiếp tục dùng để tương thích UI, nhưng frontend nên format từ `lastActivityAt` để tránh sai timezone, khó sort và khó dịch ngôn ngữ.

## 5. Error contract

Các lỗi nên dùng cùng format cho list và detail:

```json
{
  "error": {
    "code": "INVALID_QUERY",
    "message": "Tham số truy vấn không hợp lệ.",
    "fields": {
      "pageSize": "Giá trị tối đa là 100."
    }
  },
  "meta": {
    "requestId": "req_01J..."
  }
}
```

Status thực tế:

| Status | Code | Khi dùng |
|---:|---|---|
| `200` | - | Lấy danh sách/detail thành công; danh sách rỗng vẫn trả `200` với `data: []` |
| `400` | `INVALID_QUERY` | Query sai kiểu, enum hoặc vượt giới hạn; Frappe có thể trả thêm `exception`/`_server_messages` |
| `401` | `UNAUTHENTICATED` | Không dùng cho endpoint public hiện tại |
| `403` | `FORBIDDEN` | Không dùng cho endpoint public hiện tại; origin không allowlist thường biểu hiện bằng việc thiếu CORS header |
| `404` | `STUDENT_NOT_FOUND` | Không tồn tại `student_id` |
| `422` | `INVALID_ADMISSION_YEAR` | Kỳ tuyển sinh không hợp lệ |
| `500` | `INTERNAL_ERROR` | Lỗi không dự kiến phía server |

## 6. Những API chưa cần cho lần tải đầu

- Export danh sách: nút `Xuất danh sách` hiện chỉ hiển thị toast, chưa có request. Nếu triển khai, nên dùng `GET /api/method/crm.api.director_students.export_director_students` với cùng bộ query filter và trả file CSV/XLSX.
- SLA center: link `/director/sla`, không lấy dữ liệu trong trang students.
- Gọi tư vấn, gửi phương án, xác nhận phân loại: chỉ xuất hiện ở trang Student 360, không thuộc request initial của `/director/students`.

## 7. Tóm tắt request tối thiểu

Để render đầy đủ `/director/students` bằng dữ liệu thật, frontend chỉ cần request sau:

```http
GET /api/method/crm.api.director_students.get_director_students?admissionYear=2026&page=1&pageSize=20
```

Request không cần `Authorization` header. Response bắt buộc phải có:

1. `data[]` với đầy đủ `StudentListItem`.
2. `summary` cho bốn KPI.
3. `actionSummary` cho action banner và positive signal.
4. `meta.total`, `meta.totalAll`, pagination và `meta.asOf`.

Khi người dùng thay đổi toolbar, frontend gọi lại cùng endpoint với `q`, `stage` và `province`. Khi người dùng click một dòng, frontend gọi:

```http
GET /api/method/crm.api.director_students.get_director_student?student_id={studentId}
```

Môi trường mock vẫn dùng `GET /api/mock/students/{studentId}`.
