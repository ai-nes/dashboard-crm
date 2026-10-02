# Hướng dẫn cấu hình phân công Lead và bộ test case cho Tester

> Tài liệu này mô tả behavior đang được implement cho màn hình **Lead Sale → Phân công Lead → Cấu hình phân công**. Đây là workflow phân công Lead theo batch của CRM, không phải màn hình `Settings → Assignment Rules` cũ của Frappe.
>
> Nguyên tắc quan trọng: workflow v1 có topology cố định. Người vận hành chỉ thay đổi các tham số được cho phép; không được tắt các bước bảo vệ dữ liệu hoặc tự nối lại workflow.

## 1. Phạm vi và thuật ngữ

- **Workflow phân công**: chuỗi bước nhận Lead, kiểm tra dữ liệu, xác định kết quả xử lý, chọn phạm vi phân tuyến, đưa ra người nhận và ghi ownership.
- **Cách phân công**: một trong ba chế độ `global`, `group`, `campaign`; không fallback giữa các chế độ.
- **Policy**: cấu hình bật/tắt routing, cách phân công và team ưu tiên theo tỉnh.
- **Batch snapshot**: bản chụp workflow/policy được lưu trên một đợt phân công. Lần retry của batch dùng snapshot đó để kết quả có thể audit và tái lập.
- **Lead mới**: Lead chưa có `owner_staff`/`assigned_to`. Lead đã có owner không bị workflow mới ghi đè.
- **Cần lưu ý**: nhóm kết quả gồm hồ sơ `deferred`, `manual_review`, `failed` hoặc `skipped`.

## 2. Chuẩn bị trước khi test

### 2.1. Tài khoản và quyền

Chuẩn bị tối thiểu các tài khoản sau:

| Loại tài khoản | Quyền cần kiểm tra | Kết quả mong đợi |
|---|---|---|
| Người xem | Có quyền đọc phân tuyến, ví dụ `student.routing.read` | Mở được màn hình, chỉ xem, thấy badge **Chỉ có quyền xem** |
| Người vận hành | `student.routing.operate` | Được sửa policy/workflow và chạy phân công theo scope được cấp |
| Quản trị hệ thống | `system.configure` | Được sửa cấu hình và kiểm tra các API control cấp hệ thống |
| Người không có quyền | Không có capability đọc phân tuyến | Bị chặn khi vào màn hình/API, không được lộ dữ liệu cấu hình |

Quyền trên UI chỉ là lớp bảo vệ thao tác. Tester vẫn phải kiểm tra gọi trực tiếp API `POST` bằng tài khoản read-only phải trả `403`/Permission Error.

### 2.2. Dữ liệu tối thiểu

Trên môi trường test cần có:

- Ít nhất một Campus hoạt động.
- Team Sales hoạt động, thuộc đúng Campus.
- Nhân sự hoạt động thuộc Team, có User hoạt động và function là `Sale` hoặc `CTV Sale`.
- Có ít nhất hai Sale/CTV đang hoạt động để kiểm tra luân phiên; capacity period không phải điều kiện phân công Lead.
- Lead ở trạng thái `PROCESSED`, chưa có owner, có đủ `student_name`, `phone`, `province`.
- Lead thiếu phone, thiếu province, Lead trùng và Lead thiếu `high_school`/`major` để kiểm tra các nhánh dữ liệu.
- Campaign có routing hợp lệ tới Team hoặc Team Group cùng Campus; Team Group/tỉnh có Team Sales hoạt động.

### 2.3. Seed local tùy chọn

Các lệnh dưới đây chỉ dành cho `crm.localhost`. `seed-assignment-scenarios` sẽ xóa dữ liệu Lead/Student và audit assignment hiện có, vì vậy không chạy trên staging/production.

```bash
cd frappe-crm
task seed-assignment-scenarios
task seed-capacity-scenarios
```

Bộ seed có các nhóm chính:

| Nhóm dữ liệu | Ý nghĩa |
|---|---|
| Lead hợp lệ | Kiểm tra phân công thành công |
| Thiếu phone | Phải đi vào kiểm tra thủ công/không được phân công |
| Thiếu province | Không xác định được phạm vi routing |
| Thiếu `high_school` hoặc `major` | Đây là trường bổ sung, không tự động chặn nếu các trường bắt buộc hợp lệ |
| Duplicate pair | Kiểm tra nhánh duplicate và hồ sơ đóng |
| Đồng Nai | Sale/CTV chưa cấu hình capacity |
| Hồ Chí Minh - Bình Chánh/Quận 1 | Capacity còn trống |
| Hồ Chí Minh - Thủ Đức | Capacity đã đầy, dùng để kiểm tra loại khỏi candidate |

## 3. Cách sử dụng màn hình cấu hình

1. Đăng nhập bằng tài khoản có quyền đọc.
2. Mở `/lead-sale/student-assignment?tab=config`.
3. Chọn tab **Cấu hình phân công**.
4. Chọn một bước ở cột **Quy trình phân công**.
5. Nếu có quyền sửa, thay đổi cấu hình, nhập **Lý do thay đổi** tối thiểu 5 ký tự rồi chọn **Lưu và áp dụng**.
6. Tải lại trang hoặc gọi lại snapshot để xác nhận giá trị, revision, người thay đổi và lý do đã được lưu.
7. Sang tab **Phân công Lead**, tạo/chọn một batch mới rồi **Xem trước** hoặc **Phân công Lead**. Không dùng batch cũ để kết luận policy mới vì batch có snapshot riêng.
8. Sang tab **Lịch sử phân công**, mở chi tiết item để kiểm tra owner, Team, capacity, policy version, trạng thái và lý do.

### 3.1. Ý nghĩa sáu node trong workflow

| Node trên UI | Có thể bật/tắt node? | Cấu hình hiện có | Behavior cần nhớ |
|---|---:|---|---|
| **Lead vào hệ thống** (`input`) | Có | Bật/tắt; thời gian chờ job nền; giới hạn Lead mỗi lần chạy | Tắt node thì pipeline quét Lead chưa phân công trả `disabled`; không xóa Lead. Nút chạy thủ công quét ngay, không áp dụng ngưỡng tuổi nhưng vẫn chịu giới hạn số Lead. |
| **Xác định pool chuẩn** (`validation`) | Không | Trường bắt buộc: `student_name`, `phone`, `province`; trường bổ sung: `high_school`, `major` | Luôn bật. Dữ liệu thiếu/không hợp lệ đi vào **Cần lưu ý**, không được đoán Team hoặc pool. |
| **Xác định Zone và Tier** (`classification`) | Có | Bật/tắt chạy lại bước xác định kết quả xử lý | Khi tắt, dùng kết quả xử lý đã lưu trên Lead và không chạy lại kiểm tra duplicate trong batch. Lead chưa ở trạng thái phù hợp vẫn bị đưa vào kiểm tra thủ công. Không tạo Student ở bước này. |
| **Điều phối Lead** (`matching`) | Node luôn bật; policy bên trong có thể bật/tắt | Bật/tắt phân bổ; chọn một trong ba cách; cấu hình team ưu tiên theo tỉnh | Thiếu mapping/người nhận thì chờ xử lý, không đổi sang cách khác. |
| **Nhánh rẽ – Hàng đợi xử lý thủ công** (`review`) | Không | Retry thủ công; số lần retry tối đa | Nhận các hồ sơ thiếu dữ liệu, deferred, lỗi hoặc không có candidate. Không retry vô hạn. |
| **Ownership và SLA** (`assignment`) | Không | Owner hiện có được giữ; đối tượng nhận là Sale/CTV Sale; không tạo Student | Ghi ownership, audit và policy version sau khi phân công thành công. |

### 3.2. Giới hạn giá trị

