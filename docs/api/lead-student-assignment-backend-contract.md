---
type: spec
date: 2026-09-07
status: local-backend-contract
owner: frappe-crm
audience: dashboard-crm FE
---

# Contract BE phân công Lead theo batch

## 1. Mục tiêu

Tài liệu này là contract hiện tại giữa `frappe-crm` và `dashboard-crm` cho luồng:

```text
Tạo/import Lead
  → tạo batch
  → xem trước
  → bấm phân công
  → xử lý dữ liệu
  → chọn Team/Sale theo cấu hình Frappe
  → cập nhật ownership
```

BE là nguồn sự thật cho dữ liệu, status, permission và thuật toán. FE chỉ hiển thị,
nhập dữ liệu và gọi API; không tự tính Team, Zone, Sale hoặc capacity.

## 2. Mô hình dữ liệu chuẩn

### 2.1. CRM Lead và CRM Student

| Đối tượng | Ý nghĩa |
| --- | --- |
| `CRM Lead` | Một lần tiếp nhận/form submission trước khi Sale hoàn tất xử lý. Đây là record được đưa vào batch. |
| `CRM Student` | Hồ sơ canonical sau khi Lead được handoff thành công. Một Student có thể có nhiều Lead. |
| `CRM Contact` | Không phải target chính của batch hiện tại. Không tạo Contact riêng trong bước phân công. |

Quan hệ nghiệp vụ:

```text
1 CRM Student ← nhiều CRM Lead
```

Không được chặn Lead mới chỉ vì trùng phone/email. Việc phân loại trùng được thực hiện
ở bước processing.

Trang danh sách học sinh chỉ hiển thị `CRM Student` thật đã được tạo hoặc enrich qua
handoff (có `source_lead` và `converted_at`) và có người phụ trách hợp lệ. Lead `ASSIGNED` chưa handoff vẫn thuộc màn hình
Lead/cần xử lý, không được hiển thị như Student. `processingStatus` và `resolution`
chỉ là metadata của Lead nguồn; trạng thái Student dùng `studentStage`,
`enrollmentStatus` và `lifecycleStatus`.

### 2.2. Hai nhóm status cần phân biệt

`CRM Lead.lead_status` là lifecycle CRM hiện có, còn `processing_status` là workflow
server-managed của intake/assignment. FE không tự ghi hai field này.

| Field | Giá trị | Ý nghĩa |
| --- | --- | --- |
| `processing_status` | `NEW` | Lead mới nhận, chưa chạy xử lý. |
|  | `PROCESSING` | BE đang kiểm tra và phân loại. |
|  | `PROCESSED` | Đã qua điều kiện dữ liệu, chưa chắc đã có Sale. |
|  | `ASSIGNED` | Ownership Team/Sale đã ghi thành công. |
|  | `CLOSED` | Lead invalid/duplicate hoặc đã handoff thành công. |
| `resolution` | `PENDING` | Chưa phân loại. |
|  | `MATCHED` | Khớp một Student đã có. |
|  | `CREATED` | Chưa có Student phù hợp; tạo Student ngay sau khi ghi ownership. |
|  | `DUPLICATE` | Trùng Lead/Student không thể tự quyết định duy nhất. |
|  | `INVALID` | Thiếu dữ liệu bắt buộc. |
|  | `SPAM` / `FAILED` | Kết quả kết thúc do xử lý thủ công hoặc lỗi nghiệp vụ. |

Các field server-managed liên quan:

```text
processing_status
resolution
resolution_reason
matched_student
converted_student
converted_at
conversion_status
owner_staff
owning_team
owning_pool
ownership_revision
```

## 3. Điều kiện dữ liệu

### 3.1. Điều kiện để Lead được xử lý

Bốn field bắt buộc để Lead được xử lý là:

```text
Số điện thoại → CRM Lead.phone
Tỉnh/Thành phố → CRM Lead.province
Trường THPT   → CRM Lead.high_school
Ngành quan tâm → CRM Lead.major
```

CCCD (`CRM Lead.id_number`) là dữ liệu bổ sung; nếu có thì được dùng để nhận diện
trùng hoặc tìm Student đã tồn tại, nhưng không còn là điều kiện bắt buộc để xử lý.
Email vẫn là dữ liệu liên hệ và không phải gate.

Nếu thiếu một trong bốn field trên, BE trả kết quả `CLOSED / INVALID` và không phân công.

### 3.2. Field bắt buộc khi import vào batch

API import batch yêu cầu các cột sau:

| Field API | Nhãn FE | Bắt buộc |
| --- | --- | --- |
| `student_name` | Họ và tên | Có |
| `phone` | Số điện thoại | Có |
| `id_number` | CCCD | Không, nếu có sẽ dùng để nhận diện trùng |
| `province` | Tỉnh/Thành phố | Có |
| `high_school` | Trường THPT | Có |
| `major` | Ngành quan tâm | Có |
| `source` | Nguồn Lead | Có |
| `email` | Email | Không |
| `branch` | Cơ sở | Không nếu tài khoản chỉ có một cơ sở hoặc có cơ sở mặc định |

FE không hardcode danh sách tỉnh, trường, ngành và nguồn.

### 3.3. Catalog từ Frappe

Gọi:

```text
GET crm.api.lead_assignment_batch.get_lead_assignment_catalogs
```

Response gồm:

```json
{
  "provinces": [{"id": "...", "label": "...", "code": "..."}],
  "sources": [{"id": "...", "label": "...", "code": null}],
  "majors": [{"id": "...", "label": "...", "code": "..."}],
  "highSchools": [{"id": "...", "label": "...", "code": "..."}]
}
```

Khi truyền `province`, `highSchools` chỉ trả trường thuộc tỉnh đó:

```text
GET crm.api.lead_assignment_batch.get_lead_assignment_catalogs?province=<province>
```

Nguồn có trạng thái `Retired` không được trả về. Nếu tài khoản phụ trách nhiều cơ sở,
FE phải cho chọn `branch`; nếu không xác định được cơ sở, BE trả lỗi validation.

## 4. Luồng xử lý chuẩn

```text
NEW / PENDING
  │
  ├─ thiếu số điện thoại / tỉnh / THPT / ngành
  │    └─ CLOSED / INVALID
  │
  └─ đủ dữ liệu
       ├─ Student đã có → MATCHED
       └─ chưa có → CREATED
              ↓
          PROCESSED
              ↓ bấm phân công batch
          Team/Sale ownership thành công
              ↓
          ASSIGNED
              ↓ tự động handoff trong cùng lần chạy
          Student New + Lead CLOSED
```

`CREATED` ở bước `PROCESSED` là quyết định tạo Student sau khi hệ thống ghi ownership.
Khi nút phân công chạy thành công, BE gọi handoff ngay trong cùng item; vì vậy kết quả
cuối cùng là Student đã được insert với owner và Lead đã `CLOSED`.

BE chỉ gọi `crm.api.lead_processing.handoff_lead` sau khi Lead đã `ASSIGNED`, trong
cùng lần chạy phân công. Lead `CLOSED / INVALID`, `CLOSED / DUPLICATE` và Lead không
được gán owner không được tạo Student. Nếu một Lead đã có `converted_student` từ dữ
liệu cũ, BE không tạo thêm Student.

### 4.1. Quy tắc MATCHED/DUPLICATE

BE xử lý theo thứ tự:

1. Chuẩn hóa CCCD và tìm `CRM Student` theo CCCD.
2. Nếu không có CCCD match, fallback theo `phone + email + province`.
3. Một Student duy nhất → `MATCHED`, lưu `CRM Lead.matched_student`.
4. Nhiều Student phù hợp → `DUPLICATE / CLOSED`.
5. Không có Student nhưng có Lead trùng → `DUPLICATE / CLOSED`.
6. Không có match → `CREATED / PROCESSED`.

Student đã ở trạng thái đóng/lost không tự tạo bản ghi mới nếu Lead có thể chứng minh
đúng cùng một Student bằng CCCD hoặc bộ fallback `phone + email + province`; khi đó
resolution vẫn là `MATCHED` và Lead được enrich bản ghi canonical đó. Nếu không đủ
định danh để chứng minh, BE không được đoán và phải để kết quả cần rà soát thay vì
tự tạo bản ghi trùng.

Không được FE tự quyết định `MATCHED` hay `CREATED`.

## 5. Batch assignment contract

### 5.1. Trạng thái đợt

| Trạng thái đợt | Ý nghĩa |
| --- | --- |
| `draft` | Đợt mới tạo, chưa chạy. |
| `ready` | Đã kiểm tra điều kiện; các hồ sơ đã có thông tin tuyến phân công. |
| `running` | Đang xử lý một lần. Không cho chạy đồng thời. |
| `completed` | Tất cả hồ sơ đã xử lý thành công hoặc được bỏ qua hợp lệ. |
| `completed_with_errors` | Còn hồ sơ tạm hoãn, cần kiểm tra hoặc gặp lỗi. |
| `cancelled` | Không chạy tiếp. |

### 5.2. Trạng thái hồ sơ trong đợt

