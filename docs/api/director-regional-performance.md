# API cho `/director/regional-performance`

Tài liệu này mô tả contract dữ liệu cho màn **Hiệu suất tuyển sinh theo địa bàn** của Director.

## 1. Phạm vi màn hình

Màn hình dùng một snapshot chung để hiển thị kết quả và năng lực xử lý của từng địa bàn:

| Vùng UI | Dữ liệu cần | Cách sử dụng |
|---|---|---|
| Header | Kỳ tuyển sinh, scope, trạng thái dữ liệu | Hiển thị kỳ, phạm vi và cảnh báo snapshot |
| Tỷ lệ đạt chỉ tiêu | `provinces[].targetAchievement` | So sánh các địa bàn với mốc 100% |
| Hồ sơ còn lại theo giai đoạn | `provinces[].funnel` | Cộng theo cùng vị trí stage để tạo tổng của scope |
| Tóm tắt địa bàn | Các metric cấp `province` | Hiển thị khi người dùng chọn một địa bàn |
| Hồ sơ và nhập học theo tháng | `provinces[].trend` | So sánh kỳ này, kỳ trước và số nhập học trong 6 tháng |
| Hồ sơ qua từng giai đoạn | `provinces[].funnel` | Hiển thị retention và conversion giữa các bước |
| Mức sử dụng đội ngũ | `activeAdvisors`, `capacity`, `capabilities` | Đánh giá tải xử lý và từng khâu năng lực |
| Việc cần làm | `priorityActions` | Lọc theo `provinceId` đang chọn và action dùng chung |

Nguồn tham chiếu trực tiếp:

- [page.tsx](../../src/app/(with-layouts)/(dashboard)/director/regional-performance/page.tsx)
- [regional-performance-dashboard.tsx](../../src/app/(with-layouts)/(dashboard)/director/regional-performance/_components/regional-performance-dashboard.tsx)
- [regional-performance-header.tsx](../../src/app/(with-layouts)/(dashboard)/director/regional-performance/_components/regional-performance-header.tsx)
- [overview-charts.tsx](../../src/app/(with-layouts)/(dashboard)/director/regional-performance/_components/overview-charts.tsx)
- [province-summary.tsx](../../src/app/(with-layouts)/(dashboard)/director/regional-performance/_components/province-summary.tsx)
- [enrollment-trend.tsx](../../src/app/(with-layouts)/(dashboard)/director/regional-performance/_components/enrollment-trend.tsx)
- [funnel-analysis.tsx](../../src/app/(with-layouts)/(dashboard)/director/regional-performance/_components/funnel-analysis.tsx)
- [capability-summary.tsx](../../src/app/(with-layouts)/(dashboard)/director/regional-performance/_components/capability-summary.tsx)
- [priority-actions.tsx](../../src/app/(with-layouts)/(dashboard)/director/regional-performance/_components/priority-actions.tsx)
- [types.ts](../../src/app/(with-layouts)/(dashboard)/director/regional-performance/_components/types.ts)
- [data.ts](../../src/app/(with-layouts)/(dashboard)/director/regional-performance/_components/data.ts)

## 2. Tình trạng tích hợp hiện tại

Route hiện chưa gọi API. Các component đang import fixture trực tiếp từ `data.ts`; năm tuyển sinh, scope và danh sách action cũng còn có nội dung tĩnh.

Contract bên dưới là contract production đề xuất. Khi tích hợp, frontend nên thay dataset local bằng một response duy nhất để tổng funnel, số liệu địa bàn và các tỷ lệ được lấy từ cùng một snapshot. Không dùng fixture local làm fallback im lặng khi API production lỗi.

## 3. Endpoint và quyền truy cập

```http
GET {NEXT_PUBLIC_FRAPPE_URL}/api/method/crm.api.director_regional_performance.get_director_regional_performance
Cookie: sid=<Frappe session cookie>
Accept: application/json
```

Method chỉ đọc và Frappe bọc response thành công trong `message`. API không trả PII.

Backend phải kiểm tra quyền Director trước khi áp dụng `scope`:

- profile nghiệp vụ `Admissions Director`;
- `Administrator` hoặc `System Manager` có quyền phù hợp;
- scope yêu cầu phải nằm trong phạm vi user được cấp quyền.

Không để client tự quyết định danh sách tỉnh hoặc vượt scope bằng cách sửa query string.

## 4. Request

Ví dụ:

```http
GET /api/method/crm.api.director_regional_performance.get_director_regional_performance?admissionYear=2026&scope=all
```

### Query parameters

| Tên | Kiểu | Bắt buộc | Mặc định | Ràng buộc / mô tả |
|---|---|---:|---|---|
| `admissionYear` | integer | Không | Kỳ active duy nhất | Năm 4 chữ số trong khoảng `2000..2100` |
| `scope` | string | Không | `all` | `all` hoặc scope/territory ID mà user được cấp quyền |

