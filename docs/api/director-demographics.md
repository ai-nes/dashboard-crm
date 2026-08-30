# API cho `/director/demographics`

Tài liệu này mô tả dữ liệu cần để hiển thị trang **Khám phá người học**, gồm overview toàn bộ tệp và detail của một phân khúc học sinh:

- **Overview**: `GET /api/method/crm.api.director_demographics.get_director_demographics_overview`
- **Detail**: `GET /api/method/crm.api.director_demographics.get_director_demographics_segment?segment_id=...`

> Cập nhật `2026-08-31`: backend đã triển khai hai Frappe method aggregate-only cho overview/detail. API public bằng `allow_guest`, không yêu cầu JWT; browser chỉ được phép gọi cross-origin từ `http://localhost:3000` và `https://faip.pro`.

## 1. Tình trạng hiện tại

Frontend hiện chưa nối hai method này; dữ liệu màn hình vẫn được import trực tiếp từ:

- [data.ts](../../src/app/(with-layouts)/(dashboard)/director/demographics/_components/data.ts)
- [types.ts](../../src/app/(with-layouts)/(dashboard)/director/demographics/_components/types.ts)

`DemographicExplorerDashboard` giữ `selectedSegmentId` ở client. Khi click một nhóm, trang chuyển sang detail trong cùng route, không đổi URL và không tạo request mới.

Backend Frappe đã có endpoint thật bên dưới. Mock handler tại [route.ts](../../src/app/api/mock/[...resource]/route.ts) vẫn chưa có nhánh `demographics`, nên `/api/mock/demographics` hiện trả lỗi `MOCK_ENDPOINT_NOT_FOUND`.

## 2. Endpoint backend

Backend cung cấp hai endpoint chính:

```http
GET /api/method/crm.api.director_demographics.get_director_demographics_overview
GET /api/method/crm.api.director_demographics.get_director_demographics_segment?segment_id={segmentId}
```

### 2.1. Overview

```http
GET /api/method/crm.api.director_demographics.get_director_demographics_overview
```

Dashboard gateway có thể map route ngắn `/api/demographics/overview` vào Frappe method này.

Overview cần trả trong một response duy nhất:

- KPI tổng quan.
- Xu hướng quan tâm theo ngành trong 6 tháng.
- Cơ cấu giới tính và đặc điểm hồ sơ.
- Danh sách phân khúc để xếp hạng và mở detail.
- Mức độ quan tâm theo ngành và địa bàn.
- Mức độ đầy đủ của dữ liệu.

### 2.2. Detail phân khúc

```http
GET /api/method/crm.api.director_demographics.get_director_demographics_segment?segment_id={segmentId}
```

Ví dụ:

```http
GET /api/method/crm.api.director_demographics.get_director_demographics_segment?segment_id=female-ai-dong-nai&admissionYear=2026
```

Dashboard gateway có thể map route `/api/demographics/segments/{segmentId}` bằng cách chuyển `segmentId` trên path thành query `segment_id`.

Detail endpoint cần thiết cho deep-link, refresh độc lập hoặc khi danh sách overview chỉ trả summary. Với implementation hiện tại, overview có thể trả đủ `DemographicSegment` để click detail không phải gọi thêm endpoint.

## 3. Request

### 3.1. Overview request

```http
GET /api/method/crm.api.director_demographics.get_director_demographics_overview?admissionYear=2026&period=6m&scope=all
Accept: application/json
Origin: http://localhost:3000
```

Không có request body.

Không cần gửi JWT. Request từ browser phải có `Origin` nằm trong allowlist CORS; request server-to-server/cURL không bị giới hạn bởi CORS.

| Query | Kiểu | Bắt buộc | Mặc định | Mô tả |
|---|---|---:|---:|---|
| `admissionYear` | integer | Không | Kỳ hiện hành | Kỳ tuyển sinh cần phân tích |
| `period` | enum | Không | `6m` | Khoảng thời gian trend; hiện UI hiển thị 6 tháng |
| `scope` | string | Không | `all` | Phạm vi dữ liệu; backend hiện chỉ hỗ trợ `all` |