| Trạng thái hồ sơ | Ý nghĩa |
| --- | --- |
| `pending` | Chờ chạy. |
| `assigned` | Đã chọn Sale và ghi ownership. |
| `deferred` | Chưa phân công được, ví dụ chưa có policy/capacity phù hợp. |
| `manual_review` | Thiếu dữ liệu hoặc cần người quản trị xử lý. |
| `failed` | Lỗi xử lý item. |
| `skipped` | Lead đã converted hoặc đã có owner từ trước. |

Đợt không chạy bằng worker nền. Người dùng bấm một lần để hệ thống kiểm tra điều kiện,
phân tuyến và ghi nhận người phụ trách; chạy lại chỉ dành cho hồ sơ `deferred`,
`manual_review` hoặc `failed`.

### 5.3. API chính

Tất cả API trả dữ liệu trong `response.message` theo chuẩn Frappe.

| Method | HTTP | Mục đích |
| --- | --- | --- |
| `crm.api.lead_assignment_batch.import_leads_to_assignment_batch` | POST | Tạo Lead mới từ rows/CSV và đưa vào đợt `draft`; chưa phân công. |
| `crm.api.lead_assignment_batch.create_lead_assignment_batch` | POST | Tạo đợt từ các Lead đã có bằng `lead_ids`; chưa phân công. |
| `crm.api.lead_assignment_batch.preview_lead_assignment_batch` | POST | Kiểm tra điều kiện và thông tin tuyến, chuyển đợt sang `ready`. |
| `crm.api.lead_assignment_batch.run_lead_assignment_batch` | POST | Tự kiểm tra, phân công và chuyển Lead hợp lệ thành Student trong một lần bấm. |
| `crm.api.lead_assignment_batch.retry_lead_assignment_batch` | POST | Chạy lại hồ sơ tạm hoãn, cần kiểm tra hoặc gặp lỗi. |
| `crm.api.lead_assignment_batch.get_lead_assignment_batch` | GET | Lấy chi tiết một đợt và các hồ sơ trong đợt. |
| `crm.api.lead_assignment_batch.get_lead_assignment_workflow` | GET | Lấy snapshot workflow, trạng thái và metrics từ đợt được chọn hoặc đợt gần nhất trong DB. |
| `crm.api.lead_assignment_batch.list_lead_assignment_batches` | GET | Lấy lịch sử các đợt phân công. |
| `crm.api.lead_assignment_batch.list_lead_assignment_history_items` | GET | Lấy danh sách hồ sơ theo trạng thái, gồm cả Lead `CLOSED` cần kiểm tra; hỗ trợ lọc `lead_ids`. |
| `crm.api.lead_assignment_batch.get_lead_assignment_batch_options` | GET | Lấy option pool nội bộ nếu cần kiểm tra quyền; không cần hiển thị cho người dùng thường. |

`get_lead_assignment_workflow` nhận tùy chọn `batch_name`. Nếu bỏ trống, backend tổng
hợp trạng thái Lead hiện tại với item của các đợt trong phạm vi quyền và khử trùng theo
Lead; nhờ đó các Lead đã được phân công nhưng đã rời scope vẫn được tính. Response có
`summary`, `steps`, `connections` và metrics được tính ở backend; frontend chỉ chịu
trách nhiệm layout và hiển thị. Khi đang xem một `batch_name`, workflow là snapshot của
đợt đó; khi không chọn đợt, UI phải ghi rõ đây là tổng quan hiện tại.

`list_lead_assignment_history_items` cũng tổng hợp các Lead đang `CLOSED` từ DB với
`status = manual_review` để tab Cần kiểm tra hiển thị đủ hồ sơ thực tế, kể cả khi
Lead không còn item trong batch audit. Truyền `lead_ids` dạng chuỗi phân tách bằng dấu
phẩy hoặc mảng để giới hạn đúng hàng đợi hồ sơ cần xử lý.

### 5.4. Import batch

Payload tối thiểu:

```json
{
  "batch_name": "Đợt THPT Nguyễn Huệ tháng 9",
  "rows": [
    {
      "student_name": "Nguyễn Văn A",
      "phone": "0900000000",
      "province": "Ho Chi Minh City",
      "high_school": "THPT Nguyễn Huệ",
      "major": "Công nghệ thông tin",
      "source": "Website",
      "email": "a@example.com"
    }
  ],
  "description": "Đợt Lead từ form THPT Nguyễn Huệ"
}
```

