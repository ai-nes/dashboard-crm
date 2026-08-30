# API Detail School theo `schoolId`

Tài liệu này mô tả dữ liệu cần để hiển thị trang detail trường tại `/director/schools/{schoolId}`. Ví dụ route hiện tại dùng là `/director/schools/01-01-062`.

> Trong source, tên param là `schoolCode`, nhưng giá trị được truyền vào `getSchoolById()` là `SchoolDirectoryRecord.id`, không phải riêng mã trường `062`.

## 1. Tình trạng hiện tại

Trang detail hiện chưa gọi HTTP API. Server page đang:

1. Gọi `getSchoolById(schoolCode)` để đọc directory CSV.
2. Gọi `buildSchoolIntelligence(school)` để dựng dữ liệu mock cho toàn bộ dashboard.
3. Trả `404` bằng `notFound()` nếu không tìm thấy trường.

Nguồn tham chiếu:

- [page.tsx](../../src/app/(with-layouts)/(dashboard)/director/schools/[schoolCode]/page.tsx)
- [mock-data.ts](../../src/app/(with-layouts)/(dashboard)/director/schools/_components/mock-data.ts)
- [types.ts](../../src/services/api/schools/types.ts)
- [school-directory.ts](../../src/services/api/schools/school-directory.ts)

## 2. Endpoint

### 2.1. Mock API directory hiện có

```http
GET /api/mock/schools/{schoolId}
```

Ví dụ:

```http
GET /api/mock/schools/01-01-062
```

Endpoint này chỉ trả `SchoolDirectoryRecord` trực tiếp. Nó đủ cho thông tin định danh trường, nhưng chưa đủ để render toàn bộ school intelligence detail.

### 2.2. Production API đề xuất

```http
GET /api/schools/{schoolId}
```

Production nên trả `SchoolIntelligenceData` trực tiếp để page chỉ cần thay base URL. Nếu backend muốn tách bounded context directory và intelligence, có thể dùng:

```http
GET /api/schools/{schoolId}/intelligence
```

Hai endpoint phải thống nhất cùng `schoolId` và response contract bên dưới. Không nên dùng tên trường làm khóa định danh.

## 3. Request

```http
GET /api/schools/01-01-062?admissionYear=2026
Authorization: Bearer <access-token>
Accept: application/json
```

Request không có body.

### Path parameter

| Tên | Kiểu | Bắt buộc | Mô tả |
|---|---|---:|---|
| `schoolId` | string | Có | ID directory dạng `{provinceCode}-{districtCode}-{schoolCode}`, ví dụ `01-01-062` |

### Query parameter

| Tên | Kiểu | Bắt buộc | Mặc định | Mô tả |
|---|---|---:|---:|---|
| `admissionYear` | integer | Không | Kỳ hiện hành | Kỳ tuyển sinh dùng để tính chỉ số, xu hướng và enrollment |

Mock hiện tại không xử lý `admissionYear`; dữ liệu builder đang cố định theo ngữ cảnh năm 2026.

## 4. Response `200 OK`

Response production đầy đủ là `SchoolIntelligenceData` trực tiếp, không bọc trong `data`:

```text
{
  school: SchoolDirectoryRecord,
  potentialScore: number,
  grade12Students: number,
  availableStudents: number,
  prospects: number,
  applications: number,
  enrollment: number,
  changes: { prospects, applications, enrollment },
  performance: { "6m": TrendPoint[], year: TrendPoint[] },
  geography: Geography,
  demographics: SchoolDemographics,
  subjectMix: SchoolSubjectMix,
  earlyForecast: SchoolEarlyForecast,
  activityStats: SchoolActivityStat[],
  relationship: Relationship,
  classification: Classification,
  quadrantPeers: SchoolQuadrantPoint[],
  scoreBands: SchoolScoreBand[],
  academicGap: { reportCard, examScore },
  postGraduationChoices: SchoolChoiceBreakdown[],
  competitionContext: CompetitionContext,
  dataFreshness: string,
  dataSources: DataSources,
  contacts: SchoolContact[],
  activities: SchoolActivity[]
}
```

## 5. Response example

Ví dụ rút gọn cho `GET /api/schools/01-01-062`:

```json
{
  "school": {
    "id": "01-01-062",
    "provinceCode": "01",
    "province": "Hà Nội",
    "districtCode": "01",
    "district": "Quận Ba Đình",
    "schoolCode": "062",
    "name": "THPT Nguyễn Trãi-Ba Đình",
    "address": "Số 50 phố Nam Cao, phường Giảng Võ, quận Ba Đình, TP Hà Nội",
    "area": "KV3",
    "isBoardingSchool": false
  },
  "potentialScore": 88,
  "grade12Students": 624,
  "availableStudents": 206,
  "prospects": 78,
  "applications": 31,
  "enrollment": 18,
  "changes": {
    "prospects": 12,
    "applications": 6,
    "enrollment": 3
  },
  "performance": {
    "6m": [
      { "label": "T9", "prospects": 34, "applications": 12, "enrollment": 5 },
      { "label": "T2", "prospects": 78, "applications": 31, "enrollment": 18 }
    ],
    "year": [
      { "label": "2025", "prospects": 48, "applications": 19, "enrollment": 10 },
      { "label": "2026", "prospects": 78, "applications": 31, "enrollment": 18 }
    ]
  },
  "geography": {
    "cluster": "Cụm đô thị dày",
    "clusterMeaning": "Nhiều trường gần nhau",
    "travelTime": "2 giờ 15 phút",
    "distanceTier": "1–3 giờ",
    "competitionDensity": "Cao"
  },
  "demographics": {
    "occupationProfile": "Công chức, chuyên môn và dịch vụ",
    "relativeIncome": "Cao",
    "tuitionAffordability": "Có thể chi trả đầy đủ",
    "awayFromHomeRate": "32% sẵn sàng học ngoài tỉnh",
    "parentInvolvement": "Cao"
  },
  "subjectMix": {
    "naturalScienceShare": 61,
    "socialScienceShare": 31,
    "recommendedMajorGroup": "Công nghệ và kỹ thuật"
  },
  "earlyForecast": {
    "grade10CutoffScore": 41.5,
    "priorCohortResult": "Điểm chuẩn ổn định trong 3 năm gần nhất",
    "grade11SubjectSignal": "Khối 11 tiếp tục nghiêng khoa học tự nhiên"
  },
  "activityStats": [
    {
      "label": "Cuộc thi học thuật",
      "audience": "Khối 10, 11",
      "conversionRate": 31,
      "costPerActivity": 42,
      "recommended": true
    }
  ],
  "relationship": {
    "level": "Có đầu mối",
    "score": 58,
    "contact": "Nguyễn Văn A",
    "contactRole": "Phó hiệu trưởng · Người phụ trách phối hợp",
    "lastTouch": "15/05/2026 · Thăm trường",
    "nextTouch": "12/06/2026 · Career Talk",
    "source": "Ghi nhận đội ngũ địa bàn · 15/05/2026"
  },
  "classification": {
    "group": "Mở rộng",
    "isKeyAccount": false,
    "label": "Tiềm năng cao · Quan hệ còn mỏng",
    "action": "Tạo đầu mối mới và thử một hoạt động nhỏ."
  },
  "scoreBands": [
    { "label": "Ngoài khoảng phù hợp", "students": 290, "share": 46, "available": false },
    { "label": "Học sinh khả dụng", "students": 206, "share": 33, "available": true },
    { "label": "Trên khoảng phù hợp", "students": 128, "share": 21, "available": true }
  ],
  "postGraduationChoices": [
    { "label": "Đại học công lập địa phương", "students": 212, "share": 34 },
    { "label": "Đại học lớn tại đô thị trung tâm", "students": 112, "share": 18 }
  ],
  "competitionContext": {
    "leadingChoice": "Đại học công lập địa phương",
    "lostReason": "Muốn học gần nhà",
    "externalPresence": "Có 2 đơn vị hoạt động thường xuyên"
  },
  "contacts": [
    {
      "role": "Ban giám hiệu",
      "hasContact": true,
      "name": "Nguyễn Văn A",
      "lastTouch": "15/05/2026",
      "note": "Đầu mối chính của trường"
    },
    {
      "role": "GVCN khối 12",
      "hasContact": false,
      "note": "Cần xin đầu mối từ ban giám hiệu"
    }
  ],
  "activities": [
    {
      "id": "activity-1",
      "type": "Career Talk",
      "title": "Career Talk: Chọn ngành trong kỷ nguyên AI",
      "date": "Dự kiến 12/06/2026 · 14:00",
      "owner": "Minh Trang · Phụ trách tuyển sinh",
      "status": "scheduled",
      "outcome": "Mục tiêu: tiếp cận nhóm học sinh khả dụng"
    }
  ],
  "dataFreshness": "Cập nhật 15/05/2026 · 4 nguồn dữ liệu",
  "dataSources": {
    "directory": "Danh mục ngành giáo dục · hồ sơ trường & địa chỉ",
    "examScore": "Phổ điểm tốt nghiệp do Bộ công bố, đối chiếu thống kê của Sở",
    "reportCard": "Dữ liệu hồ sơ nội bộ các mùa trước",
    "relationship": "Ghi nhận đội ngũ địa bàn · 15/05/2026"
  }
}
```

