# API cho `/director/school-field-activity`

API này cung cấp snapshot cho màn **Hoạt động trường & thực địa**: hoạt động đã hoàn tất, kế hoạch sắp tới, KPI, chất lượng dữ liệu và trạng thái đồng bộ thiết bị. Endpoint GET đã được triển khai trong Frappe CRM; xuất báo cáo và tạo kế hoạch mới chưa có API backend.

## 1. Phạm vi và nguồn dữ liệu

| Vùng UI                             | Field API             |
| ----------------------------------- | --------------------- |
| Header                              | `meta`                |
| KPI                                 | `kpis`                |
| Hiệu quả hoạt động và chart chi phí | `completedActivities` |
| Kế hoạch sắp tới                    | `upcomingActivities`  |
| Đội ngũ và chất lượng dữ liệu       | `dataQuality`         |
| Đồng bộ thiết bị                    | `deviceSync`          |

Nguồn tham chiếu:

- [Frontend client](<../../src/app/(with-layouts)/(dashboard)/director/school-field-activity/_components/school-field-activity-page-client.tsx>)
- [API service](../../src/services/api/director-school-field-activity/index.ts)
- [Type frontend](../../src/services/api/director-school-field-activity/types.ts)
- [Normalizer frontend](../../src/services/api/director-school-field-activity/normalizers.ts)
- Backend: `E:\TVu\CRM\frappe-crm\crm\api\director_school_field_activity.py`

File `_components/data.ts` là fixture cũ, không còn là nguồn của route.

## 2. Tình trạng tích hợp

Route gọi `getDirectorSchoolFieldActivity` sau khi client mount. Request hiện tại của trang là:

```ts
{
  admissionYear: 2026,
  scope: "all",
  period: "season",
  activityLimit: 10,
  upcomingLimit: 10,
  includeDevices: true,
}
```

`activityLimit: 10` là giới hạn hiển thị của trang, không phải default backend. API service không tự đặt default; tham số bị bỏ qua sẽ dùng default backend.

Service gửi `Accept: application/json`, dùng `cache: "no-store"`, gửi `credentials: "include"` trên browser và chỉ chuyển cookie `sid` ở request server-side của Next.js. Khi tải lỗi, route hiển thị fallback thay vì dùng fixture.

## 3. Endpoint và quyền truy cập

```http
GET {NEXT_PUBLIC_FRAPPE_URL}/api/method/crm.api.director_school_field_activity.get_director_school_field_activity
Accept: application/json
```

Endpoint được khai báo `allow_guest=True`.

- Guest được đọc aggregate công khai khi `scope=all`; cookie `sid` không bắt buộc trong trường hợp này.
- Guest dùng scope campus, territory hoặc province nhận `403 FORBIDDEN`.
- User đăng nhập phải active và qua `require_director_access`: Administrator, canonical profile **Admissions Director**, hoặc System Manager hợp lệ theo role policy.
- Với scope cụ thể, backend kiểm tra campus/territory của CRM Staff hoặc province được gán cho territory.

Backend hiện chưa có nguồn device sync. Không có token thiết bị, serial hoặc PII học sinh trong response.

## 4. Request

```http
GET /api/method/crm.api.director_school_field_activity.get_director_school_field_activity?admissionYear=2026&scope=all&period=season&activityLimit=10&upcomingLimit=10&includeDevices=true
```

| Tên              | Kiểu                |       Mặc định backend | Ràng buộc / hành vi                                                                                                                                |
| ---------------- | ------------------- | ---------------------: | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| `admissionYear`  | string hoặc integer | Một kỳ active duy nhất | Năm 4 chữ số `2000..2100`. Nếu truyền, tìm theo `name` rồi `year_name`. Bỏ trống khi không có đúng một kỳ active trả `422 INVALID_ADMISSION_YEAR`. |
| `scope`          | string              |                  `all` | `all`, name hoặc code của CRM Campus, CRM Territory, CRM Province. Giá trị không hợp lệ trả `400 INVALID_QUERY`.                                   |
| `period`         | enum                |               `season` | `season`, `6m`, `12m`.                                                                                                                             |
| `activityLimit`  | integer             |                   `50` | `1..200`; chỉ cắt mảng `completedActivities`.                                                                                                      |
| `upcomingLimit`  | integer             |                   `10` | `1..50`; chỉ cắt mảng `upcomingActivities`.                                                                                                        |
| `includeDevices` | boolean             |                 `true` | Chỉ nhận `true` hoặc `false`. Hiện chưa tạo dữ liệu thiết bị vì backend chưa có source.                                                            |