Hoặc truyền `csv_content`. Header CSV được chấp nhận bằng tiếng Việt hoặc field API;
CCCD là tùy chọn nếu được gửi và có thể dùng `CCCD`, `Số căn cước` hoặc `id_number`.

Import chỉ tạo Lead `NEW / PENDING` và item `pending`. Không gọi routing trong bước
import.

### 5.5. Kiểm tra và chạy toàn bộ luồng

Luồng chính của FE chỉ cần một nút chạy:

```text
import/create batch
  → run đợt
  → BE tự kiểm tra điều kiện, phân tuyến và ghi nhận người phụ trách
  → refresh batch detail
```

`run` nhận cả đợt `draft` và sẽ tự thực hiện bước kiểm tra trước khi phân công.
API `preview` vẫn được giữ cho màn hình hoặc công cụ cần xem kết quả trước mà chưa
chạy phân công.

Khi chạy, nếu đợt còn ở `draft`, BE tự kiểm tra điều kiện trước khi phân công:

1. Lead `NEW` được BE đưa sang `PROCESSING`.
2. Lead không hợp lệ thành `CLOSED / INVALID`, item thành `manual_review`.
3. Lead hợp lệ thành `PROCESSED`.
4. BE chạy engine routing và ghi Team/Sale ownership.
5. Ghi ownership thành công mới đổi Lead thành `ASSIGNED`, item thành `assigned`.
6. Không đủ capacity/policy/mapping thì Lead giữ `PROCESSED`, item thành `deferred`.

Mỗi item thành công phải được ghi bền vững là `assigned` cùng Team, Sale, lý do,
`activeLoad`, giới hạn nhận và `executionId` trước khi trả response. Summary batch
được tính lại từ các item đã lưu; không được trả `assigned_count = 0` hoặc item
`pending` khi Lead tương ứng đã ở `ASSIGNED`.

FE không hiển thị nút “chạy ngầm”, không polling worker và không tự đổi status.

## 6. Thứ tự phân công

Engine hiện tại dùng context địa bàn/trường và capacity của Frappe:

1. Nhân sự gán trực tiếp cho trường (`CRM High School Assignment`).
2. Nếu không có, Team phụ trách Zone (`CRM Team Zone Assignment`) và policy active.
3. Nếu không xác định được Zone, đưa vào nhánh province/manual review theo routing context.
4. Sale được chọn phải là nhân sự active, thuộc Team active, đúng cơ sở và còn capacity.

Các kết quả routing được trả ở item:

```text
routingTier
zone
team
ownerStaff
activeLoad
capacityLimit
remainingCapacity
policyVersion
routingRequest
reason
```

FE chỉ hiển thị các giá trị BE trả về. Không tính lại phần trăm tải hoặc tự chọn người.

Tải hiện tại của một Sale/CTV là số Lead chưa `CLOSED`, chưa có
`conversion_status = Converted` và chưa có `converted_student` mà người đó đang sở
hữu (`owner_staff` hoặc `assigned_to`). Không dùng `lifecycle_stage` để tính tải vì
field này có thể để trống trong lúc Lead đã được phân công.

`pool` vẫn tồn tại trong BE như lớp tương thích nội bộ với engine routing hiện tại. FE
không cần bắt người dùng hiểu hoặc chọn “hàng chờ đầu vào”; nếu BE trả lỗi liên quan
`MISSING_INPUT_QUEUE` hoặc `MULTIPLE_INPUT_QUEUES`, hiển thị là “Cấu hình phân công
chưa hoàn tất, cần quản trị viên kiểm tra Team/Zone”.

## 7. Handoff trong luồng phân công

Đây là bước backend tự gọi sau khi chọn được owner. API vẫn được giữ để retry hoặc
cho các luồng nội bộ cần handoff riêng:

```text
POST crm.api.lead_processing.handoff_lead
```

Điều kiện:

```text
processing_status = ASSIGNED
resolution = MATCHED hoặc CREATED
```

Kết quả thành công:

- `MATCHED`: dùng `matched_student` để enrich Student hiện có.
- `CREATED`: tạo Student mới từ snapshot Lead.
- Handoff chỉ được phép khi Lead có `owner_staff` và `assigned_to` trùng nhau; Staff
  và User phụ trách phải đang hoạt động.
- Student sau khi tạo/enrich bắt buộc phải có `assigned_to`; nếu không, toàn bộ handoff
  rollback với lỗi `OWNER_REQUIRED`.
- CRM Student được đưa về stage `New`.
- Lead được `CLOSED`.
- `converted_student` và `conversion_status = Converted` được ghi bởi BE.

Handoff yêu cầu `idempotency_key` và `expected_lifecycle_revision` để chống xử lý lặp
hoặc ghi đè dữ liệu mới.

