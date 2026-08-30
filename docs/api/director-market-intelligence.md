# API cho `/director/market-intelligence`

Tài liệu này tổng hợp nguồn dữ liệu, request/response hiện có và contract production cần thiết cho bản đồ phân tích thị trường trường THPT.

## 1. Phạm vi màn hình

Trang hiện có hai vùng chính:

| Vùng UI | Dữ liệu cần | Trạng thái hiện tại |
|---|---|---|
| Bản đồ tỉnh/thành | GeoJSON ranh giới, mã/tên tỉnh, màu theo `opportunity` | GeoJSON local + metric sinh ở client |
| Bộ lọc vùng | `all`, `north`, `central`, `highlands`, `south`, `mekong` | Enum hard-code, filter client |
| Tìm nhanh tỉnh/thành | tên tỉnh, mã tỉnh, điểm cơ hội | Tìm trong mảng tỉnh đã tải, tối đa 5 kết quả |
| Footer bản đồ | dung lượng lớp 12, leads, CR, doanh thu, hotspot | Tính từ metric tỉnh; growth đang hard-code |
| Inspector địa bàn | metric tỉnh, khuyến nghị, hành động, danh sách trường | Tính từ dữ liệu mock |
| School spotlight | metric và hành động của trường được chọn | Tính từ dữ liệu mock |
| Campus marker | tên campus, tọa độ, tuyển hiện tại, target, ngành nổi bật | Model có trong code nhưng component chưa được mount vào bản đồ hiện tại |
| Xuất dữ liệu | CSV theo tỉnh | Tạo trực tiếp trên browser, chưa gọi API |

Nguồn tham chiếu:

- [page.tsx](../../src/app/(with-layouts)/(dashboard)/director/market-intelligence/page.tsx)
- [market-intelligence-dashboard.tsx](../../src/app/(with-layouts)/(dashboard)/director/market-intelligence/_components/market-intelligence-dashboard.tsx)
- [market-map.tsx](../../src/app/(with-layouts)/(dashboard)/director/market-intelligence/_components/market-map.tsx)
- [province-inspector.tsx](../../src/app/(with-layouts)/(dashboard)/director/market-intelligence/_components/province-inspector.tsx)
- [types.ts](../../src/app/(with-layouts)/(dashboard)/director/market-intelligence/_components/types.ts)
- [school-directory.ts](../../src/services/api/schools/school-directory.ts)

## 2. Luồng dữ liệu hiện tại

Trang hiện **chưa gọi HTTP API market-intelligence**. Luồng render hiện tại là:

1. Server gọi `getSchoolDirectory()` và đọc file `docs/danh_sach_truong_thpt_2025_clean.csv`.
2. Server chỉ truyền bốn field của mỗi trường sang client: `id`, `provinceCode`, `district`, `name`.
3. Client gọi asset tĩnh `/market-intelligence/vietnam-provinces-2025.json`.
4. Client ghép từng tỉnh trong GeoJSON với danh mục trường bằng `provinceCode`.
5. `toProvinceMetrics()` tự sinh `ProvinceMetrics`, bao gồm leads, conversion, revenue, competition, grade-12 population và danh sách trường mock.
6. Bản đồ, inspector và footer đều đọc từ mảng `provinces` đã được sinh ở bước 5.

Các metric hiện tại là dữ liệu mô phỏng có tính xác định theo mã/tên tỉnh, không phải số liệu lấy từ CRM. Khi kết nối backend thật, nên trả `ProvinceMetrics` đã tính ở server để đảm bảo một nguồn sự thật, truy vết được kỳ dữ liệu và tránh đưa công thức nghiệp vụ vào frontend.

## 3. Nguồn dữ liệu hiện có

### 3.1. Asset ranh giới hành chính

```http
GET /market-intelligence/vietnam-provinces-2025.json
```

Đây là file public tại [vietnam-provinces-2025.json](../../public/market-intelligence/vietnam-provinces-2025.json), hiện có 34 document tỉnh/thành.

