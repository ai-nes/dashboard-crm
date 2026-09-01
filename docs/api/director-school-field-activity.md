# API cho `/director/school-field-activity`

Tài liệu này mô tả API cho màn **Hoạt động trường & thực địa** của Director: kết quả hoạt động đã triển khai, kế hoạch sắp tới, chi phí/hiệu quả, chất lượng dữ liệu nhập và trạng thái đồng bộ thiết bị.

## 1. Phạm vi màn hình

| Vùng UI | Dữ liệu cần | Nguồn hiện tại |
|---|---|---|
| Header | Kỳ tuyển sinh, trạng thái dữ liệu, link việc cần xử lý | Text tĩnh |
| KPI | Số hoạt động, lead, chi phí/nhập học, conversion, bản ghi chưa đồng bộ | `activityKpis` |
| Hiệu quả từng hoạt động | Chỉ các hoạt động đã kết thúc, lead, xác minh, qualified, nhập học, chi phí/nhập học | `fieldActivities` |
| Kế hoạch sắp tới | Hoạt động, địa điểm, ngày, dự báo nhập học, độ tin cậy | `upcomingActivities` |
| Chi phí mỗi học sinh nhập học | Xếp hạng chi phí/nhập học theo hoạt động đã kết thúc | Tính từ `fieldActivities` |
| Đội ngũ nhập dữ liệu | Số bản ghi, giây/hồ sơ, tỷ lệ trùng, tỷ lệ thiếu | `teamDataQuality` |
| Chất lượng toàn mùa | Tỷ lệ số điện thoại liên lạc được, consent, ảnh phiếu và mục tiêu | `dataQualityMetrics` |
| Đồng bộ thiết bị | Đã đồng bộ, đang chờ, lỗi, thời điểm cập nhật cuối | `deviceSyncStatuses` |

Nguồn tham chiếu trực tiếp:

- [page.tsx](../../src/app/(with-layouts)/(dashboard)/director/school-field-activity/page.tsx)
- [school-field-activity-dashboard.tsx](../../src/app/(with-layouts)/(dashboard)/director/school-field-activity/_components/school-field-activity-dashboard.tsx)
- [types.ts](../../src/app/(with-layouts)/(dashboard)/director/school-field-activity/_components/types.ts)
- [data.ts](../../src/app/(with-layouts)/(dashboard)/director/school-field-activity/_components/data.ts)
- [field-data-overview.tsx](../../src/app/(with-layouts)/(dashboard)/director/school-field-activity/_components/field-data-overview.tsx)

## 2. Tình trạng API hiện tại

Route chưa gọi API. Các component đang import fixture trực tiếp từ `school-field-activity/_components/data.ts`; KPI, cảnh báo chất lượng dữ liệu và thông tin thiết bị chưa có snapshot từ backend.

Nút `Xuất báo cáo` và `Lập kế hoạch hoạt động mới` hiện chỉ hiển thị toast. Contract bên dưới là contract production đề xuất. Khi tích hợp, một GET nên trả cùng `asOf`, `admissionYear` và `scope` cho tất cả section để bảng hiệu quả, chart chi phí và KPI không lệch nhau.

## 3. Endpoint và quyền truy cập

```http
GET {NEXT_PUBLIC_FRAPPE_URL}/api/method/crm.api.director_school_field_activity.get_director_school_field_activity
Cookie: sid=<Frappe session cookie>
Accept: application/json
```

Frappe bọc response thành công trong `message`.

Endpoint chỉ đọc nhưng chứa dữ liệu vận hành về trường, nhân sự và thiết bị. Backend phải kiểm tra quyền Director trước khi áp dụng scope; client không được tự mở rộng phạm vi.

Quyền tối thiểu:

- `Administrator` hoặc `System Manager` có quyền phù hợp;
- profile nghiệp vụ `Admissions Director` hoặc role được allowlist;
- user chỉ được xem hoạt động, nhân sự và thiết bị thuộc `scope` được cấp;
- định danh thiết bị có thể trả dạng masked/display name, không trả token, serial hoặc thông tin bảo mật.

## 4. Request

Ví dụ:

```http
GET /api/method/crm.api.director_school_field_activity.get_director_school_field_activity?admissionYear=2026&scope=all&period=season&activityLimit=50&upcomingLimit=10
```

### Query parameters