Backend hiện hỗ trợ `6m`, `12m` và `season`. Nếu chưa có dữ liệu lịch sử, API trả `meta.dataAvailability` thay vì tự tạo số liệu.

### 3.2. Detail request

```http
GET /api/method/crm.api.director_demographics.get_director_demographics_segment?segment_id=female-ai-dong-nai&admissionYear=2026
Accept: application/json
```

| Path/query | Kiểu | Bắt buộc | Mô tả |
|---|---|---:|---|
| `segment_id` | string | Có | ID ổn định của segment, ví dụ `female-ai-dong-nai`; gateway có thể nhận `segmentId` trên path |
| `admissionYear` | integer | Không | Kỳ tuyển sinh dùng để tính segment |

`segmentId` không nên được tạo từ tên hiển thị nếu tên, địa bàn hoặc nhãn ngành có thể thay đổi. Với Frappe method trực tiếp, tham số tương ứng là `segment_id`.

## 4. Response overview `200 OK`

Frappe bọc kết quả method trong key `message`; frontend cần đọc `json.message || json`. Payload bên trong `message` có shape:

```text
{
  data: {
    kpis: DemographicKpi[],
    demand: DemandOverview,
    audienceComposition: AudienceComposition,
    segments: DemographicSegment[],
    regionOpportunities: RegionOpportunity[],
    regionalDemand: RegionalDemandMatrix,
    dataCoverage: DataCoverageMetric[]
  },
  meta: {
    admissionYear: number,
    period: string,
    scope: string,
    asOf: string,
    totalProspects: number,
    minSampleSize: number,
    dataAvailability: {
      trend: boolean,
      tuition: boolean,
      revenue: boolean,
      eligibleSegments: number
    }
  }
}
```

Ví dụ rút gọn dưới đây là nội dung bên trong `message` (số liệu chỉ minh họa):

