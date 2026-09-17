---
target: Admin catalog management UI
total_score: 21
p0_count: 0
p1_count: 3
timestamp: 2026-09-17T12-34-26Z
slug: layouts-dashboard-director-admin-catalogs-page-tsx
---
# Review UI và code — Admin Catalog

Target: src/app/(with-layouts)/(dashboard)/director/admin/catalogs/page.tsx

## Design Health Score

| # | Heuristic | Score | Key issue |
|---|---|---:|---|
| 1 | Visibility of System Status | 2/4 | Có loading/error/retry và toast cho phần lớn bảng, nhưng pending governance không có loading/error; trạng thái đang xử lý ở từng dòng chưa rõ. |
| 2 | Match System / Real World | 2/4 | Có nhóm nghiệp vụ hợp lý, nhưng người dùng phải hiểu JSON, doctype và ID kỹ thuật; nhãn Việt/Anh trộn lẫn. |
| 3 | User Control and Freedom | 2/4 | Có Hủy và xác nhận xóa, nhưng dùng browser prompt/confirm và không có undo; sửa offering Active dễ rơi vào trạng thái khó hiểu. |
| 4 | Consistency and Standards | 3/4 | Panel, form control, button, table và token dùng chung tốt; tab governed và dialog native chưa cùng một vocabulary. |
| 5 | Error Prevention | 2/4 | Required fields, backend validation và confirmation có sẵn, nhưng JSON/free-text ID dễ sai và validation chỉ xuất hiện sau submit. |
| 6 | Recognition Rather Than Recall | 2/4 | Nhãn và tab giúp nhận biết, nhưng Campus/Major/Method phải gõ ID thay vì chọn từ catalog hoặc autocomplete. |
| 7 | Flexibility and Efficiency of Use | 1/4 | Chưa có search, pagination, bulk action hay shortcut; mỗi query cố định tối đa 100 dòng. |
| 8 | Aesthetic and Minimalist Design | 3/4 | Màu sắc restrained, bố cục sạch và không có anti-pattern trang trí rõ ràng; form/table lặp lại khá cơ học. |
| 9 | Help Users Recover from Errors | 2/4 | Có retry và toast, nhưng lỗi pending governance bị hiển thị như không có dữ liệu; chưa có lỗi gắn sát từng field. |
| 10 | Help and Documentation | 2/4 | Mô tả panel và hint có ích, nhưng chưa có help contextual cho schema Lines/Rules hoặc lifecycle approval. |
| **Total** | | **21/40** | **Acceptable — cần cải thiện đáng kể trước khi coi là admin workspace hoàn thiện.** |

## Anti-Patterns Verdict

LLM assessment: Không có dấu hiệu AI-slop rõ ràng: màu và primitive bám design system, không có gradient, glassmorphism hay decoration thừa. Tuy nhiên, cấu trúc đang rơi vào CRUD scaffold khá generic: năm tab đều lặp form phía trên và table phía dưới, trong khi các thao tác có rủi ro khác nhau chưa được phân cấp đủ.

Deterministic scan: Detector chạy trên src/components/admin/admin-catalog, route page và sidebar; kết quả sạch, không phát hiện rule vi phạm. Không có false positive cần loại trừ.

## Overall Impression

Đây là nền tảng admin dùng được cho bản đầu: IA gom đúng các catalog/policy liên quan và component vocabulary khá đồng nhất. Cơ hội lớn nhất là biến nó từ “nhiều form kỹ thuật trong một tab” thành workspace giúp admin hoàn thành nghiệp vụ an toàn: chọn record từ catalog, hiểu trạng thái, và sửa lỗi ngay tại chỗ.

## What's Working

1. Route mới nằm trong nhóm CẤU HÌNH hiện có, không tạo thêm sidebar group rời rạc.
2. Các tab tách theo domain, giảm việc đưa năm học, governance, offering và score policy vào một bảng khổng lồ.
3. Panel, Field, FormActions, ErrorState, Table và token semantic được tái sử dụng, giúp màn hình dễ bảo trì và giữ consistency.

## Priority Issues

### [P1] JSON là giao diện chính cho dữ liệu nghiệp vụ

Why it matters: Lines (JSON) và Rules (JSON) buộc admin phải biết schema nội bộ. Một lỗi dấu phẩy hoặc key sai chỉ hiện sau submit qua toast, làm tăng lỗi vận hành và khiến người dùng không biết sửa gì.

Fix: Dùng array editor có dòng line_kind, Campus, Major, amount/quota và note; Score Rule có các field theo rule kind. Đưa JSON vào chế độ Advanced tùy chọn. Hiển thị validation inline, ví dụ ngay dưới dòng lỗi, và giữ nguyên dữ liệu đã nhập.

Suggested command: $fk prod hoặc $fk copy

