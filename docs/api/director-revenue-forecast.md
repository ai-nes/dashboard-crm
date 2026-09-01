# API cho `/director/revenue-forecast`

Tài liệu này mô tả contract dữ liệu cho màn **Doanh thu & dự báo** của Director. Màn hình theo dõi doanh thu thực tế, dự báo cuối kỳ, chỉ tiêu tuyển sinh, tiến độ thu/đối soát và mô phỏng các kịch bản tăng trưởng.

## 1. Phạm vi màn hình

| Vùng UI | Dữ liệu production cần | Trạng thái hiện tại |
|---|---|---|
| Header/bộ lọc | Kỳ tuyển sinh, period, scope, `asOf`, timezone | State local; label cập nhật còn tĩnh |
| KPI doanh thu | `summary` hoặc `kpis[]` | Fixture `revenueKpis` |
| Forecast theo kỳ | `forecast.points[]` | Fixture `revenueForecast` |
| Tổng quan tài chính | forecast revenue, target, confidence, milestone | Một phần hard-code |
| Mô hình doanh thu | gross, scholarship, discount, net revenue | Fixture `revenueModel` và một phần hard-code |
| Kế hoạch thu | `targetPlan[]` | Hard-code |
| Doanh thu theo vùng | `regions[]` | Fixture `revenueByRegion`; phần summary còn tĩnh |
| Tín hiệu/giải thích AI | `signals`, `aiExplanation` | Driver dùng fixture; confidence/kết luận/rủi ro còn tĩnh |
| Thu, đối soát, giao dịch | `collectionHealth`, `transactions[]`, `activities[]` | Hard-code; chưa có DTO service |
| Nguồn hồ sơ/dòng tiền | `channelMix`, `cashflow` | Hard-code |
| Quyết định/kịch bản | `decisions[]`, `scenarioSimulation` | Decision hard-code; scenario dùng fixture và state client |

Route mount các component trong [revenue-forecast-dashboard.tsx](../../src/app/(with-layouts)/(dashboard)/director/revenue-forecast/_components/revenue-forecast-dashboard.tsx). `RevenuePulseChart`, `RevenueConfidenceChart` và `RevenueKpiCard` hiện là component dự phòng, chưa được mount.

Nguồn tham chiếu:

- [page.tsx](../../src/app/(with-layouts)/(dashboard)/director/revenue-forecast/page.tsx)
- [types.ts](../../src/app/(with-layouts)/(dashboard)/director/revenue-forecast/_components/types.ts)
- [data.ts](../../src/app/(with-layouts)/(dashboard)/director/revenue-forecast/_components/data.ts)
- [erd-from-mock-data.md](../erd-from-mock-data.md)

## 2. Tình trạng tích hợp hiện tại

Route chưa gọi API. Các component import fixture trực tiếp từ `_components/data.ts` hoặc khai báo constant ngay trong component. Chưa có service trong `src/services/api/revenue-forecast`, hook query hay mock handler riêng.

Contract bên dưới là contract production đề xuất. Tất cả section phải dùng một snapshot, cùng kỳ, scope, timezone và currency; không để KPI, chart và decision card đọc các mốc dữ liệu khác nhau.

## 3. Endpoint và quyền truy cập

```http
GET {NEXT_PUBLIC_FRAPPE_URL}/api/method/crm.api.director_revenue_forecast.get_director_revenue_forecast
Cookie: sid=<Frappe session cookie>
Accept: application/json
```

Frappe bọc response thành công trong `message`. Endpoint chỉ trả aggregate tài chính/tuyển sinh và giao dịch đã được phép hiển thị; không trả PII của học sinh.

Quyền tối thiểu: profile `Admissions Director`, Finance Director hoặc role revenue được cấp; `Administrator`/`System Manager` có quyền phù hợp. `scope` và `campus` phải nằm trong phạm vi user được cấp; backend không được tin query string của client.

## 4. Request

```http
GET /api/method/crm.api.director_revenue_forecast.get_director_revenue_forecast?admissionYear=2026&period=admission-year&scope=all
```

| Tên | Kiểu | Bắt buộc | Mặc định | Ràng buộc / mô tả |
|---|---|---:|---|---|
| `admissionYear` | integer | Không | Kỳ active duy nhất | Năm 4 chữ số trong `2000..2100` |
| `period` | enum | Không | `admission-year` | `this-month`, `this-quarter`, `admission-year` |
| `scope` | string | Không | `all` | Scope/campus/territory được cấp quyền; UI hiện có `all`, `hcm`, `dong-nai`, `north` |
| `from` | date `YYYY-MM-DD` | Không | Suy ra từ `period` | Bao gồm ngày bắt đầu |
| `to` | date `YYYY-MM-DD` | Không | Suy ra từ `period` | Bao gồm ngày kết thúc; không nhỏ hơn `from` |
| `timezone` | IANA timezone | Không | `Asia/Ho_Chi_Minh` | Dùng để cắt ngày/kỳ và format giao dịch |
| `transactionLimit` | integer | Không | `10` | `0..50`; chỉ giới hạn `transactions[]` |

