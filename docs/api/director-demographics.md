# Director demographics — Contact overview + Acquisition Map

## Phạm vi

API này phục vụ route `/director/demographics`. `docs/student-group` là nguồn chuẩn về ý nghĩa metric và các điều kiện để được phép vẽ biểu đồ.

Route được chia thành hai lớp:

1. **Contact overview**: dùng dữ liệu Contact/student 360 hiện có để giúp giám đốc nhìn quy mô, hành trình, nhóm ưu tiên, nhu cầu theo ngành × địa bàn và độ đầy đủ dữ liệu.
2. **Acquisition Map**: lớp mở rộng cho 24 biểu đồ về nguồn, form, chất lượng lead, attribution, cohort, handoff và cost. Chỉ trả các metric khi backend có đủ event/lineage/cost tương ứng.

Overview không dồn 24 biểu đồ vào một màn hình dài. UI hiện tại có phần Contact summary, sau đó chia Acquisition Map thành 5 tab: Nguồn & ngân sách, Form, Chất lượng, Attribution, Cohort & vận hành. Chart mặc định xếp 2 card/hàng; list/ranking là một hàng ngang có scroll khi cần; heatmap, cohort matrix và cost ranking dùng full-width.

Trong giai đoạn chốt UX, 24 chart đang dùng dữ liệu trình diễn độc lập trong frontend để kiểm tra bố cục. Khi API sẵn sàng, thay các dataset demo bằng `data.acquisitionMap` hoặc endpoint tương ứng; không dùng số trình diễn làm dữ liệu production.

## Endpoint

```http
GET /api/method/crm.api.director_demographics.get_director_demographics_overview
GET /api/method/crm.api.director_demographics.get_director_demographics_segment
```

Frappe bọc payload trong `message`:

```json
{
  "message": {
    "data": {},
    "meta": {}
  }
}
```

Trong môi trường không có `NEXT_PUBLIC_FRAPPE_URL`, frontend dùng fixture local làm fallback. Fallback chỉ để kiểm tra UI, không phải nguồn dữ liệu production.

## Query parameters — overview

| Parameter | Type | Default | Ý nghĩa |
|---|---|---:|---|
| `admissionYear` | number | `2026` | Kỳ tuyển sinh |
| `period` | `season \| 6m \| 12m` | `season` | Khoảng báo cáo. Trục thời gian phải dùng school-year/corresponding week khi dữ liệu có ngày thực. |
| `scope` | string | `all` | Phạm vi tổng quát |
| `province` | string | — | Lọc `student.province` |
| `major` | string | — | Lọc `student.major` |
| `stage` | string | — | `Quan tâm`, `Tìm hiểu`, `Tư vấn`, `Ứng tuyển`, `Nhập học` |
| `priority` | string | — | `Cao`, `Trung bình`, `Thấp` |
| `owner` | string | — | Owner/counselor của Contact |
| `sourceGroup` | string | — | Nhóm nguồn **first-touch** đã chuẩn hóa |

Giá trị `all`, chuỗi rỗng hoặc không truyền được xem là không lọc. Các filter áp dụng đồng thời cho toàn bộ response, cùng một snapshot và cùng một denominator.

Filter được nhập trong popover của UI nhưng vẫn gửi bằng query params để API có thể cache theo đúng bộ lọc. Backend không nên âm thầm bỏ qua filter chưa hỗ trợ; nếu chưa hỗ trợ, trả lỗi contract rõ ràng hoặc trả `meta.unsupportedFilters`.

## Mapping dữ liệu Contact

| Dimension | Nguồn tối thiểu |
|---|---|
| Contact | `StudentListItem.id`, `name`, `code`, `school`, `province`, `major` |
| Hành trình | `StudentListItem.stage` và timestamp chuyển stage nếu có |
| Chất lượng | `Student360Data.classification.dimensions.interest`, `fit`, `barrier` |
| Ưu tiên | `StudentListItem.priority` |
| Tín hiệu | `StudentListItem.score` |
| First touch | acquisition lineage đã resolve identity; không suy diễn tùy tiện từ last activity |
| Nhóm nguồn | `Student360Data.acquisition.sourceGroup` |
| Hành động | `nextAction`, `owner`, `lastActivity` |
| Ứng tuyển/nhập học | event hoặc stage canonical; `Nhập học` mới được tính enrolled |