```json
{
  "data": {
    "kpis": [
      {
        "id": "prospects",
        "label": "Tổng hồ sơ",
        "value": "57.840",
        "change": "+12,6%",
        "helper": "so với cùng kỳ",
        "progress": 86,
        "tone": "primary"
      },
      {
        "id": "engaged",
        "label": "Đã tương tác",
        "value": "24.360",
        "change": "+3,8 điểm %",
        "helper": "42,1% tổng hồ sơ",
        "progress": 72,
        "tone": "info"
      }
    ],
    "demand": {
      "trend": [
        { "month": "T1", "ai": 2160, "software": 2860, "business": 2520, "design": 1280 },
        { "month": "T6", "ai": 3420, "software": 3340, "business": 2610, "design": 1620 }
      ],
      "summary": [
        { "id": "ai", "label": "AI", "value": 3420, "change": 31 },
        { "id": "software", "label": "Phần mềm", "value": 3340, "change": 4.7 },
        { "id": "business", "label": "Kinh doanh", "value": 2610, "change": 2.4 },
        { "id": "design", "label": "Thiết kế", "value": 1620, "change": 5.9 }
      ]
    },
    "audienceComposition": {
      "total": 57840,
      "gender": [
        { "id": "female", "name": "Nữ", "value": 46.8 },
        { "id": "male", "name": "Nam", "value": 51.6 },
        { "id": "unknown", "name": "Chưa xác định", "value": 1.6 }
      ],
      "profiles": [
        { "id": "grade-12", "label": "Học sinh lớp 12", "value": 63.4, "count": 36660 },
        { "id": "public-school", "label": "Trường công lập", "value": 72.1, "count": 41710 },
        { "id": "urban", "label": "Khu vực đô thị", "value": 58.7, "count": 33960 },
        { "id": "has-interest", "label": "Đã có ngành quan tâm", "value": 88.1, "count": 50960 }
      ]
    },
    "segments": [
      {
        "id": "female-ai-dong-nai",
        "name": "Nữ · Lớp 12 · Đông Nam Bộ · quan tâm AI",
        "shortName": "Nữ · AI · ĐNB",
        "description": "Tăng nhanh tại Đồng Nai nhưng độ phủ truyền thông còn thấp.",
        "region": "Đồng Nai",
        "interest": "Trí tuệ nhân tạo",
        "prospects": 3420,
        "engaged": 1280,
        "qualified": 420,
        "counselling": 268,
        "applications": 160,
        "enrolled": 68,
        "conversion": 2,
        "tuition": null,
        "revenue": null,
        "growth": 31,
        "coverage": 3.2,
        "opportunityScore": 92,
        "tone": "primary",
        "filters": [
          { "id": "gender", "label": "Giới tính", "value": "Nữ" },
          { "id": "grade", "label": "Khối lớp", "value": "Lớp 12" },
          { "id": "interest", "label": "Quan tâm", "value": "AI (Trí tuệ nhân tạo)" },
          { "id": "province", "label": "Tỉnh/TP", "value": "Đồng Nai" }
        ],
        "channels": [
          { "name": "Mạng xã hội", "value": 38 },
          { "name": "Sự kiện", "value": 24 },
          { "name": "Website", "value": 22 },
          { "name": "Giới thiệu", "value": 16 }
        ],
        "monthlyProspects": [
          { "month": "T1", "current": 1960, "benchmark": 2100 },
          { "month": "T6", "current": 3420, "benchmark": 3000 }
        ]
      }
    ],
    "regionOpportunities": [
      { "rank": 1, "name": "TP. Hồ Chí Minh", "score": 82 },
      { "rank": 2, "name": "Bình Dương", "score": 76 },
      { "rank": 3, "name": "Đồng Nai", "score": 72, "selected": true }
    ],
    "regionalDemand": {
      "columns": [
        { "id": "hcm", "name": "TP.HCM" },
        { "id": "dong-nai", "name": "Đồng Nai" },
        { "id": "binh-duong", "name": "Bình Dương" },
        { "id": "can-tho", "name": "Cần Thơ" },
        { "id": "da-nang", "name": "Đà Nẵng" }
      ],
      "rows": [
        {
          "interest": "Trí tuệ nhân tạo",
          "scores": {
            "hcm": 86,
            "dong-nai": 93,
            "binh-duong": 74,
            "can-tho": 55,
            "da-nang": 67
          }
        }
      ]
    },
    "dataCoverage": [
      {
        "label": "Địa lý",
        "detail": "Tỉnh, huyện, vùng tuyển sinh",
        "value": 96.4,
        "tone": "success"
      },
      {
        "label": "Thông tin học sinh",
        "detail": "Giới tính, khối, tuổi, học lực",
        "value": 31.2,
        "tone": "warning"
      }
    ]
  },
  "meta": {
    "admissionYear": 2026,
    "period": "6m",
    "scope": "all",
    "asOf": "2026-06-06T10:00:00+07:00",
    "totalProspects": 57840,
    "minSampleSize": 30
  }
}
```

## 5. Response detail segment `200 OK`

Frappe cũng bọc payload detail trong `message`; frontend cần đọc `json.message || json`.

```text
{
  data: {
    segment: DemographicSegment,
    benchmark: DemographicSegment,
    regionOpportunities: RegionOpportunity[],
    nextAction: SegmentNextAction,
    guardrails: SegmentGuardrail[]
  },
  meta: {
    admissionYear: number,
    asOf: string,
    minSampleSize: number,
    sampleSize: number
  }
}
```

Ví dụ phần response bổ sung ngoài `segment` (số liệu chỉ minh họa; `tuition`/`revenue` hiện là `null`):

