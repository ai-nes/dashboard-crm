# API cho `/director/campaign-intelligence`

Tài liệu này mô tả contract dữ liệu cho màn **Campaign Intelligence** của Director. Màn hình dùng cùng component với `/marketing`, nhưng route Director là entry point chính cho việc theo dõi chi phí, lead đủ điều kiện, hồ sơ, nhập học và doanh thu đã xác nhận.

## 1. Phạm vi màn hình

| Vùng UI | Field | Cách sử dụng |
|---|---|---|
| Header | thời gian, kênh, campus | Hiển thị context của snapshot; hiện frontend còn hard-code và chưa gửi query |
| Recommendation banner | `recommendation` | Khuyến nghị tái phân bổ, tác động ước tính và độ tin cậy |
| KPI strip | `summary` | Ngân sách, qualified leads, hồ sơ, nhập học, doanh thu xác nhận, ROAS |
| Performance trend | `trend[]` | Hai đường chi phí và doanh thu xác nhận theo kỳ |
| Full funnel | `funnel[]` | Số lượng và tỷ lệ chuyển tiếp qua từng giai đoạn |
| Campaign table | `campaigns[]` | Chi phí, qualified, nhập học, doanh thu, ROAS và trạng thái từng campaign |
| Channel mix | `campaigns[]` | Donut doanh thu xác nhận theo kênh; frontend tính tỷ trọng từ danh sách campaign |

Nguồn tham chiếu trực tiếp:

- [page.tsx](../../src/app/(with-layouts)/(dashboard)/director/campaign-intelligence/page.tsx)
- [campaign-intelligence-dashboard.tsx](../../src/app/(with-layouts)/(dashboard)/marketing/_component/campaign-intelligence/campaign-intelligence-dashboard.tsx)
- [types.ts](../../src/services/api/campaign-intelligence/types.ts)
- [data.ts](../../src/services/api/campaign-intelligence/data.ts)
- [mock-data.json](../../src/services/api/campaign-intelligence/mock-data.json)

## 2. Tình trạng tích hợp hiện tại

Service `getCampaignIntelligence()` hiện chỉ đọc fixture local `campaignIntelligenceMock` và thêm delay mô phỏng. Chưa có client gọi Frappe thật, chưa có query parameters và các nút chọn thời gian/kênh/campus chỉ hiển thị toast.

Fixture hiện tại chỉ phục vụ bố cục UI; trước khi dùng production cần đối soát lại aggregate `summary`/`funnel` với danh sách `campaigns[]` theo các invariant ở mục 8.

Mock HTTP route:

```http
GET /api/mock/campaign-intelligence
```

Response mock trả trực tiếp object `{ generatedAt, summary, trend, funnel, campaigns, recommendation }`, không bọc trong `message`. Khi kết nối Frappe, frontend cần hỗ trợ envelope chuẩn bên dưới và không fallback im lặng về fixture khi request production lỗi.

## 3. Endpoint production và quyền truy cập

Endpoint production đề xuất:

```http
GET {NEXT_PUBLIC_FRAPPE_URL}/api/method/crm.api.director_campaign_intelligence.get_director_campaign_intelligence
Cookie: sid=<Frappe session cookie>
Accept: application/json
```

Frappe bọc response thành công trong `message`. Endpoint chỉ trả aggregate theo campaign/kênh, không trả tên, email, số điện thoại hoặc PII của học sinh.

Quyền tối thiểu:

- profile nghiệp vụ `Admissions Director` hoặc role marketing được cấp quyền;
- `Administrator`/`System Manager` có quyền phù hợp;
- `scope`, `campus` và các campaign trong response phải nằm trong phạm vi user được cấp.

Không để client tự mở rộng scope bằng cách sửa query string. Backend phải resolve scope trước khi tổng hợp metric.

## 4. Request

Ví dụ:

```http
GET /api/method/crm.api.director_campaign_intelligence.get_director_campaign_intelligence?admissionYear=2026&from=2026-04-01&to=2026-04-30&granularity=week&channel=all&campus=all&scope=all
```

### Query parameters

| Tên | Kiểu | Bắt buộc | Mặc định | Ràng buộc / mô tả |
|---|---|---:|---|---|
| `admissionYear` | integer | Không | Kỳ active duy nhất | Năm 4 chữ số trong `2000..2100` |
| `from` | date `YYYY-MM-DD` | Không | Đầu kỳ active | Bao gồm ngày bắt đầu, theo timezone của response |
| `to` | date `YYYY-MM-DD` | Không | Cuối kỳ active | Bao gồm ngày kết thúc; không được nhỏ hơn `from` |
| `granularity` | enum | Không | `week` | `day`, `week`, `month`; không dùng `day` cho khoảng quá dài nếu vượt giới hạn backend |
| `channel` | string | Không | `all` | `all` hoặc mã `CAMPAIGN_CHANNELS` được phép |
| `campus` | string | Không | `all` | `all` hoặc campus ID được phép |
| `scope` | string | Không | `all` | Scope Director/territory được cấp quyền |

