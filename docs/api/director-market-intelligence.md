# Director Market Intelligence API

Contract đang được dùng bởi trang `/director/market-intelligence`. Server page gọi Frappe, chuyển tiếp cookie theo request, dùng `cache: "no-store"` và không quay về CSV/mock khi API lỗi.

## Endpoint và quyền truy cập

```http
GET {NEXT_PUBLIC_FRAPPE_URL}/api/method/crm.api.director_market_intelligence.get_director_market_intelligence_overview
Cookie: sid=<Frappe session cookie>
Accept: application/json
```

Method chỉ nhận `GET`; Frappe bọc kết quả thành công trong `message`. Quyền hợp lệ: `Administrator`, profile chuẩn `Admissions Director`, hoặc `System Manager` không đồng thời mang business role bị cấm. Kiểm tra quyền chạy trước truy vấn dữ liệu.

## Query parameters

| Tên | Kiểu | Mặc định | Ràng buộc |
|---|---|---|---|
| `admissionYear` | integer/string | Kỳ active duy nhất | Năm 4 chữ số, `2000..2100` |
| `period` | string | `30d` | Hiện chỉ hỗ trợ `30d` |
| `region` | string | `all` | `all`, `north`, `central`, `highlands`, `south`, `mekong` |
| `metric` | string | `opportunity` | `opportunity`, `leads`, `conversion`, `competition`, `revenue` |
| `includeSchools` | boolean | `true` | Chỉ `true` hoặc `false` |
| `schoolLimit` | integer | `6` | `1..20` |

Nếu bỏ `admissionYear`, phải có đúng một `CRM Admission Year` active; nếu không API trả `422`.

## Response `200`

```json
{
  "message": {
    "status": "available",
    "data": {
      "totalProvinces": 1,
      "totalSchools": 2,
      "provinces": [
        {
          "code": "01",
          "name": "Hà Nội",
          "fullName": "Hà Nội",
          "regionKey": "north",
          "opportunity": null,
          "leads": 12,
          "conversion": 25.0,
          "competition": null,
          "revenue": null,
          "grade12Population": null,
          "penetrationRate": null,
          "trend": null,
          "recommendation": null,
          "keyAction": null,
          "schoolCount": 2,
          "highSchools": [
            {
              "id": "01-00001-062",
              "directoryId": "01-00001-062",
              "name": "THPT Nguyễn Trãi",
              "district": "Phường Ba Đình",
              "tier": "Tier 1",
              "potentialScore": null,
              "grade12Students": null,
              "prospects": 5,
              "penetrationRate": null,
              "applications": 2,
              "enrollmentForecast": null,
              "conversionRate": 50.0,
              "lastActivity": null,
              "recommendation": null,
              "nextAction": null,
              "classification": "Trọng điểm"
            }
          ]
        }
      ],
      "regionSummary": {
        "scope": "all",
        "count": 1,
        "totalGrade12": null,
        "totalLeads": 12,
        "avgConversion": 25.0,
        "hotspotCount": null,
        "totalRevenue": null,
        "grade12Trend": null,
        "leadsTrend": null,
        "revenueTrend": null
      },
      "metricConfig": { "key": "opportunity", "label": null, "unit": null, "min": null, "max": null },
      "dataAvailability": {
        "opportunity": "unavailable",
        "competition": "unavailable",
        "revenue": "unavailable",
        "grade12Population": "unavailable"
      }
    },
    "dataAvailability": {
      "sections": {
        "identity": "available",
        "students": "available",
        "snapshots": "available",
        "wards": "available"
      },
      "fields": {
        "provinces[].opportunity": "unavailable",
        "provinces[].competition": "unavailable",
        "provinces[].revenue": "unavailable",
        "provinces[].grade12Population": "unavailable",
        "provinces[].recommendation": "unavailable"
      }
    },
    "meta": {
      "admissionYear": 2026,
      "period": "30d",
      "region": "all",
      "metric": "opportunity",
      "asOf": "2026-08-30",
      "scope": "director",
      "sourceDataRevision": "0123456789abcdef"
    }
  }
}
```

Ví dụ chỉ minh hoạ shape. Giá trị thực phụ thuộc quyền theo dòng và dữ liệu đã xác minh.

## Nguồn và semantics

- Tỉnh/trường: `CRM Province`, `CRM High School`.
- Lead/prospect: số `CRM Student` duy nhất theo tỉnh/trường và kỳ tuyển sinh.
- `schoolCount`: tổng số trường THPT của tỉnh; khác với `highSchools`, vốn là danh sách trường nổi bật và bị giới hạn bởi `schoolLimit`.
- Nếu nguồn `CRM Student` không đọc được, các aggregate `leads`, `prospects` và `regionSummary.totalLeads` là `null` kèm trạng thái nguồn `unavailable`; `0` chỉ có nghĩa là truy vấn thành công nhưng không có bản ghi.
- Application, enrollment, conversion: annual snapshot mới nhất có `verification_status = Verified`.
- Ward tạo ID canonical `{provinceCode}-{wardCode}-{schoolCode}`. Thiếu ward code làm `id`/`directoryId` của trường là `null`; frontend không tạo link detail.
- Opportunity, competition, revenue, grade-12 population, trend và recommendation chưa có nguồn đủ thẩm quyền: trả `null` + `unavailable`. `0` vẫn là dữ liệu hợp lệ.
- `status = partial` khi nguồn hỗ trợ lỗi/thiếu. Lỗi hoặc vượt cap ở nguồn tỉnh/trường chính trả `503`.
- Trường nổi bật được sắp theo application giảm dần, sau đó ID/tên; mọi source read đều bị giới hạn.

### Quy tắc màu tỉnh trên bản đồ

Màu tỉnh không dùng `provinces[].opportunity` hoặc `highSchools[].potentialScore`. Frontend tính một điểm nhiệt từ dữ liệu trường:

```text
điểm nhiệt = schoolCount / max(1, số highSchools có classification = "Trọng điểm")
```

Điểm càng cao nghĩa là một trường trọng điểm đang phủ trên nhiều trường hơn, nên tỉnh được ưu tiên màu nóng hơn. Khi `schoolCount` không có, frontend tạm dùng số phần tử `highSchools`; khi chưa có trường trọng điểm, mẫu số được coi là `1` để tỉnh vẫn được tô màu.

Geometry không đi qua API này. Client đọc asset `/market-intelligence/vietnam-provinces-2025.json` và join theo mã tỉnh.

## Errors

| HTTP | Code | Khi nào |
|---:|---|---|
| `400` | `INVALID_QUERY` | Query enum, boolean hoặc limit không hợp lệ |
| `401` | `UNAUTHENTICATED` | Guest hoặc user bị vô hiệu hoá |
| `403` | `FORBIDDEN` | User không có profile Director hợp lệ |
| `422` | `INVALID_ADMISSION_YEAR` | Năm/kỳ active không hợp lệ |
| `503` | `MARKET_DATA_UNAVAILABLE` | Không đọc được hoặc vượt cap nguồn tỉnh/trường chính |

Frontend ánh xạ non-2xx thành `DirectorMarketApiError`, không dùng mock fallback.
