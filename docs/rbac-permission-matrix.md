# Ma trận phân quyền (RBAC) theo Sidebar — CRM Tuyển sinh

> Bản nháp v1 — dựa trên danh sách màn hình hiện có trong `src/components/common/sidebar/data.tsx` và 10 role chuẩn từ backend. Đây là **đề xuất** để thảo luận, chưa phải cấu hình đã triển khai (hiện tại codebase **chưa có** middleware / route-guard / lọc sidebar theo role — xem mục "Ghi chú kỹ thuật" cuối file). Role/màn hình còn thiếu sẽ bổ sung sau.

## 1. Danh sách 10 role

| # | Role | Nhóm | Vai trò tóm tắt |
|---|------|------|------------------|
| 1 | **Sale** | Kinh doanh | Nhân viên tư vấn tuyển sinh, làm việc trực tiếp với học sinh/lead được giao |
| 2 | **CTV Sale** | Kinh doanh | Cộng tác viên bán thời gian, phạm vi dữ liệu hẹp hơn Sale chính thức |
| 3 | **Lead Sales** | Kinh doanh | Trưởng nhóm Sale, quản lý hiệu suất & pipeline của team |
| 4 | **Promoter** | Vận hành hiện trường | Nhân sự phụ trách hoạt động tại trường THPT / sự kiện |
| 5 | **Lead Promoter** | Vận hành hiện trường | Trưởng nhóm Promoter, quản lý hoạt động khu vực/trường |
| 6 | **Marketing** | Marketing | Thực thi chiến dịch, phân tích phễu tuyển sinh |
| 7 | **Lead Marketing** | Marketing | Trưởng nhóm Marketing, sở hữu chiến lược chiến dịch & ngân sách |
| 8 | **Admissions Director** | Quản lý cấp cao | Giám đốc tuyển sinh — sở hữu toàn bộ khối `/director/*` (chiến lược, phân tích, vận hành) |
| 9 | **CEO** | Điều hành | Toàn quyền xem, thiên về báo cáo chiến lược tổng thể |
| 10 | **System Manager** | Kỹ thuật/Admin | Toàn quyền hệ thống, cấu hình, quản trị người dùng & dữ liệu |

## 2. Chú giải mức quyền

| Ký hiệu | Ý nghĩa |
|---------|---------|
| ✅ Full | Xem + thao tác (tạo/sửa/gán/xử lý) trên toàn bộ dữ liệu thuộc phạm vi màn hình |
| 👥 Team | Xem + thao tác trong phạm vi dữ liệu của **team mình quản lý** |
| 🔒 Own | Xem + thao tác chỉ trên dữ liệu **được gán cho chính mình** |
| 👁 View | Chỉ xem (không tạo/sửa/gán), toàn bộ hoặc theo phạm vi ghi chú |
| ⛔ — | Không truy cập |

## 3. Ma trận phân quyền theo Sidebar

### TỔNG QUAN

| Màn hình | Route | Sale | CTV Sale | Lead Sales | Promoter | Lead Promoter | Marketing | Lead Marketing | Admissions Director | CEO | System Manager |
|---|---|---|---|---|---|---|---|---|---|---|---|
| Tổng quan tuyển sinh | `/` | 🔒 Own | 🔒 Own | 👥 Team | 🔒 Own | 👥 Team | 👁 View | 👁 View | ✅ Full | ✅ Full | ✅ Full |
| Việc cần xử lý | `/director/ai/next-best-action` | 🔒 Own | 🔒 Own | 👥 Team | 🔒 Own | 👥 Team | ⛔ | ⛔ | ✅ Full | 👁 View | ✅ Full |
| Chatbot CRM | `/crm-chatbot` | ✅ Full | ✅ Full | ✅ Full | ✅ Full | ✅ Full | ✅ Full | ✅ Full | ✅ Full | ✅ Full | ✅ Full |
| Trung tâm AI & dữ liệu | `/director/ai` | ⛔ | ⛔ | 👁 View | ⛔ | 👁 View | 👁 View | 👁 View | ✅ Full | 👁 View | ✅ Full |