| Tên | Kiểu | Bắt buộc | Mặc định | Ràng buộc / mô tả |
|---|---|---:|---|---|
| `admissionYear` | integer | Không | Kỳ active duy nhất | Năm 4 chữ số trong khoảng `2000..2100` |
| `scope` | string | Không | `all` | `all`, campus ID, territory ID hoặc province ID được cấp quyền |
| `period` | enum | Không | `season` | `season`, `6m`, `12m`; mọi section dùng cùng khoảng báo cáo |
| `activityLimit` | integer | Không | `50` | `1..200`; chỉ giới hạn hoạt động đã kết thúc |
| `upcomingLimit` | integer | Không | `10` | `1..50`; chỉ giới hạn kế hoạch sắp tới |
| `includeDevices` | boolean | Không | `true` | `true` hoặc `false`; tắt nếu caller không có quyền vận hành thiết bị |

`period` không được hiểu là số ngày rolling nếu không có timezone/school-year rule. Với `season`, backend phải dùng kỳ tuyển sinh yêu cầu và chỉ lấy hoạt động thuộc cùng kỳ.

Nếu không truyền `admissionYear`, backend chỉ được tự chọn kỳ khi có đúng một kỳ tuyển sinh active; nếu không, trả `422 INVALID_ADMISSION_YEAR`.

## 5. Response `200 OK`

Shape tổng quát:

```text
{
  message: {
    meta: FieldActivityMeta,
    kpis: FieldActivityKpi[],
    completedActivities: CompletedFieldActivity[],
    upcomingActivities: UpcomingFieldActivity[],
    dataQuality: FieldDataQuality,
    deviceSync: DeviceSyncOverview | null
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
      "period": "season",
      "asOf": "2026-08-31T10:00:00+07:00",
      "timezone": "Asia/Ho_Chi_Minh",
      "status": "partial",
      "sources": {
        "activities": "available",
        "plans": "available",
        "dataQuality": "available",
        "deviceSync": "partial"
      },
      "warnings": [
        "184 bản ghi chưa đồng bộ từ thiết bị Máy 04."
      ]
    },
    "kpis": [
      {
        "id": "activity-count",
        "label": "Hoạt động đã triển khai",
        "value": 42,
        "unit": "activities",
        "change": 18,
        "changeUnit": "percent",
        "comparison": "same_period_previous_year",
        "detail": "Tăng 18% so với cùng kỳ",
        "tone": "primary"
      },
      {
        "id": "field-leads",
        "label": "Hồ sơ thu được",
        "value": 9840,
        "unit": "leads",
        "shareOfProspects": 16.8,
        "detail": "16,8% tổng hồ sơ",
        "tone": "success"
      },
      {
        "id": "cost-per-enrollment",
        "label": "Chi phí mỗi học sinh nhập học",
        "value": 1.4,
        "unit": "million_vnd",
        "benchmark": {
          "id": "digital",
          "label": "Kênh số",
          "value": 2.5,
          "unit": "million_vnd"
        },
        "tone": "success"
      },
      {
        "id": "field-conversion",
        "label": "Tỷ lệ hồ sơ chuyển thành nhập học",
        "value": 11.0,
        "unit": "percent",
        "benchmark": {
          "id": "digital",
          "label": "Kênh số",
          "value": 4.1,
          "unit": "percent"
        },
        "tone": "primary"
      },
      {
        "id": "unsynced-records",
        "label": "Hồ sơ chưa đồng bộ",
        "value": 184,
        "unit": "records",
        "detail": "Cần kiểm tra ngay",
        "tone": "error"
      }
    ],
    "completedActivities": [
      {
        "id": "activity-2026-0001",
        "activityType": "career-talk",
        "title": "Ngày hội hướng nghiệp — THPT Châu Văn Liêm",
        "shortName": "THPT Châu Văn Liêm",
        "occurredAt": "2026-05-28T08:00:00+07:00",
        "dateLabel": "28/05",
        "locationId": "province-ct",
        "location": "Cần Thơ",
        "ownerId": "USR-001",
        "owner": "Trần Q. Bảo",
        "cost": { "amount": 18, "unit": "million_vnd" },
        "leads": 62,
        "verifiedLeads": 57,
        "verifiedRate": 91.9,
        "qualified": 34,
        "enrolled": 11,
        "costPerEnrollment": { "amount": 1.6, "unit": "million_vnd" },
        "status": "completed",
        "dataQuality": "verified"
      }
    ],
    "upcomingActivities": [
      {
        "id": "plan-2026-0001",
        "activityType": "career-talk-parent-session",
        "title": "Ngày hội hướng nghiệp + gặp phụ huynh",
        "locationId": "school-001",
        "location": "THPT Châu Văn Liêm",
        "scheduledAt": "2026-09-07T08:00:00+07:00",
        "dateLabel": "07/09",
        "expectedEnrollment": { "min": 9, "max": 14, "unit": "students" },
        "confidence": 71,
        "historicalSampleSize": 4,
        "status": "planned",
        "source": "market-and-student-priority"
      }
    ],
    "dataQuality": {
      "unsyncedRecords": 184,
      "team": [
        {
          "userId": "USR-001",
          "name": "Trần Quốc Bảo",
          "records": 137,
          "secondsPerRecord": 38,
          "duplicateRate": 2.1,
          "missingRate": 4.4
        }
      ],
      "seasonMetrics": [
        {
          "id": "reachable-phone",
          "label": "Số điện thoại liên lạc được",
          "value": 92.4,
          "target": 95.0,
          "unit": "percent",
          "status": "below_target"
        },
        {
          "id": "data-consent",
          "label": "Đồng ý xử lý dữ liệu",
          "value": 97.8,
          "target": 100.0,
          "unit": "percent",
          "status": "below_target"
        },
        {
          "id": "receipt-image",
          "label": "Có ảnh phiếu đính kèm",
          "value": 61.2,
          "target": 80.0,
          "unit": "percent",
          "status": "below_target"
        }
      ],
      "attention": {
        "userId": "USR-002",
        "name": "Nguyễn Thị Hà",
        "duplicateRate": 8.9,
        "missingRate": 14.2,
        "reason": "highest_quality_signal_gap"
      }
    },
    "deviceSync": {
      "status": "partial",
      "totalUnsyncedRecords": 184,
      "totalErrors": 12,
      "devices": [
        {
          "id": "device-04",
          "label": "Máy 04 · Nguyễn T. Hà",
          "activityId": "activity-2026-0003",
          "activity": "Tư vấn tại lớp · 12/07",
          "synced": 34,
          "pending": 128,
          "errors": 12,
          "lastUpdatedAt": "2026-08-31T06:40:00+07:00",
          "lastUpdatedLabel": "3 giờ 20 phút trước",
          "connectionStatus": "offline"
        }
      ],
      "message": "Dữ liệu vẫn an toàn trên thiết bị và sẽ tự đồng bộ khi có mạng."
    }
  }
}
```