Các filter áp dụng đồng thời cho `summary`, `trend`, `funnel`, `campaigns` và `recommendation`. Tất cả section phải được tạo từ cùng một snapshot, cùng timezone và cùng tập bản ghi đã deduplicate.

Nếu không truyền `admissionYear`, backend chỉ được tự chọn kỳ khi có đúng một kỳ active. Nếu không xác định được kỳ, trả `422 INVALID_ADMISSION_YEAR`.

## 5. Response `200 OK`

Shape Frappe:

```text
{
  message: CampaignIntelligenceResponse
}
```

Ví dụ response:

```json
{
  "message": {
    "generatedAt": "2026-08-29T09:30:00.000Z",
    "summary": {
      "spend": 1250000000,
      "qualifiedLeads": 1125,
      "applications": 312,
      "enrollments": 78,
      "confirmedRevenue": 4620000000,
      "roas": 3.7
    },
    "trend": [
      { "label": "Tuần 1", "spend": 270000000, "confirmedRevenue": 840000000 },
      { "label": "Tuần 2", "spend": 310000000, "confirmedRevenue": 1030000000 }
    ],
    "funnel": [
      { "label": "Impressions", "count": 3645210 },
      { "label": "Clicks", "count": 68432, "conversionRate": 1.88 },
      { "label": "Landing visits", "count": 42168, "conversionRate": 61.62 },
      { "label": "Leads", "count": 4062, "conversionRate": 9.63 },
      { "label": "Qualified", "count": 1125, "conversionRate": 27.7 },
      { "label": "Applications", "count": 312, "conversionRate": 27.73 },
      { "label": "Enrollments", "count": 78, "conversionRate": 25 }
    ],
    "campaigns": [
      {
        "id": "school-event",
        "name": "School Event — Khối 12",
        "channel": "School Event",
        "spend": 180000000,
        "qualifiedLeads": 168,
        "applications": 67,
        "enrollments": 22,
        "confirmedRevenue": 1320000000,
        "pipelineRevenue": 360000000,
        "roas": 7.33,
        "cpql": 1071429,
        "enrollmentRate": 13.1,
        "attributionConfidence": "high",
        "health": "on_track"
      }
    ],
    "recommendation": {
      "title": "Chuyển 15% ngân sách từ TikTok sang School Event",
      "impact": 192000000,
      "confidence": "high",
      "evidence": [
        "School Event có ROAS 7,33x, cao gấp 6,1 lần TikTok.",
        "Tỷ lệ Enrollment của School Event đạt 13,1%; TikTok là 4,37%."
      ]
    }
  }
}
```

Response production phải trả đầy đủ các campaign thuộc filter; không phân trang `campaigns[]` nếu frontend còn dùng chính danh sách này để tính Channel Mix. Nếu backend cần giới hạn danh sách, phải bổ sung metadata tổng số và một endpoint riêng cho channel mix, không để tổng doanh thu trên chart bị thiếu.

## 6. Schema và semantics

### 6.1. `generatedAt`

- ISO-8601 có timezone hoặc offset; đây là thời điểm tạo snapshot, không phải thời điểm campaign cuối cùng cập nhật.
- Backend nên trả thêm `meta` trong phiên bản contract tiếp theo với `admissionYear`, `from`, `to`, `granularity`, `timezone`, `scope`, `status` và `warnings` để frontend hiển thị đúng context.
- Nếu chưa thêm `meta`, `generatedAt` vẫn phải có và các query đã dùng phải được ghi log để audit.

### 6.2. `summary`

| Field | Kiểu | Semantics |
|---|---|---|
| `spend` | non-negative number | Tổng chi phí trong kỳ, đơn vị tiền tệ thống nhất; fixture dùng VND |
| `qualifiedLeads` | non-negative integer | Số lead đủ điều kiện sau deduplicate |
| `applications` | non-negative integer | Số hồ sơ đăng ký canonical |
| `enrollments` | non-negative integer | Số enrollment đã xác nhận/đối soát |
| `confirmedRevenue` | non-negative number | Doanh thu từ enrollment đã xác nhận; không cộng pipeline |
| `roas` | number \| null | `confirmedRevenue / spend`; `null` khi spend bằng 0 |

Các số tiền trong JSON là số nguyên/số thực, không phải chuỗi đã format. Frontend mới chịu trách nhiệm format `đ`, `tr`, `tỷ`.