| Trường | Mặc định | Khoảng hợp lệ | Hành vi ngoài khoảng |
|---|---:|---:|---|
| Thời gian chờ tự động (phút) | `5` | `0–1440` | Backend chuẩn hóa về cận gần nhất |
| Giới hạn Lead mỗi lần chạy | `1000` | `1–1000` | Backend chuẩn hóa về cận gần nhất |
| Số lần xử lý lại tối đa | `3` | `0–10` | Backend chuẩn hóa về cận gần nhất |

## 4. Ba cách phân công Lead

Chọn một cách trong **Bước 4 · Điều phối Lead**, nhập lý do rồi lưu và áp dụng.

| Cách | Cấu hình | Phạm vi |
|---|---|---|
| Chia đều cho toàn bộ Sales | Không cần mapping tỉnh/Campaign | Toàn bộ Sales đủ điều kiện (Sale/CTV đang hoạt động trong các team Sales); không giới hạn campus/tỉnh |
| Theo team/tỉnh | Thêm tỉnh, chọn team ưu tiên đang hoạt động và phụ trách tỉnh đó | Chia trong đúng team ưu tiên; không giới hạn campus của Lead |
| Theo chiến dịch | Chọn Team/Team Group nhận Lead trong chi tiết Campaign | Chia trong đích Campaign; giữ validation mapping/campus hiện có |

Ba cách dùng luân phiên dựa trên lịch sử gán thành công. Chuyển đổi/đóng Lead không làm mất lượt; nhân sự thuộc nhiều team được tính một lần. Xem trước mô phỏng lượt, không ghi ownership.

Không chuyển sang cách khác khi thiếu mapping hoặc người nhận. Lead vào **Cần kiểm tra**, giữ nguyên dữ liệu để sửa cấu hình và xử lý lại. Lead đã có người phụ trách không bị ghi đè. Cấu hình mới áp dụng cho quyết định mới; retry batch cũ giữ snapshot.

Phân công Lead hiện không chặn theo capacity; capacity là dữ liệu tương thích của các luồng cũ, không còn control trong màn cấu hình Lead này.

## 5. Luồng kiểm chứng end-to-end

1. Chuẩn bị Lead `PROCESSED`, chưa có owner.
2. Lưu cấu hình cần test, ghi lại `version/revision` hiện tại.
3. Tạo một batch mới hoặc bấm **Phân công Lead** sau khi cấu hình đã lưu.
4. Nếu cần kiểm tra không ghi dữ liệu, chọn **Xem trước**; kiểm tra Team, owner dự kiến, capacity, routing tier và policy version.
5. Chọn **Phân công Lead** để ghi kết quả.
6. Kiểm tra:
   - Lead thành công có `owner_staff`/`assigned_to`, Team đúng và trạng thái `assigned`.
   - Lead cần xử lý có trạng thái `deferred`, `manual_review` hoặc `failed`, kèm reason/error code dễ hiểu.
   - Lead đã có owner là `skipped`/`ALREADY_ASSIGNED`, owner không đổi.
   - Không tạo Student trong batch Lead này.
   - Lịch sử lưu policy/workflow version và lý do kết quả.
7. Sửa nguyên nhân (capacity, province, Team, Campaign...), chọn **Xử lý lại hồ sơ** và kiểm tra kết quả sau retry.

Nếu hệ thống còn Lead `NEW`, nút chính sẽ ưu tiên **Xử lý Lead** trước. Cần hoàn tất bước đó, sau đó chạy lại **Phân công Lead** để test routing; không dùng nút xử lý Lead để kết luận config routing.

### Snapshot và phạm vi áp dụng

- Thay đổi cấu hình có hiệu lực cho **quyết định phân công mới**.
- Lead đã có owner được giữ nguyên.
- Một batch lưu workflow/policy snapshot; retry batch dùng snapshot đó. Muốn kiểm tra policy mới, tạo batch mới sau khi lưu cấu hình.
- Batch được xem trước nhưng chưa chạy cũng phải được kiểm tra lại behavior snapshot/version theo môi trường; không giả định mọi batch tự đọc policy mới.

## 6. Bộ test case bắt buộc

### A. Truy cập và hiển thị cấu hình

