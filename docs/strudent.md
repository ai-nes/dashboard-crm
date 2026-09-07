# Phân tích khoảng cách (Gap Analysis): Student 360 vs. Bản đồ DocType Frappe CRM

> **Tài liệu đối chiếu nguồn:** `frappe-crm/docs/api/student-profile-doctypes.md`  
> **Phạm vi kiểm tra:**
> 1. Giao diện & Trải nghiệm người dùng Student 360 (`dashboard-crm`)
> 2. API Projection `get_director_student` (`frappe-crm/crm/api/director_students.py`)
> 3. Khung dữ liệu Typescript (`src/services/api/students/types.ts`) & Service tích hợp

---

## 1. Tổng quan khoảng cách (Executive Summary)

Mô hình dữ liệu của Frappe CRM (`CRM Student` và các DocType vệ tinh) được thiết kế theo kiến trúc hướng sự kiện, toàn vẹn định danh ("Một học sinh - Một hồ sơ"), hỗ trợ kiểm toán (audit/revision), phân quyền sở hữu theo Pool/Team và tuân thủ quyền riêng tư (Nghị định 13/2023/NĐ-CP & GDPR).

Tuy nhiên, màn hình **Student 360** trên `dashboard-crm` hiện tại được triển khai chủ yếu theo dạng **Cockpit phân loại quyết định (Decision-first)** và đang **thiếu hụt nhiều trường dữ liệu nghiệp vụ cốt lõi, thiếu toàn bộ 4 Child Tables của Student, chưa có quản lý tài chính/học phí, và một số chức năng trên UI mới chỉ dừng lại ở mức mô phỏng (mock) hoặc lưu trạng thái tạm thời (local state)**.

---

## 2. Chi tiết các trường trên DocType gốc `CRM Student` còn thiếu

### 2.1. Hồ sơ cá nhân và liên hệ
| Trường trên `CRM Student` | Kiểu | Trạng thái trên Student 360 | Tác động nghiệp vụ |
|---|---|---|---|
| `id_number` | Data | **Thiếu trên UI** | Không hiển thị và không thể nhập số CCCD/CMND của thí sinh. |
| `id_issued_date` | Date | **Thiếu trên UI** | Thiếu thông tin ngày cấp CCCD khi hoàn thiện thủ tục nhập học. |
| `id_issued_place` | Data | **Thiếu trên UI** | Thiếu nơi cấp CCCD. |
| `notes` | Text | **Chưa hiển thị** | Ghi chú gốc của hồ sơ bị nhầm lẫn với danh sách ghi chú tương tác (`FCRM Note`). |
| `import_source_id` | Data | Ẩn (Hợp lý) | Mã nguồn import, chỉ phục vụ di chuyển dữ liệu. |

> *Ghi chú:* API `update_student` (`crm.api.student_school.update_student`) đã hỗ trợ nhận các trường `id_number`, `id_issued_date`, `id_issued_place`, nhưng component `StudentDetailsTab` chưa có các ô nhập liệu này.

---

### 2.2. Địa lý, cơ sở đào tạo và định hướng học tập
| Trường trên `CRM Student` | Kiểu | DocType liên kết | Trạng thái trên Student 360 |
|---|---|---|---|
| `branch` | Link | `CRM Campus` | **Thiếu trên UI**. Không hiển thị thí sinh đăng ký cơ sở nào (Hà Nội, TP.HCM, Cần Thơ, Đà Nẵng, Quy Nhơn...). |
| `major` vs `aspiration` | Link | `CRM Major` / `CRM Aspiration` | **Chưa chuẩn hóa**. UI đang dùng lẫn lộn: hiển thị `major` nhưng form chỉnh sửa lại gán vào `aspiration`. Cần phân tách rõ ngành học chính và nguyện vọng. |
| `study_stage` | Select | `grade_10`, `grade_11`, `grade_12_h1`, `grade_12_h2`, `post_exam` | **Chưa hỗ trợ**. UI chỉ cho chọn `current_grade` (`10`, `11`, `12`, `post_exam`), bỏ qua phân kỳ Học kỳ 1 và Học kỳ 2 lớp 12 vốn rất quan trọng để cá nhân hóa chiến dịch tuyển sinh. |
| `source` | Link | `CRM Lead Source` | UI hiển thị dạng text trong `StudentSourceContext`, chưa cho phép chọn động từ danh mục `CRM Lead Source`. |

---

