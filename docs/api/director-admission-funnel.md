# API cho `/director/admission-funnel`

Tài liệu này mô tả contract dữ liệu cần để hiển thị màn **Phễu tuyển sinh** của Director.

## 1. Phạm vi màn hình

Route hiện có các vùng dữ liệu sau:

| Vùng UI | Dữ liệu cần | Nguồn hiện tại |
|---|---|---|
| Header | Kỳ tuyển sinh, trạng thái dữ liệu, link kế hoạch can thiệp | Text tĩnh |
| Tóm tắt | Tổng hồ sơ tiềm năng, nhập học, tỷ lệ nhập học, bước cần ưu tiên | Tính từ `funnelStages` và text tĩnh |
| Phễu hồ sơ | 7 giai đoạn, số hồ sơ, tỷ lệ còn lại, tỷ lệ chuyển tiếp | `funnelStages` |
| Hồ sơ giảm qua từng bước | 3 bước có tỷ lệ rơi lớn nhất | Tính từ `funnelStages` |
| Hồ sơ đang chờ xử lý | Aging theo giai đoạn và thời gian chờ | `agingRows` |
| Hiệu quả từng nguồn | Tỷ lệ chuyển tiếp qua 6 bước theo nguồn | `sourcePerformance` |
| Tốc độ chuyển đổi theo tuần | Cohort và tỷ lệ đạt bước đăng ký theo tuần | `cohortRows` |
| Việc cần ưu tiên | Các action được xếp hạng theo mức độ ảnh hưởng | Text tĩnh |

Nguồn tham chiếu trực tiếp:

- [page.tsx](../../src/app/(with-layouts)/(dashboard)/director/admission-funnel/page.tsx)
- [admission-funnel-dashboard.tsx](../../src/app/(with-layouts)/(dashboard)/director/admission-funnel/_components/admission-funnel-dashboard.tsx)
- [data.ts](../../src/app/(with-layouts)/(dashboard)/director/admission-funnel/_components/data.ts)

## 2. Tình trạng API hiện tại

Route chưa gọi API. Các component đang import dữ liệu mock trực tiếp từ `data.ts`; header và priority actions còn có một số nội dung hard-code. Hiện chưa có service tương ứng trong `src/services/api` hoặc mock handler riêng cho route này.

Contract bên dưới là contract production đề xuất. Khi tích hợp, nên thay toàn bộ dataset cục bộ bằng một snapshot từ cùng request để các tỷ lệ và số lượng không lệch nhau.

## 3. Endpoint và quyền truy cập

```http
GET {NEXT_PUBLIC_FRAPPE_URL}/api/method/crm.api.director_admission_funnel.get_director_admission_funnel
Cookie: sid=<Frappe session cookie>
Accept: application/json
```

Frappe bọc response thành công trong `message`.

Endpoint chỉ đọc và không trả PII. Backend phải kiểm tra quyền Director trước khi áp dụng `scope`; không được để client tự quyết định phạm vi dữ liệu.

Quyền tối thiểu:

- `Administrator` hoặc `System Manager` có quyền phù hợp;
- profile nghiệp vụ `Admissions Director`;
- scope được yêu cầu phải nằm trong phạm vi user được cấp.

## 4. Request

Ví dụ:

```http
GET /api/method/crm.api.director_admission_funnel.get_director_admission_funnel?admissionYear=2026&scope=all
```

### Query parameters

| Tên | Kiểu | Bắt buộc | Mặc định | Ràng buộc / mô tả |
|---|---|---:|---|---|
| `admissionYear` | integer | Không | Kỳ active duy nhất | Năm 4 chữ số trong khoảng `2000..2100` |
| `scope` | string | Không | `all` | `all`, campus ID hoặc territory ID được user cấp quyền |

Không cần `stage`, `source` hoặc `cohort` cho lần tải đầu. Các bảng/biểu đồ trên màn hình dùng chung một snapshot và hiện không có bộ lọc độc lập.

