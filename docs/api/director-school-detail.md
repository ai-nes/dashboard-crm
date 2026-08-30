# Director School Detail API

Contract đang được dùng bởi `/director/schools/{schoolId}`. Server page gọi Frappe trực tiếp; route detail không còn đọc directory CSV hoặc gọi `buildSchoolIntelligence()`.

## Endpoint và quyền truy cập

```http
GET {NEXT_PUBLIC_FRAPPE_URL}/api/method/crm.api.director_school_detail.get_director_school_detail?school_id=01-01-062&admissionYear=2026
Cookie: sid=<Frappe session cookie>
Accept: application/json
```

Method chỉ nhận `GET`; Frappe bọc kết quả thành công trong `message`. Quyền hợp lệ: `Administrator`, profile chuẩn `Admissions Director`, hoặc `System Manager` không đồng thời mang business role bị cấm.

## Parameters và school ID

| Tên | Kiểu | Bắt buộc | Mô tả |
|---|---|---:|---|
| `school_id` | string | Có | ID ngoài hệ thống theo một trong hai dạng dưới đây |
| `admissionYear` | integer/string | Không | Năm `2000..2100`; mặc định kỳ active duy nhất |

- Canonical `{provinceCode}-{wardCode}-{schoolCode}`: ward code có 5 chữ số, ví dụ `01-00001-062`; resolver khớp tỉnh + ward + trường.
- Legacy `{provinceCode}-{legacyDistrictCode}-{schoolCode}`: segment giữa có 2 chữ số, ví dụ `01-01-062`; resolver khớp tỉnh + trường và chỉ thành công khi đúng một trường permission-visible.

ID sai shape, không tồn tại, trùng hoặc ngoài row permission đều trả cùng `404 SCHOOL_NOT_FOUND`; response không lộ candidate nội bộ.

## Response `200`

```json
{
  "message": {
    "status": "partial",
    "school": {
      "id": "01-00001-062",
      "provinceCode": "01",
      "province": "Hà Nội",
      "districtCode": "00001",
      "district": "Phường Ba Đình",
      "schoolCode": "062",
      "name": "THPT Nguyễn Trãi",
      "address": "Hà Nội",
      "area": "KV3",
      "isBoardingSchool": false
    },
    "potentialScore": null,
    "potentialState": null,
    "grade12Students": null,
    "availableStudents": null,
    "prospects": 5,
    "applications": 2,
    "enrollment": 1,
    "changes": { "prospects": null, "applications": null, "enrollment": null },
    "performance": { "6m": [], "year": [] },
    "geography": null,
    "locality": {
      "source": {
        "name": "THPT Nguyễn Trãi",
        "address": "Hà Nội",
        "coordinates": { "latitude": 21.03, "longitude": 105.81 }
      },
      "province": "Hà Nội",
      "ward": "Phường Ba Đình",
      "travelTime": null,
      "distanceKm": null
    },
    "demographics": null,
    "subjectMix": null,
    "earlyForecast": null,
    "activityStats": [],
    "relationship": {
      "level": "Hợp tác thường xuyên",
      "score": 80,
      "contact": "Nguyễn Văn A",
      "contactRole": "Ban giám hiệu",
      "lastTouch": "2026-08-01",
      "nextTouch": "2026-09-01"
    },
    "classification": {
      "group": "Trọng điểm",
      "isKeyAccount": true,
      "label": null,
      "action": null
    },
    "quadrantPeers": [],
    "scoreBands": [],
    "academicGap": null,
    "postGraduationChoices": [],
    "competitionContext": null,
    "contacts": [
      {
        "role": "Ban giám hiệu",
        "hasContact": true,
        "full_name": "Nguyễn Văn A",
        "position": "Phó hiệu trưởng",
        "relationshipStatus": "Active",
        "lastTouch": "2026-08-01",
        "nextTouch": "2026-09-01"
      }
    ],
    "activities": [
      {
        "type": "Tư vấn hướng nghiệp",
        "date": "2026-08-20",
        "scheduledAt": null,
        "status": "completed",
        "outcome": "Positive",
        "attendance": 120
      }
    ],
    "dataFreshness": "2026-08-30",
    "dataSources": {
      "directory": "CRM High School",
      "snapshot": "CRM High School Annual Snapshot",
      "relationship": "CRM School Stakeholder",
      "activities": "CRM School Activity"
    },
    "dataAvailability": {
      "sections": {
        "identity": "available",
        "snapshot": "available",
        "relationship": "available",
        "activities": "available",
        "locality": "available",
        "demographics": "unavailable",
        "subjectMix": "unavailable",
        "outcomes": "unavailable"
      },
      "fields": {
        "potentialScore": "unavailable",
        "grade12Students": "unavailable",
        "availableStudents": "unavailable",
        "demographics": "unavailable",
        "subjectMix": "unavailable",
        "postGraduationChoices": "unavailable",
        "competitionContext": "unavailable",
        "locality.travelTime": "unavailable"
      }
    },
    "meta": {
      "admissionYear": 2026,
      "asOf": "2026-08-30",
      "scope": "director",
      "sourceDataRevision": "0123456789abcdef"
    }
  }
}
```

Ví dụ chỉ minh hoạ shape. Scalar thiếu là `null`, collection thiếu là `[]`; `0` vẫn là dữ liệu hợp lệ. `available`, `partial`, `unavailable` mô tả khả dụng theo section/field.

## Nguồn và giới hạn

- Identity/toạ độ: `CRM High School`, `CRM Province`, `CRM Ward`.
- KPI: annual snapshot mới nhất của đúng kỳ, `verification_status = Verified`.
- Relationship/contact: `CRM School Stakeholder`, person display name và term hiển thị. Không trả phone, email, Person ID hoặc internal document name.
- Activity: tối đa 50 `CRM School Activity`; nếu activity có `admission_year` thì chỉ lấy đúng kỳ đang yêu cầu, còn activity không gắn kỳ vẫn được coi là lịch sử trường. Chỉ `Planned`/`Completed` được project thành `scheduled`/`completed`. `outcome` chỉ nhận các giá trị Select có cấu trúc `Positive`, `Neutral`, `Follow-up Needed`, `No Response`, `Not Applicable`; không trả `title`, `notes` hoặc `next_action`.
- Demographics, subject mix, outcomes, travel/distance, score bands, competition và recommendation chưa có nguồn phê duyệt: giữ `null`/`[]` + `unavailable`.
- Nguồn hỗ trợ lỗi hoặc bị cap làm response `partial`; lỗi nguồn trường chính trả `503`.

Frontend chuẩn hoá DTO xuống các field dashboard dùng. `404` được chuyển thành Next `notFound()`; `401`, `403`, lỗi mạng và `5xx` vẫn là lỗi rõ ràng, không dùng mock fallback.

## Errors

| HTTP | Code | Khi nào |
|---:|---|---|
| `400` | `INVALID_SCHOOL_ID` | `school_id` rỗng hoặc dài quá giới hạn |
| `401` | `UNAUTHENTICATED` | Guest hoặc user bị vô hiệu hoá |
| `403` | `FORBIDDEN` | User không có profile Director hợp lệ |
| `404` | `SCHOOL_NOT_FOUND` | ID sai shape, không tồn tại, trùng hoặc không permission-visible |
| `422` | `INVALID_ADMISSION_YEAR` | Năm/kỳ active không hợp lệ |
| `503` | `SCHOOL_DATA_UNAVAILABLE` | Không đọc được nguồn trường chính |