`scope` xác định các địa bàn được trả trong `provinces`. Với `scope=all`, backend chỉ trả các địa bàn thuộc phạm vi Director, không mặc định là toàn bộ tỉnh trong hệ thống.

Nếu không truyền `admissionYear`, backend chỉ được tự chọn kỳ khi có đúng một kỳ tuyển sinh active. Nếu có 0 hoặc nhiều hơn 1 kỳ active, trả `422 INVALID_ADMISSION_YEAR` thay vì tự chọn không xác định.

Không cần truyền `provinceId` cho lần tải đầu. Màn hình cần danh sách tổng của toàn scope; select địa bàn chỉ đổi `selectedProvince` ở client và dùng lại snapshot hiện tại.

## 5. Response `200 OK`

Shape tổng quát:

```text
{
  message: {
    meta: RegionalPerformanceMeta,
    capabilityColumns: CapabilityColumn[],
    provinces: RegionPerformance[],
    priorityActions: PriorityAction[]
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
      "scopeLabel": "7 địa bàn trọng điểm",
      "asOf": "2026-08-31T10:00:00+07:00",
      "timezone": "Asia/Ho_Chi_Minh",
      "status": "available",
      "trendMonths": 6,
      "warnings": []
    },
    "capabilityColumns": [
      { "key": "leadGeneration", "label": "Tạo nguồn hồ sơ" },
      { "key": "counselling", "label": "Tư vấn" },
      { "key": "quality", "label": "Chất lượng hồ sơ" },
      { "key": "conversion", "label": "Tỷ lệ nhập học" },
      { "key": "campaigns", "label": "Hoạt động tuyển sinh" },
      { "key": "productivity", "label": "Năng suất đội ngũ" }
    ],
    "provinces": [
      {
        "id": "dak-lak",
        "name": "Đắk Lắk",
        "applications": 826,
        "enrollments": 166,
        "enrollmentTarget": 218,
        "targetAchievement": 76.1,
        "conversion": 20.1,
        "applicationChange": -2.8,
        "enrollmentChange": -4.6,
        "activeAdvisors": 8,
        "capacity": 94,
        "health": "critical",
        "trend": [
          {
            "month": "T2/2026",
            "applications": 317,
            "enrollments": 58,
            "previousApplications": 288
          }
        ],
        "funnel": [
          { "id": "applications", "stage": "Hồ sơ đăng ký", "value": 826 },
          { "id": "qualified", "stage": "Đủ điều kiện", "value": 512 },
          { "id": "counselling", "stage": "Đang tư vấn", "value": 389 },
          { "id": "enrolled", "stage": "Đã nhập học", "value": 166 }
        ],
        "capabilities": {
          "leadGeneration": "watch",
          "counselling": "critical",
          "quality": "watch",
          "conversion": "watch",
          "campaigns": "critical",
          "productivity": "critical"
        }
      }
    ],
    "priorityActions": [
      {
        "id": "a1",
        "title": "Bổ sung 2 tư vấn viên cho Đắk Lắk",
        "detail": "Đội ngũ đã dùng 94% khả năng xử lý hồ sơ.",
        "provinceId": "dak-lak",
        "priority": "Cao",
        "tone": "critical"
      },
      {
        "id": "a5",
        "title": "Nhân rộng cách tư vấn hiệu quả",
        "detail": "Chia sẻ kịch bản từ địa bàn có tỷ lệ chuyển đổi tốt.",
        "provinceId": "all",
        "priority": "Thấp",
        "tone": "good"
      }
    ]
  }
}
```

`trend` luôn trả đủ số điểm theo `meta.trendMonths` nếu dữ liệu kỳ hiện tại và kỳ so sánh tồn tại. Nếu một điểm không có dữ liệu, dùng `null` cho metric thiếu và thêm warning; không dùng `0` để giả lập tháng chưa có dữ liệu. Frontend hiện tại cần được cập nhật để render trạng thái thiếu dữ liệu trước khi nhận các field nullable.

## 6. Schema và semantics

### 6.1. `meta`

| Field | Kiểu | Mô tả |
|---|---|---|
| `admissionYear` | integer | Kỳ tuyển sinh của toàn bộ response |
| `scope` | string | Scope canonical sau khi backend resolve quyền |
| `scopeLabel` | string | Nhãn hiển thị, ví dụ `7 địa bàn trọng điểm` |
| `asOf` | ISO-8601 string | Thời điểm snapshot; phải kèm timezone hoặc offset |
| `timezone` | string | Timezone dùng để cắt kỳ, ví dụ `Asia/Ho_Chi_Minh` |
| `status` | `available \| partial` | `partial` khi một nguồn hoặc một nhóm metric không đầy đủ |
| `trendMonths` | integer | Số điểm trend được trả; mặc định `6` |
| `warnings` | string[] | Cảnh báo dữ liệu; khi không có trả `[]` |