Không suy diễn gender, học phí, revenue, spend, ROAS, thu nhập hay thuộc tính nhạy cảm từ dữ liệu Contact không có field canonical.

## Response contract — overview

### `data.kpis`

UI hiển thị bốn KPI dạng strip. Đây là **mảng**, không phải object map:

```json
[
  {
    "id": "prospects",
    "label": "Tổng hồ sơ",
    "value": "2.846",
    "change": "+12,6%",
    "helper": "so với cùng kỳ",
    "progress": 86,
    "tone": "primary"
  },
  {
    "id": "engaged",
    "label": "Đã tương tác",
    "value": "1.420",
    "change": "—",
    "helper": "49,9% tổng hồ sơ",
    "progress": 50,
    "tone": "info"
  }
]
```

`change` là chuỗi đã format hoặc `"—"`. Không hiển thị mũi tên tăng khi change là `"—"`, bằng 0 hoặc không có denominator hợp lệ. `progress` là số 0–100 dùng cho mức hoàn thành/coverage do backend định nghĩa; không dùng nó như tỷ lệ chuyển đổi nếu chưa ghi rõ.

### `data.demand`

Đây là chart duy nhất ở overview được dùng cho xu hướng theo kỳ. Mọi giá trị không có dữ liệu phải là `null`, không được trả `0` để giả lập lịch sử.

```json
{
  "trend": [
    { "month": "T1", "ai": 2160, "software": 2860, "business": 2520, "design": 1280 },
    { "month": "T2", "ai": null, "software": null, "business": null, "design": null }
  ],
  "summary": [
    { "id": "ai", "label": "AI", "value": 2160, "change": null },
    { "id": "software", "label": "Phần mềm", "value": 2860, "change": 4.7 }
  ]
}
```

- `value` là số Contact/hồ sơ theo kỳ; `change` là phần trăm so với kỳ tương ứng, nullable.
- Nếu chỉ có dữ liệu ở kỳ gần nhất, trả các kỳ trước là `null` hoặc `trendStatus: "partial"`; UI phải cảnh báo “chưa đủ dữ liệu so sánh”.
- Không hardcode domain trục Y theo fixture. Domain phải lấy theo max thực tế.
- Nếu backend muốn dùng metric khác count, phải trả thêm `metric`/`unit` và label trên chart.

### `data.audienceComposition`

Card này không còn dùng pie chart. UI hiển thị một thanh phân đoạn giới tính và các dòng tín hiệu hồ sơ.

```json
{
  "total": 2846,
  "gender": [
    { "id": "female", "name": "Nữ", "value": 46.8 },
    { "id": "male", "name": "Nam", "value": 51.6 },
    { "id": "unknown", "name": "Chưa xác định", "value": 1.6 }
  ],
  "profiles": [
    { "id": "has-interest", "label": "Đã có ngành quan tâm", "value": 88.1, "count": 2507, "detail": "2.507 hồ sơ" }
  ]
}
```

Các phần trăm phải cùng denominator là `total`; cho phép sai số làm tròn nhỏ nhưng tổng canonical phải được xác định. Không trả gender nếu đó là thuộc tính không có consent/canonical field.

### `data.segments`

UI hiển thị bảng xếp hạng thay cho bar chart. Mỗi dòng cần đủ số tuyệt đối để đối chiếu trên một dòng:

```json
[
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
    "conversion": 2.0,
    "tuition": null,
    "revenue": null,
    "growth": 31.0,
    "coverage": 3.2,
    "opportunityScore": 92,
    "tone": "primary",
    "filters": [],
    "channels": [],
    "channelAttributionModel": "observed-interactions",
    "monthlyProspects": []
  }
]
```

Quy tắc:

- `conversion`, `growth`, `tuition`, `revenue` có thể `null`. `null` nghĩa là không đủ mẫu/không có nguồn canonical, không phải 0.
- Nếu trả pipeline Contact → enrollment, các stage phải có định nghĩa và không được tăng ngược ở các bước kế tiếp. Nếu stage không phải funnel lồng nhau, đặt tên “lifecycle counts” và UI không được gọi là funnel.
- `opportunityScore` phải có công thức/phiên bản trong API docs. Không mô tả là kết hợp quy mô + conversion + growth nếu backend chỉ tính từ quy mô.
- `coverage` là phần trăm Contact đã có dữ liệu cần cho phân tích, không phải tỷ lệ tiếp cận nếu chưa định nghĩa.
- `channels` chỉ được gọi là first-touch/last-touch khi `channelAttributionModel` tương ứng. Nếu backend chỉ đếm mọi interaction, trả `observed-interactions` và UI sẽ không gắn nhãn first touch.

### `data.regionalDemand`

Heatmap đã được tách thành card full-width để hiển thị đủ địa bàn. Contract ưu tiên là count:

```json
{
  "metric": "count",
  "unit": "contacts",
  "columns": [
    { "id": "can-tho", "name": "Cần Thơ" },
    { "id": "hcm", "name": "TP.HCM" },
    { "id": "ha-noi", "name": "Hà Nội" }
  ],
  "rows": [
    {
      "interest": "Trí tuệ nhân tạo",
      "values": { "can-tho": 42, "hcm": 118, "ha-noi": 96 }
    }
  ]
}
```

Contract legacy `scores` chỉ được dùng khi:

```json
{
  "metric": "relative-index",
  "unit": "score",
  "rows": [{ "interest": "Trí tuệ nhân tạo", "scores": { "hcm": 93 } }]
}
```

Nếu là `relative-index`, UI phải ghi rõ “chỉ số tương đối, không phải số hồ sơ”. Không gọi điểm chuẩn hóa là quy mô Contact. Cell không có dữ liệu trả `null`, không trả 0.

### `data.dataCoverage`

```json
[
  {
    "label": "Thông tin học sinh",
    "detail": "Giới tính, khối, tuổi, học lực",
    "value": 24.7,
    "tone": "warning"
  }
]
```

`tone` phải khớp value: 0 là `danger`, dưới 50 là `warning`, từ 50 trở lên mới có thể `success` nếu dữ liệu đạt tiêu chuẩn. Không trả 24.7 nhưng gắn `success`.

### `data.filterOptions`

Options phục vụ các select bên trong filter popover. Nếu không có, frontend chỉ dùng fallback UI và backend vẫn phải validate giá trị thực tế.

```json
{
  "provinces": ["Cần Thơ", "Đà Nẵng", "Hà Nội"],
  "majors": ["Kỹ thuật phần mềm", "Trí tuệ nhân tạo"],
  "stages": ["Quan tâm", "Tìm hiểu", "Tư vấn", "Ứng tuyển", "Nhập học"],
  "priorities": ["Cao", "Trung bình", "Thấp"],
  "owners": ["Trần Minh Quân"],
  "sourceGroups": ["Trực tuyến chủ động", "Thực địa"]
}
```

### `meta`

```json
{
  "admissionYear": 2026,
  "period": "season",
  "scope": "all",
  "asOf": "2026-06-06T10:00:00+07:00",
  "totalProspects": 2846,
  "minSampleSize": 30,
  "dataAvailability": {
    "trend": "partial",
    "tuition": false,
    "revenue": false,
    "eligibleSegments": 5
  }
}
```

`dataAvailability.trend` có thể là boolean legacy hoặc `complete | partial | unavailable`. `partial` phải khiến UI hiện cảnh báo; không biến thiếu lịch sử thành đường xu hướng bằng 0.

## Response contract — segment detail

```http
GET ...get_director_demographics_segment?segment_id=female-ai-dong-nai&admissionYear=2026
```

```json
{
  "message": {
    "data": {
      "segment": {},
      "benchmark": {},
      "regionOpportunities": [],
      "nextAction": {
        "priority": "high",
        "label": "Nên làm ngay",
        "title": "...",
        "description": "...",
        "steps": []
      },
      "guardrails": []
    },
    "meta": {
      "admissionYear": 2026,
      "asOf": "2026-06-06T10:00:00+07:00",
      "minSampleSize": 30,
      "sampleSize": 3420
    }
  }
}
```