Các endpoint conversion cũ cũng phải đi qua cùng điều kiện: Lead mới phải ở
`ASSIGNED` với resolution `MATCHED` hoặc `CREATED` và có ownership hợp lệ. Nếu chưa
đạt status, BE trả `LEAD_NOT_ASSIGNED`; nếu thiếu người phụ trách, BE trả
`OWNER_REQUIRED` và không insert Student.

## 8. Contract UI cho FE

### FE phải làm

- Dùng catalog Frappe cho province, high school, major, source.
- Hiển thị rõ hai bước: “Tiếp nhận Lead” và “Phân công tự động”.
- Cho tạo nhiều batch; mỗi batch có tên, mô tả, số lượng và status.
- Hiển thị một nút chạy toàn bộ luồng kiểm tra, phân tuyến, phân công và chuyển Student.
- Hiển thị kết quả từng item: đã phân công, chờ xử lý, cần bổ sung, lỗi.
- Sau khi run, gọi lại `get_lead_assignment_batch` để lấy trạng thái cuối.
- Cho retry riêng các item `deferred`, `manual_review`, `failed`.
- Giữ nguyên error code để support/debug, nhưng hiển thị thông báo tiếng Việt.

### FE không được làm

- Không tự ghi `processing_status`, `resolution`, `owner_staff`, `owning_team`.
- Không tự tính hoặc tự chọn Sale/Team/Zone.
- Không tạo CRM Student ở bước nhập Lead. Khi phân công thành công, BE tự handoff;
  FE không cần gọi thêm API conversion.
- Không gọi worker hoặc endpoint routing cũ thay cho batch API.
- Không dùng `lead_status` để thay thế `processing_status`.
- Không hardcode dữ liệu tỉnh, trường, ngành, nguồn.

## 9. Error mapping tối thiểu

| Error code | Cách hiển thị đề xuất |
| --- | --- |
| `IDENTIFIER_GATE_FAILED` | Lead thiếu số điện thoại, tỉnh/thành phố, trường THPT hoặc ngành quan tâm. |
| `INVALID_ID_NUMBER` | CCCD phải gồm 9 hoặc 12 chữ số. |
| `INVALID_LOOKUP` / `INVALID_PROVINCE` / `INVALID_HIGH_SCHOOL` | Chọn lại dữ liệu từ danh sách Frappe. |
| `MISSING_CAMPUS` | Bổ sung cơ sở cho Lead hoặc cấu hình cơ sở mặc định. |
| `MISSING_INPUT_QUEUE` / `MULTIPLE_INPUT_QUEUES` | Quản trị viên cần hoàn tất cấu hình Team/Zone. |
| `CAPACITY_BLOCKED` | Sale/Team đã đủ giới hạn nhận Lead. |
| `NO_ACTIVE_POLICY` | Chưa có cách chia Lead đang hiệu lực cho Team. |
| `STALE_OWNERSHIP_REVISION` | Dữ liệu đã thay đổi; tải lại batch rồi retry. |
| `LEAD_NOT_ASSIGNED` | Lead chưa được phân công nên chưa thể tạo Student. |
| `OWNER_REQUIRED` | Lead/Student chưa có người phụ trách hợp lệ. |
| `FORBIDDEN` / `OUT_OF_SCOPE` | Tài khoản không có quyền hoặc ngoài phạm vi Team/cơ sở. |

## 10. Trạng thái triển khai hiện tại

Đã kiểm tra local:

- Migration thành công, 190 CRM JSON hợp lệ.
- Processing contract: 9 tests pass.
- Lead mapping/catalog: 16 tests pass.
- Assignment batch: 5 tests pass.
- Routing: 10 tests pass.
- Student routing: 6 tests pass.
- Ruff, format và `git diff --check` pass.

Dashboard chưa tích hợp lại theo contract này. Đây là điểm bắt đầu để FE viết lại UI
batch assignment mà không phải suy đoán từ các component cũ.

## References

- `crm/api/lead_assignment_batch.py`
- `crm/api/lead_processing.py`
- `crm/api/lead_mapping.py`
- `crm/fcrm/lead_processing.py`
- `crm/fcrm/lead_routing.py`
- `crm/fcrm/student_routing.py`
- `crm/fcrm/doctype/crm_lead/crm_lead.json`
- `crm/fcrm/doctype/crm_lead_assignment_batch/crm_lead_assignment_batch.json`
- `crm/fcrm/doctype/crm_lead_assignment_batch_item/crm_lead_assignment_batch_item.json`