Filter áp dụng đồng thời cho toàn bộ response. `scenarioSimulation` là kịch bản tính từ snapshot hiện tại, không phải filter lịch sử. Khi không xác định được kỳ active duy nhất, trả `422 INVALID_ADMISSION_YEAR`.

## 5. Response `200 OK`

Shape Frappe:

```text
{ message: RevenueForecastResponse }
```

Ví dụ response rút gọn:

```json
{
  "message": {
    "meta": {
      "admissionYear": 2026,
      "period": "admission-year",
      "scope": "all",
      "scopeLabel": "Tất cả khu vực",
      "from": "2026-01-01",
      "to": "2026-10-31",
      "asOf": "2026-08-29T09:30:00+07:00",
      "timezone": "Asia/Ho_Chi_Minh",
      "currency": "VND",
      "status": "available",
      "warnings": []
    },
    "summary": {
      "forecastRevenue": 468000000000,
      "actualRevenue": 382000000000,
      "revenueTarget": 520000000000,
      "forecastEnrollment": 4680,
      "enrollmentTarget": 5000,
      "revenueGap": 52000000000,
      "modelConfidence": 72,
      "changeVsPrevious": 11.5
    },
    "forecast": {
      "forecastStart": "2026-08-01",
      "points": [
        { "label": "T1", "periodStart": "2026-01-01", "actual": 42000000000, "forecast": null, "target": 52000000000 },
        { "label": "T8", "periodStart": "2026-08-01", "actual": 382000000000, "forecast": 382000000000, "target": 418000000000 },
        { "label": "T10", "periodStart": "2026-10-01", "actual": null, "forecast": 468000000000, "target": 520000000000 }
      ]
    },
    "model": {
      "grossRevenue": 520000000000,
      "scholarship": 18000000000,
      "discount": 34000000000,
      "netRevenue": 468000000000
    },
    "regions": [
      { "id": "hcm", "label": "TP. Hồ Chí Minh", "actual": 82000000000, "forecast": 98000000000, "share": 21 }
    ],
    "targetPlan": [
      { "id": "tuition", "label": "Thu học phí", "actual": 346000000000, "target": 420000000000, "progress": 82.4 }
    ],
    "signals": { "positive": [], "negative": [], "primaryRisk": null },
    "collectionHealth": {
      "status": "stable",
      "onTimeRate": 96.4,
      "reconciledCount": 1284,
      "transactionCount": 1320,
      "outstandingAmount": 14800000000,
      "processingOnTimeRate": 92.8,
      "warnings": []
    },
    "transactions": [],
    "activities": [],
    "channelMix": { "totalLeads": 11400, "items": [], "topChannelId": null },
    "cashflow": { "points": [], "grossTotal": 325000000000, "reductionTotal": 35000000000, "netTotal": 290000000000, "changeVsPrevious": 8.1 },
    "decisions": [],
    "scenarioSimulation": { "targetRevenue": 520000000000, "defaultScenarioId": "conversion-3", "scenarios": [] },
    "aiExplanation": {
      "confidence": 72,
      "conclusion": { "title": "Xu hướng đang tích cực", "description": "Tốc độ nhập học hiện tại vẫn đủ để duy trì đà tăng trưởng." },
      "expectedEnrollment": 4680,
      "drivers": [],
      "primaryRisk": null
    }
  }
}
```

Collection không có dữ liệu trả `[]`, không trả `null`. Metric không đủ denominator hoặc nguồn chưa khả dụng trả `null` kèm warning trong `meta`.

## 6. Schema và semantics

### 6.1. `meta` và `summary`

```typescript
type RevenueForecastMeta = {
  admissionYear: number;
  period: "this-month" | "this-quarter" | "admission-year";
  scope: string;
  scopeLabel: string;
  from: string;
  to: string;
  asOf: string;
  timezone: string;
  currency: string; // ISO-4217, mặc định VND
  status: "available" | "partial" | "unavailable";
  warnings: string[];
};

type RevenueSummary = {
  forecastRevenue: number;
  actualRevenue: number;
  revenueTarget: number;
  forecastEnrollment: number;
  enrollmentTarget: number;
  revenueGap: number | null;
  modelConfidence: number | null;
  changeVsPrevious: number | null;
};
```

