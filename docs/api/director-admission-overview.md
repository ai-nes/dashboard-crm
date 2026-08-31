# API Tổng quan tuyển sinh cho route `/`

Tài liệu này mô tả API cần để hiển thị màn **Tổng quan tuyển sinh** tại route mặc định `/` của Director.

## 1. Phạm vi màn hình

Route `/` hiện render `DirectorDashboard` với các vùng dữ liệu sau:

| Vùng UI | Dữ liệu cần | Đang render |
|---|---|---:|
| Header | Kỳ tuyển sinh, phạm vi, thời điểm cập nhật | Có |
| KPI chính | Hồ sơ tiềm năng, đủ điều kiện, đã nộp, trúng tuyển, nhập học | Có, 5 KPI đầu |
| Dự báo nhập học | Thực tế, dự báo AI, chỉ tiêu theo niên khóa | Có |
| Briefing | Cảnh báo chính và hành động ưu tiên | Có |
| Phễu tuyển sinh | 7 giai đoạn từ prospect đến enrolled | Có |
| Xu hướng tuyển sinh | Hồ sơ mới, nộp hồ sơ, nhập học theo `7d`, `30d`, `year` | Có |
| Kết quả theo vùng | Hồ sơ, nhập học, conversion, growth, coverage | Có |
| Nguồn hồ sơ | Leads, nhập học và tỷ trọng theo nguồn | Có |
| Nhịp vận hành tư vấn | Tương tác và SLA trong 7 ngày | Có |
| KPI phụ, attention queue, team performance | Dữ liệu bổ sung | Chưa mount hiện tại |

Nguồn tham chiếu:

- [page.tsx](../../src/app/(with-layouts)/(dashboard)/(home)/page.tsx)
- [director-dashboard/index.tsx](../../src/app/(with-layouts)/(dashboard)/(home)/_component/director-dashboard/index.tsx)
- [types.ts](../../src/app/(with-layouts)/(dashboard)/(home)/_component/director-dashboard/types.ts)
- [data.ts](../../src/app/(with-layouts)/(dashboard)/(home)/_component/director-dashboard/data.ts)

## 2. Tình trạng API hiện tại

Trang `/` hiện chưa gọi API. `DirectorDashboard` import dữ liệu trực tiếp từ `director-dashboard/data.ts`.

Các API trong `src/services/api/home` là contract của dashboard generic khác và chưa được dùng bởi route `/`. Mock handler `src/app/api/mock/[...resource]/route.ts` cũng chưa có endpoint riêng cho Director overview.

## 3. Endpoint production đề xuất

Nên dùng một Frappe RPC method cho lần tải đầu, trả toàn bộ dữ liệu cần render:

```http
GET /api/method/crm.api.director_dashboard.get_director_overview
```

Ví dụ:

```http
GET /api/method/crm.api.director_dashboard.get_director_overview?admissionYear=2026&scope=all&trendRange=30d
Authorization: Bearer <access-token>
Accept: application/json
```

Không nên tách mỗi card thành một request riêng. Các phần trend có thể được cache theo `admissionYear`, `scope` và `trendRange`.

### Query parameters

| Tên | Kiểu | Bắt buộc | Mặc định | Mô tả |
|---|---|---:|---:|---|
| `admissionYear` | integer | Không | Kỳ hiện hành | Niên khóa/kỳ tuyển sinh cần xem |
| `scope` | string | Không | `all` | Phạm vi Director được phép xem, ví dụ `all`, campus hoặc territory ID |
| `trendRange` | enum | Không | `30d` | Range mặc định của biểu đồ, nhận `7d`, `30d`, `year` |

`trendRange` chỉ xác định trạng thái mở đầu. Response nên trả đủ ba range để dropdown đổi range không phải gọi lại API. Nếu payload lớn, có thể lazy-load bằng cùng endpoint với `trendRange` cụ thể.

## 4. Response `200 OK`