| ID | Mức | Tiền điều kiện | Thao tác | Kết quả mong đợi |
|---|---|---|---|---|
| CFG-001 | P0 | Tài khoản có quyền đọc | Mở URL cấu hình | Trang tải được; có tab Cấu hình; hiển thị đủ 6 node; không lộ JSON/raw secret. |
| CFG-002 | P0 | Tài khoản read-only | Mở cấu hình và chọn từng node | Có badge **Chỉ có quyền xem**; field/toggle/select và nút lưu bị khóa; vẫn xem được giá trị hiện tại. |
| CFG-003 | P0 | Cấu hình control rỗng hoặc mới | Tải snapshot | Giá trị an toàn: input bật, chờ `5`, limit `1000`, classification bật, retry `3`, cách phân công theo cấu hình server, chia luân phiên. Các node bảo vệ hiển thị **Bắt buộc bật**. |
| CFG-004 | P1 | Backend trả 403/5xx hoặc mất mạng | Tải lại trang cấu hình | Hiển thị trạng thái lỗi rõ ràng; không hiển thị form giả như đã tải thành công; không được ghi thay đổi một phần. |
| CFG-005 | P1 | Có quyền sửa cách phân công | Đổi cách phân công bằng bàn phím và chuột | Chỉ một cách được chọn; bàn phím và nhãn control hoạt động đúng. |
| CFG-006 | P1 | Có quyền sửa | Chọn tab khác rồi quay lại hoặc refresh | Tab cấu hình vẫn mở được; dữ liệu server sau khi đã lưu không quay về draft cũ. |

### B. Sửa workflow và validation form

| ID | Mức | Tiền điều kiện | Thao tác | Kết quả mong đợi |
|---|---|---|---|---|
| CFG-010 | P0 | Có quyền `student.routing.operate` | Sửa input: bật, chờ `10`, limit `20`; nhập lý do hợp lệ; lưu | Toast thành công; dữ liệu giữ sau refresh; revision tăng; last changed by/reason được cập nhật. |
| CFG-011 | P0 | Có Lead `PROCESSED` chưa owner và không còn Lead `NEW` chờ xử lý | Tắt bước `input`, lưu, bấm **Phân công Lead** | Scan trả `disabled`, không tạo batch phân công mới/không gán owner. Bật lại để dọn dữ liệu sau test. |
| CFG-012 | P0 | Có nhiều Lead đủ điều kiện | Đặt `maxLeadsPerRun = 2`, chạy scan thủ công | Một lượt không quét quá 2 Lead; Lead còn lại vẫn chờ lượt sau. |
| CFG-013 | P1 | Có Lead mới vừa tạo và ngưỡng chờ > 0 | Đặt chờ job nền `60` phút; chạy thủ công ngay và đối chiếu job nền | Chạy thủ công không chờ 60 phút; job nền loại Lead chưa đủ tuổi. Kiểm tra limit vẫn được áp dụng cho cả scan. |
| CFG-014 | P0 | Có Lead đã `PROCESSED` và Lead `NEW/PROCESSING` | Tắt classification rồi chạy batch | Lead đã `PROCESSED` dùng kết quả đã lưu; Lead `NEW/PROCESSING` vào `manual_review` với `INVALID_PROCESSING_STATUS`; không tự chuyển Lead sang `PROCESSED`. |
| CFG-015 | P1 | Có Lead thiếu phone/province/high_school/major | Bật classification và chạy xem trước | Thiếu phone là lỗi dữ liệu; thiếu province không routing được; thiếu `high_school` hoặc `major` không tự chặn vì đây là field bổ sung. |
| CFG-016 | P0 | Có quyền sửa | Chọn validation/matching/assignment và tìm cách tắt node | Không có control tắt node; node vẫn **Bắt buộc bật**. Gọi API trực tiếp với settings trái phép phải bị reject cho validation/assignment; matching chỉ sửa policy bên trong, không tắt node. |
| CFG-017 | P0 | Có quyền sửa | Đổi `maxRetries` lần lượt thành `0`, `10`, giá trị âm và `11` | `0` và `10` được lưu; giá trị ngoài khoảng được chuẩn hóa về `0`/`10`; retry mode luôn là **Thủ công**. |
| CFG-018 | P0 | Có quyền sửa | Để lý do trống, 4 ký tự, chỉ có khoảng trắng rồi bấm lưu | Không cho lưu ở UI; nếu bypass UI thì API trả validation error “ít nhất 5 ký tự”; server không đổi revision/config. |
| CFG-019 | P1 | Có draft chưa lưu | Sửa field, chuyển node, refresh trước khi lưu | Draft không được báo là đã áp dụng; sau refresh giá trị quay về server value; không tạo audit record. |
| CFG-020 | P1 | Hai session mở cùng revision | Session A lưu trước; session B lưu bằng revision cũ | Session B nhận `WORKFLOW_REVISION_CONFLICT`, không ghi đè thay đổi A; UI yêu cầu tải lại rồi lưu lại. |