`revenueGap = max(revenueTarget - forecastRevenue, 0)`. `modelConfidence` nằm trong `0..100`. Số tiền production là number theo `meta.currency`, không trả chuỗi `468B`, `520B` hoặc `+11.5%`; frontend chịu trách nhiệm format. Fixture hiện tại dùng thêm `RevenueKpi` với các string đã format.

### 6.2. `forecast.points[]`

```typescript
type RevenueForecastPoint = {
  label: string;
  periodStart: string;
  actual: number | null;
  forecast: number | null;
  target: number | null;
};
```

`periodStart` là khóa sort canonical; `label` chỉ để hiển thị. `actual` có giá trị ở kỳ đã có dữ liệu, `forecast` bắt đầu từ `forecastStart`; không điền `0` cho kỳ chưa quan sát. `target` phải cùng kỳ và currency với các series còn lại.

### 6.3. `model` và `targetPlan[]`

```typescript
type RevenueModel = {
  grossRevenue: number;
  scholarship: number;
  discount: number;
  netRevenue: number;
};

type TargetPlanItem = {
  id: string;
  label: string;
  actual: number;
  target: number;
  progress: number | null;
};
```

```text
netRevenue = grossRevenue - scholarship - discount
progress = actual / target * 100
```

`scholarship` và `discount` trả số dương trong JSON; UI mới hiển thị dấu trừ. `progress = null` khi target bằng `0` hoặc chưa có target canonical. Không gộp pipeline revenue vào gross revenue.

### 6.4. `regions[]`, `channelMix` và `cashflow`

```typescript
type RevenueRegion = {
  id: string;
  label: string;
  actual: number | null;
  forecast: number | null;
  share: number | null;
};

type ChannelMix = {
  totalLeads: number;
  items: Array<{ id: string; label: string; share: number | null }>;
  topChannelId: string | null;
};

type Cashflow = {
  points: Array<{ label: string; periodStart: string; gross: number; reductions: number }>;
  grossTotal: number;
  reductionTotal: number;
  netTotal: number;
  changeVsPrevious: number | null;
};
```

`share` phải ghi rõ denominator. Nếu là hồ sơ, dùng `totalLeads`; nếu là revenue, phải đổi tên thành `revenueShare`. `cashflow.reductions` chỉ gồm học bổng, chiết khấu, hoàn phí hoặc giảm trừ tài chính; `netTotal = grossTotal - reductionTotal`.

### 6.5. `collectionHealth`, `transactions[]`, `activities[]`

`collectionHealth` tối thiểu gồm `status: stable | watch | critical`, `onTimeRate`, `reconciledCount`, `transactionCount`, `outstandingAmount`, `processingOnTimeRate` và `warnings`. Rate phải có denominator rõ ràng; `reconciledCount <= transactionCount`.

```typescript
type RevenueTransaction = {
  id: string;
  title: string;
  occurredAt: string;
  amount: number;
  direction: "income" | "expense";
  status: string;
  reconciled: boolean;
};

type RevenueActivity = {
  id: string;
  title: string;
  occurredAt: string;
  value: string;
  status: string;
  direction: "positive" | "negative";
};
```

Không đưa tên học sinh, mã hồ sơ, số điện thoại hoặc chi tiết nhạy cảm vào title. `occurredAt` là ISO-8601; UI tự format “Hôm nay/Hôm qua”. Giới hạn `transactionLimit` không được làm thay đổi aggregate.

### 6.6. `signals`, `aiExplanation` và `decisions[]`

```typescript
type ForecastDriver = {
  id: string;
  label: string;
  value: number;
  description: string;
  direction: "positive" | "negative";
  impactRevenue?: number | null;
  source?: string;
};

type RevenueDecision = {
  id: string;
  title: string;
  note: string;
  impactRevenue: number | null;
  tone: "success" | "warning" | "danger";
  sourceSignalIds: string[];
};
```

Signal phải mô tả metric quan sát được, khoảng so sánh và nguồn; không gọi correlation là nguyên nhân. Decision phải truy vết được về signal/metric. Model version, confidence rule và thời gian huấn luyện nên nằm trong `meta.modelInfo` hoặc field tương đương.

### 6.7. `scenarioSimulation`

```typescript
type RevenueScenario = {
  id: string;
  label: string;
  description: string;
  enrollment: number;
  revenue: number;
  deltaRevenue: number;
  additionalEnrollment: number;
  assumption: string;
  impactHorizonDays?: number;
};

type ScenarioSimulation = {
  targetRevenue: number;
  defaultScenarioId: string | null;
  scenarios: RevenueScenario[];
};
```