```json
{
  "data": {
    "segment": {
      "id": "female-ai-dong-nai",
      "name": "Nữ · Lớp 12 · Đông Nam Bộ · quan tâm AI",
      "prospects": 3420,
      "engaged": 1280,
      "qualified": 420,
      "counselling": 268,
      "applications": 160,
      "enrolled": 68,
      "conversion": 2,
      "tuition": null,
      "revenue": null,
      "growth": 31,
      "coverage": 3.2,
      "opportunityScore": 92
    },
    "benchmark": {
      "id": "male-ai-dong-nai",
      "name": "Nam · Lớp 12 · Đông Nam Bộ · quan tâm AI",
      "prospects": 5180,
      "qualified": 640,
      "applications": 248,
      "enrolled": 96,
      "conversion": 1.9,
      "tuition": null,
      "growth": 12
    },
    "nextAction": {
      "priority": "high",
      "label": "Ưu tiên cao",
      "title": "Ưu tiên tiếp cận sớm",
      "description": "Nhóm có 3.420 học sinh và đang tăng 31%.",
      "steps": [
        {
          "order": 1,
          "title": "Tiếp cận qua Mạng xã hội",
          "detail": "38% tương tác đầu tiên đến từ kênh này."
        },
        {
          "order": 2,
          "title": "Tổ chức một hoạt động tư vấn",
          "detail": "Ưu tiên Career Talk hoặc tư vấn nhóm nhỏ."
        },
        {
          "order": 3,
          "title": "Đánh giá lại sau 30 ngày",
          "detail": "So sánh số học sinh được tiếp cận và số hồ sơ nhập học."
        }
      ]
    },
    "guardrails": [
      {
        "criterion": "Khả năng học phí",
        "issue": "Không suy đoán thu nhập gia đình của người chưa thành niên.",
        "replacement": "Dùng hành vi xem học phí và hỏi học bổng.",
        "status": "Tạm khóa",
        "tone": "error"
      }
    ]
  },
  "meta": {
    "admissionYear": 2026,
    "asOf": "2026-06-06T10:00:00+07:00",
    "minSampleSize": 30,
    "sampleSize": 3420
  }
}
```

## 6. Data contract chi tiết

### 6.1. KPI overview

Mỗi `DemographicKpi`:

| Field | Kiểu | Bắt buộc | Mô tả |
|---|---|---:|---|
| `id` | string | Có | ID KPI, hiện gồm `prospects`, `engaged`, `qualified`, `enrolled` |
| `label` | string | Có | Tên KPI |
| `value` | string | Có | Giá trị display-ready, ví dụ `57.840` |
| `change` | string | Có | Thay đổi so với kỳ trước, ví dụ `+12,6%` |
| `helper` | string | Có | Diễn giải/mẫu số |
| `progress` | number | Có | Thanh tiến độ hiển thị, `0..100` |
| `tone` | enum | Có | `primary`, `info`, `success`, `warning`, `danger` |

Production nên bổ sung field máy đọc được như `numericValue`, `changeValue`, `changeUnit` nếu KPI cần sort, tính toán hoặc format theo locale. `value`, `change` và `helper` hiện phục vụ tương thích UI.

### 6.2. `demand`

`demand.trend[]` hiện dùng shape cố định:

```typescript
{
  month: string;
  ai: number;
  software: number;
  business: number;
  design: number;
}
```

`demand.summary[]`:

```typescript
{
  id: string;
  label: string;
  value: number;
  change: number;
}
```

`change` là phần trăm tăng/giảm so với kỳ so sánh. Nếu ngành không có đủ dữ liệu, trả `null` và lý do trong `meta.dataAvailability`, không trả `0` gây hiểu nhầm là không có nhu cầu.

### 6.3. `audienceComposition`

```typescript
{
  total: number;
  gender: Array<{
    id: string;
    name: string;
    value: number; // phần trăm
  }>;
  profiles: Array<{
    id: string;
    label: string;
    value: number; // phần trăm
    count: number;
  }>;
}
```

Tổng `gender[].value` phải xấp xỉ `100`. `profiles[].value` là tỷ lệ trong tổng hồ sơ và `count` là số lượng tương ứng.

Không nên trả `fill` hoặc `color` từ backend. Đây là presentation token hiện đang nằm trong fixture và nên được frontend map theo `id`.

### 6.4. `DemographicSegment`