### HỌC SINH & TRƯỜNG THPT

| Màn hình | Route | Sale | CTV Sale | Lead Sales | Promoter | Lead Promoter | Marketing | Lead Marketing | Admissions Director | CEO | System Manager |
|---|---|---|---|---|---|---|---|---|---|---|---|
| Khám phá người học | `/director/demographics` | ⛔ | ⛔ | 👁 View | ⛔ | 👁 View | 👁 View | 👁 View | ✅ Full | 👁 View | ✅ Full |
| Hồ sơ học sinh 360° | `/director/students` (+ `/director/students/[studentId]`) | 🔒 Own | 🔒 Own | 👥 Team | ⛔ | ⛔ | ⛔ | ⛔ | ✅ Full | 👁 View | ✅ Full |
| Trường THPT 360° | `/director/market-intelligence` (+ `/director/schools`, `/director/schools/[schoolCode]`, `/director/school/[id]`) | 👁 View | ⛔ | 👁 View | 🔒 Own | 👥 Team | 👁 View | 👁 View | ✅ Full | 👁 View | ✅ Full |
| Hiệu suất khu vực | `/director/regional-performance` | ⛔ | ⛔ | 👥 Team | ⛔ | 👥 Team | ⛔ | 👁 View | ✅ Full | 👁 View | ✅ Full |

### MARKETING

| Màn hình | Route | Sale | CTV Sale | Lead Sales | Promoter | Lead Promoter | Marketing | Lead Marketing | Admissions Director | CEO | System Manager |
|---|---|---|---|---|---|---|---|---|---|---|---|
| Phễu tuyển sinh | `/director/admission-funnel` | ⛔ | ⛔ | 👁 View | ⛔ | ⛔ | 👥 Team | ✅ Full | ✅ Full | 👁 View | ✅ Full |
| Phân tích xu hướng | `/director/revenue-forecast` | ⛔ | ⛔ | 👁 View | ⛔ | ⛔ | 👁 View | ✅ Full | ✅ Full | ✅ Full | ✅ Full |

### VẬN HÀNH TUYỂN SINH

| Màn hình | Route | Sale | CTV Sale | Lead Sales | Promoter | Lead Promoter | Marketing | Lead Marketing | Admissions Director | CEO | System Manager |
|---|---|---|---|---|---|---|---|---|---|---|---|
| Quản lý task | `/director/tasks` | 🔒 Own | 🔒 Own | 👥 Team | 🔒 Own | 👥 Team | 🔒 Own | 👥 Team | ✅ Full | 👁 View | ✅ Full |
| Hoạt động & chiến dịch | `/director/activity-campaign` | ⛔ | ⛔ | 👁 View | 🔒 Own | 👥 Team | 👥 Team | ✅ Full | ✅ Full | 👁 View | ✅ Full |

### BÁO CÁO

Hiện chưa có màn hình nào được khai báo trong `NAV_DATA` (mục trống) — sẽ bổ sung khi có yêu cầu cụ thể.

## 4. Route tồn tại trong code nhưng chưa gắn vào sidebar (orphan routes)

Các route sau đã có page trong `src/app/(with-layouts)/(dashboard)/director/` nhưng **chưa** được khai báo trong `NAV_DATA` — đề xuất tạm thời (cần xác nhận khi đưa vào menu chính thức):