- `benchmark` phải là nhóm đối chiếu thực trong **cùng snapshot, cùng filter và cùng denominator**. Không để frontend chọn benchmark từ fixture local.
- `guardrails` luôn là array. Khi không có cảnh báo, trả `[]`.
- Trend detail dùng `monthlyProspects[].current` và `.benchmark`; điểm không có dữ liệu là `null`.
- Khi `growth` null, UI hiển thị “Chưa đủ dữ liệu tăng trưởng”, không hiển thị `+null%`.
- `segment` và `benchmark` không có tuition/revenue thì trả `null`; không ép thành 0.

## Acquisition Map — phần mở rộng theo `docs/student-group`

Các field dưới đây chưa được render trong Contact overview hiện tại. Backend có thể đưa vào namespace `data.acquisitionMap` hoặc endpoint riêng, nhưng phải giữ cùng `admissionYear`, filter, snapshot và định nghĩa denominator.

### A. Platform và cost

| Chart / dạng UI | Field tối thiểu | Điều kiện |
|---|---|---|
| 1. Lead & cost/platform — combo bar + line | `platformLeadCost[]` | `platform`, `leads`, `validLeads`, `spend`, `cplValidLead`; hai trục phải có label rõ |
| 2. Lead trend current vs same season — slope comparison | `leadTrendComparison[]` | school-year/corresponding week, không so Gregorian week lệch mùa |
| 3. Daily spend & leads — hai sparkline | `dailySpendLeads[]` | chỉ đọc volume/spend, không dùng để kết luận chất lượng |
| 4. Touchpoint × platform × lead — heatmap full-width | `touchpointPlatformMatrix` | có touchpoint event; cell `< 10` phải null/ẩn theo docs |
| 5. Budget by platform role — 100% stacked strip | `budgetByPlatformRole[]` | bốn role không chồng lấn và tổng phải cover 100% budget |

### B. Form

| Chart / dạng UI | Field tối thiểu | Điều kiện |
|---|---|---|
| 6. Form funnel — progress funnel ngang | `formFunnel[]` | `impression`, `form_open`, `form_complete`, `valid_lead`, `handoff`; trả count + retention từng bước |
| 7. Completion rate by form — dot plot | `formCompletion[]` | chỉ so form cùng mục đích, trả form id/name và denominator |
| 8. Dropoff by field — Pareto | `formDropoffByField[]` | chỉ trả khi có field-level event tracking; thiếu event thì omit/null, không suy diễn |
| 9. Embedded vs landing page — dumbbell | `captureModeComparison[]` | cùng campaign và cùng khoảng thời gian |

Form tối thiểu theo docs: name, phone, high school, major, grade và consent. Consent cần timestamp/purpose; dữ liệu dưới 18 tuổi phải có policy phù hợp.

### C. Chất lượng lead và identity

| Chart / dạng UI | Field tối thiểu | Điều kiện |
|---|---|---|
| 10. Classification by source — 100% stacked strip | `leadQualityBySource[]` | valid, needs enrichment, invalid, out-of-scope, duplicate là các class rõ ràng; duplicate giữ riêng |
| 11. Valid rate by time — multi-line | `validLeadRateTrend[]` | tối đa 4–5 source lines, áp dụng min sample |
| 12. Handoff completeness — bullet list | `handoffDataCompleteness[]` | denominator chỉ là lead đã handoff |
| 13. Identity match mechanism — ranking list | `identityMatchBreakdown[]` | các mechanism phải cộng đủ số record, có confidence/queue nếu applicable |

Identity cần normalize phone/email/name/school, stable id, confidence matching queue, audit split/merge, consent và season key.

### D. Attribution

| Chart / dạng UI | Field tối thiểu | Điều kiện |
|---|---|---|
| 14–15. First/last touch — một ranking có toggle | `firstTouchBySource[]`, `lastTouchBySource[]` | model ghi rõ `first-touch`/`last-touch`; cùng lead set |
| 16. First vs last — dumbbell | `firstVsLastSource[]` | đây là chart duy nhất được đặt hai model cạnh nhau; phải có delta |
| 17. First → last flow — flow list/Sankey | `attributionFlow[]` | chỉ trả khi touchpoint sequence complete |

Offline source phải được giữ như event/school/referral; không ép thành online platform. Response phải chứa `attributionModel` trên chart hoặc dataset.

### E. Cohort và lag