Tất cả timestamp dùng `Asia/Ho_Chi_Minh`.

- `season` dùng `start_date`/ `end_date` của CRM Admission Year; nếu thiếu, fallback 01/01–31/12 của năm tuyển sinh.
- `6m` và `12m` là rolling window 182 và 365 ngày tính đến `asOf`.
- Hoạt động completed được đọc theo `activity_date desc, scheduled_datetime desc, name desc`, sau đó lấy `activityLimit` đầu tiên. Backend không xếp hạng, gộp hoặc khử trùng theo trường.
- Kế hoạch chỉ gồm CRM status `Planned` hoặc `Cancelled`, thời gian từ `asOf` trở đi, và được sắp tăng dần theo ngày/ID.

## 5. Response thành công

Frappe bọc giá trị return của method trong `message`:

```ts
type FrappeEnvelope = {
  message: DirectorSchoolFieldActivityData;
};

type DirectorSchoolFieldActivityData = {
  meta: FieldActivityMeta;
  kpis: FieldActivityKpi[];
  completedActivities: CompletedFieldActivity[];
  upcomingActivities: UpcomingFieldActivity[];
  dataQuality: FieldDataQuality;
  deviceSync: DeviceSyncOverview | null;
};
```

Ví dụ rút gọn phản ánh implementation hiện tại:

```json
{
  "message": {
    "meta": {
      "admissionYear": 2026,
      "scope": "all",
      "scopeLabel": "Toàn bộ cơ sở",
      "period": "season",
      "asOf": "2026-09-02T10:00:00+07:00",
      "timezone": "Asia/Ho_Chi_Minh",
      "status": "partial",
      "sources": {
        "activities": "available",
        "plans": "available",
        "dataQuality": "partial",
        "deviceSync": "unavailable"
      },
      "warnings": [
        "Nguồn đồng bộ thiết bị chưa được cấu hình; không suy diễn số pending/error."
      ]
    },
    "kpis": [
      {
        "id": "activity-count",
        "label": "Hoạt động đã triển khai",
        "value": 1,
        "unit": "activities",
        "change": null,
        "changeUnit": null,
        "comparison": null,
        "shareOfProspects": null,
        "benchmark": null,
        "detail": null,
        "tone": "primary"
      }
    ],
    "completedActivities": [
      {
        "id": "ACT-0001",
        "activityType": "career-talk",
        "title": "Ngày hội hướng nghiệp",
        "shortName": "THPT Ví dụ",
        "occurredAt": "2026-05-28T08:00:00+07:00",
        "dateLabel": "28/05",
        "locationId": "SCHOOL-001",
        "location": "Cần Thơ",
        "ownerId": "STAFF-001",
        "owner": "Người phụ trách",
        "cost": { "amount": null, "unit": "vnd" },
        "leads": 12,
        "verifiedLeads": null,
        "verifiedRate": null,
        "qualified": null,
        "enrolled": null,
        "costPerEnrollment": { "amount": null, "unit": "vnd" },
        "status": "completed",
        "dataQuality": "partial"
      }
    ],
    "upcomingActivities": [],
    "dataQuality": {
      "unsyncedRecords": 0,
      "team": [],
      "seasonMetrics": [
        {
          "id": "reachable-phone",
          "label": "Số điện thoại liên lạc được",
          "value": null,
          "target": 95.0,
          "unit": "percent",
          "status": "unavailable"
        },
        {
          "id": "data-consent",
          "label": "Đồng ý xử lý dữ liệu",
          "value": null,
          "target": 100.0,
          "unit": "percent",
          "status": "unavailable"
        },
        {
          "id": "receipt-image",
          "label": "Có ảnh phiếu đính kèm",
          "value": null,
          "target": 80.0,
          "unit": "percent",
          "status": "unavailable"
        }
      ],
      "attention": null
    },
    "deviceSync": null
  }
}
```

Ví dụ chỉ minh hoạ shape; backend luôn trả đủ năm KPI và ba `seasonMetrics`.

## 6. Data contract

### 6.1. `meta`

