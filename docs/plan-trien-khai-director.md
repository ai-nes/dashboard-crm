# AI-NES Director Workspace — Kế hoạch triển khai theo phase

## Mục tiêu

Xây dựng workspace riêng cho `Admissions Director`, tập trung vào 3 câu hỏi mỗi ngày:

1. Tuyển sinh đang đạt đến đâu so với mục tiêu?
2. Hàng đợi/rủi ro nào cần Director can thiệp ngay?
3. Campus, team, nguồn tuyển và funnel nào đang tạo ra kết quả tốt nhất?

Toàn bộ dữ liệu mockup hiện tại chỉ phục vụ kiểm tra UI. Dữ liệu thật sẽ đi qua API có server-side permission, row-level scope và append-only history theo tài liệu nghiệp vụ.

## Thứ tự ưu tiên

| Priority | Năng lực | Lý do |
|---|---|---|
| P0 | Director Dashboard | Màn hình điều hành trung tâm, giúp xác định việc cần xử lý ngay |
| P0 | Student Pipeline + Intake Review | Bảo vệ thực thể `CRM Student`, chống trùng và không để hồ sơ mồ côi |
| P0 | SLA Monitor + Student Pool | Kiểm soát first meaningful response, routing và escalation |
| P1 | Statistics & Performance | So sánh funnel, Campus, Team, nguồn tuyển và hiệu quả chuyển đổi |
| P1 | Executive Reports | Báo cáo theo niên khóa, kỳ, Campus, ngành và nguồn; hỗ trợ export |
| P1 | Enrollment Conversion | Đối soát `Enrolled` → `CRM Contact`, không tạo Contact trùng |
| P2 | Marketing Attribution & ROI | Đo multi-touch, spend, CPL, CPA và ROI |
| P2 | AI Insights | Score, risk flag, dự báo nhập học và next best action |
| P2 | Governance & Master Data | Approval, audit trail, break-glass và chất lượng dữ liệu |

## Phase 0 — Director IA & shell

**Trạng thái:** Hoàn tất mockup.

- Sidebar riêng cho Director, không hiển thị các dashboard demo E-commerce/Stocks/SaaS.
- Nhóm navigation: Command Center, Admissions Operations, Enrollment, Marketing & Attribution, AI Insights, Interactions & Tasks, Organization & Academic, Governance.
- Footer sidebar thể hiện `Director mode`, trạng thái Live và niên khóa hiện tại.
- Giữ nguyên pattern `Collapsible` + `Link` của design system để keyboard navigation và mobile sheet hoạt động nhất quán.

## Phase 1 — Director Dashboard

**Trạng thái:** UI mockup hoàn tất, chờ review trước khi sang Phase 2.

### Thành phần đã dựng

- Global filters: Campus và thời gian.
- KPI: hồ sơ hoạt động, lead mới, SLA attainment, Applicant, Enrolled.
- Admissions funnel: `Lead → MQL → SQL → Applicant → Admitted → Enrolled`.
- Needs attention queue: SLA breach, unassigned pool, intake review, conversion reconciliation, approval pending.
- Decision brief: các tín hiệu high-intent, SLA risk và hồ sơ sẵn sàng chuyển đổi.
- Campus & team performance table.
- Lead sources với Applicant/Enrolled contribution.

### Điều kiện nghiệm thu

- Director nhìn thấy KPI quan trọng trong một viewport desktop.
- Mọi cảnh báo đều có count, mức độ ưu tiên và đường dẫn xử lý.
- Có thể lọc theo Campus/thời gian mà không đổi layout.
- Mobile không làm vỡ card/table; bảng có horizontal scroll có chủ đích.
- Không chứa dữ liệu PII thật trong mockup.

## Phase 2 — Operations: Intake, Pool, Routing, SLA

- `Student Pipeline`: filter, search, lifecycle status, owner, Team, Campus.
- `Intake Review`: duplicate candidates, conflict reason, approve/merge/reject và audit note.
- `Student Pool`: hồ sơ chưa phân công, aging, routing preview và manual assignment có quyền.
- `Routing Requests`: deferred request, retry status, reason và policy used.
- `SLA Monitor`: active attempts, warning, breached, escalated, completed; drill-down tới Interaction + Outcome.
- Tất cả thao tác ghi phải tạo command receipt và event history.

## Phase 3 — Statistics & Insights

- Funnel theo ngày/tuần/tháng/niên khóa.
- Conversion theo Campus, Team, ngành, phương thức xét tuyển và nguồn.
- Cohort: thời gian từ Lead → MQL → SQL → Applicant → Enrolled.
- SLA: first-response median, attainment, breach rate, escalation rate.
- Workload: hồ sơ/nhân sự, aging, task completion, ownership transfer.
- AI: score distribution, high-intent, objection, risk flag và forecast.

## Phase 4 — Executive Reports

- Report presets: Daily Director Brief, Weekly Admissions Review, Monthly Executive Review.
- Bộ lọc lưu được, drill-down từ chart tới danh sách hồ sơ.
- Export CSV/XLSX/PDF theo quyền.
- So sánh kỳ trước, target vs actual và snapshot theo thời điểm.
- Ghi nhận lịch sử export và người thực hiện.

## Phase 5 — Enrollment & Governance

- Conversion queue `Enrolled` → `CRM Contact`.
- Reconciliation 1-1, idempotency và xử lý lỗi.
- Approval Center cho master data, học phí, học bổng, quota, ngành và Campus.
- Audit trail cho lifecycle, ownership, SLA, interaction, conversion và approval.
- Break-glass theo two-person rule.

## Phase 6 — Hardening & mở rộng role

- Server-side permission theo `owner_staff`, `owning_team`, `campus`.
- Role workspace cho Lead Sales, Sale, Marketing và System Manager.
- Kết nối webhook, Zalo/Email/VoIP, SIS và campaign platforms.
- Test accessibility, responsive, permission boundary, idempotency và audit completeness.

## Quy tắc dừng để review

Sau mỗi phase cần dừng để review 4 điểm trước khi triển khai tiếp:

1. Visual hierarchy và tên gọi nghiệp vụ.
2. KPI/metric có đúng ý nghĩa vận hành không.
3. Navigation và đường dẫn drill-down có hợp lý không.
4. Quyền Director có đang xem/sửa đúng phạm vi không.