### C. Ba cách phân công

| ID | Mức | Thao tác | Kết quả mong đợi |
|---|---|---|---|
| CFG-030 | P0 | Tắt phân bổ tự động, chạy Lead mới | Không gán; lý do LEAD_ROUTING_DISABLED |
| CFG-031 | P0 | Chọn toàn bộ Sales; Lead và người nhận khác tỉnh/campus | Gán được Sale/CTV đủ điều kiện; routing tier global |
| CFG-032 | P0 | Chạy nhiều Lead với chế độ toàn bộ Sales | Luân phiên người nhận, nhân sự nhiều team chỉ tính một lần |
| CFG-033 | P0 | Chọn team/tỉnh, cấu hình tỉnh → team | Gán trong đúng team ưu tiên; tier group |
| CFG-034 | P0 | Chọn team không phụ trách tỉnh khi lưu | Backend reject, cấu hình không bị ghi sai |
| CFG-035 | P0 | Tỉnh chưa có team ưu tiên | Cần kiểm tra; không chuyển sang toàn bộ Sales |
| CFG-036 | P0 | Chọn chiến dịch có đích Team/Team Group hợp lệ | Gán trong đích Campaign; tier campaign |
| CFG-037 | P0 | Campaign thiếu mapping hoặc team không có người nhận | Cần kiểm tra; không fallback |
| CFG-038 | P1 | Sale/CTV không có capacity period | Vẫn nhận Lead nếu đáp ứng điều kiện hoạt động/membership |
| CFG-039 | P1 | Đóng/chuyển đổi Lead trước lượt tiếp theo | Lượt tiếp theo tiếp tục từ lịch sử gán gần nhất |
| CFG-040 | P0 | Đổi cách phân công, lưu, refresh | Chế độ/map tỉnh được giữ; revision/audit cập nhật |
| CFG-041 | P0 | Lead đã có owner | Không ghi đè owner hiện tại |
| CFG-042 | P1 | Batch cũ rồi đổi cấu hình và retry | Retry giữ policy snapshot cũ |
| CFG-043 | P1 | Read-only mở cấu hình | Xem được chế độ/map tỉnh; không có control sửa |
| CFG-044 | P0 | Tab Thiếu thông tin, bổ sung đủ trường bắt buộc | Lead ra khỏi tab sau refresh; trường optional nullable không bị tính thiếu |

### D. Review, retry và dữ liệu bất thường