Nếu không truyền `admissionYear`, backend chỉ được tự chọn kỳ khi có đúng một kỳ tuyển sinh active; nếu không, trả `422 INVALID_ADMISSION_YEAR`.

## 5. Response `200 OK`

Shape tổng quát:

```text
{
  message: {
    meta: FunnelMeta,
    summary: FunnelSummary,
    stages: FunnelStage[],
    dropOffs: FunnelDropOff[],
    aging: FunnelAging,
    sourcePerformance: FunnelSourcePerformance[],
    cohorts: FunnelCohorts,
    priorityActions: FunnelPriorityAction[]
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
      "status": "available"
    },
    "summary": {
      "prospects": 58420,
      "enrolled": 3820,
      "enrollmentRate": 6.5,
      "priorityStageId": "prospect",
      "priorityNextStageId": "engaged",
      "priorityDropRate": 55.2,
      "priorityDropCount": 32240
    },
    "stages": [
      { "id": "prospect", "label": "Hồ sơ tiềm năng", "description": "Có định danh và đồng ý nhận tư vấn", "count": 58420, "remainingRate": 100, "stepRate": 100 },
      { "id": "engaged", "label": "Đã tương tác", "description": "Đã phản hồi hai chiều", "count": 26180, "remainingRate": 44.8, "stepRate": 44.8 },
      { "id": "qualified", "label": "Đủ điều kiện", "description": "Đúng nhóm tuyển sinh mục tiêu", "count": 12640, "remainingRate": 21.6, "stepRate": 48.3 },
      { "id": "counselling", "label": "Đã tư vấn", "description": "Đã có ít nhất một phiên tư vấn", "count": 8920, "remainingRate": 15.3, "stepRate": 70.6 },
      { "id": "application", "label": "Đã đăng ký", "description": "Đã khởi tạo hồ sơ đăng ký", "count": 6240, "remainingRate": 10.7, "stepRate": 70.0 },
      { "id": "accepted", "label": "Đã trúng tuyển", "description": "Đủ điều kiện nhập học", "count": 4910, "remainingRate": 8.4, "stepRate": 78.7 },
      { "id": "enrolled", "label": "Đã nhập học", "description": "Đã hoàn tất xác nhận nhập học", "count": 3820, "remainingRate": 6.5, "stepRate": 77.8 }
    ],
    "dropOffs": [
      { "fromStageId": "prospect", "toStageId": "engaged", "fromLabel": "Hồ sơ tiềm năng", "toLabel": "Đã tương tác", "dropCount": 32240, "dropRate": 55.2 },
      { "fromStageId": "engaged", "toStageId": "qualified", "fromLabel": "Đã tương tác", "toLabel": "Đủ điều kiện", "dropCount": 13540, "dropRate": 51.7 },
      { "fromStageId": "qualified", "toStageId": "counselling", "fromLabel": "Đủ điều kiện", "toLabel": "Đã tư vấn", "dropCount": 3720, "dropRate": 29.4 }
    ],
    "aging": {
      "totalOverFourteenDays": 7272,
      "rows": [
        { "stageId": "prospect", "stage": "Hồ sơ tiềm năng", "underThreeDays": 12480, "threeToSevenDays": 8940, "sevenToFourteenDays": 6120, "overFourteenDays": 4680, "medianDays": 2.1 },
        { "stageId": "engaged", "stage": "Đã tương tác", "underThreeDays": 5240, "threeToSevenDays": 3810, "sevenToFourteenDays": 2960, "overFourteenDays": 1420, "medianDays": 4.8 },
        { "stageId": "qualified", "stage": "Đủ điều kiện", "underThreeDays": 1980, "threeToSevenDays": 1240, "sevenToFourteenDays": 810, "overFourteenDays": 692, "medianDays": 6.2 },
        { "stageId": "counselling", "stage": "Đã tư vấn", "underThreeDays": 1140, "threeToSevenDays": 820, "sevenToFourteenDays": 460, "overFourteenDays": 340, "medianDays": 5.1 },
        { "stageId": "application", "stage": "Đã đăng ký", "underThreeDays": 980, "threeToSevenDays": 610, "sevenToFourteenDays": 310, "overFourteenDays": 100, "medianDays": 3.4 },
        { "stageId": "accepted", "stage": "Đã trúng tuyển", "underThreeDays": 420, "threeToSevenDays": 280, "sevenToFourteenDays": 190, "overFourteenDays": 40, "medianDays": 2.2 }
      ]
    },
    "sourcePerformance": [
      { "id": "digital", "label": "Kênh số", "stepRates": [44.1, 46.2, 68.4, 69.1, 77.8, 76.2], "finalRate": 5.7 },
      { "id": "field", "label": "Thực địa", "stepRates": [58.2, 54.8, 74.1, 78.6, 81.2, 82.4], "finalRate": 12.4 }
    ],
    "cohorts": {
      "targetStageId": "application",
      "followUpWeeks": [1, 2, 3, 4, 5, 6],
      "completeCohortCount": 3,
      "rows": [
        { "id": "week-24", "label": "Tuần 24", "values": [41, 24, 18, 14, 11, 9.2] },
        { "id": "week-27", "label": "Tuần 27", "values": [46, 28, 21, 16, 12.4, null] }
      ]
    },
    "priorityActions": [
      { "id": "improve-first-transition", "title": "Cải thiện bước Tiềm năng → Tương tác", "detail": "32.240 hồ sơ chưa chuyển bước.", "tone": "error" },
      { "id": "clear-aging-backlog", "title": "Xử lý hồ sơ chờ trên 14 ngày", "detail": "7.272 hồ sơ đang tồn đọng.", "tone": "warning" },
      { "id": "scale-best-source", "title": "Nhân rộng nguồn có tỷ lệ nhập học cao", "detail": "Nguồn hiệu quả nhất cần được ưu tiên mở rộng.", "tone": "success" }
    ]
  }
}
```

