# Kiểm tra mã nghiệp vụ — 11/10/2026

Phạm vi: mã hiển thị của thí sinh, chiến dịch, phân khúc, mẫu tin nhắn,
thư viện mẫu, nội dung mẫu, phân loại/tag và các danh mục liên quan.
ID nội bộ tiếp tục phục vụ liên kết, truy vấn và thao tác cập nhật.

| Nhóm | Kết quả kiểm tra và sửa |
| --- | --- |
| Thí sinh | Danh sách dùng mã thí sinh; bộ chọn thí sinh của task hiển thị mã để phân biệt người trùng tên. Giá trị chọn vẫn là ID. |
| Nguồn Lead | Ba adapter hồ sơ dùng `leadCode` để hiển thị; `sourceLeadId` giữ cho liên kết. |
| Chiến dịch | Bỏ dự phòng bằng UUID ở mã/tên. Liên kết chi tiết dùng mã; bộ lọc thí sinh và thao tác cập nhật dùng ID chiến dịch đã xác định. |
| Phân khúc | Mã phân khúc dùng `segment_code`. API xem trước trả thêm `student_code`; danh sách thành viên giữ UUID cho liên kết. |
| Phân loại/tag | Giữ mã nghiệp vụ; không hiển thị UUID thay cho mã/nhãn. Giữ tên tài liệu cũ khi đó là mã nghiệp vụ hợp lệ. |
| Mẫu tin nhắn | API trả mã riêng `MSG-*`, giữ UUID làm khóa. |
| Thư viện mẫu tin nhắn | API trả mã riêng `MSG-LIB-*`, giữ UUID làm khóa. |
| Nội dung mẫu | API trả mã riêng `SNP-*`; adapter không lấy ID làm mã dự phòng. |
| Trường THPT | Dùng `school_code`/`school_name`; thiếu dữ liệu không thay bằng ID. |
| Giấy tờ/phương thức xét tuyển | Nhãn dùng tên hoặc mã danh mục; lựa chọn chưa tìm thấy có nhãn dễ hiểu và giữ giá trị đang lưu. |
| Danh mục hành động/tương tác | Đối chiếu backend: mã là trường nghiệp vụ riêng. Tên tài liệu dùng làm mã ở hợp đồng cũ được giữ khi có cơ sở dữ liệu tương ứng. |

## Dữ liệu local

- 64 thí sinh: tất cả có mã.
- 3 phân khúc: tất cả có mã.
- 8 chiến dịch: 1 bản ghi thực sự chưa có mã. Giao diện hiển thị
  “Chưa có mã chiến dịch”; không tự đoán mã lịch sử. API tạo chiến dịch hiện
  cho phép bỏ `stableCode`; import đọc mã từ `stable_code` nguồn.
- 4 mẫu tin nhắn, 19 mẫu thư viện, 2 nội dung mẫu: giữ nguyên 25 mã Frappe đã có.

Migration backend `20261011100000_message_business_codes` bổ sung mã riêng,
sao chép mã cũ, cấp mã cho bản ghi chưa có mã và tạo bộ đếm theo loại nội dung.
Tạo mới cấp mã trong cùng transaction với bản ghi. Import giữ mã nguồn và
đồng bộ bộ đếm để không lùi số. Migration đã áp dụng trên local sau sao lưu,
kiểm tra database thử và đối chiếu: không đổi UUID, mã cũ hoặc số lượng bản ghi.

## URL chi tiết

- Lead: link dùng `leadCode`, ví dụ `/director/leads/LD-2026-HCM-003978`.
  Backend tra chính xác ID hoặc mã trong cùng phạm vi quyền. Adapter tải Lead
  trước, rồi tải nhật ký bằng UUID trả về; các tab và thao tác ghi cũng dùng UUID.
- Chiến dịch: các trang dùng chung danh sách/chi tiết điều hướng bằng mã, ví dụ
  `/lead-sale/campaigns/CAM-2026-00001`. Tra mã bằng adapter hiện có;
  bộ lọc Lead/học sinh vẫn dùng ID của chiến dịch.
- Học sinh: danh sách, tạo mới, chuyển đổi Lead, link task và hành động từ hồ sơ
  dùng mã học sinh. Sửa, xóa, phân công và chuyển trạng thái dùng ID đã xác định.
- Phân khúc: danh sách, chi tiết và chỉnh sửa hỗ trợ mã; xem trước, task,
  nhật ký và cập nhật giữ UUID của bản ghi đã tải.
- Nhóm ngành: danh sách dùng mã nhóm, chi tiết tra ID hoặc mã; danh mục con
  tiếp tục nhận ID nhóm.
- Link ID cũ tự thay URL thành mã sau khi tải dữ liệu thành công, giữ query,
  tab, task và anchor. Thiếu mã thật thì vẫn mở bằng ID, không lấy placeholder
  làm đường dẫn hoặc tự đoán mã.
- Đề xuất AI tận dụng mã từ những truy vấn học sinh đang có. Khi dữ liệu đề xuất
  chỉ có ID và không cần truy vấn bổ sung để lấy tên, link ID vẫn hoạt động;
  trang hồ sơ sẽ chuyển sang URL mã sau khi tải.
- Mẫu tin nhắn/thư viện/nội dung mẫu hiện dùng dialog, không có URL chi tiết
  riêng. Trường học đã có route mã; cấu hình quy tắc dùng `versionId`/`ruleId`
  nghiệp vụ trong trường `name`. Team và mẫu điểm chưa có trường mã riêng
  trong hợp đồng dữ liệu hiện tại.
- Đối chiếu dữ liệu local với ảnh: Lead `23600821-7310-458a-9b9d-54135d0d33aa`
  có mã `LD-2026-HCM-003978`; chiến dịch `d05cabf9-6ff7-508c-bbba-821789584064`
  có mã `CAM-2026-00001`.

## Kiểm chứng

| Kiểm tra | Kết quả |
| --- | --- |
| Toàn bộ test frontend | PASS — 205 file, 999 test |
| Frontend TypeScript | PASS |
| ESLint các file TypeScript thay đổi | PASS — không lỗi; cảnh báo React Compiler/TanStack Table hiện có |
| Backend Prisma format/validate/generate | PASS |
| Backend format, lint, typecheck, build | PASS — lint còn cảnh báo ngoài phạm vi sửa |
| Toàn bộ unit backend | PASS — 66 file, 355 test |
| Toàn bộ E2E backend với DB và queue bật | PASS — 63 file, 348 test; 1 file/38 test audit trùng hồ sơ skip theo cờ riêng sẵn có |
| Cấp mã đồng thời và giữ mã khi cập nhật | PASS — HTTP E2E và đối chiếu bản ghi đã lưu |
| Migration với dữ liệu cũ và vượt 999 | PASS — database tổng hợp riêng, kiểm tra mã tới `MSG-2000` |
| Bảo toàn dữ liệu local | PASS — 25 mã cũ khớp, UUID và số lượng nguồn giữ nguyên |
| Trình duyệt trực tiếp | BLOCKED — không có app hoặc browser kết nối |
| Nạp bản backend mới vào API local đang chạy | BLOCKED — xét duyệt tự động chặn thao tác restart với “blocked by policy”; cần khởi động lại tiến trình local để nạp bản build đã kiểm tra |

E2E dùng database, tài khoản MariaDB và container Redis riêng; đã dọn sau chạy.
Không staging, commit, push hoặc tác động production. Giữ các thay đổi đang có
của người dùng, kể cả phần nhật ký đã stage.