### [P1] Admission Offering cho nhập ID tự do và có lỗi khi sửa offering Active

Why it matters: Admission Year, Campus, Major và Admission Method đều là text field chứa ID. Admin phải nhớ hoặc sao chép mã, dễ tạo liên kết sai. Khi sửa một offering Active, form set status là Active nhưng select không có option Active; submit trở nên khó đoán và backend sẽ từ chối.

Fix: Dùng combobox/select từ các catalog đã có; hiển thị label kèm code. Với offering Active, khóa các field không được sửa hoặc mở flow “Tạo revision”; trạng thái Active chỉ hiển thị read-only và lifecycle action riêng. Disable nút Duyệt/Retire trong lúc mutation chạy để tránh double-submit.

Suggested command: $fk responsive và $fk prod

### [P1] Governance workflow không có trạng thái lỗi đầy đủ và dùng browser dialogs

Why it matters: changesQuery chỉ render khi có data, còn lỗi query sẽ rơi xuống “Không có đề xuất chờ xử lý”, vi phạm visibility of system status. window.prompt/window.confirm phá vỡ vocabulary của app, khó style, khó hỗ trợ keyboard/screen reader và không cho người dùng xem lại context.

Fix: Thêm loading/error/retry riêng cho pending changes. Thay prompt/confirm bằng Dialog chuẩn của design system, có title, record name, reason field, cancel/submit, focus trap và trạng thái pending. Giữ action Đề xuất retire khác biệt với delete thật.

Suggested command: $fk prod

### [P2] Không có search/pagination cho catalog lớn

Why it matters: Hooks cố định pageLength: 100 nhưng UI không có search, filter hay pagination. Khi catalog vượt 100 dòng, record tồn tại nhưng không thể discover từ màn hình; đây là rủi ro vận hành hơn là chỉ vấn đề hiệu năng.

Fix: Thêm search debounce, filter status/active, pagination hoặc cursor, và hiển thị tổng số record. Với channel/governed catalog, thêm bulk enable/disable hoặc bulk proposal nếu backend policy cho phép.

Suggested command: $fk perf

### [P2] Semantics/accessibility chưa hoàn chỉnh ở tab, table và loading

Why it matters: Governed selector đặt role tablist nhưng các Button con không có role tab/aria-selected; người dùng keyboard/screen reader không nhận đúng mô hình tab. Table chưa khai báo scope cho header. Loading dùng text trong EmptyState thay vì skeleton, dễ bị hiểu là không có dữ liệu.

Fix: Dùng primitive Tabs chuẩn cho selector governed hoặc hoàn thiện role/keyboard contract; thêm scope col và caption/accessible name cho table; tách LoadingState/Skeleton khỏi EmptyState; thêm aria-live cho save/error feedback.

Suggested command: $fk check

## Persona Red Flags

### Alex — Power User

- Không có search, pagination hoặc bulk action; phải cuộn và thao tác từng dòng.
- Nút Duyệt/Retire chưa khóa khi mutation đang chạy, nên thao tác nhanh có thể tạo request trùng.
- JSON editor không có shortcut/schema assist, khiến flow sửa nhanh chậm và dễ sai.

### Sam — Accessibility-Dependent User

- Nhóm governed tự nhận là tablist nhưng thiếu semantics tab đầy đủ.
- Error ở pending governance có thể bị đọc như empty state vì không có nhánh error rõ ràng.
- Trạng thái Active/Inactive/Enabled truyền bằng text thuần; sau này nếu đổi sang màu badge cần giữ text/aria, không dùng màu làm tín hiệu duy nhất.

### Riley — Stress Tester

- Paste JSON không hợp lệ chỉ nhận toast chung, không chỉ ra dòng/key sai.
- Chuỗi ID dài hoặc record trên 100 dòng không có cách tìm và kiểm tra nhanh.
- Sửa offering Active là edge case có contract UI/backend không khớp.

## Minor Observations

- Nhãn Admission Year, Academic Year Config, Lines, Rules, Active, Retire đang trộn với tiếng Việt; nên chuẩn hóa theo ngôn ngữ operator.
- Status hiện là text thường, thiếu badge/description nhất quán để quét nhanh bảng.
- Table min-w 680px hoạt động bằng horizontal scroll trên mobile nhưng chưa có mobile row/card alternative.
- Các bảng chưa có caption hoặc accessible name riêng; tiêu đề panel giúp hiểu bằng mắt nhưng chưa tối ưu cho screen reader.

## Questions to Consider

1. Với admin nghiệp vụ, ưu tiên trước là bỏ JSON bằng form builder, hay ưu tiên lookup/autocomplete để giảm nhập ID sai?
2. Offering Active có nên sửa trực tiếp không, hay bắt buộc tạo revision mới để audit rõ hơn?