Ví dụ trên rút gọn `dropOffs`, `sourcePerformance` và `cohorts.rows`. Response production phải trả đủ 6 transition, tất cả nguồn được phép hiển thị và các cohort đã có trong kỳ theo dõi.

## 6. Data contract chi tiết

### 6.1. `meta`

```typescript
type FunnelMeta = {
  admissionYear: number;
  scope: string;
  scopeLabel: string;
  asOf: string; // ISO-8601, có timezone
  timezone: string;
  status: "available" | "partial";
  warnings?: string[];
};
```

`asOf` là thời điểm snapshot được tạo, không thay thế bằng chuỗi tương đối như `2 phút trước`. `status = partial` chỉ dùng khi một section không đủ dữ liệu; section đó phải trả array rỗng hoặc field `null` kèm warning rõ ràng.

### 6.2. `summary`

```typescript
type FunnelSummary = {
  prospects: number;
  enrolled: number;
  enrollmentRate: number | null;
  priorityStageId: FunnelStageId | null;
  priorityNextStageId: FunnelStageId | null;
  priorityDropRate: number | null;
  priorityDropCount: number | null;
};
```

`priorityStageId` là transition có `dropRate` lớn nhất, không phải giai đoạn có số lượng tuyệt đối lớn nhất. Nếu denominator bằng `0`, trả `null` thay vì `0`.

### 6.3. `stages[]`

```typescript
type FunnelStageId =
  | "prospect"
  | "engaged"
  | "qualified"
  | "counselling"
  | "application"
  | "accepted"
  | "enrolled";

type FunnelStage = {
  id: FunnelStageId;
  label: string;
  description: string;
  count: number;
  remainingRate: number; // count / stages[0].count * 100
  stepRate: number | null; // count / previous stage count * 100
};
```

Quy ước:

- Array phải giữ đúng thứ tự từ `prospect` đến `enrolled` và luôn có 7 stage.
- `remainingRate` dùng cùng denominator là tổng `prospect`; stage đầu bằng `100` nếu có dữ liệu.
- `stepRate` của stage đầu là `100`; từ stage thứ hai trở đi là tỷ lệ chuyển từ stage ngay trước đó.
- `count` là số bản ghi unique sau khi áp dụng kỳ tuyển sinh và scope, không phải số dòng của một trang phân trang.
- Không để count của stage sau lớn hơn stage trước nếu đây là cùng một funnel canonical.

### 6.4. `dropOffs[]`

```typescript
type FunnelDropOff = {
  fromStageId: FunnelStageId;
  toStageId: FunnelStageId;
  fromLabel: string;
  toLabel: string;
  dropCount: number;
  dropRate: number; // 100 - stepRate
};
```

Trả đủ 6 transition và sắp xếp `dropRate` giảm dần để UI lấy ba dòng đầu. `dropCount = fromCount - toCount`; không tính từ các chuỗi đã format theo locale.

### 6.5. `aging`

```typescript
type FunnelAging = {
  totalOverFourteenDays: number;
  rows: Array<{
    stageId: Exclude<FunnelStageId, "enrolled">;
    stage: string;
    underThreeDays: number;
    threeToSevenDays: number;
    sevenToFourteenDays: number;
    overFourteenDays: number;
    medianDays: number | null;
  }>;
};
```

`rows` gồm các stage còn hồ sơ chờ xử lý, hiện là 6 stage đầu và không gồm `enrolled`. Các bucket thời gian phải loại trừ lẫn nhau và bao phủ các hồ sơ đang chờ. `totalOverFourteenDays` phải bằng tổng `overFourteenDays` của các row.

`medianDays` là median thời gian kể từ lần vào stage hoặc lần chuyển bước gần nhất đến `asOf`, theo timezone trong `meta`.

### 6.6. `sourcePerformance[]`

```typescript
type FunnelSourcePerformance = {
  id: string;
  label: string;
  stepRates: Array<number | null>; // luôn có 6 phần tử, theo thứ tự stages[i] -> stages[i + 1]
  finalRate: number | null; // enrolled / prospect của riêng source
};
```

`stepRates[0]` là `prospect → engaged`, `stepRates[5]` là `accepted → enrolled`. `finalRate` nên được tính trực tiếp từ denominator canonical của source, không suy ra từ các rate đã làm tròn. Nếu source không đủ mẫu hoặc chưa tracking được lineage, trả `null` kèm warning thay vì điền `0`.

Backend không cần trả class màu hoặc mã màu. Frontend map màu theo `id`/thứ tự cố định.

### 6.7. `cohorts`

```typescript
type FunnelCohorts = {
  targetStageId: FunnelStageId;
  followUpWeeks: number[]; // ví dụ [1, 2, 3, 4, 5, 6]
  completeCohortCount: number;
  rows: Array<{
    id: string;
    label: string;
    values: Array<number | null>;
  }>;
};
```

`values[i]` là tỷ lệ phần trăm của cohort đạt `targetStageId` sau `followUpWeeks[i]` tuần. `null` nghĩa là cohort chưa đủ thời gian quan sát hoặc dữ liệu chưa có; không thay bằng `0`.

`completeCohortCount` là số row có đủ giá trị cho toàn bộ follow-up horizon. Với UI hiện tại, các row đầy đủ được dùng làm line chart; các row chưa đủ 6 tuần vẫn có thể trả về để hiển thị trạng thái partial.

### 6.8. `priorityActions[]`

```typescript
type FunnelPriorityAction = {
  id: string;
  title: string;
  detail: string;
  tone: "error" | "warning" | "success";
  href?: string;
};
```

Action phải được tạo từ snapshot hiện tại và sắp xếp theo ưu tiên. `detail` không nên chứa số hard-code từ frontend. Nếu có `href`, chỉ cho phép route nội bộ đã allowlist; không lấy URL tùy ý từ dữ liệu người dùng.