`summary` là aggregate canonical của toàn bộ filter. Không tự cộng lại từ `campaigns[]` nếu backend công bố danh sách là một subset; trong contract hiện tại, `campaigns[]` phải là đầy đủ để Channel Mix không sai denominator.

### 6.3. `trend[]`

```typescript
type CampaignTrendPoint = {
  label: string;
  spend: number;
  confirmedRevenue: number;
};
```

- `label` phải giữ thứ tự thời gian tăng dần và tương ứng với `granularity`.
- `spend` và `confirmedRevenue` dùng cùng kỳ, cùng currency và cùng scope.
- Không trả `0` để giả lập kỳ chưa có dữ liệu; nếu một metric thật sự unavailable, schema production nên mở rộng thành `number | null` và thêm warning.
- `confirmedRevenue` chỉ ghi nhận revenue đã đối soát, không dùng `pipelineRevenue` để vẽ đường doanh thu.

### 6.4. `funnel[]`

```typescript
type CampaignFunnelStage = {
  label: string;
  count: number;
  conversionRate?: number;
};
```

Funnel mặc định gồm các stage theo thứ tự:

```text
Impressions → Clicks → Landing visits → Leads → Qualified → Applications → Enrollments
```

- `count` là số event/bản ghi unique theo stage và snapshot.
- `conversionRate` của stage đầu có thể bỏ qua hoặc trả `100`; các stage sau là tỷ lệ chuyển từ stage ngay trước đó.
- Denominator phải được giữ nhất quán; không trộn impressions theo ad platform với enrollments của một scope khác.
- Nếu funnel không phải pipeline lồng nhau, backend phải đặt tên/metadata rõ là lifecycle counts để UI không diễn giải thành tỷ lệ rơi tuần tự.
- Array rỗng là response hợp lệ khi nguồn funnel chưa có dữ liệu, nhưng phải kèm trạng thái/warning trong phiên bản response có `meta`.

### 6.5. `campaigns[]`

```typescript
type CampaignRecord = {
  id: string;
  name: string;
  channel: string;
  spend: number;
  qualifiedLeads: number;
  applications: number;
  enrollments: number;
  confirmedRevenue: number;
  pipelineRevenue: number;
  roas: number;
  cpql: number;
  enrollmentRate: number;
  attributionConfidence: "high" | "medium" | "low";
  health: "on_track" | "watch" | "reallocate";
};
```

| Field | Quy tắc |
|---|---|
| `id` | ID campaign ổn định, không dùng label làm khóa |
| `name` | Tên campaign để hiển thị |
| `channel` | Tên/mã kênh canonical từ `CAMPAIGN_CHANNELS` |
| `spend` | Chi phí đã ghi nhận trong khoảng lọc |
| `qualifiedLeads` | Lead đủ điều kiện, unique theo định danh canonical |
| `applications` | Hồ sơ đăng ký của campaign theo attribution model đã công bố |
| `enrollments` | Enrollment đã xác nhận và được attribution cho campaign |
| `confirmedRevenue` | Revenue đã đối soát từ enrollment; không bao gồm pipeline |
| `pipelineRevenue` | Revenue dự kiến/chưa đối soát; không dùng tính ROAS |
| `roas` | `confirmedRevenue / spend`; trả `null` nếu spend bằng 0 trong contract production |
| `cpql` | `spend / qualifiedLeads`; trả `null` nếu qualified leads bằng 0 |
| `enrollmentRate` | `enrollments / qualifiedLeads * 100`; không phải `enrollments / applications` trong fixture hiện tại |
| `attributionConfidence` | Độ tin cậy của lineage/attribution: `high`, `medium`, `low` |
| `health` | Rule backend: `on_track`, `watch`, `reallocate`; phải có tài liệu rule và threshold |

`roas`, `cpql` và `enrollmentRate` là metric không cộng được. Không tính các metric này từ tổng các campaign nếu denominator đã bị deduplicate khác nhau.

### 6.6. `recommendation`

| Field | Kiểu | Semantics |
|---|---|---|
| `title` | string | Hành động ngắn gọn, có nguồn chuyển và nguồn nhận nếu là reallocation |
| `impact` | number \| null | Doanh thu xác nhận tăng thêm ước tính, cùng currency với `confirmedRevenue` |
| `confidence` | `high \| medium \| low` | Độ tin cậy của khuyến nghị; không mặc định `high` ở frontend |
| `evidence` | string[] | Các luận cứ đã format; không đưa PII |