| Route | Đề xuất nhóm menu | Sale | CTV Sale | Lead Sales | Promoter | Lead Promoter | Marketing | Lead Marketing | Admissions Director | CEO | System Manager |
|---|---|---|---|---|---|---|---|---|---|---|---|
| `/director/sales-pipeline` | VẬN HÀNH TUYỂN SINH | 🔒 Own | 🔒 Own | 👥 Team | ⛔ | ⛔ | ⛔ | ⛔ | ✅ Full | 👁 View | ✅ Full |
| `/director/sla` | VẬN HÀNH TUYỂN SINH | 👁 View | ⛔ | 👥 Team | 👁 View | 👥 Team | ⛔ | ⛔ | ✅ Full | 👁 View | ✅ Full |
| `/director/alerts` | TỔNG QUAN | 🔒 Own | ⛔ | 👥 Team | 🔒 Own | 👥 Team | ⛔ | ⛔ | ✅ Full | 👁 View | ✅ Full |
| `/director/data-health` | TỔNG QUAN (AI & dữ liệu) | ⛔ | ⛔ | ⛔ | ⛔ | ⛔ | ⛔ | ⛔ | ✅ Full | 👁 View | ✅ Full |
| `/director/campaign-intelligence` | MARKETING | ⛔ | ⛔ | ⛔ | ⛔ | ⛔ | 👥 Team | ✅ Full | ✅ Full | 👁 View | ✅ Full |
| `/director/school-field-activity` | VẬN HÀNH TUYỂN SINH | ⛔ | ⛔ | ⛔ | 🔒 Own | 👥 Team | ⛔ | ⛔ | ✅ Full | 👁 View | ✅ Full |

## 5. Tab con trong trang (không phải sidebar nhưng ảnh hưởng phân quyền)

**`/director/ai` — Trung tâm AI & dữ liệu** (tabs: Luồng tín hiệu, Hỏi đáp tuyển sinh, Độ tin cậy AI, Sức khỏe dữ liệu, Cảnh báo): áp dụng cùng mức quyền như dòng "Trung tâm AI & dữ liệu" ở mục 3, ngoại trừ tab **Sức khỏe dữ liệu** nên giới hạn ⛔ cho tất cả trừ Admissions Director / CEO (view) / System Manager (full), do đây là dữ liệu vận hành kỹ thuật.

**`/director/activity-campaign` — tabs Hoạt động trường / Chiến dịch & chuyển đổi**: Promoter/Lead Promoter chỉ nên thấy tab "Hoạt động trường"; Marketing/Lead Marketing chỉ nên thấy tab "Chiến dịch & chuyển đổi"; Admissions Director/CEO/System Manager thấy cả hai.

## 6. Ghi chú kỹ thuật (để dev tham khảo khi triển khai)

- Hiện **chưa có** cơ chế phân quyền nào trong code: không có `middleware.ts`, `AuthGuard` (`src/components/common/auth/auth-guard.tsx`) chỉ kiểm tra đăng nhập, sidebar (`NAV_DATA` trong `src/components/common/sidebar/data.tsx`) là danh sách tĩnh không có field role.
- Backend đã trả sẵn `roles: string[]`, `crm_profile: string | null`, `crm_role: string | null`, `crm_capabilities: string[]` trong `CurrentUser` (`src/services/api/auth/types.ts`) nhưng frontend chưa dùng để lọc gì cả.
- Để triển khai ma trận này cần tối thiểu:
  1. Thêm field `roles` (hoặc `permissionKey`) vào từng item trong `NAV_DATA`.
  2. Lọc `NAV_DATA` trong `src/components/common/sidebar/index.tsx` theo `useAuth().user.crm_profile` / `roles`.
  3. Thêm route-level guard (middleware hoặc per-page check) cho các route `/director/*`, đặc biệt các orphan route ở mục 4 vì hiện ai có link cũng vào được.
  4. Với mức 🔒 Own / 👥 Team, cần lọc **dữ liệu** ở tầng API (theo `assigned_to` / khu vực / team), không chỉ ẩn menu — ẩn menu không ngăn truy cập trực tiếp bằng URL.

---
*File này là đề xuất ban đầu dựa trên tên màn hình + vai trò nghiệp vụ suy luận từ route. Cần xác nhận lại với business owner trước khi code, đặc biệt các ô 👁 View / 🔒 Own / 👥 Team ở vùng Marketing–Promoter vì ranh giới "xem toàn bộ vs xem team" phụ thuộc vào cách tổ chức đội nhóm thực tế.*