Frappe trả payload qua wrapper `message`:

```text
{
  message: {
    meta: OverviewMeta,
    kpis: DirectorKpi[],
    forecast: EnrollmentForecast,
    briefing: DirectorBriefing,
    pipeline: AdmissionsPipeline,
    admissionsTrend: AdmissionsTrend,
    marketOverview: MarketOverviewItem[],
    sourcePerformance: SourcePerformance[],
    weeklyActivity: WeeklyActivity
  }
}
```

Response mẫu rút gọn:

```json
{
  "message": {
    "meta": {
      "admissionYear": 2026,
      "scope": "all",
      "scopeLabel": "Toàn bộ cơ sở",
      "asOf": "2026-06-06T10:00:00+07:00",
      "freshnessLabel": "Dữ liệu cập nhật 2 phút trước",
      "timezone": "Asia/Ho_Chi_Minh"
    },
    "kpis": [
      {
        "id": "prospects",
        "label": "Tổng hồ sơ tiềm năng",
        "value": "24.860",
        "target": "30.000",
        "achievement": "82,9%",
        "change": "+9,8%",
        "helper": "so với kỳ trước",
        "tone": "primary"
      },
      {
        "id": "qualified",
        "label": "Hồ sơ đủ điều kiện",
        "value": "14.420",
        "target": "18.000",
        "achievement": "80,1%",
        "change": "+12,4%",
        "helper": "so với tuần trước",
        "tone": "info"
      },
      {
        "id": "applicants",
        "label": "Đã nộp hồ sơ",
        "value": "6.980",
        "target": "8.200",
        "achievement": "85,1%",
        "change": "+8,6%",
        "helper": "so với kỳ trước",
        "tone": "warning"
      },
      {
        "id": "accepted",
        "label": "Đã trúng tuyển",
        "value": "4.820",
        "target": "6.000",
        "achievement": "80,3%",
        "change": "+10,1%",
        "helper": "so với kỳ trước",
        "tone": "info"
      },
      {
        "id": "enrollment",
        "label": "Đã nhập học",
        "value": "3.820",
        "target": "5.000",
        "achievement": "76,4%",
        "change": "+6,8%",
        "helper": "so với kỳ trước",
        "tone": "success"
      }
    ],
    "forecast": {
      "summary": {
        "actual": 3820,
        "forecast": 4680,
        "target": 5000,
        "confidence": 72,
        "gapToTarget": 320
      },
      "points": [
        { "label": "T1", "actual": 420, "forecast": 420, "target": 520 },
        { "label": "T8", "actual": 3820, "forecast": 3820, "target": 4180 },
        { "label": "T9", "actual": null, "forecast": 4180, "target": 4560 },
        { "label": "T10", "actual": null, "forecast": 4680, "target": 5000 }
      ]
    },
    "briefing": {
      "alert": {
        "id": "dong-nai-risk",
        "type": "risk",
        "title": "Chuyển đổi tại Đồng Nai giảm 14%",
        "description": "Tỷ lệ từ nộp hồ sơ đến nhập học giảm liên tục trong 14 ngày gần đây.",
        "evidence": "4 trường có quy mô lớn chưa có hoạt động tuyển sinh mới.",
        "metric": "-14%",
        "href": "/director/regional-performance"
      },
      "priorityAction": {
        "id": "school-event",
        "title": "Tổ chức sự kiện tại Đồng Nai",
        "description": "Kích hoạt tư vấn hướng nghiệp cho 4 trường chưa có hoạt động trong 45 ngày.",
        "impact": "+3.0% chuyển đổi",
        "href": "/director/schools"
      }
    },
    "pipeline": {
      "stages": [
        { "id": "prospect", "label": "Hồ sơ tiềm năng", "value": "24.860", "percentage": 100, "conversion": "100%" },
        { "id": "engaged", "label": "Đã tương tác", "value": "18.840", "percentage": 76, "conversion": "75,8%" },
        { "id": "qualified", "label": "Đủ điều kiện", "value": "14.420", "percentage": 58, "conversion": "76,5%" },
        { "id": "counselling", "label": "Đang tư vấn", "value": "10.240", "percentage": 41, "conversion": "71,0%" },
        { "id": "application", "label": "Đã nộp hồ sơ", "value": "6.980", "percentage": 28, "conversion": "68,2%" },
        { "id": "accepted", "label": "Đã trúng tuyển", "value": "4.820", "percentage": 19, "conversion": "69,1%" },
        { "id": "enrolled", "label": "Đã nhập học", "value": "3.820", "percentage": 15, "conversion": "79,3%" }
      ],
      "summary": {
        "prospects": 24860,
        "accepted": 4820,
        "enrolled": 3820,
        "enrollmentRate": 15.4
      },
      "biggestDrop": {
        "fromStageId": "prospect",
        "fromLabel": "Hồ sơ tiềm năng",
        "toStageId": "engaged",
        "toLabel": "Đã tương tác",
        "differencePoints": 24
      }
    },
    "admissionsTrend": {
      "defaultRange": "30d",
      "ranges": {
        "7d": {
          "points": [
            { "label": "T2", "newLeads": 310, "applicants": 112, "enrolled": 42 },
            { "label": "CN", "newLeads": 486, "applicants": 176, "enrolled": 68 }
          ],
          "totals": { "newLeads": 2727, "applicants": 980, "enrolled": 384 }
        },
        "30d": {
          "points": [
            { "label": "Tuần 1", "newLeads": 1220, "applicants": 438, "enrolled": 174 },
            { "label": "Tuần 4", "newLeads": 1852, "applicants": 706, "enrolled": 288 }
          ],
          "totals": { "newLeads": 6246, "applicants": 2284, "enrolled": 926 }
        },
        "year": {
          "points": [
            { "label": "T1", "newLeads": 12400, "applicants": 2900, "enrolled": 1240 },
            { "label": "T8", "newLeads": 24860, "applicants": 6980, "enrolled": 3820 }
          ],
          "totals": { "newLeads": 143940, "applicants": 39050, "enrolled": 19690 }
        }
      }
    },
    "marketOverview": [
      {
        "id": "southeast",
        "name": "Đông Nam Bộ",
        "prospects": "8,420",
        "enrolled": "1,286",
        "conversion": "15.3%",
        "growth": "+18.4%",
        "coverage": 86,
        "tone": "primary"
      },
      {
        "id": "mekong",
        "name": "Đồng bằng sông Cửu Long",
        "prospects": "4,860",
        "enrolled": "612",
        "conversion": "12.6%",
        "growth": "-8.2%",
        "coverage": 62,
        "tone": "danger"
      }
    ],
    "sourcePerformance": [
      {
        "id": "facebook",
        "label": "Quảng cáo Facebook",
        "leads": "3,920",
        "applicants": "684",
        "enrolled": "318",
        "share": 31
      },
      {
        "id": "school-tour",
        "label": "Tư vấn tại trường",
        "leads": "2,486",
        "applicants": "524",
        "enrolled": "286",
        "share": 24
      }
    ],
    "weeklyActivity": {
      "points": [
        { "label": "T2", "interactions": 680, "sla": 94 },
        { "label": "CN", "interactions": 512, "sla": 98 }
      ],
      "totalInteractions": 5240,
      "averageSla": 94.1,
      "changePercent": 12.6
    }
  }
}
```