| ID | Mức | Tiền điều kiện | Thao tác | Kết quả mong đợi |
|---|---|---|---|---|
| CFG-050 | P0 | Lead thiếu province | Chạy xem trước/phân công | Item ở `manual_review` hoặc trạng thái cần lưu ý, reason `MISSING_PROVINCE`; sửa province rồi retry mới có thể route. |
| CFG-051 | P0 | Lead thiếu phone | Chạy classification | Lead không được phân công; kết quả invalid/manual review hoặc hồ sơ đóng theo contract xử lý Lead; reason phải giữ được nguyên nhân thiếu dữ liệu. |
| CFG-052 | P1 | Lead thiếu `high_school` hoặc `major`, các field bắt buộc đủ | Chạy batch | Không bị chặn chỉ vì thiếu field optional; nếu dữ liệu và cấu hình người nhận hợp lệ thì được phân công. |
| CFG-053 | P0 | Có cặp Lead duplicate | Chạy batch | Lead duplicate bị nhận diện và đóng/skip theo contract; không gán owner cho bản ghi duplicate; bản ghi gốc không bị đổi sai owner. |
| CFG-054 | P0 | Có item `manual_review` vì thiếu nhân sự | Bổ sung Sale/CTV hoạt động vào team rồi chọn **Xử lý lại hồ sơ** | Retry tăng retry count, dùng policy snapshot của batch, đọc nhân sự mới và phân công được nếu mọi điều kiện đã đạt. |
| CFG-055 | P0 | `maxRetries = 0` | Chọn retry item cần xử lý | Không chạy lại; reason/error `RETRY_LIMIT_REACHED`; item vẫn hiển thị trong lịch sử. |
| CFG-056 | P1 | `maxRetries = 1` | Retry một item hai lần | Lần đầu được chạy; lần thứ hai bị chặn bởi giới hạn; không tạo thêm ownership event ngoài lần thành công. |
| CFG-057 | P1 | Item `skipped` do đã assigned/converted | Chọn retry | Không xuất hiện trong nhóm retry hoặc không bị reset; dữ liệu ownership/converted giữ nguyên. |
| CFG-058 | P0 | Batch có item assigned và item cần lưu ý | Mở Lịch sử và chi tiết từng item | Summary đếm đúng `assigned`, `deferred`, `manual_review`, `failed`, `skipped`; reason hiển thị tiếng Việt dễ hiểu, không lộ raw code nếu đã có mapping. |
| CFG-059 | P1 | Sửa policy sau khi batch đã có snapshot | Retry batch cũ rồi tạo batch mới | Batch cũ dùng policy version cũ; batch mới dùng version mới; không có việc đổi ngầm kết quả cũ. |

### E. Quyền, API, audit và độ bền UI

| ID | Mức | Tiền điều kiện | Thao tác | Kết quả mong đợi |
|---|---|---|---|---|
| CFG-070 | P0 | Tài khoản read-only lấy được GET snapshot | Gọi `POST update_lead_assignment_workflow_step` và `POST update_lead_routing_policy` | Trả 403/Permission Error; database/config/revision không thay đổi. |
| CFG-071 | P0 | Tài khoản không có capability đọc | Gọi GET snapshot và mở màn hình | Bị từ chối; không trả danh sách Team, Sale, capacity hay reason nội bộ ngoài phạm vi. |
| CFG-072 | P1 | Đã lưu một thay đổi hợp lệ | Kiểm tra response/API/DB audit | Có workflow/policy version mới, revision tăng đúng một lần, `lastChangedBy`, `lastChangeReason` đúng actor/reason; không tăng revision khi validation fail. |
| CFG-073 | P1 | Đang lưu một thay đổi | Double-click nút lưu hoặc gửi hai request nhanh | Nút bị disable khi pending; không tạo hai thay đổi ngoài ý muốn; nếu concurrent thật thì một request bị revision conflict. |
| CFG-074 | P1 | API trả lỗi sau khi submit | Giả lập 4xx/5xx/network error | Có toast lỗi; không hiển thị toast thành công; server value không bị coi là đã lưu; draft không làm sai dữ liệu sau refresh. |
| CFG-075 | P2 | Desktop, tablet, mobile; dùng keyboard | Tab qua step, toggle, select, textarea và nút lưu | Focus visible, label/aria rõ, không bị cắt control; chọn chế độ và team ưu tiên thao tác được bằng bàn phím. |
| CFG-076 | P2 | Có nhiều mapping tỉnh và bảng item dài | Mở ở viewport nhỏ, cuộn bảng và drawer chi tiết | Không tràn ngang ngoài vùng được thiết kế; dữ liệu owner/status/reason vẫn đọc và thao tác được. |

## 7. Ma trận kết quả cần đối chiếu