### 2.3. Tuyển sinh và học thuật
| Trường trên `CRM Student` | Kiểu | Trạng thái trên Student 360 | Chi tiết khoảng cách |
|---|---|---|---|
| `education_program` | Link (`CRM Education Program`) | **Thiếu hoàn toàn** | Chưa hiển thị chương trình đào tạo (Đại trà, Chất lượng cao, Liên kết quốc tế, v.v.). |
| `admission_method` | Select | **Chưa có cấu trúc** | Phương thức xét tuyển (`TRANSCRIPT_REVIEW`, `NATIONAL_HIGH_SCHOOL_EXAM`, `LANGUAGE_CERTIFICATE_REVIEW`, `DIRECT_ADMISSION`, `COMBINED`) chỉ trả text thô trong mảng `academics`, không có enum và không thể chỉnh sửa. |
| `graduation_score` | Float | **Chưa chuẩn hóa** | Điểm tốt nghiệp THPT chưa có trường số riêng biệt. |
| `transcript_score` | Float | **Chưa chuẩn hóa** | Điểm học bạ THPT chưa có trường số riêng biệt. |
| `english_converted_score` | Float | **Chưa chuẩn hóa** | Điểm tiếng Anh quy đổi chưa có trường số riêng biệt. |
| `total_score` | Float | **Thiếu** | Tổng điểm xét tuyển chưa được hiển thị. |
| `cohort_start_year`, `cohort_end_year` | Int | **Thiếu** | Niên khóa cohort chưa được hiển thị. |
| `step` | Int | **Thiếu** | Bước quy trình xử lý hồ sơ tuyển sinh chưa được hiển thị dạng tiến trình số. |

---

### 2.4. Phân quyền sở hữu, Lifecycle & SLA Governance
| Trường trên `CRM Student` | Kiểu | Ý nghĩa nghiệp vụ | Trạng thái trên Student 360 |
|---|---|---|---|
| `owning_team` | Link `CRM Team` | Đội ngũ tuyển sinh sở hữu hồ sơ | **Thiếu**. UI chỉ hiển thị tên tư vấn viên (`counselor`), không hiển thị Team. |
| `owning_pool` | Link `CRM Student Pool` | Pool quản lý để định tuyến tự động | **Thiếu**. Không thể biết học sinh đang thuộc Pool tự do hay Pool chuyên biệt nào. |
| `assignment_priority` | Select (`low`, `normal`, `high`, `urgent`) | Độ ưu tiên xử lý định tuyến | **Chưa khớp**. UI hiển thị độ ưu tiên chung (Cao/Trung bình/Thấp), chưa ánh xạ đúng enum 4 mức của backend. |
| `lifecycle_stage` | Select (`Lead`, `MQL`, `Applicant`, `Enrolled`, `Lost`) | Vị trí phễu vòng đời chuẩn | UI map sang 5 bước tiếng Việt nhưng **chưa thể hiện trạng thái `Lost` (thất bại/hủy quan tâm)** và lý do mất lead (`status_change_reason`). |
| `sla_evidence_state`, `sla_evidence_observed_at` | Select / Datetime | Bằng chứng và thời điểm quan sát SLA | **Thiếu**. Chưa có cảnh báo hoặc đồng hồ đếm ngược thời gian phản hồi cam kết dịch vụ (SLA) của tư vấn viên. |

---

### 2.5. Định danh và tính toàn vẹn hồ sơ (Identity & Integrity)
| Trường trên `CRM Student` | Kiểu | Ý nghĩa nghiệp vụ | Trạng thái trên Student 360 |
|---|---|---|---|
| `identity` | Link `CRM Student Identity` | Bản ghi định danh mạnh hợp nhất | **Thiếu hoàn toàn trên UI**. |
| `case_key` | Link `CRM Student Case Key` | Khóa case tuyển sinh theo năm | **Thiếu trên UI**. Chỉ có mã hiển thị `student.code`. |
| `intake_integrity_state` | Select (`resolved`, `review_required`, `quarantined`, `legacy`) | Trạng thái toàn vẹn hồ sơ | **Thiếu**. Không cảnh báo khi hồ sơ bị nghi vấn trùng lặp hoặc cần xác minh intake. |
| `intake_quarantine_reason` | Small Text | Lý do cách ly hồ sơ | **Thiếu**. |
| `legal_hold` | Check | Cờ bảo toàn pháp lý | **Thiếu**. |

---

## 3. Thiếu toàn bộ các Child Tables trực tiếp trên `CRM Student`

DocType `CRM Student` sở hữu 4 bảng con trực tiếp, nhưng **Student 360 hiện chưa có giao diện hiển thị dạng bảng (table/list view)** cho các phần này:

### 3.1. `academic_results` (`CRM Student Academic Result`)
- **Các trường:** `school_year` (Năm học), `grade` (Lớp 10/11/12), `academic_rank` (Học lực), `gpa` (Điểm trung bình).
- **Thực trạng:** UI chỉ hiển thị 1 dòng tĩnh `GPA lớp 11: 8.7 / 10`. Không có bảng học bạ 3 năm để đối soát điều kiện xét tuyển.

### 3.2. `language_certificates` (`CRM Student Language Certificate`)
- **Các trường:** `language` (Ngoại ngữ), `certificate_name` (IELTS, TOEIC, JLPT...), `score_level` (Điểm/Bậc), `issue_date` (Ngày cấp), `expiry_date` (Ngày hết hạn).
- **Thực trạng:** UI chỉ có một chuỗi text tĩnh gộp chung. Không có danh sách chứng chỉ, ngày cấp và hạn sử dụng để xét miễn thi/quy đổi điểm.

### 3.3. `status_change_log` (`Status Change Log`)
- **Các trường:** `from`, `to`, `from_date`, `to_date`, `duration`, `log_owner`, `from_type`, `to_type`.
- **Thực trạng:** Tab "Tiến độ tuyển sinh" (`JourneyTimeline`) hiện chỉ lọc từ các tương tác gần đây, chưa đọc trực tiếp bảng log lịch sử trạng thái chính thức này.

### 3.4. `assignment_log` (`CRM Assignment Log`)
- **Các trường:** `from_staff`, `to_staff`, `changed_by`, `changed_at`, `auto_routed`, `reason`.
- **Thực trạng:** Hoàn toàn thiếu bảng theo dõi lịch sử phân công/chuyển giao phụ trách giữa các tư vấn viên và CTV.

---

## 4. Thiếu các DocType nghiệp vụ liên kết ngược (`Link -> CRM Student`)

### 4.1. Tài chính, Học phí & Thanh toán (`CRM Student Payment` & `CRM Revenue Recognition`)
- **Vấn đề cốt lõi:** Phân tích chân dung thí sinh chỉ ra "Rào cản chi phí" là mối bận tâm hàng đầu của phụ huynh và học sinh.
- **Thực trạng:** Student 360 **hoàn toàn không có tab hoặc widget Tài chính/Thanh toán**. Chưa hiển thị:
  - Lệ phí xét tuyển đã nộp.
  - Phí đặt cọc giữ chỗ nhập học.
  - Học phí các kỳ đã thanh toán / còn nợ.
  - Học bổng và chính sách ưu đãi tài chính được duyệt chính thức.

### 4.2. Hồ sơ đăng ký tuyển sinh chi tiết (`CRM Admission Application`)
- **Thực trạng:** UI hiện chỉ hiển thị một block tóm tắt (`application: [{label: "Nguyện vọng", value: "Trí tuệ nhân tạo"}]`).
- **Thiếu:** Bảng danh sách các đơn xét tuyển thực tế của thí sinh:
  - Mã hồ sơ xét tuyển (`name`).
  - Các nguyện vọng đăng ký (NV1, NV2, v.v.).
  - Ngành học (`major`), cơ sở (`campus`), phương thức xét tuyển (`admission_method`).
  - Thời hạn nộp hồ sơ (`deadline`).
  - Trạng thái hồ sơ (`Draft`, `Submitted`, `Under Review`, `Accepted`, `Enrolled`).
  - Tiến độ giấy tờ (`document_completed` / `document_total`).

### 4.3. Quản lý Đa phụ huynh / Người giám hộ (`CRM Student Guardian` & `CRM Parent Contact Authority`)
- **Một học sinh có thể có nhiều người giám hộ** (Bố, Mẹ, Người bảo trợ). Tab `StudentFamilyTab` hiện chỉ hỗ trợ duy nhất 1 đối tượng phụ huynh đơn lẻ (`parentProfile`).
- **Thiếu thẩm quyền liên hệ:** Chưa thể hiện `CRM Parent Contact Authority` (ai có quyền quyết định thay thí sinh dưới 18 tuổi, cơ sở pháp lý và sự đồng thuận liên hệ qua kênh nào).
- **Lỗi thao tác trên UI:** Nút "Lưu" trong `StudentFamilyTab` hiện chỉ cập nhật state tạm thời trong React (`setParent(...)`), **chưa có API lưu dữ liệu phụ huynh về backend Frappe**.

### 4.4. Ý định & Động lực của thí sinh (`CRM Intent`)
- Backend Frappe có DocType `CRM Intent` (phân tích từ tin nhắn Zalo, Chatwoot, ghi âm cuộc gọi ra các ý định: *Hỏi học phí, So sánh trường khác, Đăng ký tham quan campus, Xin chuyển ngành*).
- Student 360 hiện chưa có nơi hiển thị danh sách các Intent này để tư vấn viên nắm bắt nhanh tâm lý thí sinh.