Ví dụ chỉ minh hoạ một hoạt động, một kế hoạch, một dòng nhân sự và một thiết bị. Response production phải trả tất cả hoạt động/kế hoạch trong limit và đủ các metric quality cần hiển thị.

## 6. Data contract chi tiết

### 6.1. `meta`

```typescript
type FieldActivityMeta = {
  admissionYear: number;
  scope: string;
  scopeLabel: string;
  period: "season" | "6m" | "12m";
  asOf: string; // ISO-8601, có timezone
  timezone: string;
  status: "available" | "partial" | "unavailable";
  sources: {
    activities: "available" | "partial" | "unavailable";
    plans: "available" | "partial" | "unavailable";
    dataQuality: "available" | "partial" | "unavailable";
    deviceSync: "available" | "partial" | "unavailable";
  };
  warnings?: string[];
};
```

`asOf` là thời điểm snapshot được tạo. Khi `deviceSync` partial, các KPI phụ thuộc bản ghi chưa đồng bộ phải được đánh dấu hoặc loại khỏi denominator; không âm thầm xem pending là `0`.

### 6.2. `kpis[]`

```typescript
type FieldActivityKpi = {
  id:
    | "activity-count"
    | "field-leads"
    | "cost-per-enrollment"
    | "field-conversion"
    | "unsynced-records";
  label: string;
  value: number | null;
  unit: "activities" | "leads" | "million_vnd" | "percent" | "records";
  change?: number | null;
  changeUnit?: "percent" | "percentage_points" | "absolute";
  comparison?: "same_period_previous_year" | "previous_period" | "benchmark";
  shareOfProspects?: number | null;
  benchmark?: {
    id: string;
    label: string;
    value: number | null;
    unit: "million_vnd" | "percent";
  } | null;
  detail?: string;
  tone: "primary" | "success" | "warning" | "error";
};
```

