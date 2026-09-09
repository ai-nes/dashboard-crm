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

| Đối tượng     | Ý nghĩa                                                                                            |
| ------------- | -------------------------------------------------------------------------------------------------- |
| `CRM Lead`    | Một lần tiếp nhận/form submission trước khi Sale hoàn tất xử lý. Đây là record được đưa vào batch. |
| `CRM Student` | Hồ sơ canonical sau khi Lead được handoff thành công. Một Student có thể có nhiều Lead.            |
| `CRM Contact` | Không phải target chính của batch hiện tại. Không tạo Contact riêng trong bước phân công.          |

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

| Field               | Giá trị           | Ý nghĩa                                                          |
| ------------------- | ----------------- | ---------------------------------------------------------------- |
| `processing_status` | `NEW`             | Lead mới nhận, chưa chạy xử lý.                                  |
|                     | `PROCESSING`      | BE đang kiểm tra và phân loại.                                   |
|                     | `PROCESSED`       | Đã qua điều kiện dữ liệu, chưa chắc đã có Sale.                  |
|                     | `ASSIGNED`        | Ownership Team/Sale đã ghi thành công.                           |
|                     | `CLOSED`          | Lead invalid/duplicate hoặc đã handoff thành công.               |
| `resolution`        | `PENDING`         | Chưa phân loại.                                                  |
|                     | `MATCHED`         | Khớp một Student đã có.                                          |
|                     | `CREATED`         | Chưa có Student phù hợp; tạo Student ngay sau khi ghi ownership. |
|                     | `DUPLICATE`       | Trùng Lead/Student không thể tự quyết định duy nhất.             |
|                     | `INVALID`         | Thiếu dữ liệu bắt buộc.                                          |
|                     | `SPAM` / `FAILED` | Kết quả kết thúc do xử lý thủ công hoặc lỗi nghiệp vụ.           |

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

| Field API      | Nhãn FE        | Bắt buộc                                                    |
| -------------- | -------------- | ----------------------------------------------------------- |
| `student_name` | Họ và tên      | Có                                                          |
| `phone`        | Số điện thoại  | Có                                                          |
| `id_number`    | CCCD           | Không, nếu có sẽ dùng để nhận diện trùng                    |
| `province`     | Tỉnh/Thành phố | Có                                                          |
| `high_school`  | Trường THPT    | Có                                                          |
| `major`        | Ngành quan tâm | Có                                                          |
| `source`       | Nguồn Lead     | Có                                                          |
| `email`        | Email          | Không                                                       |
| `branch`       | Cơ sở          | Không nếu tài khoản chỉ có một cơ sở hoặc có cơ sở mặc định |

FE không hardcode danh sách tỉnh, trường, ngành và nguồn.

### 3.3. Catalog từ Frappe

Gọi:

```text
GET crm.api.lead_assignment_batch.get_lead_assignment_catalogs
```

Response gồm:

```json
{
  "provinces": [{ "id": "...", "label": "...", "code": "..." }],
  "sources": [{ "id": "...", "label": "...", "code": null }],
  "majors": [{ "id": "...", "label": "...", "code": "..." }],
  "highSchools": [{ "id": "...", "label": "...", "code": "..." }]
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

| Trạng thái đợt          | Ý nghĩa                                                           |
| ----------------------- | ----------------------------------------------------------------- |
| `draft`                 | Đợt mới tạo, chưa chạy.                                           |
| `ready`                 | Đã kiểm tra điều kiện; các hồ sơ đã có thông tin tuyến phân công. |
| `running`               | Đang xử lý một lần. Không cho chạy đồng thời.                     |
| `completed`             | Tất cả hồ sơ đã xử lý thành công hoặc được bỏ qua hợp lệ.         |
| `completed_with_errors` | Còn hồ sơ tạm hoãn, cần kiểm tra hoặc gặp lỗi.                    |
| `cancelled`             | Không chạy tiếp.                                                  |

### 5.2. Trạng thái hồ sơ trong đợt

| Trạng thái hồ sơ | Ý nghĩa                                                     |
| ---------------- | ----------------------------------------------------------- |
| `pending`        | Chờ chạy.                                                   |
| `assigned`       | Đã chọn Sale và ghi ownership.                              |
| `deferred`       | Chưa phân công được, ví dụ chưa có policy/capacity phù hợp. |
| `manual_review`  | Thiếu dữ liệu hoặc cần người quản trị xử lý.                |
| `failed`         | Lỗi xử lý item.                                             |
| `skipped`        | Lead đã converted hoặc đã có owner từ trước.                |

Đợt không chạy bằng worker nền. Người dùng bấm một lần để hệ thống kiểm tra điều kiện,
phân tuyến và ghi nhận người phụ trách; chạy lại chỉ dành cho hồ sơ `deferred`,
`manual_review` hoặc `failed`.

### 5.3. API chính

Tất cả API trả dữ liệu trong `response.message` theo chuẩn Frappe.

| Method                                                             | HTTP | Mục đích                                                                                       |
| ------------------------------------------------------------------ | ---- | ---------------------------------------------------------------------------------------------- |
| `crm.api.lead_assignment_batch.import_leads_to_assignment_batch`   | POST | Tạo Lead mới từ rows/CSV và đưa vào đợt `draft`; chưa phân công.                               |
| `crm.api.lead_assignment_batch.create_lead_assignment_batch`       | POST | Tạo đợt từ các Lead đã có bằng `lead_ids`; chưa phân công.                                     |
| `crm.api.lead_assignment_batch.preview_lead_assignment_batch`      | POST | Kiểm tra điều kiện và thông tin tuyến, chuyển đợt sang `ready`.                                |
| `crm.api.lead_assignment_batch.run_lead_assignment_batch`          | POST | Tự kiểm tra, phân công và chuyển Lead hợp lệ thành Student trong một lần bấm.                  |
| `crm.api.lead_assignment_batch.retry_lead_assignment_batch`        | POST | Chạy lại hồ sơ tạm hoãn, cần kiểm tra hoặc gặp lỗi.                                            |
| `crm.api.lead_assignment_batch.get_lead_assignment_batch`          | GET  | Lấy chi tiết một đợt và các hồ sơ trong đợt.                                                   |
| `crm.api.lead_assignment_batch.get_lead_assignment_workflow`       | GET  | Lấy snapshot workflow, trạng thái và metrics từ đợt được chọn hoặc đợt gần nhất trong DB.      |
| `crm.api.lead_assignment_batch.list_lead_assignment_batches`       | GET  | Lấy lịch sử các đợt phân công.                                                                 |
| `crm.api.lead_assignment_batch.list_lead_assignment_history_items` | GET  | Lấy danh sách hồ sơ theo trạng thái, gồm cả Lead `CLOSED` cần kiểm tra; hỗ trợ lọc `lead_ids`. |
| `crm.api.lead_assignment_batch.get_lead_assignment_batch_options`  | GET  | Lấy option pool nội bộ nếu cần kiểm tra quyền; không cần hiển thị cho người dùng thường.       |

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

### 5.4.1. Import nhanh từ Dashboard Lead

Dashboard `/lead-sale/leads` có nút **Import Excel** cạnh nút tạo Lead, mở dialog
import file riêng. Luồng này tạo trực tiếp `CRM Lead`, không tạo `CRM Lead Assignment
Batch` và không gọi routing trong thao tác import.

```text
POST crm.api.lead_mapping.inspect_lead_import  (multipart {file})
  → trả field catalog, header và sample, không insert
POST crm.api.lead_mapping.preview_lead_import  (multipart {file, column_mapping, campaign_code?})
  → map theo sourceIndex, validate/resolve lookup, không insert
POST crm.api.lead_mapping.import_leads         (multipart {file, column_mapping, campaign_code})
  → gửi lại file gốc để backend parse, tạo từng CRM Lead hợp lệ, savepoint theo dòng