`impact` phải có horizon và phương pháp ước tính ở metadata hoặc tài liệu model. UI hiện hiển thị cố định “trong 30 ngày tiếp theo”; nếu horizon thay đổi, backend cần trả thêm `impactHorizonDays`.

## 7. Nguồn dữ liệu và quy tắc tổng hợp

- Campaign và channel: `CAMPAIGNS`, `CAMPAIGN_CHANNELS`.
- Impressions, clicks, landing visits, leads, qualified leads, spend và revenue theo kỳ: `CAMPAIGN_PERFORMANCE_PERIODS`.
- Funnel stage: `CAMPAIGN_FUNNEL_METRICS`.
- Attribution: `CAMPAIGN_ATTRIBUTIONS` cùng `attribution_model`, `attribution_weight` và thời điểm touchpoint.
- Applications/enrollment: `ADMISSION_APPLICATIONS`; chỉ enrollment đã xác nhận mới vào `enrollments` và `confirmedRevenue`.
- Revenue phải cùng currency và được quy đổi trước khi aggregate nếu có nhiều currency.
- Dedupe theo student/contact canonical trước khi đếm lead, application và enrollment.
- Offline/referral/school event vẫn phải giữ như channel hợp lệ; không loại vì không có spend quảng cáo.
- Không trả PII ở aggregate endpoint.

## 8. Tính nhất quán cần kiểm tra

Backend phải bảo đảm trong cùng snapshot:

```text
summary.spend = tổng spend của campaigns[]
summary.confirmedRevenue = tổng confirmedRevenue của campaigns[]
summary.qualifiedLeads = tổng qualifiedLeads của campaigns[]
summary.applications = tổng applications của campaigns[]
summary.enrollments = tổng enrollments của campaigns[]
summary.roas = summary.confirmedRevenue / summary.spend
```

Các invariant trên chỉ áp dụng khi `campaigns[]` là full result của filter. Nếu attribution cho phép một record thuộc nhiều campaign, backend phải công bố quy tắc fractional attribution và không được gọi tổng đó là số unique toàn scope.

## 9. Việc backend cần làm để khớp UI

1. Cung cấp method production với query `admissionYear`, `from`, `to`, `granularity`, `channel`, `campus` và `scope`.
2. Trả Frappe envelope `{ message: ... }`, `generatedAt` ISO-8601 và thêm `meta` gồm filter, timezone, status, source revision và warnings.
3. Tổng hợp tất cả section từ cùng snapshot; không trộn kỳ hoặc denominator.
4. Trả `campaigns[]` đầy đủ nếu frontend tiếp tục tính Channel Mix từ danh sách campaign.
5. Công bố attribution model, quy tắc dedupe và threshold của `attributionConfidence`/`health`.
6. Trả `null` thay vì `0` cho ROAS/CPQL/rate khi denominator bằng 0 hoặc metric unavailable; cập nhật TypeScript type tương ứng.
7. Trả recommendation kèm horizon của `impact`, confidence thực tế và evidence có thể audit.
8. Nối các control thời gian/kênh/campus ở `CampaignHeader` vào query API; không để UI hiển thị filter nhưng dữ liệu không đổi.
9. Nối các phần trăm “kỳ trước” trong KPI vào response canonical; hiện các giá trị change còn hard-code ở frontend.
10. Dùng `recommendation.confidence` để render badge; hiện UI đang cố định nhãn “Độ tin cậy cao”.

## 10. Error contract

```json
{
  "error": {
    "code": "CAMPAIGN_INTELLIGENCE_DATA_UNAVAILABLE",
    "message": "Không thể tải dữ liệu campaign intelligence.",
    "details": {}
  }
}
```

Khuyến nghị status:

| HTTP | Code | Khi nào |
|---:|---|---|
| `400` | `INVALID_QUERY` | `granularity`, channel, campus, date hoặc scope không hợp lệ |
| `401` | `UNAUTHENTICATED` | Session không hợp lệ hoặc user chưa đăng nhập |
| `403` | `FORBIDDEN` | Không có quyền Director/Marketing hoặc vượt scope |
| `422` | `INVALID_ADMISSION_YEAR` / `INVALID_DATE_RANGE` | Kỳ tuyển sinh hoặc khoảng ngày không hợp lệ |
| `502` | `INVALID_CAMPAIGN_RESPONSE` | Upstream trả thiếu field bắt buộc hoặc sai kiểu |
| `503` | `CAMPAIGN_INTELLIGENCE_DATA_UNAVAILABLE` | Không đọc được nguồn aggregate chính |

Frontend hiện hiển thị trạng thái lỗi chung “Không thể tải dữ liệu campaign”. Backend nên giữ `error.code` ổn định để sau này UI phân biệt lỗi quyền, query và nguồn dữ liệu.