Frontend format `value`, `change` và `unit` theo locale. Không trả `1,4 tr`, `11,0%` hoặc `184 hồ sơ` như numeric contract duy nhất.

KPI semantics:

- `activity-count`: số hoạt động đã kết thúc trong kỳ, không tính plan chưa diễn ra.
- `field-leads`: số lead unique được attributable cho hoạt động thực địa theo attribution model đã công bố.
- `cost-per-enrollment`: tổng chi phí hoạt động chia cho số enrollment canonical attributable cho hoạt động; đơn vị `million_vnd`.
- `field-conversion`: `enrolled / leads * 100` theo cùng attribution và snapshot.
- `unsynced-records`: tổng record đang pending hoặc lỗi đồng bộ, không phải số lead chắc chắn bị mất.

Nếu denominator bằng `0` hoặc nguồn chưa đủ để tính, trả `null` và trạng thái nguồn tương ứng, không trả `0`.

### 6.3. `completedActivities[]`

```typescript
type CompletedFieldActivity = {
  id: string;
  activityType: string;
  title: string;
  shortName: string;
  occurredAt: string;
  dateLabel?: string;
  locationId: string | null;
  location: string;
  ownerId: string | null;
  owner: string | null;
  cost: {
    amount: number | null;
    unit: "vnd" | "thousand_vnd" | "million_vnd";
  };
  leads: number | null;
  verifiedLeads: number | null;
  verifiedRate: number | null;
  qualified: number | null;
  enrolled: number | null;
  costPerEnrollment: {
    amount: number | null;
    unit: "vnd" | "thousand_vnd" | "million_vnd";
  };
  status: "completed";
  dataQuality: "verified" | "partial" | "unavailable";
};
```

Quy ước:

- Chỉ `status = completed` mới được đưa vào bảng hiệu quả và chart chi phí.
- `verifiedRate = verifiedLeads / leads * 100`; `verifiedLeads` phải là số lead unique đã qua rule xác minh.
- `qualified` và `enrolled` phải dùng canonical lifecycle/application event; không dùng số lần tham dự hoặc form submit trùng.
- `costPerEnrollment` phải tính từ số đầy đủ trước khi làm tròn, không suy ra từ giá trị display.
- `activityType` là mã ổn định; frontend map label tiếng Việt.
- Hoạt động chưa đồng bộ toàn phần không được dùng để kết luận hoạt động kém hiệu quả. Trả `dataQuality = partial` và metadata nguồn nếu cần.

UI hiện tại sắp xếp theo `costPerEnrollment` tăng dần ở chart chi phí. Backend không cần trả chart color hoặc class CSS.

### 6.4. `upcomingActivities[]`

```typescript
type UpcomingFieldActivity = {
  id: string;
  activityType: string;
  title: string;
  locationId: string | null;
  location: string;
  scheduledAt: string;
  dateLabel?: string;
  expectedEnrollment: {
    min: number | null;
    max: number | null;
    unit: "students";
  };
  confidence: number | null; // 0..100
  historicalSampleSize: number | null;
  status: "planned" | "confirmed" | "cancelled";
  source: "market-and-student-priority" | "historical-activity" | "manual" | "mixed";
  evidence?: string[];
};
```

`expectedEnrollment` là khoảng dự báo, không phải số enrollment thực tế. `confidence` phải đi kèm `historicalSampleSize`; nếu số mẫu nhỏ hoặc thiếu hoạt động tương tự, backend nên trả confidence thấp/null và warning. Không dùng plan đã `cancelled` để tính KPI hoặc forecast tổng.

Kế hoạch phải được sắp xếp theo `scheduledAt` tăng dần. `dateLabel` chỉ phục vụ hiển thị.

### 6.5. `dataQuality`

```typescript
type FieldDataQuality = {
  unsyncedRecords: number;
  team: Array<{
    userId: string;
    name: string;
    records: number;
    secondsPerRecord: number | null;
    duplicateRate: number | null;
    missingRate: number | null;
  }>;
  seasonMetrics: Array<{
    id: string;
    label: string;
    value: number | null;
    target: number | null;
    unit: "percent";
    status: "meets_target" | "below_target" | "unavailable";
  }>;
  attention?: {
    userId: string;
    name: string;
    duplicateRate: number | null;
    missingRate: number | null;
    reason: string;
  } | null;
};
```