Scenario là output tính toán, không ghi đè actual history. Mỗi scenario phải có assumption, horizon và model version; `revenue` là dự kiến, không được gọi là actual revenue. Nếu sau này nhận input tương tác, nên dùng endpoint `POST .../simulate` riêng.

## 7. Nguồn dữ liệu và công thức

- Campaign/enrollment/revenue: `CAMPAIGNS`, `CAMPAIGN_PERFORMANCE_PERIODS`, `ADMISSION_APPLICATIONS`.
- Khoản thu, học bổng, chiết khấu, hoàn phí và đối soát: payment/finance ledger canonical của CRM.
- Forecast input: funnel tuyển sinh, enrollment đã xác nhận, conversion theo cohort, target theo kỳ và feature đã được phép dùng trong model.
- `actualRevenue` chỉ gồm khoản đã ghi nhận/đối soát; không cộng `pipelineRevenue`.
- `forecastRevenue` là actual đã xác nhận cộng phần kỳ còn lại do model dự báo, không cộng trùng actual.
- Dedupe theo enrollment/payment/contact canonical trước khi aggregate; quy đổi currency trước khi tính tổng.
- Nguồn offline/referral/school event vẫn là channel hợp lệ, không loại vì không có spend.

## 8. Quy tắc dữ liệu thiếu và consistency

- `null` dùng cho unavailable, denominator bằng `0`, forecast chưa đủ dữ liệu hoặc vùng chưa được quan sát; chỉ dùng `0` khi giá trị thật đã được xác nhận là `0`.
- Nếu `status = partial`, `meta.warnings` phải chỉ rõ section/field bị ảnh hưởng.
- Invariant tối thiểu:

```text
model.netRevenue = model.grossRevenue - model.scholarship - model.discount
cashflow.netTotal = cashflow.grossTotal - cashflow.reductionTotal
summary.revenueGap = max(summary.revenueTarget - summary.forecastRevenue, 0)
summary.modelConfidence ∈ [0, 100]
```

Không bắt buộc tổng `regions[].forecast` bằng summary nếu có vùng “khác” hoặc scope subset; nếu là full scope thì phải công bố và kiểm tra reconciliation.

## 9. Việc backend cần làm để khớp UI

1. Tạo Frappe method production và service adapter cho overview revenue forecast.
2. Trả một snapshot có meta, summary, forecast, model, region, target, collection, transaction, activity, channel mix, cashflow, decision và scenario.
3. Nối filter header vào query; không để scope/period thay đổi label nhưng giữ nguyên data.
4. Thay các constant trong target plan, cashflow, channel mix, collection health, transactions, activity và decision card bằng payload API.
5. Thay text hard-code trong summary rail và AI explanation bằng summary, signals và aiExplanation.
6. Công bố model version, confidence rule, impact horizon và denominator của signal.
7. Dùng `recommendation`/decision theo dữ liệu thực, không mặc định trạng thái tốt khi model confidence thấp.
8. Không fallback im lặng về fixture khi endpoint production lỗi; hiển thị `partial`/`unavailable` rõ ràng.

## 10. Error contract

```json
{
  "error": {
    "code": "REVENUE_FORECAST_DATA_UNAVAILABLE",
    "message": "Không thể tải dữ liệu doanh thu và dự báo.",
    "details": {}
  }
}
```

| HTTP | Code | Khi nào |
|---:|---|---|
| `400` | `INVALID_QUERY` | `period`, scope, timezone hoặc date range không hợp lệ |
| `401` | `UNAUTHENTICATED` | Session không hợp lệ hoặc chưa đăng nhập |
| `403` | `FORBIDDEN` | Không có quyền xem revenue hoặc vượt scope |
| `422` | `INVALID_ADMISSION_YEAR` / `INVALID_DATE_RANGE` | Kỳ tuyển sinh hoặc khoảng ngày không hợp lệ |
| `502` | `INVALID_REVENUE_FORECAST_RESPONSE` | Upstream thiếu field bắt buộc hoặc sai kiểu |
| `503` | `REVENUE_FORECAST_DATA_UNAVAILABLE` | Không đọc được ledger, enrollment hoặc nguồn model chính |

Frontend hiện hiển thị lỗi chung “Không thể tải dữ liệu doanh thu và dự báo”. Nên giữ `error.code` ổn định để phân biệt lỗi quyền, query, nguồn dữ liệu và model chưa sẵn sàng.