Các mảng trong ví dụ được rút gọn. Response thật phải trả đủ 5 KPI đang render, 7 stage pipeline, 4 vùng, 5 nguồn, đủ điểm của cả ba range trend và đủ 7 ngày activity.

## 5. Data contract chi tiết

### 5.1. `meta`

| Field | Kiểu | Bắt buộc | Mô tả |
|---|---|---:|---|
| `admissionYear` | integer | Có | Niên khóa/kỳ tuyển sinh |
| `scope` | string | Có | Mã phạm vi dữ liệu đã áp dụng |
| `scopeLabel` | string | Có | Nhãn hiển thị, ví dụ `Toàn bộ cơ sở` |
| `asOf` | ISO-8601 string | Có | Thời điểm snapshot dữ liệu |
| `freshnessLabel` | string | Nên có | Nhãn cập nhật, ví dụ `Dữ liệu cập nhật 2 phút trước` |
| `timezone` | string | Nên có | Timezone dùng để tính ngày/tuần, ví dụ `Asia/Ho_Chi_Minh` |

Header hiện dùng `scopeLabel`, `admissionYear` và `freshnessLabel`. Tiêu đề `Tổng quan tuyển sinh` cùng phần mô tả có thể giữ ở frontend vì là nội dung tĩnh.

### 5.2. `kpis[]`