Semantics:

- `duplicateRate` là tỷ lệ bản ghi bị xác định trùng trong số bản ghi người đó nhập, theo identity resolution version đang dùng.
- `missingRate` là tỷ lệ bản ghi thiếu một hoặc nhiều field bắt buộc của hoạt động thực địa.
- `secondsPerRecord` là thời gian trung bình nhập một record; nếu thiếu timestamp bắt đầu/kết thúc, trả `null`.
- `seasonMetrics.value` và `target` dùng cùng denominator đã công bố; không trộn toàn mùa với kỳ đang chọn.
- `attention` chỉ là tín hiệu cần hướng dẫn/quy trình, không phải đánh giá năng lực hoặc xếp hạng nhân sự.
- Không trả raw phone, email, ảnh phiếu hoặc nội dung nhạy cảm trong overview. Link sang Data Health/Student 360 dùng quyền riêng.

### 6.6. `deviceSync`

```typescript
type DeviceSyncOverview = {
  status: "available" | "partial" | "unavailable";
  totalUnsyncedRecords: number;
  totalErrors: number;
  devices: Array<{
    id: string;
    label: string;
    activityId: string | null;
    activity: string | null;
    synced: number;
    pending: number;
    errors: number;
    lastUpdatedAt: string | null;
    lastUpdatedLabel?: string;
    connectionStatus: "online" | "offline" | "unknown";
  }>;
  message?: string;
};
```

`synced`, `pending` và `errors` phải được định nghĩa rõ theo record đồng bộ. `pending` là record chưa nhận ACK thành công; `errors` là record có lần đồng bộ thất bại cần retry hoặc xử lý. Tổng `totalUnsyncedRecords` phải nhất quán với rule đã công bố, thường là `pending + errors` sau khi loại duplicate.

Khi một thiết bị offline:

- trả `connectionStatus = offline` và `lastUpdatedAt`;
- không biến record pending thành `0`;
- không dùng record chưa đồng bộ để làm giảm conversion, tăng duplicate hoặc đánh giá owner;
- nếu nguồn device không đọc được, trả `deviceSync = null` hoặc `status = unavailable`, không tạo số giả.

## 7. Công thức và attribution

Các aggregate phải dùng cùng một attribution model và snapshot:

```text
verifiedRate = verified unique leads / unique leads * 100
fieldConversion = attributable enrolled / attributable leads * 100
costPerEnrollment = activity cost / attributable enrolled
shareOfProspects = attributable field leads / total prospects * 100
```

Backend phải công bố `attributionModel` nếu lead có nhiều điểm chạm, ví dụ `first-touch`, `last-touch` hoặc `observed-interactions`. Không gọi là lead của hoạt động thực địa nếu chỉ có một interaction nhưng chưa resolve identity/lineage.

Chi phí cần có currency/unit rõ ràng. Fixture hiện dùng `million_vnd`; production không được suy diễn đơn vị từ label.

## 8. Quy tắc dữ liệu và privacy

- Tất cả section phải dùng cùng `admissionYear`, `scope`, `period`, `asOf` và timezone.
- Không lấy số lượng record của page hiện tại làm KPI toàn mùa.
- `null` dành cho unavailable, denominator bằng `0`, chưa đủ quan sát hoặc chưa xác minh; `0` chỉ dùng khi giá trị thực đã được quan sát là 0.
- Activity, lead và enrollment phải deduplicate theo ID canonical; không đếm lại khi một thiết bị retry đồng bộ.
- Không hiển thị hoạt động chưa hoàn tất trong bảng ranking hiệu quả.
- Dữ liệu pending/error phải được tách khỏi actual và có data availability marker.
- Không trả thông tin bảo mật thiết bị, token đồng bộ hoặc PII không cần thiết.
- Dữ liệu quality của nhân sự chỉ nên dùng để cải thiện quy trình nhập và phải có audit/permission phù hợp.

## 9. API action bổ sung

### 9.1. Xuất báo cáo

Nút `Xuất báo cáo` hiện chỉ hiển thị toast. Nếu triển khai, dùng endpoint riêng với cùng query/snapshot:

```http
GET /api/method/crm.api.director_school_field_activity.export_director_school_field_activity?admissionYear=2026&scope=all&period=season&format=xlsx
```

