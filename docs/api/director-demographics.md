# Director demographics API

API tổng hợp dữ liệu học sinh cho Director dashboard. Backend hiện tại không trả danh tính cá nhân, không hỗ trợ bộ lọc theo thuộc tính học sinh, phân trang hoặc Acquisition Map.

## Endpoints

```http
GET /api/method/crm.api.director_demographics.get_director_demographics_overview
GET /api/method/crm.api.director_demographics.get_director_demographics_segment
```

Frappe bọc kết quả trong `message`:

```json
{ "message": { "data": {}, "meta": {} } }
```

## Overview

```http
GET ...get_director_demographics_overview?admissionYear=2026&period=6m&scope=all
```

| Query parameter | Kiểu / mặc định | Quy tắc thực tế |
| --- | --- | --- |
| `admissionYear` | `string \| number`, mặc định do backend resolve | Chỉ lấy `CRM Student` của kỳ tuyển sinh đã resolve. |
| `period` | `6m` (mặc định), `12m`, hoặc `season` | Xác định 6 hoặc 12 cửa sổ tháng tính đến tháng hiện tại; `season` hiện cũng là 12 tháng. Giá trị khác trả `400 INVALID_PERIOD`. |
| `scope` | `all` | Giá trị duy nhất được hỗ trợ. Giá trị khác trả `400 INVALID_SCOPE`. |

`page`, `pageSize`, `province`, `major`, `stage`, `priority`, `owner` và `sourceGroup` **không thuộc contract backend hiện tại**. Không dựa vào chúng để lọc hoặc phân trang.

### Response `data`