Mỗi KPI có shape `DirectorKpi`:

| Field | Kiểu | Bắt buộc | Mô tả |
|---|---|---:|---|
| `id` | string | Có | ID ổn định của KPI |
| `label` | string | Có | Tên chỉ số |
| `value` | string | Có | Giá trị display-ready |
| `target` | string | Có | Mục tiêu của chỉ số |
| `achievement` | string | Có | Tỷ lệ đạt mục tiêu |
| `change` | string | Có | Mức thay đổi so với kỳ so sánh |
| `helper` | string | Có | Ngữ cảnh so sánh/độ tin cậy |
| `tone` | enum | Có | `primary`, `success`, `warning`, `danger`, `info` |

`DirectorKpiCards` hiện chỉ render 5 phần tử đầu tiên theo thứ tự API:

```text
prospects -> qualified -> applicants -> accepted -> enrollment
```

Các KPI có trong fixture nhưng chưa render ở card chính gồm:

```text
conversion-rate
expected-enrollment
expected-revenue
actual-revenue
target-achievement
```

Production nên bổ sung field số như `numericValue`, `targetValue`, `changeValue` và `changeUnit` nếu cần tính toán. `value`, `target`, `achievement`, `change` hiện phục vụ tương thích UI.

### 5.3. `forecast`

```typescript
forecast: {
  summary: {
    actual: number;
    forecast: number;
    target: number;
    confidence: number; // 0..100
    gapToTarget: number;
  };
  points: Array<{
    label: string;
    actual: number | null;
    forecast: number;
    target: number;
  }>;
}
```

`actual: null` nghĩa là kỳ tương lai chưa có kết quả thực tế. Không thay bằng `0`, vì `0` làm sai biểu đồ và diễn giải dữ liệu.

### 5.4. `briefing`

```typescript
briefing: {
  alert: {
    id: string;
    type: "risk" | "opportunity" | "revenue";
    title: string;
    description: string;
    evidence: string;
    metric: string;
    href: string;
  };
  priorityAction: {
    id: string;
    title: string;
    description: string;
    impact: string;
    href: string;
  };
}
```

`href` chỉ được trỏ tới route nội bộ đã allowlist. Không lấy URL tùy ý từ dữ liệu người dùng để tránh open redirect.

### 5.5. `pipeline`

Mỗi stage:

```typescript
{
  id: "prospect" | "engaged" | "qualified" | "counselling"
    | "application" | "accepted" | "enrolled";
  label: string;
  value: string;
  percentage: number; // tỷ lệ còn lại so với stage đầu, 0..100
  conversion: string; // tỷ lệ chuyển từ stage trước
}
```

`pipeline.summary`:

```typescript
{
  prospects: number;
  accepted: number;
  enrolled: number;
  enrollmentRate: number;
}
```

`biggestDrop` phải được backend tính từ dữ liệu pipeline thay vì để frontend so sánh chuỗi display-ready:

```typescript
{
  fromStageId: string;
  fromLabel: string;
  toStageId: string;
  toLabel: string;
  differencePoints: number;
}
```

Các stage phải giữ thứ tự phễu. `percentage` của `prospect` là `100` và các stage sau không được lớn hơn stage trước nếu dùng cùng mẫu số.

### 5.6. `admissionsTrend`

```typescript
type TrendRange = "7d" | "30d" | "year";

admissionsTrend: {
  defaultRange: TrendRange;
  ranges: Record<TrendRange, {
    points: Array<{
      label: string;
      newLeads: number;
      applicants: number;
      enrolled: number;
    }>;
    totals: {
      newLeads: number;
      applicants: number;
      enrolled: number;
    };
  }>;
}
```

Frontend hiện dùng `30d` lúc mở trang và cho phép chuyển sang `7d` hoặc `year`. `label` chỉ dùng hiển thị; nếu cần sort hoặc drill-down, bổ sung `periodStart`/`periodEnd` ISO-8601.

### 5.7. `marketOverview[]`

| Field | Kiểu | Bắt buộc | Mô tả |
|---|---|---:|---|
| `id` | string | Có | ID vùng |
| `name` | string | Có | Tên vùng tuyển sinh |
| `prospects` | string | Có | Số hồ sơ, tương thích format hiện tại |
| `enrolled` | string | Có | Số nhập học |
| `conversion` | string | Có | Tỷ lệ chuyển đổi |
| `growth` | string | Có | Tăng trưởng, có thể âm |
| `coverage` | number | Có | Độ phủ, `0..100` |
| `tone` | enum | Nên có | `primary`, `success`, `warning`, `danger`, `info` |

UI sort theo số `prospects` giảm dần và đánh dấu vùng có `growth` âm. Backend nên trả thêm field số `prospectsValue`, `enrolledValue`, `conversionValue`, `growthValue`; frontend hiện vẫn đọc các chuỗi display-ready.

### 5.8. `sourcePerformance[]`

```typescript
{
  id: string;
  label: string;
  leads: string;
  applicants: string;
  enrolled: string;
  share: number; // phần trăm
}
```

Nguồn hiện có trong fixture:

```text
facebook | school-tour | zalo | website | open-day
```

`SourceMixChart` hiển thị `leads`, `enrolled` và `share`. Component `SourcePerformance` chưa mount nhưng dùng thêm `applicants`. Không trả `barClassName` hoặc `chartColor` từ backend; frontend nên map màu theo `id`.

### 5.9. `weeklyActivity`

```typescript
weeklyActivity: {
  points: Array<{
    label: string;
    interactions: number;
    sla: number; // phần trăm
  }>;
  totalInteractions: number;
  averageSla: number;
  changePercent: number;
}
```

Response phải trả đủ 7 ngày trong kỳ. `totalInteractions`, `averageSla` và `changePercent` dùng cho summary phía trên biểu đồ, tránh hard-code các giá trị `5.240`, `94,1%` và `12,6%`.

## 6. Dữ liệu hiện chưa cần cho initial render

Các component sau có fixture nhưng chưa được import trong `DirectorDashboard` hiện tại:

| Component | Dữ liệu dự kiến | Khi nào cần thêm vào response |
|---|---|---|
| `CompactKpiStrip` | 5 KPI phụ còn lại | Khi bật dải KPI bổ sung |
| `AttentionQueue` | SLA vi phạm, chưa phân công, chờ rà soát, đối soát, phê duyệt | Khi mount hàng đợi xử lý |
| `TeamPerformance` | Đội/cơ sở, active leads, SLA, enrolled, conversion, trend | Khi mount bảng hiệu suất đội |
| `DecisionBrief` | Tín hiệu high-intent, SLA recovery, conversion-ready | Khi mount block điểm đáng chú ý |
| `ConversionHealth` | actual enrollment, forecast, gap to target | Khi thay `EnrollmentForecast` bằng radial health card |