Endpoint trả file CSV/XLSX hoặc job export có `requestId`; không đưa dữ liệu export lớn vào response JSON của overview.

### 9.2. Lập kế hoạch hoạt động mới

Nút `Lập kế hoạch hoạt động mới` hiện chưa có form. Khi triển khai, dùng command riêng thay vì ghi trực tiếp từ dashboard:

```http
POST /api/method/crm.api.director_school_field_activity.create_field_activity_plan
Cookie: sid=<Frappe session cookie>
Content-Type: application/json
Accept: application/json
Idempotency-Key: <unique-command-key>
```

Request tối thiểu:

```json
{
  "activityType": "career-talk",
  "title": "Ngày hội hướng nghiệp + gặp phụ huynh",
  "locationId": "school-001",
  "scheduledAt": "2026-09-07T08:00:00+07:00",
  "ownerId": "USR-001",
  "admissionYear": 2026,
  "scope": "all",
  "expectedEnrollment": { "min": 9, "max": 14 },
  "idempotencyKey": "plan-01J-create-school-001-20260907"
}
```

Backend phải validate permission trên trường/địa điểm, người phụ trách, thời gian trùng lịch, kỳ tuyển sinh và range dự báo. Response nên trả plan ID, trạng thái, version và audit event. Nếu form cho phép sửa dự báo hoặc owner sau này, cần optimistic concurrency và `expectedVersion`.

## 10. Error contract

Lỗi đọc dữ liệu:

```json
{
  "message": {
    "error": {
      "code": "DIRECTOR_SCHOOL_FIELD_ACTIVITY_UNAVAILABLE",
      "message": "Không thể tải dữ liệu hoạt động trường và thực địa.",
      "details": {}
    },
    "meta": {
      "requestId": "req_01J..."
    }
  }
}
```

Lỗi mutation dùng cùng format và thêm `planId`/`currentVersion` khi phù hợp.

| HTTP | Code | Khi dùng |
|---:|---|---|
| `400` | `INVALID_QUERY` / `INVALID_ACTIVITY_PLAN` | Query/body sai format |
| `401` | `UNAUTHENTICATED` | Thiếu hoặc hết hạn session |
| `403` | `FORBIDDEN` | User không có quyền xem scope hoặc tạo plan |
| `404` | `ADMISSION_YEAR_NOT_FOUND` / `LOCATION_NOT_FOUND` | Kỳ hoặc trường/địa điểm không tồn tại |
| `409` | `SCHEDULE_CONFLICT` | Hoạt động trùng lịch/owner/device allocation |
| `409` | `DUPLICATE_IDEMPOTENCY_KEY` | Command key đã dùng cho payload khác |
| `422` | `INVALID_ADMISSION_YEAR` / `INVALID_DATE_RANGE` | Kỳ, thời gian hoặc range dự báo không hợp lệ |
| `502` | `INVALID_FIELD_ACTIVITY_RESPONSE` | Upstream trả schema không hợp lệ |
| `503` | `DIRECTOR_SCHOOL_FIELD_ACTIVITY_UNAVAILABLE` | Không đọc được nguồn hoạt động hoặc aggregate chính |

Nếu chỉ nguồn device sync lỗi, không nhất thiết trả `503` cho toàn bộ overview; trả `meta.status = partial`, `sources.deviceSync = unavailable` và giữ các section còn hợp lệ.

## 11. Request tối thiểu để tích hợp

```http
GET /api/method/crm.api.director_school_field_activity.get_director_school_field_activity?admissionYear=2026&scope=all&period=season
```

Response tối thiểu phải có:

1. `meta.admissionYear`, `meta.scopeLabel`, `meta.period`, `meta.asOf`, `meta.status` và `meta.sources`.
2. `kpis` cho 5 chỉ số đang hiển thị.
3. `completedActivities` với các field để render performance chart và cost chart.
4. `upcomingActivities` với khoảng dự báo và confidence.
5. `dataQuality.team`, `dataQuality.seasonMetrics` và `unsyncedRecords`.
6. `deviceSync` hoặc marker unavailable/partial nếu caller có quyền xem thiết bị.

Các mutation export/plan là API riêng. Khi backend sẵn sàng, frontend không nên tiếp tục lấy số liệu từ fixture, hard-code cảnh báo `184` hoặc dùng dữ liệu chưa đồng bộ để kết luận hiệu quả hoạt động.