```

Cả ba endpoint yêu cầu người dùng đăng nhập và có quyền tạo `CRM Lead`; inspect không
phải guest endpoint vì response chứa dữ liệu thô từ file. `campaign_code`
ở preview là tùy chọn và được gửi bằng multipart form field; ở `quick_create` import,
đây là context bắt buộc ở cấp request. Backend resolve code thành `CRM Campaign.name`,
kiểm tra quyền đọc Campaign của người dùng và chỉ chấp nhận status chuẩn hóa
`ACTIVE` hoặc `CLOSED`. Các lỗi context dùng các mã `CAMPAIGN_REQUIRED`,
`INVALID_CAMPAIGN_CODE`, `CAMPAIGN_PERMISSION_DENIED` và
`CAMPAIGN_STATUS_NOT_ALLOWED`.

Khi chọn file trên dashboard, FE gọi inspect trước để lấy catalog/mapping gợi ý. Khi
tiếp tục, FE gửi `column_mapping` cho mapped preview; ở bước commit FE gửi lại file gốc
và mapping, không gửi rows đã normalize từ browser. Preview không trả field server-managed
`campaign` hoặc row-level `campaign_code` trong `rows[].fields`. Ở bước commit, campaign
cấp request được áp dụng cho mọi Lead hợp lệ và không thể bị ghi đè bởi dữ liệu trong file.

Campaign selector lấy toàn bộ campaign người dùng có thể xem, không dùng `lead_only`
(để không loại campaign chưa có Lead), sau đó chỉ hiển thị `ACTIVE` và `CLOSED`.
Preview không tạo dữ liệu; import vẫn giữ savepoint độc lập theo từng dòng.

`import_mode` khác `quick_create` giữ nguyên contract legacy hiện có, bao gồm caller
`student-school-update`; các caller này không bị bắt buộc gửi `campaign_code`.

File hỗ trợ `.csv` UTF-8 (kể cả BOM) và `.xlsx` ở worksheet đầu tiên, tối đa 5 MB,
1.000 dòng dữ liệu không rỗng và 100 cột. Dòng không rỗng đầu tiên là header; inspect
trả tối đa 10 sample rows. Giá trị sample được serialize thành chuỗi JSON-safe hoặc
`null` nếu ô rỗng; `row` là số dòng vật lý. Contract v1 chưa tự nhận diện title row và
chưa cho chọn worksheet; title-row detection/multi-sheet selection được deferred.
Header được nhận bằng nhãn tiếng Việt hoặc field API để đưa ra `inferredField`, nhưng
người dùng vẫn có thể đổi mapping theo source index.

`fieldCatalog` là nguồn sự thật từ backend, không phải danh sách FE tự hardcode; mỗi
item có `{key, label, required, valueType}`. `requiredFields` là danh sách target bắt
buộc do backend trả về và FE dùng để kiểm tra tiến độ/điều kiện tiếp tục. `headers` có
`{sourceIndex, label, inferredField, enabled}` và `sampleRows` có `{row, values}`;
`values` luôn giữ thứ tự cột nguồn. Dùng `sourceIndex` thay vì label để xử lý đúng các
cột trùng tên.

Mapped preview/quick commit dùng payload:

```json
[
  {"sourceIndex": 0, "targetField": "student_name", "enabled": true},
  {"sourceIndex": 1, "targetField": null, "enabled": false}
]
```

Các cột bắt buộc của `quick_create` chỉ gồm:

| Field API             | Nhãn trong file | Bắt buộc                                                                                          |
| --------------------- | --------------- | ------------------------------------------------------------------------------------------------- |
| `student_name`        | Họ và tên       | Có                                                                                                |
| `phone`               | Di động         | Có                                                                                                |
| `province`            | Tỉnh/Thành phố  | Có                                                                                                |
| `high_school`         | Trường THPT     | Có                                                                                                |
| `source`              | Nguồn           | Có                                                                                                |
| `major`               | Ngành quan tâm  | Không                                                                                             |
| —                     | Tình trạng Lead | Có thể giữ trong template; backend bỏ qua và tự đặt `processing_status=NEW`, `resolution=PENDING` |
| `assigned_to`         | Giao cho        | Không                                                                                             |
| `aspiration`          | Nguyện vọng     | Không                                                                                             |
| `description`/`notes` | Mô tả/Ghi chú   | Không                                                                                             |
| `admission_year`      | Năm tuyển sinh  | Không, dùng năm hiện tại nếu catalog có                                                           |

`Giao cho` để trống là hợp lệ: Lead được tạo không có owner, giữ `NEW/PENDING` để
người vận hành chạy lần lượt **Xử lý Lead** rồi **Phân công Lead** theo flow hiện
có. Nếu có giá trị, giá trị đó phải khớp chính xác `CRM Staff` đang hoạt động và
được phép giao; không nhận tên User tùy ý và không tự chia ngay trong import.

Các giá trị tỉnh, trường, ngành, nguồn, nguyện vọng và năm tuyển sinh được resolve
theo các bản ghi/catalog của Frappe, không phải text tự do. Cột tình trạng trong
template chỉ mang tính hướng dẫn và không được FE/BE dùng để ghi trạng thái Lead.
Ví dụ `promoter` chỉ hợp lệ nếu có nguồn tương ứng trong CRM. Nếu cùng gửi `description`
và `notes`, backend ưu tiên `description`. Bỏ trống năm tuyển sinh sẽ dùng năm hiện
tại nếu catalog `CRM Admission Year` có bản ghi tương ứng.

Inspect trả `filename`, `fieldCatalog`, `headers`, `sampleRows` và `requiredFields`.
Mapped preview trả `filename`, `total`, `valid`, `failed`, `mappedFields`,
`ignoredColumns`, `rows` (gồm `row`, `fields`, `errors`) và `errors`. Lỗi mapping dùng
các mã ổn định như `INVALID_COLUMN_MAPPING`, `MAPPING_TARGET_REQUIRED`,
`INVALID_SOURCE_INDEX`, `DUPLICATE_SOURCE_INDEX`, `DUPLICATE_TARGET_FIELD`,
`UNKNOWN_FIELD`, `SERVER_MANAGED_FIELD` và `MISSING_REQUIRED_MAPPING`. `row` giữ số
dòng vật lý; lỗi cấp request (file, quyền, campaign hoặc mapping) không nằm trong danh
sách dòng.

Commit nhận multipart `file`, `column_mapping`, `campaign_code` và `import_mode=quick_create`;
backend parse/validate lại file gốc trước khi ghi. Commit trả `filename`, `total`, `created`, `failed`, `students` và `errors`; `total`
ở đây là số dòng hợp lệ được gửi vào commit, còn tổng file và các dòng bị loại ở
preview được FE cộng lại khi hiển thị. Key `students` là tên tương thích cũ nhưng
mỗi item thực tế là summary của `CRM Lead`, không phải `CRM Student`. Lỗi một dòng
không rollback các dòng hợp lệ khác.

### 5.4.2. Thứ tự rollout

Backend contract và test là bước trước: dashboard chỉ bật wizard sau khi inspect,
mapped preview, permission/limit checks và commit re-parse đã sẵn sàng. FE gửi file gốc
kèm `column_mapping` ở preview/commit; backend là nguồn quyết định cuối. Các plan
duplicate-review tiếp theo tiêu thụ row shape từ mapped preview và không mở rộng
boundary v1 (first non-empty row của worksheet đầu tiên; title-row detection và
multi-sheet selection vẫn deferred).

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

| Error code                                                    | Cách hiển thị đề xuất                                                      |
| ------------------------------------------------------------- | -------------------------------------------------------------------------- |
| `IDENTIFIER_GATE_FAILED`                                      | Lead thiếu số điện thoại, tỉnh/thành phố, trường THPT hoặc ngành quan tâm. |
| `INVALID_ID_NUMBER`                                           | CCCD phải gồm 9 hoặc 12 chữ số.                                            |
| `INVALID_LOOKUP` / `INVALID_PROVINCE` / `INVALID_HIGH_SCHOOL` | Chọn lại dữ liệu từ danh sách Frappe.                                      |
| `MISSING_CAMPUS`                                              | Bổ sung cơ sở cho Lead hoặc cấu hình cơ sở mặc định.                       |
| `MISSING_INPUT_QUEUE` / `MULTIPLE_INPUT_QUEUES`               | Quản trị viên cần hoàn tất cấu hình Team/Zone.                             |
| `CAPACITY_BLOCKED`                                            | Sale/Team đã đủ giới hạn nhận Lead.                                        |
| `NO_ACTIVE_POLICY`                                            | Chưa có cách chia Lead đang hiệu lực cho Team.                             |
| `STALE_OWNERSHIP_REVISION`                                    | Dữ liệu đã thay đổi; tải lại batch rồi retry.                              |
| `LEAD_NOT_ASSIGNED`                                           | Lead chưa được phân công nên chưa thể tạo Student.                         |
| `OWNER_REQUIRED`                                              | Lead/Student chưa có người phụ trách hợp lệ.                               |
| `FORBIDDEN` / `OUT_OF_SCOPE`                                  | Tài khoản không có quyền hoặc ngoài phạm vi Team/cơ sở.                    |

## 10. Trạng thái triển khai hiện tại

Đã kiểm tra local:

- Migration thành công, 190 CRM JSON hợp lệ.
- Processing contract: 9 tests pass.
- Lead mapping/catalog: 16 tests pass.
- Assignment batch: 5 tests pass.
- Routing: 10 tests pass.
- Student routing: 6 tests pass.
- `git diff --check` pass. Ruff chưa khả dụng trong môi trường chuẩn; focused backend
  suite còn các lỗi integration baseline do môi trường/fixture, không phải lỗi mapping
  contract mới.

Dashboard đã tích hợp luồng import mapping/live preview theo contract này. Phần batch
assignment vẫn giữ các API lịch sử và không được suy đoán lại từ import dialog.

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