| Field | Schema và cách tính |
| --- | --- |
| `kpis` | Mảng 4 KPI: `prospects`, `engaged`, `qualified`, `enrolled`. Mỗi phần tử: `{ id, label, value, change, helper, progress, tone }`; `value` là chuỗi số có dấu chấm ngăn cách hàng nghìn, `change` là chuỗi phần trăm hoặc `"—"`, `progress` là phần trăm. |
| `demand` | `{ trend, summary }`. `trend[]` có `{ month, ai, software, business, design }` (số lượng tạo mới theo tháng). `summary[]` có `{ id, label, value, change }`; `change` là `number` hoặc `null` khi tháng trước bằng 0. |
| `audienceComposition` | `{ total, gender, profiles }`. `gender[]`: `{ id, name, value }`; `profiles[]`: `{ id, label, value, count }`. Luôn có `grade-12` và `has-interest`; chỉ có `public-school` khi tồn tại dữ liệu loại trường. |
| `segments` | Mảng không phân trang các phân khúc đủ mẫu. Schema từng phần tử ở phần [Phân khúc](#phân-khúc). |
| `regionOpportunities` | Tối đa 5 tỉnh có nhiều học sinh nhất: `{ rank, name, score, selected }`. `score` chuẩn hoá 0–100 theo tỉnh lớn nhất; overview luôn có `selected: false`. |
| `regionalDemand` | `{ columns, rows }`. `columns[]` là `{ id, name }`; `rows[]` là `{ interest, scores }`. `scores` là chỉ số 0–100 chuẩn hoá theo tỉnh cao nhất **trong từng nhóm ngành**, không phải số hồ sơ. |
| `dataCoverage` | Năm phần tử `{ label, detail, value, tone }`: Địa lý, Thông tin học sinh, Ngành quan tâm, Hành vi, Thông tin học phí. Mục học phí luôn `{ value: 0, tone: "danger" }` vì chưa có nguồn canonical. |

### Response `meta`

| Field | Ý nghĩa |
| --- | --- |
| `admissionYear` | Năm dạng số của kỳ đã resolve; có thể là `0` nếu không đổi được tên kỳ sang số. |
| `period` | `6m`, `12m` hoặc `season` sau chuẩn hoá. |
| `scope` | Luôn là `all`. |
| `asOf` | Thời điểm backend tạo response, ISO 8601. |
| `totalProspects` | Tổng số bản ghi học sinh của kỳ tuyển sinh. |
| `minSampleSize` | Luôn là `30`. |
| `dataAvailability` | `{ trend, tuition, revenue, eligibleSegments }`; `trend` là boolean theo sự hiện diện của `creation`, `tuition` và `revenue` luôn `false`, `eligibleSegments` là số phần tử trong `segments`. |

Ví dụ shape đầy đủ (giá trị chỉ minh hoạ):

```json
{
  "data": {
    "kpis": [{ "id": "prospects", "label": "Tổng hồ sơ", "value": "30", "change": "—", "helper": "Tổng dữ liệu kỳ tuyển sinh", "progress": 100, "tone": "primary" }],
    "demand": { "trend": [{ "month": "T1", "ai": 0, "software": 0, "business": 0, "design": 0 }], "summary": [{ "id": "ai", "label": "AI", "value": 0, "change": null }] },
    "audienceComposition": { "total": 30, "gender": [{ "id": "female", "name": "Nữ", "value": 100 }], "profiles": [{ "id": "grade-12", "label": "Học sinh lớp 12", "value": 100, "count": 30 }] },
    "segments": [],
    "regionOpportunities": [{ "rank": 1, "name": "Cần Thơ", "score": 100, "selected": false }],
    "regionalDemand": { "columns": [{ "id": "can-tho", "name": "Cần Thơ" }], "rows": [{ "interest": "AI", "scores": { "can-tho": 100 } }] },
    "dataCoverage": [{ "label": "Địa lý", "detail": "Tỉnh, huyện, vùng tuyển sinh", "value": 100, "tone": "success" }]
  },
  "meta": { "admissionYear": 2026, "period": "6m", "scope": "all", "asOf": "2026-09-03T10:00:00+07:00", "totalProspects": 30, "minSampleSize": 30, "dataAvailability": { "trend": true, "tuition": false, "revenue": false, "eligibleSegments": 0 } }
}
```

## Phân khúc

`segments` được nhóm theo giới tính × nhóm ngành × tỉnh (hoặc vùng nếu không có tỉnh); chỉ nhóm có ít nhất 30 học sinh được trả về. Nhóm ngành là `AI`, `Phần mềm`, `Kinh doanh`, `Thiết kế` hoặc `Khác`, suy ra từ ngành, nhóm ngành và nguyện vọng. Kết quả được sắp xếp `opportunityScore` giảm dần rồi `id` tăng dần.

```json
{
  "id": "female-ai-can-tho",
  "name": "Nữ · Lớp 12 · Cần Thơ · quan tâm AI",
  "shortName": "Nữ · AI",
  "description": "30 hồ sơ, 50.0% đã có tương tác.",
  "region": "Cần Thơ",
  "interest": "AI",
  "prospects": 30,
  "engaged": 15,
  "qualified": 8,
  "counselling": 4,
  "applications": 3,
  "enrolled": 1,
  "conversion": 3.3,
  "tuition": null,
  "revenue": null,
  "growth": null,
  "coverage": 50.0,
  "opportunityScore": 100,
  "tone": "primary",
  "filters": [{ "id": "gender", "label": "Giới tính", "value": "Nữ" }],
  "channels": [{ "name": "Zalo", "value": 100 }],
  "monthlyProspects": [{ "month": "T1", "current": 1, "benchmark": 2 }]
}
```

`conversion` là `enrolled / prospects × 100`; `coverage` là `engaged / prospects × 100`; `opportunityScore` chỉ dựa trên quy mô nhóm so với nhóm đủ mẫu lớn nhất. `growth` so sánh hai tháng cuối của period và là `null` nếu tháng trước bằng 0. `monthlyProspects[].benchmark` là toàn bộ học sinh cùng nhóm ngành, không phải benchmark đã loại riêng phân khúc hiện tại. `channels[].value` là tỷ trọng trên mọi CRM Interaction của nhóm; đây không phải first-touch hay last-touch attribution.

## Chi tiết phân khúc

```http
GET ...get_director_demographics_segment?segment_id=female-ai-can-tho&admissionYear=2026
```

| Query parameter | Quy tắc |
| --- | --- |
| `segment_id` | Bắt buộc, không được rỗng. |
| `admissionYear` | Tuỳ chọn, được resolve giống overview. |

Endpoint này luôn dùng cửa sổ `6m`, độc lập với `period` của overview. Response `data` có `{ segment, benchmark, regionOpportunities, nextAction, guardrails }`; `segment` dùng schema trên. `benchmark` là phân khúc khác có cùng `interest` và `region`, nhiều `prospects` nhất; nếu không có thì chính là `segment`. `regionOpportunities` giữ tối đa 5 tỉnh và đánh dấu `selected: true` khi tên tỉnh trùng `segment.region`.

`nextAction` có `{ priority, label, title, description, steps }`; `priority` là `high` khi `opportunityScore >= 85`, ngược lại là `normal`; mỗi `steps[]` có `{ order, title, detail }`. `guardrails` luôn là mảng và hiện trả cảnh báo về việc không suy đoán khả năng học phí/thu nhập của người chưa thành niên: `{ criterion, issue, replacement, status, tone }`.

`meta` chi tiết gồm `{ admissionYear, asOf, minSampleSize, sampleSize }`; `sampleSize` bằng `segment.prospects`.

## Quy tắc dữ liệu và riêng tư

- API chỉ tạo projection aggregate, không trả `student_name`, email, số điện thoại hay định danh học sinh.
- `engaged` có ít nhất một `CRM Interaction`; `qualified` là assessment `confirmed` hoặc có application thuộc `submitted`, `under review`, `accepted`, `enrolled`; `applications` là có ít nhất một application; `enrolled` dựa vào lifecycle, enrollment status hoặc application status; `counselling` nhận diện từ lifecycle/status hiện có.
- `tuition` và `revenue` luôn `null` ở phân khúc. Không dùng response để suy luận thu nhập hoặc khả năng chi trả.

## Lỗi

| HTTP | Code | Khi xảy ra |
| --- | --- | --- |
| 400 | `INVALID_PERIOD` | `period` không phải `6m`, `12m`, `season`. |
| 400 | `INVALID_SCOPE` | `scope` khác `all`. |
| 400 | `INVALID_SEGMENT_ID` | `segment_id` rỗng hoặc thiếu. |
| 404 | `SEGMENT_NOT_FOUND` | Không có phân khúc trùng `segment_id`, hoặc nhóm chưa đủ 30 mẫu. |

Backend đặt lỗi Frappe ở `error.code`, `error.message` và HTTP status tương ứng.

## Tình trạng client dashboard

[`src/services/api/demographics/index.ts`](../../src/services/api/demographics/index.ts) vẫn gửi các filter/phân trang nêu trên và validator overview còn yêu cầu `data.acquisitionMap` cùng `meta.page`, `pageSize`, `total`, `totalPages`, `hasNextPage`. Backend hiện tại không trả các field này, nên khi dùng `NEXT_PUBLIC_FRAPPE_URL`, overview response bị client từ chối với `INVALID_DEMOGRAPHICS_RESPONSE`. Fallback local không phải contract của backend.