```ts
type FieldActivityDataStatus = "available" | "partial" | "unavailable";

type FieldActivityMeta = {
  admissionYear: number;
  scope: string;
  scopeLabel: string;
  period: "season" | "6m" | "12m";
  asOf: string;
  timezone: string;
  status: "available" | "partial";
  sources: {
    activities: FieldActivityDataStatus;
    plans: FieldActivityDataStatus;
    dataQuality: FieldActivityDataStatus;
    deviceSync: FieldActivityDataStatus;
  };
  warnings: string[];
};
```

`asOf` là snapshot time. `warnings` luôn là array. Với implementation hiện tại, `sources.deviceSync` luôn `unavailable`, nên `meta.status` thường là `partial`.

### 6.2. `kpis[]`

```ts
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
  change: null;
  changeUnit: null;
  comparison: null;
  shareOfProspects: number | null;
  benchmark: null;
  detail: null;
  tone: "primary" | "success" | "warning" | "error";
};
```

Backend luôn trả năm KPI theo thứ tự trên và hiện chưa có dữ liệu change, benchmark hoặc detail.

- KPI được tính từ **toàn bộ** completed activities trong period, trước khi áp dụng `activityLimit`.
- `field-leads` ưu tiên số student unique từ CRM Student Engagement Event; nếu không có attribution, fallback `prospect_count` và activity có `dataQuality: "partial"`.
- `cost-per-enrollment` đổi tổng cost sang VND, chia enrollment rồi trả `million_vnd`. Thiếu cost ở bất kỳ activity nào hoặc không có enrollment trả `null`.
- `field-conversion = enrolled / leads * 100`.
- `unsynced-records` hiện là `null`, vì chưa có device-sync source.

### 6.3. `completedActivities[]`

```ts
type FieldActivityAmount = {
  amount: number | null;
  unit: "vnd" | "thousand_vnd" | "million_vnd";
};

type CompletedFieldActivity = {
  id: string;
  activityType: string;
  title: string;
  shortName: string;
  occurredAt: string;
  dateLabel: string | null;
  locationId: string | null;
  location: string;
  ownerId: string | null;
  owner: string | null;
  cost: FieldActivityAmount;
  leads: number | null;
  verifiedLeads: number | null;
  verifiedRate: number | null;
  qualified: number | null;
  enrolled: number | null;
  costPerEnrollment: FieldActivityAmount;
  status: "completed";
  dataQuality: "verified" | "partial" | "unavailable";
};
```

`activityType` là code raw từ CRM School Activity; frontend chưa map code này thành label tiếng Việt. `cost` lấy lần lượt từ `activity_cost/activity_cost_unit` hoặc `cost_amount/cost_unit`; nếu thiếu, API trả `{ amount: null, unit: "vnd" }`.

Khi attribution có CRM Student:

- `verifiedLeads`: student có `consent_state=granted`;
- `qualified`: lifecycle `mql`, `applicant` hoặc `enrolled`;
- `enrolled`: lifecycle `enrolled` hoặc CRM Admission Application status `enrolled`.

`costPerEnrollment` giữ unit của `cost`. UI đổi sang million VND trước khi vẽ chart chi phí.

### 6.4. `upcomingActivities[]`

```ts
type UpcomingFieldActivity = {
  id: string;
  activityType: string;
  title: string;
  locationId: string | null;
  location: string;
  scheduledAt: string;
  dateLabel: string | null;
  expectedEnrollment: {
    min: number | null;
    max: number | null;
    unit: "students";
  };
  confidence: number | null;
  historicalSampleSize: number | null;
  status: "planned" | "cancelled";
  source: string;
  evidence: string[];
};
```

Backend trả `planned` cho CRM status `Planned` và `cancelled` cho `Cancelled`. UI lọc cancelled trước khi hiển thị. `source` lấy từ `forecast_source`, default `manual`; normalizer frontend fallback giá trị không nhận diện về `manual`. `evidence` chứa `evidence_reference` nếu có.

### 6.5. `dataQuality`

```ts
type FieldDataQuality = {
  unsyncedRecords: number;
  team: Array<{
    userId: string;
    name: string;
    records: number;
    secondsPerRecord: null;
    duplicateRate: null;
    missingRate: null;
  }>;
  seasonMetrics: Array<{
    id: "reachable-phone" | "data-consent" | "receipt-image";
    label: string;
    value: number | null;
    target: number;
    unit: "percent";
    status: "meets_target" | "below_target" | "unavailable";
  }>;
  attention: null;
};
```