## 7. Quy tắc dữ liệu và tính nhất quán

- Tất cả section phải dùng cùng `admissionYear`, `scope` và `asOf`.
- `prospects`, `enrolled`, `stages`, aging và source phải cùng định nghĩa unique record; không trộn Contact, event và application nếu chưa quy định lineage.
- Tỷ lệ được trả dưới dạng số phần trăm, không kèm ký hiệu `%`; frontend chịu trách nhiệm format theo locale.
- `null` dành cho denominator bằng 0, thiếu dữ liệu hoặc chưa đủ quan sát; `0` chỉ có nghĩa là đã truy vấn thành công và giá trị thực bằng 0.
- Không trả display string như `58.420`, `6,5%` hoặc `7.272 hồ sơ` trong contract số liệu.
- Aggregate phải được tính sau khi kiểm tra quyền theo Director/campus/territory.
- Không trả PII trong endpoint aggregate; drill-down hồ sơ phải dùng endpoint riêng và áp dụng policy privacy/consent.
- Snapshot cần có revision hoặc request ID nếu backend có pipeline tổng hợp bất đồng bộ, để hỗ trợ đối soát giữa các biểu đồ.

## 8. Error contract

```json
{
  "message": {
    "error": {
      "code": "DIRECTOR_ADMISSION_FUNNEL_UNAVAILABLE",
      "message": "Không thể tải dữ liệu phễu tuyển sinh.",
      "details": {}
    },
    "meta": {
      "requestId": "req_01J..."
    }
  }
}
```

| HTTP | Code | Khi dùng |
|---:|---|---|
| `400` | `INVALID_QUERY` | `scope` hoặc query sai format |
| `401` | `UNAUTHENTICATED` | Thiếu hoặc hết hạn session |
| `403` | `FORBIDDEN` | User không có quyền Director hoặc scope không hợp lệ |
| `422` | `INVALID_ADMISSION_YEAR` | Kỳ tuyển sinh không hợp lệ hoặc không xác định được kỳ active |
| `404` | `ADMISSION_YEAR_NOT_FOUND` | Không tồn tại dữ liệu cho kỳ yêu cầu |
| `409` | `SNAPSHOT_NOT_READY` | Snapshot đang được tổng hợp |
| `502` | `INVALID_FUNNEL_RESPONSE` | Upstream trả schema không hợp lệ |
| `503` | `DIRECTOR_ADMISSION_FUNNEL_UNAVAILABLE` | Không đọc được nguồn aggregate chính |

## 9. API action bổ sung

Nút `Xem kế hoạch can thiệp` chỉ điều hướng sang `/director/ai/next-best-action`, không cần thêm command vào request initial.

Nút `Xuất báo cáo` hiện chỉ hiển thị toast. Nếu triển khai backend, dùng endpoint riêng với cùng snapshot/filter:

```http
GET /api/method/crm.api.director_admission_funnel.export_director_admission_funnel?admissionYear=2026&scope=all
```

Endpoint export nên trả file CSV/XLSX hoặc job export có `requestId`; không đưa dữ liệu export lớn vào response JSON của endpoint overview.

## 10. Request tối thiểu để tích hợp

```http
GET /api/method/crm.api.director_admission_funnel.get_director_admission_funnel?admissionYear=2026&scope=all
```

Response tối thiểu để render đúng route:

1. `meta.admissionYear`, `meta.scopeLabel`, `meta.asOf` và `meta.status`.
2. Đủ 7 phần tử trong `stages` theo đúng thứ tự funnel.
3. `summary` có tỷ lệ nhập học và transition cần ưu tiên.
4. Đủ 6 phần tử `dropOffs`, 6 row aging, `sourcePerformance` và `cohorts`.
5. `priorityActions` có tối đa 3 action đã được xếp hạng.

Đây là một overview snapshot duy nhất. Khi dữ liệu backend sẵn sàng, frontend không nên tiếp tục tính các metric chính từ fixture hoặc hiển thị số liệu hard-code.