`asOf`, `admissionYear`, `scope` và các metric phải thuộc cùng một snapshot. Không trộn số liệu hiện tại với kỳ trước được tính ở thời điểm khác.

### 6.2. `provinces[]`

| Field | Kiểu | Mô tả |
|---|---|---|
| `id` | string | ID địa bàn ổn định, dùng làm `selectedProvinceId` và `provinceId` |
| `name` | string | Tên địa bàn để hiển thị |
| `applications` | non-negative integer | Số hồ sơ đăng ký canonical trong kỳ và địa bàn |
| `enrollments` | non-negative integer | Số hồ sơ đã hoàn tất nhập học trong kỳ |
| `enrollmentTarget` | non-negative integer | Chỉ tiêu nhập học dùng làm denominator của `targetAchievement` |
| `targetAchievement` | number | Phần trăm đạt chỉ tiêu, công thức `enrollments / enrollmentTarget * 100` |
| `conversion` | number \| null | Tỷ lệ nhập học, công thức `enrollments / applications * 100` |
| `applicationChange` | number \| null | Phần trăm thay đổi hồ sơ so với kỳ so sánh tương ứng |
| `enrollmentChange` | number \| null | Phần trăm thay đổi nhập học so với kỳ so sánh tương ứng |
| `activeAdvisors` | non-negative integer \| null | Số tư vấn viên đang được phân công và có hoạt động trong scope |
| `capacity` | number \| null | Phần trăm công suất xử lý đang sử dụng |
| `health` | `good \| watch \| critical` | Trạng thái tổng hợp do backend tính theo rule nghiệp vụ |
| `trend` | `MonthlyTrend[]` | Xu hướng hồ sơ/nhập học theo tháng |
| `funnel` | `FunnelStage[]` | Funnel theo thứ tự canonical |
| `capabilities` | `CapabilityKey -> HealthTone` | Trạng thái của sáu khâu năng lực |

Các giá trị phần trăm là số, không phải chuỗi đã format. Không thêm `%` hoặc dùng dấu phẩy thập phân trong JSON.

`capacity` phải có một denominator được định nghĩa ở backend, ví dụ workload mở chia cho throughput kế hoạch của đội ngũ. Không tính capacity từ số tư vấn viên đơn thuần; số tư vấn viên chỉ được trả riêng ở `activeAdvisors`.

### 6.3. `trend[]`

```json
{
  "month": "T2/2026",
  "applications": 317,
  "enrollments": 58,
  "previousApplications": 288
}
```

- `month` là label ổn định theo timezone của response; nên chứa cả tháng và năm để tránh nhập nhằng giữa các niên khóa.
- `applications` là số hồ sơ của kỳ hiện tại tại tháng đó.
- `previousApplications` là số hồ sơ của kỳ so sánh tương ứng, không phải tháng liền trước của cùng kỳ.
- `enrollments` là số hồ sơ hoàn tất nhập học ghi nhận trong tháng.
- Mảng phải sắp xếp tăng dần theo thời gian và có tối đa 12 điểm.

Kỳ so sánh phải dùng cùng logic school-year/corresponding month. Không so sánh tuỳ tiện theo tháng Gregorian nếu hai niên khóa bắt đầu lệch thời điểm.

### 6.4. `funnel[]`

Funnel phải có đúng bốn stage và đúng thứ tự sau:

| `id` | `stage` | Ý nghĩa |
|---|---|---|
| `applications` | `Hồ sơ đăng ký` | Hồ sơ đã tạo trong kỳ |
| `qualified` | `Đủ điều kiện` | Hồ sơ qua bước đánh giá điều kiện |
| `counselling` | `Đang tư vấn` | Hồ sơ đang hoặc đã đi qua bước tư vấn |
| `enrolled` | `Đã nhập học` | Hồ sơ đã hoàn tất xác nhận nhập học |

`value` là non-negative integer. Vì đây là funnel lồng nhau, phải thoả:

```text
applications >= qualified >= counselling >= enrolled
```

Frontend tự tính:

```text
remainingRate(stage) = stage.value / applications.value * 100
stepConversion(stage) = stage.value / previousStage.value * 100
dropOff(stage) = 100 - stepConversion(stage)
```

Nếu denominator bằng `0`, rate phải là `null`, không phải `0` hoặc `100`. Nếu backend trả thêm rate đã tính sẵn, rate đó phải dùng cùng snapshot và cùng quy tắc làm tròn.

### 6.5. `capabilityColumns` và `capabilities`

`capabilityColumns` xác định label và thứ tự hiển thị. `key` chỉ nhận các giá trị:

```text
leadGeneration | counselling | quality | conversion | campaigns | productivity
```

Mỗi value trong `provinces[].capabilities` chỉ nhận:

```text
good | watch | critical
```

Backend nên giữ rule tính tone ở một nơi và trả kết quả canonical. Không để frontend tự suy ra trạng thái năng lực từ một metric đơn lẻ nếu rule nghiệp vụ cần nhiều nguồn dữ liệu.

### 6.6. `priorityActions[]`

| Field | Kiểu | Mô tả |
|---|---|---|
| `id` | string | ID action ổn định, dùng cho key và audit |
| `title` | string | Tiêu đề ngắn |
| `detail` | string | Lý do/insight hỗ trợ action |
| `provinceId` | string | ID địa bàn hoặc `all` cho action dùng chung |
| `priority` | `Cao \| Trung bình \| Thấp` | Mức ưu tiên hiển thị hiện tại |
| `tone` | `good \| watch \| critical` | Màu trạng thái tương ứng |

API trả action theo thứ tự ưu tiên giảm dần. `priorityActions` là aggregate trong cùng snapshot; không nhúng PII hoặc thông tin cá nhân của tư vấn viên/học sinh.

Khi chọn một địa bàn, frontend chỉ giữ các action thỏa:

```text
action.provinceId === selectedProvinceId || action.provinceId === "all"
```

Nếu không có action, trả `[]`; không trả `null`.

## 7. Quy tắc dữ liệu

- `applications`, `enrollments`, `funnel[].value` và các count khác chỉ trả `0` khi backend đã truy vấn thành công và kết quả canonical thực sự bằng 0.
- Rate, change, capacity hoặc median chưa có denominator/nguồn tin cậy phải trả `null`, kèm `status: "partial"` hoặc warning phù hợp.
- `targetAchievement` không được tự suy ra từ `conversion`; chỉ tiêu là một denominator nghiệp vụ độc lập.
- `applicationChange` và `enrollmentChange` phải dùng cùng kỳ so sánh, cùng scope và cùng định nghĩa record. Denominator bằng 0 thì trả `null`.
- Các aggregate overview được frontend cộng từ `provinces[]`; mọi province phải dùng cùng bốn funnel stage theo đúng order và semantics.
- Không trả PII trong endpoint aggregate. ID địa bàn không được chứa tên học sinh, số điện thoại hoặc email.
- `provinces` phải là array, kể cả khi scope không có dữ liệu. Khi scope hợp lệ nhưng rỗng, trả schema hợp lệ với `provinces: []`, `priorityActions: []` và `status: "available"`.

## 8. Errors

```json
{
  "error": {
    "code": "REGIONAL_PERFORMANCE_DATA_UNAVAILABLE",
    "message": "Không thể tải dữ liệu hiệu suất theo địa bàn.",
    "details": {}
  }
}
```

| HTTP | Code | Khi nào |
|---:|---|---|
| `400` | `INVALID_QUERY` | Query không đúng kiểu hoặc enum |
| `401` | `UNAUTHENTICATED` | Guest hoặc session không hợp lệ |
| `403` | `FORBIDDEN` | User không có profile/quyền Director |
| `422` | `INVALID_ADMISSION_YEAR` / `INVALID_SCOPE` | Kỳ tuyển sinh hoặc scope không hợp lệ |
| `502` | `INVALID_REGIONAL_PERFORMANCE_RESPONSE` | Upstream trả schema không hợp lệ |
| `503` | `REGIONAL_PERFORMANCE_DATA_UNAVAILABLE` | Không đọc được nguồn aggregate chính |

Không trả `200` với một phần field bị đổi tên, sai kiểu hoặc thiếu stage bắt buộc. Nếu dữ liệu nghiệp vụ chỉ thiếu một nhóm metric nhưng schema vẫn hợp lệ, dùng `status: "partial"` và `null`/warning theo quy tắc ở trên.

## 9. Luồng gọi tối thiểu ở frontend

Để render đầy đủ route bằng dữ liệu thật, frontend chỉ cần:

1. Gọi `GET ...get_director_regional_performance?admissionYear=2026&scope=all` một lần khi tải màn hình.
2. Lấy danh sách select từ `provinces[]`.
3. Dùng `selectedProvinceId` để chọn một object trong snapshot hiện tại; không gọi lại API khi đổi địa bàn.
4. Tính aggregate funnel từ các `provinces[].funnel` cùng order canonical.
5. Hiển thị lỗi/partial state theo `meta.status`, `meta.warnings`; không âm thầm quay về `data.ts` trong production.

Nếu cần export, nên tạo method riêng với cùng `admissionYear`, `scope`, snapshot và quyền truy cập; không dùng response aggregate làm file export bằng cách format lại ở client.