`team.records` là tổng leads theo owner của completed activities trong scope/period. Backend chưa đo thời gian nhập, duplicate, missing rate hoặc attention, nên các field đó là `null`.

`seasonMetrics` luôn có ba metric: phone/consent được tính từ student attributed trong scope/period; `receipt-image` luôn unavailable. `dataQuality.unsyncedRecords` hiện được giữ ở `0` để tương thích UI dù chưa có device source; không được hiểu là đã quan sát thấy không có record pending.

### 6.6. `deviceSync`

```ts
type DeviceSyncOverview = {
  status: FieldActivityDataStatus;
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
    lastUpdatedLabel: string | null;
    connectionStatus: "online" | "offline" | "unknown";
  }>;
  message: string | null;
};
```

Đây là shape frontend-ready cho nguồn tương lai. Hiện CRM schema chưa có DocType device sync; GET luôn trả `deviceSync: null`, `meta.sources.deviceSync: "unavailable"` và warning tương ứng.

## 7. Chuẩn hoá ở frontend

`getDirectorSchoolFieldActivity` nhận envelope `message`, `data` hoặc payload unwrapped. Normalizer cũng chấp nhận alias snake_case như `completed_activities`, `data_quality` và `device_sync`.

- Response 2xx chỉ được chấp nhận khi có `meta` và mảng `kpis`; nếu không, service ném client-side `502 INVALID_FIELD_ACTIVITY_RESPONSE`.
- KPI/activity sai shape bị loại; integer được làm tròn không âm, percentage bị clamp `0..100`.
- Section thiếu được normalise về array/object rỗng hoặc giá trị nullable.
- Formatting tiền, tỷ lệ và locale được thực hiện ở component UI.
- Thiếu `NEXT_PUBLIC_FRAPPE_URL` hoặc lỗi kết nối được service biểu diễn thành client-side `503 DIRECTOR_SCHOOL_FIELD_ACTIVITY_UNAVAILABLE`.

## 8. Error contract

Backend đặt custom error ở top-level Frappe response:

```json
{
  "error": {
    "code": "INVALID_QUERY",
    "message": "Tham số period không hợp lệ."
  },
  "http_status_code": 400
}
```

Frappe có thể thêm field lỗi framework. Client đọc `error` ở top-level hoặc bên trong `message`; endpoint không tự tạo `details` hay `requestId`.

| HTTP | Code                                         | Khi dùng                                                             |
| ---: | -------------------------------------------- | -------------------------------------------------------------------- |
|  400 | `INVALID_QUERY`                              | `scope`, `period`, limit hoặc `includeDevices` không hợp lệ          |
|  401 | `UNAUTHENTICATED`                            | Request không phải Guest hợp lệ nhưng user thiếu hoặc không active   |
|  403 | `FORBIDDEN`                                  | Guest dùng scope cụ thể hoặc user không được cấp scope               |
|  404 | `ADMISSION_YEAR_NOT_FOUND`                   | `admissionYear` hợp lệ về format nhưng không tồn tại                 |
|  422 | `INVALID_ADMISSION_YEAR`                     | Năm sai format/range hoặc không có đúng một kỳ active khi bỏ tham số |
|  503 | `DIRECTOR_SCHOOL_FIELD_ACTIVITY_UNAVAILABLE` | Không đọc được nguồn CRM School Activity bắt buộc                    |

`502 INVALID_FIELD_ACTIVITY_RESPONSE` chỉ do frontend service tạo khi response 2xx không qua validation tối thiểu.

## 9. API chưa triển khai

Hai nút **Xuất báo cáo** và **Lập kế hoạch hoạt động mới** hiện chỉ hiển thị toast. Backend chưa có:

- `export_director_school_field_activity`
- `create_field_activity_plan`

Không gọi hoặc coi hai path trên là production contract. Khi triển khai, cần bổ sung endpoint, authorization, validation và test riêng trước khi cập nhật tài liệu này.

## 10. Request tối thiểu để tích hợp

```http
GET /api/method/crm.api.director_school_field_activity.get_director_school_field_activity?admissionYear=2026&scope=all&period=season&activityLimit=10&upcomingLimit=10&includeDevices=true
```

Frontend cần xử lý `meta.status`, `meta.warnings`, giá trị `null` trong KPI/metric và `deviceSync: null`. Không suy luận số liệu đồng bộ hoặc chi phí từ fixture khi API trả unavailable.