| Field | Kiểu | Bắt buộc | Mô tả |
|---|---|---:|---|
| `id` | string | Có | ID ổn định của segment |
| `name` | string | Có | Tên đầy đủ |
| `shortName` | string | Có | Nhãn ngắn cho biểu đồ/nút chọn |
| `description` | string | Có | Diễn giải segment |
| `region` | string | Có | Tỉnh/vùng của segment |
| `interest` | string | Có | Ngành hoặc nhóm ngành quan tâm |
| `prospects` | integer | Có | Tổng hồ sơ phù hợp |
| `engaged` | integer | Có | Đã tương tác |
| `qualified` | integer | Có | Đủ điều kiện tư vấn |
| `counselling` | integer | Có | Đã tư vấn |
| `applications` | integer | Có | Đã nộp hồ sơ |
| `enrolled` | integer | Có | Đã nhập học |
| `conversion` | number | Có | Tỷ lệ `enrolled / prospects * 100` |
| `tuition` | number \| null | Có | Học phí ròng trung bình, đơn vị triệu đồng/học sinh nhập học; hiện `null` vì chưa có nguồn canonical |
| `revenue` | number \| null | Có | Doanh thu ghi nhận, đơn vị tỷ đồng; hiện `null` vì chưa có nguồn canonical |
| `growth` | number \| null | Có | Tăng trưởng hồ sơ so với tháng trước, đơn vị phần trăm; `null` nếu kỳ trước không có hồ sơ |
| `coverage` | number | Có | Tỷ lệ độ phủ/đã tiếp cận, đơn vị phần trăm |
| `opportunityScore` | number | Có | Điểm ưu tiên, `0..100` |
| `tone` | enum | Có | `primary`, `info`, `success`, `warning`, `danger` |
| `filters` | `SegmentFilter[]` | Có | Các điều kiện tạo segment |
| `channels` | `SegmentChannel[]` | Có | Tỷ lệ theo kênh tiếp cận đầu tiên |
| `monthlyProspects` | `SegmentTrendPoint[]` | Có | Trend nhóm đang xem và benchmark |

Nên bảo đảm pipeline không tăng ngược:

```text
prospects >= engaged >= qualified >= counselling >= applications >= enrolled
```

### 6.5. Filter và channel

```typescript
SegmentFilter = {
  id: string;
  label: string;
  value: string;
}

SegmentChannel = {
  name: string;
  value: number; // phần trăm, tổng nên bằng 100
}

SegmentTrendPoint = {
  month: string;
  current: number;
  benchmark: number;
}
```

Backend không trả field presentation `fill`; frontend tự map màu theo tên/id kênh. Giá trị được tính từ các tương tác CRM, không khẳng định đây là first-touch channel.

Các dimension hiện có trong fixture gồm `gender`, `grade`, `interest`, `province`, `region` và `schoolType`. API có thể trả thêm `filterOptions` nếu UI bật lại `SegmentBuilder`:

```json
{
  "filterOptions": [
    { "id": "gender", "label": "Giới tính", "value": "Nữ", "availableCount": 3420 },
    { "id": "interest", "label": "Quan tâm", "value": "AI (Trí tuệ nhân tạo)", "availableCount": 3420 }
  ]
}
```

### 6.6. Địa bàn và data coverage

`RegionOpportunity`:

```typescript
{
  rank: number;
  name: string;
  score: number; // 0..100
  selected?: boolean;
}
```

`selected` chỉ nên dùng khi response đã áp dụng một scope/region cụ thể. Nếu API trả overview toàn quốc, frontend có thể tự quản lý trạng thái selected.

`DataCoverageMetric`:

```typescript
{
  label: string;
  detail: string;
  value: number; // 0..100
  tone: "success" | "warning" | "danger";
}
```

`regionalDemand` nên dùng dạng `columns + rows[].scores` như response mẫu, không dùng key tỉnh viết cứng trong object. Cách này cho phép thêm tỉnh mà không đổi schema. Frontend hiện đang dùng fixture dạng `hcm`, `dongNai`, `binhDuong`, `canTho`, `daNang`, nên cần adapter khi tích hợp.

### 6.7. `nextAction` và guardrails

`nextAction` là dữ liệu khuyến nghị mà backend nên trả để tránh đưa business rule vào component:

```typescript
{
  priority: "high" | "normal";
  label: string;
  title: string;
  description: string;
  steps: Array<{
    order: number;
    title: string;
    detail: string;
  }>;
}
```

`SegmentGuardrail`:

```typescript
{
  criterion: string;
  issue: string;
  replacement: string;
  status: string;
  tone: "success" | "warning" | "error";
}
```

## 7. Quy tắc dữ liệu và quyền truy cập

- Chỉ trả segment có `sampleSize >= 30`. Ngưỡng này đang được hiển thị trong detail để tránh suy luận từ nhóm quá nhỏ.
- Không trả danh sách cá nhân, tên, số điện thoại, email hoặc thuộc tính có thể tái nhận diện từ API demographics.
- Không suy đoán thu nhập, khả năng đóng học phí hoặc mức học bổng của học sinh chưa thành niên. Các tiêu chí này đang bị khóa trong `SegmentGuardrails`.
- Thông tin học lực/giải thưởng chỉ được dùng khi consent bao phủ đúng mục đích.
- Endpoint hiện là aggregate public (`allow_guest=True`) và chỉ hỗ trợ `scope=all`; không trả PII, không có JWT/territory scope.
- Server phải áp dụng ngưỡng `MIN_SAMPLE_SIZE = 30` trước khi đưa segment vào response và ranking.
- `asOf` phải là ISO-8601 có timezone. Không dùng chuỗi display-ready để tính tăng trưởng hoặc so sánh kỳ.
- `tuition` và `revenue` hiện trả `null`; không được suy luận từ tỉnh, trường hoặc phân khúc.

## 8. Những API chưa cần cho lần tải đầu

Các nút hiện tại chỉ hiển thị toast, chưa phát sinh request:

- `Xuất báo cáo` overview.
- `Xuất báo cáo` detail segment.
- `Lưu nhóm này`.

Nếu triển khai sau:

```http
GET /api/demographics/export?admissionYear=2026&period=6m&segmentId=female-ai-dong-nai
POST /api/demographics/saved-segments
```

Hai command này không thuộc request bắt buộc để render trang và cần audit quyền, log export cùng chính sách sample-size.

## 9. Error contract

```json
{
  "error": {
    "code": "SEGMENT_NOT_FOUND",
    "message": "Không tìm thấy phân khúc hoặc phân khúc không đủ dữ liệu để hiển thị."
  },
  "meta": {
    "requestId": "req_01J..."
  }
}
```

Status nên thống nhất:

| Status | Code | Khi dùng |
|---:|---|---|
| `200` | - | Overview/detail thành công |
| `400` | `INVALID_SEGMENT_ID` / `INVALID_PERIOD` / `INVALID_SCOPE` | Thiếu segment hoặc query không hợp lệ |
| `404` | `SEGMENT_NOT_FOUND` | Không tồn tại segment |
| `422` | `INVALID_ADMISSION_YEAR` | Kỳ tuyển sinh không hợp lệ |
| `500` | `INTERNAL_ERROR` | Lỗi không dự kiến phía server |
| `503` | `DEMOGRAPHICS_DATA_UNAVAILABLE` | Pipeline aggregate hoặc nguồn dữ liệu chưa sẵn sàng |

## 10. Tóm tắt request tối thiểu

Overview:

```http
GET /api/method/crm.api.director_demographics.get_director_demographics_overview?admissionYear=2026&period=6m&scope=all
```

Detail khi người dùng mở một nhóm:

```http
GET /api/method/crm.api.director_demographics.get_director_demographics_segment?segment_id={segmentId}&admissionYear=2026
```

Overview bắt buộc phải có `kpis`, `demand`, `audienceComposition`, `segments`, `regionOpportunities`, `regionalDemand`, `dataCoverage` và `meta.asOf`. Detail bắt buộc phải có `segment`, `benchmark`, `nextAction`, `guardrails` và `meta.sampleSize`. Các segment dưới 30 hồ sơ không xuất hiện; khi detail gọi vào ID đó, API trả `404 SEGMENT_NOT_FOUND`.