### 4.5. Quyền riêng tư & Bảo vệ dữ liệu cá nhân (`CRM Student Privacy Request`)
- Tuân thủ Nghị định 13/2023/NĐ-CP & GDPR: Quản lý các yêu cầu rút lại sự đồng ý (consent), yêu cầu hạn chế xử lý, hoặc xóa dữ liệu cá nhân.
- Student 360 hiện chỉ hiển thị badge trạng thái đồng ý (`contactConsent`), chưa có giao diện tiếp nhận và xử lý yêu cầu Privacy Request.

---

## 5. Lỗ hổng kỹ thuật & Bất cập dữ liệu giữa Frontend và Frappe Backend

Qua kiểm tra endpoint `get_director_student` (`frappe-crm/crm/api/director_students.py`) và `Student360Dashboard` (`dashboard-crm`):

1. **Tab "Hồ sơ & tài liệu" (`StudentDocumentsTab`) đang dùng dữ liệu Mock:**
   - Hàm `_build_student_360` trên backend Frappe **hoàn toàn không trả về trường `documents`**.
   - Khi kết nối với hệ thống Frappe thật, tab Tài liệu sẽ luôn trống (`Chưa có dữ liệu tài liệu`). Cần bổ sung logic truy vấn bảng `File` đính kèm hoặc bảng tài liệu của `CRM Admission Application`.
2. **Tab "Gia đình" (`StudentFamilyTab`) chưa có API ghi dữ liệu:**
   - Thao tác chỉnh sửa thông tin phụ huynh và mối quan tâm không kích hoạt mutation nào gửi về server.
3. **Các trường phân loại `evidence` và `insight` còn sơ sài:**
   - Backend `director_students.py` chỉ trích xuất tối đa 1 lý do từ `CRM Student Assessment.reason` vào `evidence`, chưa tổng hợp đầy đủ bằng chứng từ lịch sử tương tác và các điểm chạm thực tế.

---

## 6. Đề xuất lộ trình bổ sung theo độ ưu tiên

| Mức độ | Hạng mục cần bổ sung | Phạm vi triển khai |
|---|---|---|
| 🔴 **P1 (Cấp thiết)** | **Bổ sung CCCD/CMND, Cơ sở (Campus), Ngành chính vào UI**<br>- Thêm các trường `id_number`, `id_issued_date`, `id_issued_place`.<br>- Thêm chọn Cơ sở (`branch`) và Ngành học (`major`). | - Frontend: `StudentDetailsTab`<br>- Types: `Student360Data.student` |
| 🔴 **P1 (Cấp thiết)** | **Kết nối API thật cho Tab Phụ huynh & Tài liệu**<br>- Viết API cập nhật `alt_name`, `alt_phone`, `alt_address` hoặc `CRM Student Guardian` khi bấm Lưu ở Tab Gia đình.<br>- Backend trả về danh sách tài liệu (`documents`) từ file đính kèm thật. | - Frontend: `StudentFamilyTab`, `StudentDocumentsTab`<br>- Backend: `director_students.py` |
| 🟡 **P2 (Quan trọng)** | **Hiển thị 2 Child Tables: Kết quả học tập & Chứng chỉ ngoại ngữ**<br>- Bảng điểm học bạ 3 năm THPT (`academic_results`).<br>- Bảng chứng chỉ ngoại ngữ quốc tế (`language_certificates`). | - Frontend: Component bảng điểm trong `StudentDetailsTab`<br>- Backend: Hydrate child table trong `_build_student_360` |
| 🟡 **P2 (Quan trọng)** | **Bổ sung Widget/Tab Tài chính & Học phí**<br>- Hiển thị lệ phí, tiền đặt cọc, học phí đã nộp, chính sách học bổng (`CRM Student Payment`). | - Frontend: Tab/Card Tài chính tuyển sinh<br>- Backend: API query thanh toán |
| 🟢 **P3 (Nâng cao)** | **Quản lý toàn vẹn hồ sơ, SLA & Lịch sử phân công**<br>- Badge cảnh báo hồ sơ trùng lặp/cách ly (`intake_integrity_state`, `case_key`).<br>- Bảng lịch sử phân công tư vấn viên (`assignment_log`).<br>- Cảnh báo trạng thái SLA tư vấn viên. | - Frontend: `StudentHeader`, `StudentAuditCard`<br>- Backend: Metadata projection |