Response là một array `ProvinceGeometryDocument[]`:

```json
[
  {
    "Code": "01",
    "Name": "Hà Nội",
    "FullName": "Thành phố Hà Nội",
    "GIS": {
      "Geometry": {
        "type": "MultiPolygon",
        "coordinates": "<GeoJSON coordinates>"
      },
      "BoundingBox": {
        "MinLongitude": 105.28695,
        "MinLatitude": 20.564756,
        "MaxLongitude": 106.018302,
        "MaxLatitude": 21.384203
      }
    }
  }
]
```

Contract geometry:

| Field | Kiểu | Bắt buộc | Mô tả |
|---|---|---:|---|
| `Code` | string | Có | Mã tỉnh, giữ cả số 0 ở đầu, ví dụ `01` |
| `Name` | string | Có | Tên hiển thị ngắn, ví dụ `Hà Nội` |
| `FullName` | string | Có | Tên đầy đủ, ví dụ `Thành phố Hà Nội` |
| `GIS.Geometry` | GeoJSON `MultiPolygon` | Có | Ranh giới dùng để vẽ SVG map |
| `GIS.BoundingBox` | object | Có | Bounds dùng cho zoom hoặc fit map |

Nếu backend trả geometry qua API thay vì asset public, nên giữ đúng `MultiPolygon`, thứ tự tọa độ GeoJSON `[longitude, latitude]` và mã tỉnh canonical.

### 3.2. Danh mục trường THPT

Service server hiện đọc CSV và chuẩn hóa thành `SchoolDirectoryRecord`:

```text
GET /api/mock/schools?limit=100
```

Request hiện tại:

- Không có request body.
- `limit` mặc định `50`, tối đa `100`, tối thiểu `1`.
- `q` tìm theo tên trường, tỉnh, quận/huyện và mã trường.
- Không có phân trang thật; response chỉ trả tối đa `limit` bản ghi.

Response `200 OK`:

```json
{
  "data": [
    {
      "id": "01-01-062",
      "provinceCode": "01",
      "province": "Hà Nội",
      "districtCode": "01",
      "district": "Quận Ba Đình",
      "schoolCode": "062",
      "name": "THPT Nguyễn Trãi-Ba Đình",
      "address": "Số 50 phố Nam Cao, phường Giảng Võ, quận Ba Đình, TP Hà Nội",
      "area": "KV3",
      "isBoardingSchool": false
    }
  ],
  "meta": {
    "total": 1,
    "query": "nguyen"
  }
}
```

CSV hiện có 4.337 trường THPT hợp lệ trên 64 tỉnh/thành theo dữ liệu nguồn. GeoJSON hiện có 34 tỉnh/thành, vì vậy không phải toàn bộ danh mục CSV đều được đưa vào bản đồ hiện tại.

Các endpoint schools khác:

| Method | Endpoint | Dùng cho market intelligence hiện tại |
|---|---|---|
| `GET` | `/api/mock/schools/suggestions?q=nguyen&limit=8` | Không dùng; hỗ trợ autocomplete |
| `GET` | `/api/mock/schools/{schoolId}` | Không dùng khi tải bản đồ; dùng để lấy record directory riêng |
| `GET` | `/api/mock/schools/report` | Không dùng; trả báo cáo tổng danh mục trường |

Lưu ý: `/api/mock/schools` không đủ để thay thế toàn bộ danh mục cho trang này nếu chỉ gọi với `limit` mặc định, vì handler giới hạn tối đa 100 bản ghi trong khi nguồn hiện có 4.337 trường.

## 4. Dữ liệu đang hiển thị trên UI

### 4.1. Metric theo tỉnh

Một tỉnh được map vào `ProvinceMetrics`:

| Field | Kiểu/unit | Dùng ở UI |
|---|---|---|
| `code` | string | Join với GeoJSON và chọn tỉnh |
| `name` | string | Label map, search, inspector |
| `regionKey` | enum | Filter vùng |
| `opportunity` | number, `0..100` | Màu heatmap, score, badge |
| `leads` | integer | Inspector và footer |
| `conversion` | number, `%` | Inspector và footer CR |
| `competition` | number, `0..100` | Metric data; chưa hiển thị trực tiếp trên inspector |
| `revenue` | number, tỷ VND | Inspector và footer |
| `grade12Population` | integer | Inspector và footer |
| `penetrationRate` | number, `%` | Metric tiếp cận |
| `trend` | number, `% YoY` | Inspector hint doanh thu |
| `recommendation` | string | Card `Cơ hội khu vực` |
| `keyAction` | string | Hành động kế tiếp của khu vực |
| `highSchools` | `HighSchoolItem[]` | Marker, school list, spotlight |

`MetricKey` hiện khai báo năm metric:

```text
opportunity | leads | conversion | competition | revenue
```

Tuy nhiên `MarketMap` hiện cố định `activeMetric = "opportunity"`. Vì vậy lần tải đầu bắt buộc phải có `opportunity`; bốn metric còn lại được dùng trong inspector hoặc là dữ liệu dự phòng cho mở rộng sau này.

### 4.2. Trường nổi bật trong tỉnh

`HighSchoolItem` cần các field sau:

| Field | Kiểu/unit | Dùng ở UI |
|---|---|---|
| `id` | string | Key, marker và chọn trường |
| `directoryId` | string, optional hiện tại | Chuyển tới `/director/schools/{schoolCode}` |
| `name` | string | Danh sách, marker label |
| `district` | string | Danh sách và spotlight |
| `tier` | `Tier 1 \| Tier 2 \| Tier 3` | Model hiện có; chưa hiển thị trực tiếp |
| `potentialScore` | number, `0..100` | Sort, marker, Potential |
| `grade12Students` | integer | Spotlight |
| `prospects` | integer | Spotlight |
| `penetrationRate` | number, `%` | Danh sách và spotlight |
| `applications` | integer | Recommendation trong spotlight |
| `enrollmentForecast` | integer | Forecast trong spotlight |
| `conversionRate` | number, `%` | CR trong spotlight |
| `lastActivity` | string | Spotlight |
| `recommendation` | string | Spotlight |
| `nextAction` | string | Spotlight |
| `classification` | enum | Màu marker và badge |

Enum `classification`:

```text
Trọng điểm | Mở rộng | Duy trì | Sàng lọc
```

Khi người dùng click trường, frontend chỉ chuyển route nếu `directoryId` tồn tại. Backend cần trả `directoryId` là school directory id canonical, không dùng tên trường làm khóa.

### 4.3. Summary ở footer map

Footer lọc theo `activeRegion`, sau đó tính:

```text
totalGrade12 = SUM(province.grade12Population)
totalLeads = SUM(province.leads)
avgConversion = AVG(province.conversion)
hotspotCount = COUNT(province.opportunity >= 75)
totalRevenue = SUM(province.revenue)
count = COUNT(province)
```

Ba phần trăm tăng trưởng bên cạnh dung lượng, leads và doanh thu hiện đang hard-code lần lượt là `+3.8%`, `+14.2%`, `+14.5%`. Production nên trả các giá trị này từ server để chúng thay đổi theo kỳ và vùng. Khi không có tỉnh phù hợp, code hiện có fallback hard-code; API nên trả `data: []` hoặc marker `unavailable` thay vì hiển thị số giả.

## 5. Contract production đề xuất

### 5.1. Overview động

Nên có một endpoint trả toàn bộ metric cần cho lần tải đầu. Geometry nên giữ ở asset/CDN cacheable hoặc endpoint riêng; không cần nhúng polygon lớn vào mỗi response metric.

```http
GET /api/market-intelligence/overview?admissionYear=2026&period=30d&region=all&metric=opportunity
Authorization: Bearer <access-token>
Accept: application/json
```

Request không có body.

Query parameters:

| Tên | Kiểu | Bắt buộc | Mặc định | Mô tả |
|---|---|---:|---:|---|
| `admissionYear` | integer | Nên có | Kỳ hiện hành | Kỳ tuyển sinh cần phân tích |
| `period` | enum/string | Không | `30d` | Cửa sổ metric, tối thiểu `30d`, có thể mở rộng `7d`, `90d`, hoặc `from/to` |
| `region` | enum | Không | `all` | `all`, `north`, `central`, `highlands`, `south`, `mekong` |
| `metric` | enum | Không | `opportunity` | Metric dùng cho choropleth: `opportunity`, `leads`, `conversion`, `competition`, `revenue` |
| `includeSchools` | boolean | Không | `true` | Có trả danh sách trường nổi bật theo tỉnh hay không |
| `schoolLimit` | integer | Không | `6` | Số trường nổi bật mỗi tỉnh; nên giới hạn tối đa `20` |

`region` chỉ nên dùng để tối ưu payload. Nếu frontend cần đổi vùng tức thời như hiện tại, lần tải đầu nên lấy `region=all`, rồi filter client từ cùng snapshot.

### 5.2. Response overview

```json
{
  "data": {
    "totalProvinces": 34,
    "totalSchools": 4337,
    "provinces": [
      {
        "code": "01",
        "name": "Hà Nội",
        "fullName": "Thành phố Hà Nội",
        "regionKey": "north",
        "opportunity": 91,
        "leads": 28640,
        "conversion": 21.4,
        "competition": 88,
        "revenue": 294.3,
        "grade12Population": 74200,
        "penetrationRate": 8.3,
        "trend": 14.2,
        "recommendation": "Ưu tiên tối đa ngân sách marketing và tăng cường workshop tại các trường trọng điểm.",
        "keyAction": "Mở rộng điểm tư vấn lưu động và ký hợp tác ngày hội Open Day.",
        "schoolCount": 612,
        "highSchools": [
          {
            "id": "01-01-062",
            "directoryId": "01-01-062",
            "name": "THPT Nguyễn Trãi-Ba Đình",
            "district": "Quận Ba Đình",
            "tier": "Tier 1",
            "potentialScore": 94,
            "grade12Students": 820,
            "prospects": 206,
            "penetrationRate": 8.4,
            "applications": 44,
            "enrollmentForecast": 23,
            "conversionRate": 21.4,
            "lastActivity": "2026-05-25T09:00:00+07:00",
            "recommendation": "Giữ và làm sâu quan hệ trong 30 ngày tới.",
            "nextAction": "Đặt lịch Career Talk kết hợp Parent Session.",
            "classification": "Trọng điểm"
          }
        ]
      }
    ],
    "regionSummary": {
      "scope": "all",
      "count": 34,
      "totalGrade12": 605502,
      "totalLeads": 175102,
      "avgConversion": 13.8,
      "hotspotCount": 13,
      "totalRevenue": 1420.9,
      "grade12Trend": 3.8,
      "leadsTrend": 14.2,
      "revenueTrend": 14.5
    },
    "metricConfig": {
      "key": "opportunity",
      "label": "Điểm cơ hội",
      "unit": "/100",
      "min": 40,
      "max": 95
    },
    "geometry": {
      "url": "/market-intelligence/vietnam-provinces-2025.json",
      "version": "2025",
      "count": 34
    }
  },
  "meta": {
    "admissionYear": 2026,
    "period": "30d",
    "periodLabel": "30 ngày gần nhất",
    "region": "all",
    "metric": "opportunity",
    "asOf": "2026-06-06T10:00:00+07:00",
    "currency": "VND",
    "scope": "director"
  }
}
```

Quy ước:

- `provinces` chứa metric tỉnh và các trường nổi bật đủ để vẽ marker, inspector và spotlight.
- `totalProvinces` và `totalSchools` là tổng trong scope đã áp dụng; dùng cho header map, không suy ra `totalSchools` bằng `SUM(highSchools.length)` nếu danh sách trường đã giới hạn.
- `schoolCount` là tổng số trường trong tỉnh; `highSchools` chỉ là danh sách trường nổi bật trả cho map, không nhất thiết chứa toàn bộ danh mục.
- `revenue` trong response tương thích UI hiện tại là đơn vị **tỷ VND**. Nếu API chuẩn hóa về VND nguyên, cần đổi tên thành `revenueVnd` và để frontend format.
- `trend`, `grade12Trend`, `leadsTrend`, `revenueTrend` là phần trăm thay đổi so với kỳ so sánh; số âm phải được giữ nguyên dấu.
- `asOf` phải là ISO-8601 có timezone và áp dụng chung cho metric tỉnh, summary và danh sách trường.
- `scope` phải phản ánh quyền Director/territory đã áp dụng ở server trước khi aggregate.

### 5.3. Geometry API tùy chọn

Nếu không muốn phục vụ file public trực tiếp, có thể expose endpoint riêng:

```http
GET /api/geographies/vietnam/provinces?version=2025
```

Response giữ nguyên `ProvinceGeometryDocument[]` như mục 3.1. Geometry có thể cache lâu hơn metric, vì vậy không nên gộp polygon vào mỗi request overview nếu không cần.

### 5.4. Lazy load theo tỉnh/trường tùy chọn

Nếu overview chỉ trả trường nổi bật hoặc không trả `highSchools`, dùng endpoint sau khi chọn tỉnh:

```http
GET /api/market-intelligence/provinces/{provinceCode}?admissionYear=2026&period=30d
```

Response:

```json
{
  "data": {
    "code": "01",
    "name": "Hà Nội",
    "regionKey": "north",
    "opportunity": 91,
    "leads": 28640,
    "conversion": 21.4,
    "competition": 88,
    "revenue": 294.3,
    "grade12Population": 74200,
    "penetrationRate": 8.3,
    "trend": 14.2,
    "recommendation": "Ưu tiên tối đa ngân sách marketing.",
    "keyAction": "Mở rộng điểm tư vấn lưu động.",
    "schoolCount": 612,
    "highSchools": []
  },
  "meta": {
    "admissionYear": 2026,
    "period": "30d",
    "asOf": "2026-06-06T10:00:00+07:00"
  }
}
```

Với implementation hiện tại, lazy load không bắt buộc vì inspector có thể đọc từ `provinces` đã tải. Chỉ dùng phương án này nếu số lượng trường và payload thực tế tăng đáng kể.

## 6. Campus data

`FptuCampusLocation` hiện được khai báo tĩnh trong `data.ts` với các field:

| Field | Kiểu | Mô tả |
|---|---|---|
| `id` | string | Mã campus |
| `name` | string | Tên đầy đủ |
| `shortName` | string | Nhãn trên bản đồ |
| `region` | string | Vùng |
| `city` | string | Tỉnh/thành |
| `coordinates` | `[lat, lng]` | Tọa độ hiển thị |
| `currentEnrolled` | integer | Số đã tuyển hiện tại |
| `target` | integer | Chỉ tiêu |
| `highlightMajor` | string | Nhóm ngành nổi bật |

`CampusMarkerLayer` chưa được import/render trong `MarketMap`, nên campus không phải dữ liệu bắt buộc để render trạng thái hiện tại. Nếu bật layer này, bổ sung `campuses` vào overview response với đúng schema trên và thống nhất thứ tự tọa độ API là `[latitude, longitude]` hoặc đổi sang object `{ latitude, longitude }` để tránh nhầm với GeoJSON `[longitude, latitude]`.

## 7. Export và action chưa có API

### 7.1. Export CSV

Hiện tại nút `Xuất` tạo CSV ngay trên client với các cột:

```text
Mã Tỉnh,
Tên Tỉnh,
Vùng,
Dung lượng Lớp 12,
Điểm Tiềm Năng,
Leads,
Tỷ lệ CR (%),
Cạnh Tranh,
Doanh Thu (Tỷ VND)
```