Các array trong ví dụ được rút gọn. Backend phải trả đủ dữ liệu theo contract nếu UI cần vẽ toàn bộ biểu đồ hoặc timeline.

## 6. Data contract chi tiết

### 6.1. `school`

`school` có type `SchoolDirectoryRecord`:

| Field | Kiểu | Bắt buộc | Dùng ở UI |
|---|---|---:|---|
| `id` | string | Có | Khóa detail và link route |
| `provinceCode` | string | Có | Xác định địa bàn |
| `province` | string | Có | Header, locality và filter |
| `districtCode` | string | Có | Xác định quận/huyện |
| `district` | string | Có | Địa chỉ và bối cảnh địa bàn |
| `schoolCode` | string | Có | Mã trường hiển thị |
| `name` | string | Có | Tên trường và metadata |
| `address` | string | Có | Địa chỉ trường |
| `area` | string | Có | Khu vực tuyển sinh |
| `isBoardingSchool` | boolean | Có | Badge trường DTNT |

`id` hiện được tạo từ `${provinceCode}-${districtCode}-${schoolCode}`. API nên giữ ổn định giá trị này ngay cả khi tên trường thay đổi.

### 6.2. Chỉ số tổng quan và xu hướng

| Field | Kiểu | Bắt buộc | Mô tả |
|---|---|---:|---|
| `potentialScore` | number | Có | Điểm tiềm năng, khoảng `0..100` |
| `grade12Students` | integer | Có | Quy mô học sinh khối 12 |
| `availableStudents` | integer | Có | Số học sinh phù hợp để tiếp cận |
| `prospects` | integer | Có | Số prospect từ trường |
| `applications` | integer | Có | Số hồ sơ/ứng viên |
| `enrollment` | integer | Có | Số nhập học |
| `changes.prospects` | number | Có | Thay đổi prospect theo kỳ so sánh |
| `changes.applications` | number | Có | Thay đổi application theo kỳ so sánh |
| `changes.enrollment` | number | Có | Thay đổi enrollment theo kỳ so sánh |

`performance["6m"]` và `performance.year` là mảng `TrendPoint`:

```typescript
{
  label: string;
  prospects: number;
  applications: number;
  enrollment: number;
}
```

`label` hiện là nhãn hiển thị như `T9`, `T10`, `2025`, `2026`. Production nên bổ sung `periodStart` dạng ISO nếu cần sort, filter hoặc so sánh theo timezone.

### 6.3. `geography`

| Field | Kiểu | Bắt buộc | Mô tả |
|---|---|---:|---|
| `cluster` | string | Có | Nhóm địa bàn, hiện gồm `Cụm đô thị dày`, `Cụm huyện lỵ cũ`, `Trường lẻ vùng xa` |
| `clusterMeaning` | string | Có | Diễn giải nhóm địa bàn |
| `travelTime` | string | Có | Thời gian di chuyển hiển thị |
| `distanceTier` | enum | Có | `Dưới 1 giờ`, `1–3 giờ`, `Trên 3 giờ` |
| `competitionDensity` | enum | Có | `Thấp`, `Trung bình`, `Cao` |

### 6.4. `demographics`

| Field | Kiểu | Bắt buộc | Mô tả |
|---|---|---:|---|
| `occupationProfile` | string | Có | Hồ sơ nghề nghiệp phổ biến của khu vực |
| `relativeIncome` | enum | Có | `Thấp`, `Trung bình`, `Cao` |
| `tuitionAffordability` | string | Có | Khả năng chi trả học phí |
| `awayFromHomeRate` | string | Có | Tỷ lệ sẵn sàng học ngoài tỉnh |
| `parentInvolvement` | enum | Có | `Thấp`, `Trung bình`, `Cao` |

### 6.5. `subjectMix` và `earlyForecast`

```typescript
subjectMix: {
  naturalScienceShare: number; // phần trăm, 0..100
  socialScienceShare: number; // phần trăm, 0..100
  recommendedMajorGroup: string;
}

earlyForecast: {
  grade10CutoffScore: number;
  priorCohortResult: string;
  grade11SubjectSignal: string;
}
```

Tổng `naturalScienceShare + socialScienceShare` có thể nhỏ hơn `100`; frontend tự tính phần `Khác / chưa chọn` bằng phần còn lại.

### 6.6. `activityStats[]`

