# Bug notes — Lead Sale Overview / FR-DASH-03

## Phạm vi kiểm tra

- Ngày kiểm tra: 2026-09-28
- Route: `/lead-sale`
- Môi trường: local dashboard (`localhost:3000`) + Frappe API (`localhost:8000`)
- Tài khoản: đã đăng nhập với phạm vi Lead Sale/Manager
- Cách kiểm tra: browser QA bằng dữ liệu runtime, chỉ mở và đóng các màn hình đọc dữ liệu; không tái phân bổ hoặc thay đổi hồ sơ.
- Kết quả nền: overview API trả `200`; không có page error hoặc console error trong lúc kiểm tra.

## Danh sách bug cần sửa

### BUG-01 — Nút “Mở thao tác nhanh” không mở menu

- Mức độ: P1 — Cao
- Trạng thái: Open
- Phạm vi: Dashboard Overview / thao tác nhanh
- Tái hiện:
  1. Đăng nhập và mở `/lead-sale`.
  2. Nhấn **Mở thao tác nhanh**.
  3. Kiểm tra menu hoặc trạng thái mở của nút.
- Kỳ vọng: menu thao tác nhanh hiển thị; trong đó có thể truy cập **Tái phân bổ nhanh** theo quyền.
- Thực tế: đã click hai lần nhưng không xuất hiện menu, modal hoặc trạng thái mở mới trong accessibility tree.
- Ảnh hưởng: không thể truy cập/kiểm tra luồng tái phân bổ nhanh từ Overview.
- Tiêu chí hoàn tất:
  - Click nút mở menu ổn định.
  - Menu có trạng thái mở/đóng và đóng được bằng click ngoài hoặc Escape.
  - **Tái phân bổ nhanh** chỉ hiển thị khi người dùng có quyền; thao tác mutation có xử lý loading, lỗi và thành công.

### BUG-02 — Chưa có thẻ cảnh báo “Cần lưu ý” theo FR-DASH-03

- Mức độ: P1 — Cao
- Trạng thái: Open / Requirement gap
- Phạm vi: Manager Early Warning System
- Kỳ vọng: Overview có thẻ **Cần lưu ý / Attention Needed** hiển thị tổng số cảnh báo đang hoạt động và mức độ nghiêm trọng.
- Thực tế: giao diện hiện có các nhóm **Công việc ưu tiên** (quá hạn, chưa phân công, liên hệ hôm nay, tồn lâu) và **Cần can thiệp** theo giai đoạn, nhưng không có thẻ cảnh báo sớm đúng theo FR-DASH-03.
- Ảnh hưởng: Manager không có một điểm tổng hợp để nhận biết các cảnh báo SLA, bất thường địa bàn hoặc sụt giảm chuyển đổi.
- Tiêu chí hoàn tất:
  - Thẻ hiển thị số lượng cảnh báo active từ dữ liệu thật, có trạng thái màu theo severity.
  - Số liệu tôn trọng phạm vi quyền và phạm vi đội/campus hiện tại.
  - Có empty state và lỗi đồng bộ rõ ràng.

### BUG-03 — Thiếu bộ lọc loại cảnh báo và campus

- Mức độ: P2 — Trung bình
- Trạng thái: Open / Requirement gap
- Phạm vi: Danh sách cảnh báo sớm
- Kỳ vọng có:
  - **Alert Type Filter**: SLA 24h, bất thường địa bàn, sụt giảm chuyển đổi.
  - **Campus Filter**: lọc theo cơ sở/khu vực.
- Thực tế: accessibility tree của Overview không có hai bộ lọc này.
- Ảnh hưởng: không thể khoanh vùng nhanh cảnh báo theo nguyên nhân hoặc campus.
- Tiêu chí hoàn tất:
  - Bộ lọc cập nhật đồng bộ query/API và danh sách hiển thị.
  - Có lựa chọn “Tất cả” và empty state khi không có kết quả.
  - Không làm mất các filter/phạm vi đã chọn khi mở chi tiết cảnh báo.

### BUG-04 — Thiếu hành động xem chi tiết và bỏ qua/đã xử lý cảnh báo

- Mức độ: P1 — Cao
- Trạng thái: Open / Requirement gap
- Phạm vi: Chi tiết cảnh báo sớm
- Kỳ vọng có:
  - **Xem chi tiết cảnh báo** để mở danh sách Lead hoặc phân tích khu vực tương ứng.
  - **Bỏ qua / Đã xử lý** để đưa cảnh báo ra khỏi danh sách active.