| Chart / dạng UI | Field tối thiểu | Điều kiện |
|---|---|---|
| 18. Cohort enrollment matrix — heatmap full-width | `cohortEnrollmentMatrix[]` | cohort gần đây chưa đủ thời gian phải null, không phải 0 |
| 19. Lag histogram — histogram + median | `enrollmentLagHistogram` | chỉ enrolled; có `medianDays` và line median |
| 20. Cumulative conversion — step-area | `cumulativeConversion[]` | chỉ vẽ khi có ít nhất một complete season |

### F. Handoff vận hành

| Chart / dạng UI | Field tối thiểu | Điều kiện |
|---|---|---|
| 21. Time to first contact — box plot | `firstContactLatency[]` | median theo submit window; outlier không làm méo chart |
| 22. Submission timing — calendar heatmap | `submissionTiming` | weekday × local hour, timezone phải trả rõ |
| 23. Handoff success/source — bullet list | `handoffSuccessBySource[]` | success = contacted + confirmed, không chỉ là moved to team |
| 24. Cost per enrolled — ranking list full-width | `costPerEnrolledBySource[]` | chỉ complete season; luôn giữ source miễn phí |

## Quy tắc chung cho API

- Rate, conversion, cost per head là non-additive; không dùng stacked/part-of-whole nếu metric không phải thành phần cộng được.
- Rate cần tối thiểu `minSampleSize` (mặc định 30). Dưới ngưỡng trả `null` và `reason: "below_min_sample"` nếu có thể.
- `null` dùng cho unavailable, denominator bằng 0, cohort gần đây hoặc event chưa được tracking. Chỉ dùng 0 khi đã quan sát canonical rằng giá trị thực bằng 0.
- Mọi metric phải có denominator và snapshot. Không trộn current với benchmark khác kỳ.
- Có `asOf` ISO-8601 kèm timezone; dùng school-year timeline cho tuyển sinh.
- Không trả PII trong aggregate endpoint. Segment detail vẫn phải tuân privacy/under-18/consent.
- Nguồn phải bao gồm offline/referral nếu có; không bỏ chúng chỉ vì không có spend.
- Empty dataset trả schema hợp lệ với array rỗng/null và lý do; không làm frontend rơi vào fixture giả mà không báo.

## Việc backend cần làm để khớp UI hiện tại

1. Hỗ trợ filter `province`, `major`, `stage`, `priority`, `owner`, `sourceGroup` cùng với `period`/`admissionYear`.
2. Trả `data.kpis` là array đúng schema, không trả object `totalContacts/highIntentContacts/...` thay thế.
3. Trả trend thiếu dữ liệu là `null` và `meta.dataAvailability.trend = partial/unavailable`, không điền 0 cho các kỳ chưa có record.
4. Trả `conversion`/`growth` nullable; không tạo phần trăm từ denominator 0.
5. Giữ pipeline stage không tăng ngược nếu UI gọi là funnel; nếu là lifecycle counts, đổi `metricName`/label để UI không diễn giải sai.
6. Trả regional demand bằng `values` + `metric: count` cho số Contact. Chỉ trả `scores` khi thật sự là relative index.
7. Trả `channelAttributionModel`; chỉ đặt `first-touch` khi có acquisition lineage đã resolve.
8. Tính tone coverage theo value và trả `filterOptions` từ dữ liệu thật.
9. Segment detail trả benchmark cùng snapshot/filter, `guardrails: []` khi rỗng và không phụ thuộc fixture frontend.
10. Bổ sung namespace/endpoint Acquisition Map theo các bảng A–F khi đã có event, identity, handoff, cost và enrollment canonical.

## Error contract

```json
{
  "error": {
    "code": "CONTACT_DEMOGRAPHICS_DATA_UNAVAILABLE",
    "message": "Không thể tải dữ liệu Contact demographics.",
    "details": {}
  }
}
```

Khuyến nghị status:

- `400`: query/filter không hợp lệ;
- `404`: `SEGMENT_NOT_FOUND` cho segment id không tồn tại;
- `502`: upstream schema không hợp lệ;
- `503`: dữ liệu aggregate tạm thời unavailable.

Frontend dùng `INVALID_DEMOGRAPHICS_RESPONSE` khi response 2xx thiếu field bắt buộc của contract này.