| Field | Kiểu | Bắt buộc | Mô tả |
|---|---|---:|---|
| `label` | enum | Có | `Cuộc thi học thuật`, `Ngày hội hướng nghiệp`, `Tư vấn tại lớp`, `Tham quan cơ sở`, `Tập huấn giáo viên`, `Hoạt động trực tuyến` |
| `audience` | string | Có | Nhóm người tham dự |
| `conversionRate` | number | Có | Tỷ lệ chuyển đổi phần trăm |
| `costPerActivity` | number | Có | Chi phí ước tính, đơn vị triệu đồng |
| `recommended` | boolean | Có | Có nên ưu tiên hoạt động này không |

### 6.7. `relationship` và `classification`

`relationship.level` dùng một trong các giá trị:

```text
Chưa tiếp xúc | Đã tiếp xúc | Có đầu mối | Hợp tác thường xuyên | Đối tác chiến lược
```

| Field | Kiểu | Bắt buộc | Mô tả |
|---|---|---:|---|
| `relationship.level` | enum string | Có | Mức độ hợp tác hiện tại |
| `relationship.score` | number | Có | Điểm hợp tác, khoảng `0..100` |
| `relationship.contact` | string | Có | Đầu mối chính hoặc `Chưa có đầu mối chính` |
| `relationship.contactRole` | string | Có | Vai trò đầu mối |
| `relationship.lastTouch` | string | Có | Điểm chạm gần nhất |
| `relationship.nextTouch` | string | Có | Điểm chạm tiếp theo |
| `relationship.source` | string | Có | Nguồn và thời điểm cập nhật |
| `classification.group` | enum string | Có | `Trọng điểm`, `Mở rộng`, `Duy trì`, `Sàng lọc` |
| `classification.isKeyAccount` | boolean | Có | Có phải trường trọng điểm không |
| `classification.label` | string | Có | Nhãn giải thích phân loại |
| `classification.action` | string | Có | Hành động được khuyến nghị |

> Quy tắc phân loại hiện tại: `potentialScore >= 82` là tiềm năng cao; `relationship.score >= 60` là quan hệ tốt. Hai ngưỡng này được khai báo trong [classification.ts](../../src/services/api/schools/classification.ts). Backend nên tính và trả sẵn `classification`, frontend không nên tự suy diễn khác quy tắc.

### 6.8. `scoreBands`, `postGraduationChoices`, `competitionContext`

```typescript
scoreBands: Array<{
  label: string;
  students: number;
  share: number;
  available?: boolean;
}>;

postGraduationChoices: Array<{
  label: string;
  students: number;
  share: number;
}>;

competitionContext: {
  leadingChoice: string;
  lostReason: string;
  externalPresence: string;
};
```

`scoreBands` hiện được frontend đọc theo thứ tự ba nhóm:

1. `Ngoài khoảng phù hợp`
2. `Học sinh khả dụng`
3. `Trên khoảng phù hợp`

Nên giữ thứ tự này hoặc bổ sung `id` ổn định để frontend không phụ thuộc index.

### 6.9. `contacts[]`

```typescript
{
  role: "Ban giám hiệu"
    | "GVCN khối 12"
    | "GV phụ trách hướng nghiệp"
    | "Đoàn trường"
    | "Cựu học sinh đang học";
  hasContact: boolean;
  name?: string;
  lastTouch?: string;
  note: string;
}
```

Nếu `hasContact` là `false`, không bắt buộc trả `name` hoặc `lastTouch`. Không trả số điện thoại cá nhân trong contract này nếu chưa có policy PII và quyền truy cập tương ứng.

### 6.10. `activities[]`

| Field | Kiểu | Bắt buộc | Mô tả |
|---|---|---:|---|
| `id` | string | Có | ID hoạt động |
| `type` | enum | Có | `Thăm trường`, `Career Talk`, `Hội thảo`, `Gặp phụ huynh`, `Tư vấn` |
| `title` | string | Có | Tên hoạt động |
| `date` | string | Có | Nhãn thời gian hiển thị |
| `owner` | string | Có | Người phụ trách |
| `status` | enum | Có | `completed` hoặc `scheduled` |
| `outcome` | string | Không | Kết quả hoặc mục tiêu |

Production nên bổ sung `occurredAt` hoặc `scheduledAt` ISO-8601 để sort timeline; không nên sort bằng `date` display-ready.

## 7. Dữ liệu địa bàn cần bổ sung để bỏ mock

Hiện `SchoolLocalityCard` không lấy tọa độ và thống kê địa bàn từ `SchoolIntelligenceData`. Component tự gọi `getSchoolLocalityContext(school)`, trong đó có:

- Tọa độ campus FPTU TP.HCM cố định.
- Tọa độ trường suy ra từ tỉnh/quận, chưa phải geocoding chính thức.
- Khoảng cách và thời gian di chuyển tính mock.
- `mockStats`, rủi ro và action địa bàn dựng cứng.
- Tuyến đường được gọi trực tiếp từ OSRM trên client.

Để dữ liệu detail production đầy đủ, nên bổ sung object `locality` vào response:

```typescript
locality: {
  source: {
    name: string;
    address: string;
    coordinates: { latitude: number; longitude: number };
  };
  campus: {
    id: string;
    name: string;
    address: string;
    coordinates: { latitude: number; longitude: number };
  };
  regionLabel: string;
  routeLabel: string;
  distanceKm: number;
  travelTime: string;
  risks: string[];
  opportunity: string;
  actions: string[];
  recommendation: string;
  areaStats: {
    nearbySchools: number;
    grade12Students: number;
    awayFromHomeRate: number;
    targetInterestRate: number;
  };
  route?: {
    coordinates: Array<[number, number]>;
    source: "osrm" | "internal";
    calculatedAt: string;
  };
}
```

Tọa độ nên dùng object `{ latitude, longitude }` thay vì array để tránh nhầm thứ tự với GeoJSON. Nếu giữ array, API phải quy định rõ là `[latitude, longitude]`.

## 8. Dữ liệu hiện chưa được render trực tiếp

Các field dưới đây đã có trong `SchoolIntelligenceData` và nên giữ trong response intelligence, nhưng dashboard hiện tại chưa hiển thị thành một component riêng hoặc đang có component chưa được mount:

| Field | Ghi chú |
|---|---|
| `prospects`, `applications`, `changes` | Dùng được cho KPI hoặc biểu đồ funnel; chưa có section riêng trong dashboard hiện tại |
| `performance` | Có dữ liệu trend trong builder nhưng chưa được render bởi `SchoolIntelligenceDashboard` |
| `earlyForecast` | Chưa được render |
| `quadrantPeers` | Chưa được render |
| `academicGap` | Chưa được render |
| `dataFreshness`, `dataSources` | Nên dùng cho provenance/freshness, hiện chưa có section hiển thị |

Các field này không nên bỏ khỏi endpoint nếu mục tiêu là contract detail hoàn chỉnh, nhưng có thể lazy-load sau nếu payload production lớn.

## 9. Error contract

### Không tìm thấy trường

```http
HTTP/1.1 404 Not Found
```

```json
{
  "error": {
    "code": "SCHOOL_NOT_FOUND",
    "message": "Không tìm thấy trường trong danh mục."
  }
}
```

Status nên thống nhất:

| Status | Code | Khi dùng |
|---:|---|---|
| `200` | - | Lấy detail thành công |
| `400` | `INVALID_SCHOOL_ID` | ID rỗng hoặc sai format |
| `401` | `UNAUTHENTICATED` | Thiếu hoặc hết hạn access token |
| `403` | `FORBIDDEN` | Director không có quyền xem địa bàn/trường |
| `404` | `SCHOOL_NOT_FOUND` | Không tồn tại trường hoặc không thuộc phạm vi quyền |
| `422` | `INVALID_ADMISSION_YEAR` | Kỳ tuyển sinh không hợp lệ |
| `500` | `INTERNAL_ERROR` | Lỗi không dự kiến phía server |
| `503` | `SCHOOL_DATA_UNAVAILABLE` | Nguồn directory/intelligence tạm thời không sẵn sàng |

## 10. Tóm tắt request tối thiểu

Để render school detail bằng API thật:

```http
GET /api/schools/{schoolId}?admissionYear=2026
```

Response bắt buộc cho các section đang render:

1. `school`, `classification`, `geography`, `relationship` cho header và mức ưu tiên.
2. `potentialScore`, `grade12Students`, `availableStudents` cho priority/action.
3. `demographics` và dữ liệu `locality` cho kế hoạch tiếp cận địa bàn.
4. `scoreBands`, `postGraduationChoices`, `competitionContext` cho quy mô và cạnh tranh.
5. `subjectMix` cho định hướng nhóm ngành.
6. `contacts`, `activities`, `activityStats` cho quan hệ và lịch làm việc.

Mock tương thích hiện tại vẫn là:

```http
GET /api/mock/schools/{schoolId}
```

Nhưng endpoint mock này chỉ trả directory record. Muốn chuyển page sang API thật mà không đổi UI, cần backend hoặc adapter bổ sung response `SchoolIntelligenceData` và thay phần `buildSchoolIntelligence()` đang dựng mock trong page.
