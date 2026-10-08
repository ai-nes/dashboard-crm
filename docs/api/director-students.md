# API cho `/director/students`

Trang danh sách học sinh của Director đọc `GET /api/v1/students` qua
`useDirectorStudentsQuery` → `getDirectorStudents()` → `nestDirectorStudents()`
(`src/services/api/students/students-nest.ts`). Hồ sơ chi tiết dùng
[director-student-detail.md](./director-student-detail.md).

## 1. Phạm vi màn hình

| Vùng UI | Nguồn dữ liệu |
|---|---|
| Header | `meta.admissionYear` (tiêu đề/mô tả là UI) |
| KPI strip | `summary.trackedStudents` = `meta.total`; các KPI khác chưa có nguồn nên để trống (`null`/`undefined`) |
| Action banner | `actionSummary` hiện là object rỗng |
| Toolbar | Từ khóa, giai đoạn, người phụ trách, tỉnh, campaign → query parameters |
| Student list | `data[]` |
| Link `Mở 360°` | `id` → `/director/students/{id}` |

Nguồn tham chiếu: `students-overview-dashboard.tsx`, `student-list-toolbar.tsx`,
`student-list.tsx` (thư mục `director/students/_components`) và
`src/services/api/students/types.ts`.

## 2. Endpoint và quyền truy cập

```http
GET {NEXT_PUBLIC_CRM_API_URL}/api/v1/students
Cookie: <Better Auth session cookie>   (credentials: "include")
Accept: application/json
```

Phạm vi đọc suy ra từ phiên đăng nhập (lead access scope): người dùng chỉ thấy hồ sơ
trong phạm vi được cấp; `ownerId` chỉ thu hẹp kết quả, không mở rộng scope. Quyền
sửa/xóa/phân công được kiểm tra riêng ở từng command.

### Query

| Tên | Kiểu | Mặc định | Mô tả |
|---|---|---|---|
| `admissionYear` | `YYYY` | — | Lọc theo kỳ tuyển sinh |
| `page` | integer | `1` | Trang, bắt đầu từ `1` |
| `pageSize` | integer | `20` | `1..100` |
| `q` | string (≤120) | — | Tìm theo tên, mã, điện thoại, email |
| `stage` | enum | — | `New`, `Attempting`, `Connected`, `Qualified`, `Registration`, `New Enter`, `Disqualified` |
| `ownerId` | string | — | Người phụ trách |
| `provinceId` | string | — | ID tỉnh |
| `campaignId` | string | — | ID campaign (UI gửi `campaign` ≠ `all`) |
| `order` | `asc \| desc` | `desc` | Sắp xếp theo thời điểm tạo |

Dashboard bỏ qua giá trị `stage` không thuộc enum trên. Các filter `assignmentStatus`,
`lifecycleStatus` và `sort` của hợp đồng cũ hiện chưa có trên API; nhãn giai đoạn
hiển thị và `assignmentStatus`/`lifecycleStatus` được suy ra ở frontend từ
`studentStage` và `ownerUserId`.

## 3. Response `200 OK`

```json
{
  "data": [
    {
      "id": "7d1c…",
      "studentCode": "STU-2026-04821",
      "sourceLeadId": null,
      "fullName": "Nguyễn Minh An",
      "studentStage": "Connected",
      "qualityBucket": "high",
      "ownerUserId": "user-id",
      "owner": "Trần Quốc Bảo",
      "province": "Cần Thơ",
      "provinceId": "…",
      "school": "THPT Châu Văn Liêm",
      "major": "Trí tuệ nhân tạo",
      "source": "Career Talk 28/05",
      "latestScore": "82",
      "revision": 4,
      "ownershipRevision": 4,
      "modifiedAt": "2026-06-06T09:56:00.000Z"
    }
  ],
  "meta": { "total": 1, "page": 1, "pageSize": 20, "totalPages": 1, "hasNextPage": false }
}
```

`nestDirectorStudents()` chuyển mỗi dòng thành `StudentListItem`:

| UI field | Lấy từ |
|---|---|
| `id`, `code`, `name`, `school`, `province`, `provinceId`, `major`, `source`, `owner` | `id`, `studentCode`, `fullName`, `school`, `province`, `provinceId`, `major`, `source`, `owner` |
| `stage` (nhãn hành trình) | `studentStage` qua bảng `JOURNEY` trong `students-nest.ts` |
| `studentStage` | `studentStage` |
| `assignmentStatus` | `assigned` nếu có `ownerUserId`, ngược lại `unassigned` |
| `lifecycleStatus` | ánh xạ từ `studentStage` |
| `score` | `latestScore` |
| `lastActivity` | `modifiedAt` |
| `revision` | `ownershipRevision ?? revision` — token CAS khi phân công, không được mặc định ở frontend |
| `priority` | `qualityBucket` |
| `nextAction` | chuỗi rỗng (chưa có nguồn) |

`meta` trả về UI gồm `total`, `totalAll` (= `total`), `page`, `pageSize`, `totalPages`,
`hasNextPage`, `admissionYear` (giá trị đã gửi hoặc năm hiện tại), `query` và `asOf`
(thời điểm nhận response).

## 4. `StudentListItem`

Kiểu đầy đủ nằm ở `src/services/api/students/types.ts`. Các field bắt buộc ở UI:
`id`, `initials`, `name`, `code`, `school`, `province`, `major`, `stage`, `score`,
`scoreDelta`, `lastActivity`, `nextAction`, `owner`, `revision`, `source`, `priority`.

```text
stage:    nhãn hành trình (xem bảng JOURNEY trong students-nest.ts)
priority: Cao | Trung bình | Thấp
```

## 5. Lỗi

```json
{ "error": { "code": "INVALID_QUERY", "message": "Tham số truy vấn không hợp lệ." } }
```

| Status | Code | Khi dùng |
|---:|---|---|
| `200` | — | Thành công; danh sách rỗng vẫn là `200` với `data: []` |
| `400` | `INVALID_QUERY` | Query sai kiểu, enum hoặc vượt giới hạn |
| `401` | `UNAUTHENTICATED` | Chưa đăng nhập hoặc phiên hết hạn |
| `403` | `FORBIDDEN` | Không có quyền xem danh sách |
| `404` | `STUDENT_NOT_FOUND` | Chỉ ở endpoint chi tiết |

## 6. Chưa có

- Export danh sách: nút `Xuất danh sách` chỉ hiển thị toast; chưa có endpoint.
- KPI tổng quan (ý định cao, cần hành động hôm nay, khả năng nhập học) và action banner
  chưa có nguồn trong API; UI hiển thị trạng thái trống thay vì số giả.
- Trung tâm SLA: link `/director/sla`, không lấy dữ liệu trong trang students.

## 7. Mock

`src/app/api/mock/[...resource]/route.ts` và `computeDirectorStudents()` là dữ liệu mô
phỏng cho demo/QA, không được dùng khi chạy với API thật.