Nếu cần export production từ server:

```http
GET /api/market-intelligence/export?admissionYear=2026&period=30d&region=all&metric=opportunity
Authorization: Bearer <access-token>
Accept: text/csv
```

Response nên là file CSV với:

```http
HTTP/1.1 200 OK
Content-Type: text/csv; charset=utf-8
Content-Disposition: attachment; filename="market-intelligence-2026-06-06.csv"
```

Export không thuộc request initial để render màn hình.

### 7.2. Kích hoạt chiến dịch

Nút `Kích hoạt chiến dịch tại {province}` hiện chỉ hiển thị toast. Nếu triển khai nghiệp vụ, cần một command riêng, ví dụ:

```http
POST /api/market-intelligence/campaign-plans
Content-Type: application/json
```

```json
{
  "admissionYear": 2026,
  "provinceCode": "01",
  "source": "market-intelligence",
  "requestedAction": "activate"
}
```

Command này không cần cho việc hiển thị bản đồ và nên được thiết kế sau khi có workflow campaign/approval rõ ràng.

## 8. Error contract

Lỗi tải geometry hiện được UI xử lý bằng màn hình `MapError`. API production nên trả cùng format cho overview, geography và export:

```json
{
  "error": {
    "code": "MARKET_DATA_UNAVAILABLE",
    "message": "Không thể tải dữ liệu phân tích thị trường.",
    "details": "Market snapshot chưa sẵn sàng cho kỳ tuyển sinh này."
  },
  "meta": {
    "requestId": "req_01J..."
  }
}
```

Status tối thiểu:

| Status | Code | Khi dùng |
|---:|---|---|
| `200` | - | Overview/geometry thành công; mảng rỗng vẫn trả `200` nếu scope hợp lệ |
| `400` | `INVALID_QUERY` | Sai enum `region`, `metric`, kỳ hoặc period |
| `401` | `UNAUTHENTICATED` | Thiếu/hết hạn access token |
| `403` | `FORBIDDEN` | Không có quyền xem territory hoặc metric |
| `404` | `PROVINCE_NOT_FOUND` | Mã tỉnh không tồn tại khi lazy load |
| `409` | `SNAPSHOT_NOT_READY` | Snapshot đúng kỳ nhưng chưa hoàn tất |
| `500` | `INTERNAL_ERROR` | Lỗi không dự kiến phía server |
| `503` | `MARKET_DATA_UNAVAILABLE` | Nguồn dữ liệu hoặc pipeline đang unavailable |

## 9. Tóm tắt request tối thiểu

Để render bản đồ và inspector theo implementation hiện tại bằng dữ liệu thật, frontend cần:

```http
GET /api/market-intelligence/overview?admissionYear=2026&period=30d&region=all&metric=opportunity
GET /market-intelligence/vietnam-provinces-2025.json
```

Overview bắt buộc phải có:

1. `data.provinces[]` với mã/tên/vùng, `opportunity`, leads, conversion, revenue, dung lượng lớp 12, penetration, trend và recommendation.
2. `data.totalProvinces`, `data.totalSchools` cho header map.
3. `data.provinces[].highSchools[]` với ít nhất các trường nổi bật để map marker và inspector.
4. `data.regionSummary` với các aggregate footer và ba chỉ số growth.
5. `data.geometry.url` hoặc một geometry response riêng có cùng `code` với province metric.
6. `meta.admissionYear`, `meta.period`, `meta.asOf`, `meta.scope`.

Khi người dùng đổi vùng hoặc tìm tỉnh, UI hiện tại có thể filter client từ snapshot đã tải và không cần request mới. Khi click trường, cần `directoryId` để chuyển tới `/director/schools/{schoolCode}`. Contract detail và quy ước `directoryId` được mô tả tại [director-school-detail.md](./director-school-detail.md); trang school detail hiện vẫn dựng dữ liệu mock riêng, chưa có API intelligence hoàn chỉnh.