| Tình huống | Kết quả UI | Mã/ý nghĩa backend thường gặp |
|---|---|---|
| Input step tắt | Không quét Lead | `disabled` / `ROUTING_DISABLED` |
| Lead chưa xử lý | Cần kiểm tra | `NOT_PROCESSED` |
| Thiếu tỉnh | Cần kiểm tra | `MISSING_PROVINCE` |
| Không có Team tỉnh | Cần kiểm tra | `TEAM_NOT_FOUND_FOR_PROVINCE` hoặc `GROUP_TARGET_UNAVAILABLE` |
| Không có routing layer phù hợp | Cần kiểm tra | `NO_ROUTING_LAYER` |
| Routing policy tắt | Cần kiểm tra | `LEAD_ROUTING_DISABLED` |
| Tỉnh chưa chọn team ưu tiên | Cần kiểm tra | `PROVINCE_TEAM_NOT_CONFIGURED` |
| Không có Sale/CTV hoạt động | Cần kiểm tra | `NO_ELIGIBLE_RECIPIENT` |
| Campaign mapping sai | Cần kiểm tra | `CAMPAIGN_MAPPING_INVALID` / `CAMPAIGN_TARGET_UNAVAILABLE` |
| Lead đã có owner | Bỏ qua | `ALREADY_ASSIGNED` |
| Lead đã convert | Bỏ qua | `ALREADY_CONVERTED` |
| Retry quá số lần | Không chạy lại | `RETRY_LIMIT_REACHED` |
| Cấu hình bị thay đổi ở session khác | Tải lại rồi lưu lại | `WORKFLOW_REVISION_CONFLICT` |

Khi triage lỗi, không chỉ nhìn label tổng hợp **Cần lưu ý**. Tester cần mở drawer/history và ghi lại: Lead ID, batch ID, status, reason, error code, routing tier, Team, owner, active load, capacity limit, policy version và workflow version.

## 8. Tiêu chí pass trước khi bàn giao

- [ ] Người có quyền đọc và người read-only thấy đúng khác biệt; người không quyền bị chặn.
- [ ] Chỉ `input` và `classification` được bật/tắt; các node bảo vệ luôn bật.
- [ ] Validation reason, range và revision conflict hoạt động đúng.
- [ ] Ba cách phân công và mapping tỉnh được phản ánh trong batch mới.
- [ ] Thiếu mapping/người nhận không tự chuyển sang cách phân công khác.
- [ ] Lead thiếu dữ liệu, duplicate, thiếu team/mapping hoặc nhân sự đều có reason rõ ràng.
- [ ] Lead đã có owner không bị ghi đè; batch không tạo Student.
- [ ] Retry tôn trọng `maxRetries` và batch snapshot.
- [ ] Audit/version/reason được lưu sau thay đổi hợp lệ và không lưu khi validation thất bại.
- [ ] Kiểm tra desktop/mobile/keyboard và trạng thái loading/error.

## 9. Tài liệu và source tham chiếu

- [Nghiệp vụ phân công Lead tự động](./nghiep-vu-phan-cong-lead-tu-dong.md)
- [Contract backend phân công Lead theo batch](./api/lead-student-assignment-backend-contract.md)
- [API màn hình Lead Sale – Student Assignment](./api/lead-sale-student-assignment.md)
- [Component cấu hình workflow](<../src/app/(with-layouts)/(dashboard)/lead-sale/student-assignment/_components/lead-assignment-workflow-config-card.tsx>)
- [Component routing settings](<../src/app/(with-layouts)/(dashboard)/lead-sale/student-assignment/_components/lead-routing-settings.tsx>)
- [Backend workflow config](../../frappe-crm/crm/fcrm/lead_assignment_workflow.py)
- [Backend routing policy](../../frappe-crm/crm/fcrm/lead_routing_policy.py)
- [Assignment control API](../../frappe-crm/crm/api/assignment_control.py)
- [Seed assignment scenarios](../../frappe-crm/crm/demo/seed_assignment_scenarios.py)