- Thực tế: các drawer hiện tại mở được cho nhóm hồ sơ ưu tiên và đóng được, nhưng chưa có thực thể “cảnh báo sớm” cùng nút dismiss/resolve theo FR-DASH-03.
- Ảnh hưởng: không có vòng đời xử lý cảnh báo; cảnh báo không được đánh dấu đã can thiệp hoặc truy vết trạng thái.
- Tiêu chí hoàn tất:
  - Chi tiết cảnh báo giữ đúng filter/nhóm dữ liệu đã chọn.
  - Dismiss/resolve yêu cầu quyền phù hợp, có xác nhận và cập nhật danh sách sau khi thành công.
  - Lỗi backend/403 hiển thị thông báo dùng chung, không làm vỡ drawer.

## Các luồng đã pass trong lần kiểm tra này

- Drawer **Công việc quá hạn** mở/đóng được; hiển thị 1 hồ sơ.
- Drawer **Lead chưa phân công** mở/đóng được; hiển thị 34 hồ sơ.
- Drawer **Hồ sơ tồn lâu** mở/đóng được; hiển thị 41 hồ sơ.
- Drawer **Liên hệ hôm nay** xử lý đúng empty state với 0 hồ sơ.
- Nút **Xem các hồ sơ cần xử lý** mở được drawer hồ sơ tồn lâu.
- Không phát hiện crash, page error hoặc console error trong các luồng trên.

## Ghi chú kiểm thử tự động

- Test tập trung Lead Sale: `8/8` pass.
- Full suite: `590` pass, `1` fail tại `src/components/segments/segment-task-utils.test.ts` do test dùng ngày cố định nên bị lệch so với ngày chạy thực tế. Lỗi này chưa được xác định là bug của Lead Sale Overview và nên theo dõi riêng.
- Không có thay đổi mã nguồn ngoài file note này.

## Bổ sung QA theo FR-DASH-01

### BUG-05 — Thiếu bộ lọc mùa, đội, chương trình, nguồn và khu vực trên Overview

- Mức độ: P1 — Cao
- Trạng thái: Open / Requirement gap
- Phạm vi: Admission Overview Dashboard
- Tái hiện:
  1. Đăng nhập và mở `/lead-sale`.
  2. Kiểm tra header và chọn **Mở thanh bên**.
  3. Tìm các control lọc theo mùa, đội, chương trình, nguồn và khu vực.
- Kỳ vọng: các bộ lọc FR-DASH-01 hiển thị, có thể thay đổi population và cập nhật đồng bộ toàn bộ widget.
- Thực tế: click **Mở thanh bên** không mở panel; snapshot không có `combobox`, `listbox`, `textbox` hoặc `select` cho các bộ lọc này.
- Bằng chứng source: `dashboard-filters.tsx` có component lọc kỳ/chương trình/nguồn/khu vực nhưng chưa được render trong `lead-sale-dashboard.tsx`; component hiện cũng chưa có filter đội.
- Ảnh hưởng: người dùng không thể xem dashboard theo season/scope khác và không thể kiểm chứng tính nhất quán population theo filter.
- Tiêu chí hoàn tất:
  - Render đủ filter mùa, đội, chương trình, nguồn và khu vực.
  - Thay đổi filter gọi lại query/API và cập nhật đồng bộ KPI, chart, table, action cards và drill-down.
  - Có reset filter, loading, empty state và xử lý lỗi; giữ đúng quyền/scope.

### BUG-06 — Một số drill-down funnel và intervention không mở detail drawer

- Mức độ: P1 — Cao
- Trạng thái: Open
- Phạm vi: Tổng quan phễu tuyển sinh / Cần can thiệp
- Tái hiện:
  1. Mở `/lead-sale` sau khi reload sạch.
  2. Click thẻ **Đã kết nối**, **Đủ điều kiện** trong funnel.
  3. Click thẻ can thiệp **Đã kết nối**.
- Kỳ vọng: mỗi thẻ mở `Chi tiết hồ sơ tuyển sinh` với đúng stage, số hồ sơ và danh sách thuộc nhóm đó.
- Thực tế: thẻ **Lead mới** mở được drawer với 41 hồ sơ; các thẻ **Đã kết nối**, **Đủ điều kiện** và can thiệp **Đã kết nối** không mở drawer, không có thông báo lỗi.
- Ảnh hưởng: người dùng không thể drill-down tới các giai đoạn cần xem; lỗi im lặng làm giảm khả năng điều hành.
- Tiêu chí hoàn tất:
  - Tất cả stage/intervention cards mở đúng detail drawer.
  - Số lượng và danh sách trong drawer khớp card đã chọn.
  - Nếu không có dữ liệu, hiển thị empty state thay vì không phản hồi.
  - Có regression test riêng cho cả bốn stage và các intervention đang hiển thị.

