# Student 360 — Đối chiếu tài liệu định hướng vs trang chi tiết hiện tại

Nguồn đối chiếu: [Student-360-Phan-tich-chan-dung-va-phan-loai.pdf](./Student-360-Phan-tich-chan-dung-va-phan-loai.pdf)
Trang hiện tại: `/director/students/[studentId]` — `src/app/(with-layouts)/(dashboard)/director/students/`

## 1. Đã có trong trang hiện tại

| Nội dung | Component |
|---|---|
| Định danh & nhân khẩu (tên, mã, DOB, giới tính, trường, SĐT, email) | `student-details-tab.tsx` |
| Hành trình tương tác (timeline sự kiện) | `journey-timeline.tsx` |
| Lịch sử touchpoint, KPI tương tác | `student-engagement-tab.tsx`, `student-tab-data.ts` |
| Xác suất nhập học + tín hiệu đóng góp | `student-signal-card.tsx` |
| Rào cản (dạng text tự do) | `student-header.tsx`, `ai-insight.tsx` |
| Người ảnh hưởng quyết định, mối lo ngại gia đình | `student-family-tab.tsx` |
| Hồ sơ ứng tuyển, checklist tài liệu | `application-card.tsx`, `student-documents-tab.tsx` |
| Ghi chú tư vấn viên | `student-notes-tab.tsx` |

## 2. Thiếu — Chiều phân loại (mục 6.1 của tài liệu, phần lõi)

| Chiều | Yêu cầu tài liệu | Hiện trạng |
|---|---|---|
| Chiều 1 — Giai đoạn hành trình | 7 mốc phễu chuẩn: chưa biết → đã biết → tìm hiểu → cân nhắc nghiêm túc → nộp hồ sơ → trúng tuyển → nhập học | Có `journey` timeline nhưng không map vào 7 giai đoạn chuẩn |
| Chiều 2 — Mức độ quan tâm | Cao/Trung bình/Thấp/Không xác định, đo bằng **tín hiệu hành vi quan sát được** | Chưa có trường riêng — bị trộn lẫn vào `probability` |
| Chiều 3 — Mức độ phù hợp | Ngành có trong danh mục đào tạo, phương thức xét tuyển khả thi với hồ sơ, chi phí/địa lý khả thi | **Chưa có gì** — tài liệu nhấn mạnh đây là chiều "thường bị bỏ qua nhưng quan trọng nhất với cơ chế mới" (ngưỡng điểm tối thiểu + giới hạn 15 nguyện vọng) |
| Chiều 4 — Rào cản chính | 6 loại chuẩn hoá: chi phí / năng lực / gia đình / thông tin / địa lý / cạnh tranh | Chỉ 1 trường text tự do, không phân loại theo 6 nhóm |
| Tổ hợp 4 chiều → hành động ưu tiên (mục 6.2) | Bảng ánh xạ, VD: quan tâm cao + phù hợp thấp → tư vấn phương án thay thế; quan tâm thấp + phù hợp cao → chủ động khơi lại | Không có — "Khuyến nghị ưu tiên" hiện là text AI tự do, không map theo tổ hợp chuẩn |

## 3. Thiếu — Cấu trúc 4 lớp dữ liệu hồ sơ (mục 7.1)

| Lớp | Yêu cầu | Hiện trạng |
|---|---|---|
| Nguồn và quy gán | Kênh đầu tiên biết đến trường, chiến dịch, sự kiện, người giới thiệu | Chưa có section/card riêng cho nguồn gốc lead |
| Trục giai đoạn học tập (mục 5.3) | Lớp 10 / 11 / 12 HK1 / 12 HK2 / sau kỳ thi, mỗi giai đoạn gắn mục tiêu tiếp cận riêng | `grade` chỉ là text tự do, không gắn mục tiêu tiếp cận |
| Trục địa bàn phân tầng (mục 5.1) | Nội thành / tỉnh lân cận / tỉnh xa & khó khăn / khu vực trường trọng điểm | Có `province` nhưng không phân tầng |
| Phụ huynh như đối tượng độc lập (mục 4.3) | Mức độ tham gia, mối quan tâm riêng (khác thí sinh), kênh liên hệ ưa thích | `student-family-tab.tsx` chỉ có "người quyết định" + "concerns" chung, thiếu 3 trường cụ thể |
| Trục điều kiện kinh tế (mục 5.5) | Nhạy cảm — chỉ ghi khi tự nguyện chia sẻ, dùng để tư vấn chính sách hỗ trợ, không dùng để ưu tiên/loại trừ | Chưa có trường này |

## 4. Thiếu — Nguyên tắc vận hành (mục 6.3)

- Mỗi phân loại phải kèm **lý do đọc được** gắn trực tiếp vào từng chiều — hiện `evidence` trong `ai-insight.tsx` là danh sách chung, không gắn theo từng chiều phân loại cụ thể.
- Không có cơ chế để tư vấn viên **điều chỉnh/phản hồi khi thấy phân loại sai** — đây cũng là một chỉ số đo lường ở mục 10 ("tỷ lệ tư vấn viên điều chỉnh phân loại của hệ thống").
- Phân loại cần **cập nhật liên tục theo tương tác mới**; hiện dữ liệu là snapshot tĩnh, không thể hiện tính "sống" của phân loại.

## 5. Vấn đề dữ liệu nền (phát hiện khi rà code)

- `student360Data` trong `src/services/api/students/data.ts` là **một template duy nhất** dùng chung cho mọi học sinh — chỉ các trường định danh (tên, mã, trường, tỉnh, counselor) và probability/score được override theo từng `studentListItem`. Vi phạm nguyên tắc "một thí sinh một hồ sơ" (mục 7.2).
- `student-tab-data.ts` (touchpoints, documents, notes) hoàn toàn tĩnh, không cá nhân hoá theo học sinh.
- `student-charts-section.tsx`: dữ liệu trend/channel là hằng số hardcode, chỉ điểm cuối cùng của trend được patch từ `data.insight`.

## 6. Tóm tắt ưu tiên

Trang hiện tại mạnh về UI trình bày (probability gauge, journey timeline, engagement stats) nhưng thiếu đúng phần tài liệu coi là **trọng tâm nghiệp vụ**:

1. **Chiều 3 — Mức độ phù hợp**: chưa tồn tại, cần bổ sung trước tiên vì gắn trực tiếp với quy chế tuyển sinh mới (ngưỡng điểm, giới hạn nguyện vọng).
2. **Chuẩn hoá rào cản thành 6 loại** thay vì text tự do.
3. **Bảng tổ hợp 4 chiều → hành động ưu tiên** (mục 6.2) để thay thế "khuyến nghị AI" dạng tự do hiện tại.
4. **Lớp "Nguồn và quy gán"** — hiện chưa có card nào hiển thị nguồn gốc lead.
5. Làm giàu dữ liệu phụ huynh theo 3 trường cụ thể (mục 4.3).
6. Cá nhân hoá dữ liệu backend — thay template dùng chung bằng dữ liệu theo từng học sinh.