Nếu bật các block này, nên mở rộng cùng endpoint bằng các object tùy chọn hoặc endpoint lazy-load riêng. Không bắt buộc đưa vào initial payload khi UI chưa render.

## 7. Quy tắc dữ liệu

- KPI, pipeline, forecast, market và source phải cùng `admissionYear`, `scope` và snapshot `asOf`.
- Các aggregate phải được tính sau khi áp dụng quyền Director/campus/territory.
- Không dùng số lượng của page hiện tại làm tổng KPI.
- Tỷ lệ phần trăm cần quy định rõ mẫu số: `conversion`, `coverage`, `achievement`, `sla` và `change` không được dùng lẫn nhau.
- Các field tiền tệ như doanh thu phải có unit rõ ràng. Fixture hiện dùng tỷ đồng cho KPI doanh thu phụ.
- Chuỗi format theo locale chỉ phục vụ hiển thị; production nên trả thêm số nguyên/thực và timestamp ISO để tính toán.
- `asOf` phải có timezone. Không dùng `2 phút trước` làm dữ liệu duy nhất để xác định freshness.

## 8. Error contract

```json
{
  "message": {
    "error": {
      "code": "DIRECTOR_OVERVIEW_UNAVAILABLE",
      "message": "Không thể tải dữ liệu tổng quan tuyển sinh."
    },
    "meta": {
      "requestId": "req_01J..."
    }
  }
}
```

Status nên thống nhất:

| Status | Code | Khi dùng |
|---:|---|---|
| `200` | - | Tải overview thành công |
| `400` | `INVALID_QUERY` | Query sai kiểu hoặc enum |
| `401` | `UNAUTHENTICATED` | Thiếu hoặc hết hạn session/token |
| `403` | `FORBIDDEN` | Không có quyền xem scope |
| `404` | `ADMISSION_YEAR_NOT_FOUND` | Không có dữ liệu cho niên khóa |
| `409` | `SNAPSHOT_NOT_READY` | Snapshot đang được tổng hợp |
| `500` | `INTERNAL_ERROR` | Lỗi không dự kiến phía server |
| `503` | `DIRECTOR_OVERVIEW_UNAVAILABLE` | Nguồn dữ liệu hoặc pipeline unavailable |

## 9. API action chưa cần cho lần tải đầu

Các link trong overview chỉ điều hướng sang màn hình khác, không cần command trong request initial:

```text
/director/regional-performance
/director/market-intelligence
/director/revenue-forecast
/director/ai/next-best-action
/director/schools
/director/admission-funnel
/director/campaign-intelligence
/director/sla
/director/students
```

Nút export/action nếu triển khai sau nên dùng API riêng, ví dụ:

```http
GET /api/method/crm.api.director_dashboard.export_overview?admissionYear=2026&scope=all
```

## 10. Tóm tắt request tối thiểu

```http
GET /api/method/crm.api.director_dashboard.get_director_overview?admissionYear=2026&scope=all&trendRange=30d
```

Để render đúng route `/`, response bắt buộc phải có:

1. `meta.admissionYear`, `meta.scopeLabel`, `meta.asOf`.
2. 5 `kpis` đầu theo thứ tự `prospects`, `qualified`, `applicants`, `accepted`, `enrollment`.
3. `forecast.summary` và `forecast.points`.
4. `briefing.alert` và `briefing.priorityAction`.
5. 7 `pipeline.stages`, `pipeline.summary` và `pipeline.biggestDrop`.
6. `admissionsTrend.ranges.7d`, `.30d`, `.year`.
7. `marketOverview[]`, `sourcePerformance[]` và `weeklyActivity`.

Đây là một overview snapshot duy nhất. Khi người dùng đổi range biểu đồ, frontend đổi dữ liệu trong `admissionsTrend.ranges` hoặc gọi lại cùng endpoint nếu backend dùng lazy-load.