### BUG-07 — Đóng detail drawer để lại overlay rỗng chặn tương tác

- Mức độ: P1 — Cao
- Trạng thái: Open
- Phạm vi: `LeadSaleDetailSheet` / `SheetOverlay`
- Tái hiện:
  1. Mở drill-down **Lead mới**.
  2. Click **Đóng bảng chi tiết**.
  3. Click tiếp một stage khác, ví dụ **Đang liên hệ**.
- Kỳ vọng: drawer và overlay được unmount hoàn toàn; Overview nhận tương tác bình thường.
- Thực tế: nội dung drawer biến mất nhưng một dialog/overlay rỗng với lớp `fixed inset-0` vẫn còn, chặn click stage tiếp theo. Click **Dismiss** và nhấn Escape không xóa được; reload trang mới phục hồi.
- Bằng chứng source: luồng đóng nằm ở `lead-sale-detail-sheet.tsx` và primitive `SheetOverlay`; cần kiểm tra lại controlled `isOpen`/`onOpenChange` và lifecycle của `ModalOverlay`.
- Ảnh hưởng: một lần đóng drawer có thể làm toàn bộ Overview bị khóa tương tác.
- Tiêu chí hoàn tất:
  - Sau khi đóng, không còn dialog/backdrop trong DOM/accessibility tree.
  - Click stage khác hoạt động ngay mà không cần reload.
  - Có test mở → đóng → mở drawer khác và test Escape/click ngoài.

### BUG-08 — Nút “Mở thanh bên” không có phản hồi

- Mức độ: P2 — Trung bình
- Trạng thái: Open
- Phạm vi: Dashboard shell / filter sidebar
- Kỳ vọng: click nút mở/đóng sidebar chứa bộ lọc hoặc nội dung điều hành tương ứng, có trạng thái expanded rõ ràng.
- Thực tế: click nút hoàn tất nhưng không mở sidebar, không thay đổi accessibility state và không hiển thị nội dung mới.
- Ảnh hưởng: người dùng không biết nút còn tác dụng hay không; nếu sidebar là nơi chứa filter thì các filter cũng không thể truy cập.
- Tiêu chí hoàn tất:
  - Nút có trạng thái expanded/collapsed đúng.
  - Sidebar hỗ trợ keyboard và đóng được bằng Escape/click ngoài.
  - Không tạo overlay rỗng hoặc chặn nội dung phía sau.

### BUG-09 — Chưa hiển thị KPI tổng “Tổng chỉ tiêu” ở Overview

- Mức độ: P2 — Trung bình
- Trạng thái: Open / Requirement gap
- Phạm vi: KPI tổng quan FR-DASH-01
- Kỳ vọng: Overview hiển thị tổng chỉ tiêu của đúng mùa/kỳ tuyển sinh đang chọn để làm mốc so sánh tiến độ.
- Thực tế: accessibility tree không có nhãn **Tổng chỉ tiêu**; chỉ có cột **Chỉ tiêu** trong bảng hiệu suất nhân viên. Source có `summary.target` và component `stat-cards.tsx`, nhưng `LeadSaleDashboard` hiện không render khu vực StatCards.
- Ảnh hưởng: Manager không có KPI tổng làm baseline ngay trên màn hình tổng quan.
- Tiêu chí hoàn tất:
  - Hiển thị tổng chỉ tiêu theo season/scope hiện tại.
  - Công thức và dữ liệu target khớp API, không dùng target của mùa khác.
  - Có empty state khi target chưa được cấu hình và drill-down nếu user có quyền.

## Evidence FR-DASH-01

- Pass: Overview render, refresh cập nhật timestamp, các khu vực chính của dashboard hiển thị.
- Pass: Drill-down **Lead mới** mở đúng drawer và số lượng 41 hồ sơ.
- Fail: drill-down **Đã kết nối**, **Đủ điều kiện** và intervention **Đã kết nối** không mở drawer.
- Fail: đóng drawer để lại overlay rỗng cho đến khi reload.
- Fail: **Mở thanh bên** không mở panel hoặc filter.
- Không phát hiện page error hoặc console error; các lỗi trên là lỗi im lặng ở hành vi UI.
- Regression test hiện có: `3` files, `8/8` tests pass.
