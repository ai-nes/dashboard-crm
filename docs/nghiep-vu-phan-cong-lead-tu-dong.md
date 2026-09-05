# Nghiệp vụ Phân công Lead Tự động cho Sales

> Tài liệu mô tả chính xác hành vi đã **implement** trong code (không phải chỉ ý định thiết kế trong plan/PDF gốc). Nguồn: `crm/fcrm/student_assignment.py`, `student_routing.py`, `student_ownership.py`, `student_sla.py`, `student_lead_operations.py`, `api/student_lead_operations.py`.
>
> Phạm vi: **CRM Student** (không phải `CRM Contact`). Điểm dừng của nghiệp vụ này là lead được gán cho **một Sales/CTV cụ thể** (owner_staff) hoặc rơi vào một hàng đợi. Các bước sau đó (NBA, nuôi dưỡng lead...) thuộc repo `crm-agents`, ngoài phạm vi tài liệu này.

---

## 1. Luồng tổng thể (end-to-end)

```
Lead vào hệ thống (student_intake.py::submit_intake)
        │
        ▼
Tạo CRM Student, pool-owned theo Campus (owning_team/owning_pool = pool mặc định theo campus)
        │
        ▼
Kích hoạt routing (đồng bộ HOẶC qua hàng đợi CRM Student Routing Request)
        │
        ▼
route_pool_owned_student() — cây quyết định 4 tầng
        │
        ├─ Tầng 1: trường có người phụ trách  → gán thẳng người đó
        ├─ Tầng 2: biết Zone, trường chưa ai phụ trách → route vào pool của Team đang quản lý Zone → chọn 1 member (round-robin hoặc weighted score)
        ├─ Tầng 3: chỉ biết Province → hàng đợi thủ công (MANUAL_QUEUE)
        └─ Tầng 4: không xác định địa bàn → hàng đợi làm giàu dữ liệu (ENRICHMENT_QUEUE)
        │
        ▼
change_student_ownership() — command duy nhất được phép ghi owner_staff/owning_team/owning_pool
        │
        ├─ Ghi CRM Student Command Receipt (idempotency, HMAC)
        ├─ Ghi CRM Student Ownership Event (audit trail append-only)
        └─ Mở CRM Student SLA Attempt (nếu target là owner cá nhân)
```

**Toàn bộ pipeline bị tắt hoàn toàn nếu feature flag `routing` = False** (`student_feature_flags.py`, mặc định `False`). Khi tắt, `route_pool_owned_student()` trả về ngay `{"status": "deferred", "reason": "ROUTING_DISABLED"}` — lead vẫn nằm ở pool-owned theo campus, không có ai được auto-assign. Đây là unhappy case bao trùm toàn bộ hệ thống, phải xác nhận đã bật trên môi trường thật trước khi coi routing "sống".

---

## 2. Happy path — chi tiết từng bước

### Bước 1: Lead được tạo → pool-owned theo Campus
- `student_intake.py::submit_intake` xác định actor, campus, pool mặc định, kiểm tra trùng lặp qua `CRM Student Case Key` (HMAC digest chống dedup), rồi tạo `CRM Student` với `owning_team`/`owning_pool` trỏ vào pool theo Campus (chưa theo Zone).
- Ngay sau khi tạo, routing được kích hoạt: đồng bộ trong cùng transaction (nếu flag `synchronous_routing` bật) hoặc đẩy vào outbox `CRM Student Routing Request` (worker xử lý theo phút qua scheduler).

### Bước 2: Xác định pool chuẩn (`_canonical_pool`)
Trước khi routing, hệ thống phải resolve **đúng một** `CRM Student Pool` đang active khớp Campus + (owning_pool hoặc owning_team) của Student. Đây là điều kiện tiên quyết — nếu sai sẽ raise lỗi ngay (xem mục 4.1).

### Bước 3: Xác định Zone/Tier của Student (`resolve_student_zone` + `_routing_context`)
Thứ tự ưu tiên xác định địa bàn:
1. **High School → CRM High School Assignment.zone**: nếu student có `high_school` và trường đó có người phụ trách đang active → **Tier 1**.
2. Nếu trường có Zone xác định nhưng **chưa ai phụ trách** → **Tier 2** (biết Zone).
3. Nếu chỉ biết **Province** (không suy ra được Zone) → **Tier 3**.
4. Nếu không xác định được địa bàn nào → **Tier 4**.

Việc resolve Zone qua trường học được ưu tiên tuyệt đối so với resolve qua chuỗi Province/Ward — không có cơ chế "so khớp rồi lấy giao" giữa hai nguồn; hệ thống chọn quyết định theo một đường duy nhất (xem case xung đột ở mục 4.3).

### Bước 4: Điều phối theo Tier

**Tier 1 — Trường đã có người phụ trách (`school_owner`)**
- Lấy `school_owner_team` (Team của người phụ trách trường).
- Nếu người phụ trách trường (`school_owners`) vẫn còn là thành viên active của team đó → gọi `_eligible_team_members(team, campus, staff_ids=school_owners, prefer_sale=False)` để lấy đúng (các) member này làm ứng viên — **bỏ qua hoàn toàn round-robin/pool**.
- Áp policy hiện hành (`_active_policy`) để chấm điểm/chọn trong tập ứng viên này (thường tập chỉ có 1 người).
- Kiểm tra capacity với `direct=True` (xem mục 5 — Tier 1 được miễn "giảm tải 85%" nhưng **không** miễn "chặn cứng 100%").
- Nếu qua được capacity → gọi `change_student_ownership(target_kind="owner", ...)` gán thẳng cho người phụ trách trường, kèm lý do `"Automatic school-owner routing"`.
- Kết quả: `{"status": "applied", "tier": 1, "owner_staff": ...}`.

**Tier 2 — Biết Zone, trường chưa ai phụ trách**
- Resolve Zone → Team đang quản lý Zone → Pool tương ứng (`zone_team_pool`), phần này được **đóng băng (frozen) tại thời điểm enqueue request**, không resolve lại lúc xử lý (xem mục 4.4 về staleness).
- Nếu pool hiện tại của Student khác pool đã map theo Zone → di chuyển Student sang pool đó trước (qua `change_student_ownership(target_kind="pool", ...)`), sau đó mới chọn member.
- Lấy toàn bộ member active của Team (`_eligible_members`), lọc theo capacity (`capacity_eligible`, `direct=False` — **có áp dụng ngưỡng giảm tải 85%**).
- Chọn 1 người theo policy: `round_robin` (mặc định, dùng con trỏ `cursor_staff` lưu trên `CRM Student Routing Policy`) hoặc `weighted_score` (nếu policy cấu hình `strategy="weighted_score"` — xem mục 6).
- Nếu người được chọn có `function == "CTV-Sale"` → không gán trực tiếp, mà đưa vào **CTV batch** (xem mục 7) thay vì ownership ngay lập tức.
- Gán quyền sở hữu qua `change_student_ownership`, cập nhật `cursor_staff`/`cursor_revision` của policy (round-robin tiến lên 1 nấc).

**Tier 3 — Chỉ biết Province**
- Không tự động chọn ai. Student được đánh dấu `status: "queued", tier: 3, queue: MANUAL_QUEUE"`.
- Trưởng phòng/Manager phải phân công thủ công (qua `manager_reassign_student`).

**Tier 4 — Không xác định được địa bàn**
- Không tự động chọn ai. `status: "queued", tier: 4, queue: ENRICHMENT_QUEUE"`.
- Cần làm giàu dữ liệu (bổ sung trường/tỉnh/phường) trước khi có thể routing lại.

### Bước 5: Mở SLA
- Nếu kết quả là gán cho một owner cá nhân (Tier 1 hoặc Tier 2 áp dụng thành công), `change_student_ownership` tự động gọi `open_sla_for_assignment` để mở một `CRM Student SLA Attempt` — bắt đầu đếm giờ phản hồi đầu tiên theo priority (xem mục 8).
- Tier 3/4 (hàng đợi) **không** mở SLA vì chưa có owner cá nhân.

---

## 3. Cây quyết định 4 tầng — bảng tóm tắt

| Tầng | Điều kiện vào | Hành động | Có gán owner? | Có mở SLA? |
|---|---|---|---|---|
| 1 | Trường đã có người phụ trách active | Gán thẳng người đó (qua capacity/policy check) | Có (nếu qua capacity) | Có |
| 1 → rơi xuống | Trường có owner nhưng **không có `school_owner_team`** | Rơi xuống Tier 4 (enrichment) | Không | Không |
| 1 → rơi xuống | Người phụ trách trường không còn active trong team | Rơi xuống Tier 3 (manual) | Không | Không |
| 1 → deferred | Người phụ trách trường đủ điều kiện nhưng **capacity chặn cứng (100%)** | `status: deferred, reason: CAPACITY_BLOCKED` — **không tự rơi xuống tầng khác** | Không | Không |
| 2 | Biết Zone, trường chưa ai phụ trách, Zone có Team quản lý | Route vào pool Team đó, chọn 1 member | Có (nếu có ứng viên qua capacity) | Có |
| 2 → deferred | Không còn ứng viên nào qua được capacity | `status: deferred, reason: CAPACITY_BLOCKED` | Không | Không |
| 2 → deferred | Không có active policy cho pool | `status: deferred, reason: NO_ACTIVE_POLICY` | Không | Không |
| 3 | Chỉ biết Province | Vào MANUAL_QUEUE | Không | Không |
| 4 | Không xác định địa bàn | Vào ENRICHMENT_QUEUE | Không | Không |
| 0 (legacy) | Zone tier 3/4 nhưng pool hiện tại **không có Zone mapping** (`CRM Team Zone Assignment` active) | Giữ hành vi campus-scoped cũ (không áp cây quyết định mới) | Tùy round-robin cũ | Có (nếu gán owner) |

> **Lưu ý quan trọng**: hệ thống **không có cơ chế fallback tự động giữa các tầng khi bị "deferred" do capacity/policy** — một request bị `deferred` sẽ nằm nguyên ở trạng thái đó trong `CRM Student Routing Request` cho đến khi được `retry_student_routing()` (thủ công hoặc worker tự retry theo điều kiện khác), **không tự động rơi xuống Tier 3/4**. Đây là điểm khác biệt dễ gây hiểu nhầm: "deferred" ≠ "queued vào hàng đợi thấp hơn".

---

## 4. Các trường hợp bất thường (unhappy case) trong xác định pool/Zone

### 4.1 Lỗi topology của pool (`_canonical_pool`)
Raise `StudentRoutingError` ngay lập tức (không routing được), với các mã lỗi:
- `INVALID_TOPOLOGY` — Student thiếu `branch` (Campus), hoặc pool khớp filter nhưng **inactive/sai Campus**, hoặc Student không có cả `owning_pool` lẫn `owning_team`.
- `NOT_POOL_OWNED` — Student không có `owning_pool`/`owning_team` nào để suy ra pool.
- `AMBIGUOUS_POOL` — Student khớp **nhiều hơn 1** pool active cùng lúc (dữ liệu bất thường).
- `INVALID_TOPOLOGY` — Student đã có `owner_staff`/`assigned_to` (đã có chủ) nhưng vẫn được đưa vào routing pool-owned — vi phạm bất biến "student đã routing phải pool-owned độc quyền".
- `INVALID_TOPOLOGY` — `owning_team` của Student không khớp `team` của pool đã resolve (dữ liệu lệch).

### 4.2 Ambiguous School Zone
Nếu một trường có **nhiều assignment đang active** trỏ tới **nhiều Zone khác nhau** cùng lúc (dữ liệu bất thường — lẽ ra 1 trường chỉ nên thuộc 1 Zone), `resolve_student_zone` trả về mã `AMBIGUOUS_SCHOOL_ZONE` → hệ thống **không cố đoán**, rơi thẳng xuống **Tier 4** (enrichment queue) để người phụ trách dữ liệu xử lý thủ công.

### 4.3 Conflicting Geography
Nếu Zone suy ra từ trường học và Zone suy ra từ chuỗi Province/Ward **mâu thuẫn nhau** (về lý thuyết không nên xảy ra nếu chuỗi địa lý nhất quán, nhưng dữ liệu thực tế có thể lệch), mã `CONFLICTING_GEOGRAPHY` được trả về → cũng rơi xuống **Tier 4**, không tự chọn một trong hai nguồn để "đại diện".

### 4.4 Zone→Team→Pool mapping bị stale (đã đóng băng nhưng đổi chủ giữa chừng)
- Khi một routing request được **enqueue** (`enqueue_student_routing`), mapping Zone→Team→Pool được **đóng băng** (`frozen_mapping`) ngay tại thời điểm đó và lưu trên request row — **không resolve lại động khi xử lý**.
- Lý do: `CRM Team Zone Assignment` có thể đổi Team quản lý Zone bất kỳ lúc nào (effective-dated), độc lập với `ownership_revision` của Student — nếu resolve lại lúc xử lý có thể âm thầm route sang Team khác so với lúc Student thực sự "vào" hệ thống.
- Tại thời điểm xử lý (`process_routing_request`), hệ thống gọi `frozen_mapping_is_current(frozen, campus)`:
  - Nếu mapping **vẫn đúng** → xử lý bình thường.
  - Nếu mapping **đã cũ** (Team quản lý Zone đã đổi) → request chuyển trạng thái `status: "deferred", last_error_code: "STALE_ZONE_MAPPING"` — **không route theo mapping cũ**, phải retry để re-derive mapping mới.

### 4.5 Ownership revision đã thay đổi (stale revision)
- Mọi lệnh routing đều mang `expected_revision`. Nếu `ownership_revision` hiện tại của Student **khác** giá trị mong đợi (ví dụ Student đã bị người khác thao tác ownership song song) → trả về `status: "superseded", reason: "STALE_OWNERSHIP_REVISION"`, **không ghi đè**. Đây là cơ chế optimistic locking bảo vệ khỏi race condition khi 2 tiến trình cùng cố gắng routing 1 Student.

### 4.6 Pool không có Zone mapping (pool cũ, chưa nâng cấp)
Nếu pool hiện tại **chưa** có `CRM Team Zone Assignment` active nào trỏ tới, nhưng Zone của Student lại resolve ra Tier 3/4 → hệ thống coi đây là **pool legacy chưa map Zone** và trả `{"tier": 0, "legacy": True}` — giữ nguyên hành vi routing kiểu cũ theo Campus (round-robin thuần), **không ép vào MANUAL_QUEUE/ENRICHMENT_QUEUE**. Mục đích: không phá vỡ các pool đang chạy tốt trước khi Zone được thiết lập cho chúng.

---

## 5. Capacity gating (ngưỡng tải)

Nguồn: `crm/fcrm/student_assignment.py::capacity_eligible`, `_capacity`. Capacity dựa trên `CRM Staff Capacity Period` (`max_active_students`).

- **≥ 100% tải (`BLOCKED_LOAD`)** → **chặn cứng hoàn toàn**, kể cả với Tier 1 (`direct=True`). Không có ngoại lệ nào miễn chặn 100%.
- **≥ 85% và < 100% (`REDUCED_LOAD`)** → chỉ với routing **không phải Tier 1** (`direct=False`): thu hẹp diện ứng viên hợp lệ xuống còn **các match cùng trường** (same-school-only). Tier 1 (`direct=True`) **được miễn** ràng buộc thu hẹp này — vì Tier 1 vốn đã là match trường-người phụ trách, không cần thu hẹp thêm.
- **< 85%** → không giới hạn gì thêm, coi là bình thường.
- **"Daily cap" (giới hạn tiếp nhận/ngày)**: hệ thống **tái sử dụng cùng một giá trị** `max_active_students` làm cả giới hạn "nắm giữ đồng thời" lẫn giới hạn ngày — **không có field/rate-limit riêng cho "tiếp nhận trong ngày"** như PDF gốc mô tả 2 loại năng lực tách biệt.

### ⚠️ Unhappy case ẩn — bypass capacity khi chưa cấu hình
Nếu một staff/team **không có bất kỳ `CRM Staff Capacity Period` nào** được thiết lập, `limit == 0` và hệ thống coi đây là **không giới hạn** (`load = 0.0`, luôn eligible). Đây là hành vi **fail-open** — không có cảnh báo hiển thị cho manager rằng capacity đang bị bỏ qua hoàn toàn cho người/team đó. Nếu vận hành thực tế phụ thuộc vào capacity gating để tránh quá tải, **phải đảm bảo mọi staff/team đều có Capacity Period được cấu hình**, nếu không nghiệp vụ "giới hạn tải" coi như không tồn tại với người đó.

---

## 6. Chấm điểm khi dùng chiến lược `weighted_score`

Chỉ áp dụng khi `CRM Student Routing Policy.strategy == "weighted_score"` (mặc định vẫn là `round_robin`).

Công thức: `score = load*W_load + territory*W_territory + performance*W_performance + rotation*W_rotation`

Trọng số mặc định trong code: `{"load": 0.35, "territory": 0.30, "performance": 0.20, "rotation": 0.15}` — **cấu hình được** qua `policy.scoring_weights` (JSON), không hardcode. *(Lưu ý: khác với con số trong PDF gốc/plan ban đầu là 0.35/0.25/0.20/0.20 — số hiện tại trong code là 0.35/0.30/0.20/0.15.)*

Các yếu tố:
- **load**: `1 - capacity_load` (càng rảnh điểm càng cao); nếu chưa cấu hình capacity → mặc định `1.0` (rảnh tuyệt đối — cộng hưởng với unhappy case ở mục 5).
- **territory**: `1.0` nếu member đang được gán phụ trách đúng trường của student, ngược lại `0.0`.
- **performance**: heuristic thô — `0.5` nếu member có dưới 5 lần được gán trước đó (chưa đủ dữ liệu đánh giá), ngược lại là tỉ lệ số lần gán của member so với tổng số lần gán của cả team.
- **rotation**: **cờ nhị phân**, không phải suy giảm theo thời gian thực — `1.0` nếu member **chưa từng được gán** lần nào, `0.5` nếu đã từng. Không phân biệt "gán lần cuối cách đây 1 ngày" hay "1 năm".

Người thắng: điểm cao nhất; hòa điểm thì chọn theo `staff` name tăng dần (tie-break xác định, không ngẫu nhiên).

---

## 7. Cơ chế lô (CTV Batch) cho cộng tác viên bán thời gian

Áp dụng khi member được chọn có `function == "CTV-Sale"` (Tier 2 routing only — Tier 1 dùng `prefer_sale=False` nên vẫn có thể gán trực tiếp CTV nếu CTV chính là người phụ trách trường, không qua batch).

### Happy path
1. `is_ctv_eligible(student)` kiểm tra lead có **đủ điều kiện vào batch** không: loại trừ lead **điểm `latest_score >= 80`** hoặc `fit_level` thuộc `{High, Complex, Strategic}` — các lead "cao cấp/phức tạp" luôn đi qua gán cá nhân trực tiếp, **không bao giờ vào batch CTV**.
2. Nếu CTV chưa có batch mở → `open_ctv_batch()` tạo batch mới (`batch_size` mặc định 10, `validity_hours` mặc định 24h).
3. Nếu batch hiện tại **chưa đầy** (`len(items) < batch_size`) → thêm student vào batch (`status: delivered`).
4. Nếu batch đã đầy → `deliver_ctv_student` trả `None`, và tại `student_routing.py` điều này khiến routing trả `status: "deferred", reason: "CTV_BATCH_UNAVAILABLE_OR_LEAD_COMPLEX"` — **student không được gán cho CTV này**, vẫn phải chờ hoặc route lại.

### Vòng đời batch
- **Replenish tự động** (`replenish_ctv_batch`): chỉ khi batch đã hoàn thành **≥ 75%** số lượng (`completed_count >= batch_size * 0.75`) — đóng batch cũ (`status: completed`), mở batch mới cùng size.
- **Recall tự động khi hết hạn** (`recall_expired_ctv_batches`, chạy theo cron mỗi phút — xem `crm/hooks.py`): với mọi batch `status: open` và `expires_at < now`, mọi item còn `status: delivered` (chưa được làm) bị recall — trả ngược Student về pool của Team (qua `change_student_ownership`, lý do `"CTV batch expired; lead recalled"`), batch chuyển `status: recalled`.

### Unhappy case
- **Race condition mở batch trùng**: `open_ctv_batch` kiểm tra "đã có batch mở chưa" (`frappe.db.exists`) rồi mới `insert()` — đây là kiểm-tra-rồi-ghi (check-then-insert) **không có khóa DB hay unique constraint** đảm bảo tính nguyên tử. Nếu 2 lead được route đồng thời cho cùng 1 CTV trong cùng khoảnh khắc, về lý thuyết **có thể tạo 2 batch mở cùng lúc cho cùng 1 người** (vi phạm bất biến "1 CTV chỉ có 1 batch mở"). Đây là finding HIGH từ code review, **chưa được fix** — cần lưu ý khi vận hành ở tải cao.
- **Lead trả về pool khi batch hết hạn dù CTV đang làm dở**: nếu item vẫn ở `delivered` (chưa chuyển `worked`) khi `expires_at` tới, nó bị recall vô điều kiện — không có cơ chế "gia hạn nếu đang active".
- Batch item chỉ chuyển `worked` qua `complete_ctv_item()` được gọi tường minh — nếu CTV không có thao tác nào cập nhật trạng thái item, hệ thống không tự biết là "đang làm dở" hay "bỏ quên".

---

## 8. Chuyển giao thủ công bởi Manager (Reassignment)

Hàm `manager_reassign_student` (`student_lead_operations.py`):

### Happy path
1. Manager chỉ định `target_staff` + `target_team` + `reason` + `expected_revision`.
2. Hệ thống resolve lại Zone của Student; nếu Student có Zone xác định (không rỗng) → **bắt buộc** `target_team` phải là Team đang quản lý đúng Zone đó (`zone_team_pool`), nếu không → lỗi `"Target staff must belong to the student's zone-owning team."`.
3. Kiểm tra capacity của `target_staff` với `direct=True` (miễn giảm-tải-85%, không miễn chặn-cứng-100%) — nếu vượt ngưỡng chặn cứng → lỗi `"Target staff is at capacity."`.
4. Nếu qua hết → gọi `change_student_ownership(target_kind="owner", ...)`, lý do ghi vết `"Manager transfer: {reason}"`.

### Cơ chế "vượt rào" khẩn cấp — `emergency_override=True`
- Bỏ qua cả kiểm tra Zone-Team khớp lẫn kiểm tra capacity.
- **Đây là điểm cần đặc biệt lưu ý về phân quyền**: theo code review, endpoint gọi hàm này qua API (`crm/api/student_lead_operations.py`) hiện **không kiểm tra capability `student.ownership.manage`** trước khi cho phép gọi — trong khi `change_student_ownership` gốc **có** enforce capability này cho actor thông thường. Vì lệnh reassignment gọi `change_student_ownership` với `_internal_service=True`, nó **bỏ qua** bước `_authorize()` áp dụng cho actor công khai — nghĩa là API tầng trên phải tự kiểm tra quyền, và theo review hiện tại **chưa làm việc này đầy đủ** cho endpoint CTV batch và fairness report (CRITICAL finding, chưa fix). Khi vận hành, coi đây là lỗ hổng cần vá trước khi mở endpoint này cho vai trò không phải admin.

### Unhappy case khác
- `expected_revision` sai (Student đã bị đổi ownership song song) → thất bại theo cùng cơ chế optimistic locking `STALE_OWNERSHIP_REVISION` như routing tự động.
- Auto-recall SLA (mục 9) và manager transfer **đều đi qua `change_student_ownership`** nên có row-level lock + revision check — về mặt kỹ thuật không thể có "double write" thật sự đồng thời, nhưng nếu auto-recall thắng trước, manager sẽ nhận lỗi `STALE_OWNERSHIP_REVISION` khi submit — **UI/luồng nghiệp vụ cần hiển thị rõ xung đột này để manager retry**, thay vì âm thầm no-op.

---

## 9. SLA — Hạn phản hồi theo Priority, Ngoài giờ, và Tự động thu hồi

Nguồn: `crm/fcrm/student_sla.py`. Toàn bộ tắt nếu flag `sla=False`.

### Happy path — mở SLA khi gán owner
- `open_sla_for_assignment` chỉ mở **một** attempt "not-terminal" cho mỗi student — nếu đã tồn tại attempt đang mở, trả về attempt hiện có (idempotent, không mở trùng).
- Cần có **policy SLA active** khớp Campus (+Pool nếu có) — nếu không có → lỗi cứng `NO_ACTIVE_POLICY` (khác với routing, ở đây **không fallback im lặng**).
- `opened_at = next_working_start(now, policy)`: nếu lead tạo **ngoài giờ làm việc**, thời điểm bắt đầu tính SLA được **dời tới đầu giờ làm việc kế tiếp** — không tính giờ ngủ/nghỉ là thời gian vi phạm.
- Deadline theo priority: `priority_minutes(policy, priority)` — nếu priority không có override cấu hình riêng → dùng `policy.warning_minutes` mặc định.
- 3 mốc: `warning_at` (cảnh báo cho owner) → `breach_at` (báo `lead_sales`) → `escalation_at` (báo `admissions_director`).

### Unhappy case
- **Ngoài giờ nhưng chưa cấu hình working-hours** → `next_working_start` **âm thầm no-op**, trả nguyên thời điểm đầu vào — nghĩa là nếu working-hours config bị thiếu, SLA coi như bắt đầu ngay lập tức kể cả lúc nửa đêm, **không có cảnh báo** rằng config thiếu.
- **Tier 3/4 (hàng đợi thủ công/enrichment) không mở SLA** — vì chưa có owner cá nhân, đúng theo yêu cầu nghiệp vụ (SLA chỉ áp cho lead đã có người phụ trách).
- **Auto-recall khi quá hạn gấp đôi (2x)**: `recall_due()` kiểm tra nếu đã quá **2 lần** khoảng breach mà chưa phản hồi → tự động trả Student về pool (giống release thủ công), `SLA Attempt` chuyển `status: superseded`. **Hệ số 2x này bị hardcode trong code**, mặc dù đã có field `CRM Student SLA Policy.auto_recall_multiplier` sẵn trong schema nhưng **chưa được đọc/sử dụng** — nếu vận hành muốn đổi hệ số theo từng policy/campus, hiện tại **không có tác dụng**, luôn luôn là 2x cố định (MEDIUM finding, chưa fix).
- **Pause SLA** chỉ được phép với lý do nằm trong danh sách `pause_reasons` được duyệt sẵn trong policy — lý do ngoài danh sách bị từ chối (`INVALID_PAUSE_REASON`). Có giới hạn tổng thời gian pause tối đa (`maximum_pause_minutes`) — vượt quá bị từ chối (`PAUSE_LIMIT_REACHED`).
- **Response hợp lệ** phải đến từ một `CRM Interaction` được xác minh nguồn (`verify_sla_source`), thuộc danh sách nguồn được phép (Call Log, Communication, Task, CRM Marketing Engagement, WhatsApp Message), có outcome nằm trong `MEANINGFUL_OUTCOMES` — nếu không, SLA **không được coi là đã phản hồi** dù nhân viên có tương tác gì đó không đủ chuẩn.
- **Escalation daily-digest**: nếu policy dùng chiến lược `owner_warning_lead_breach_director_daily_digest`, sự kiện `escalated` vẫn được ghi vào audit trail **nhưng không gửi thông báo realtime ngay** cho Director — thông báo được gộp gửi theo lịch tổng hợp hằng ngày. Đừng nhầm "không thấy thông báo ngay" là hệ thống lỗi.

---

## 10. Fairness Reporting (Báo cáo công bằng phân công)

Hàm `fairness_report()` (trong `student_assignment.py`, expose qua `fairness_summary`):
- Tính số lead mỗi staff nhận, số lần bị chuyển giao (heuristic: `reason` bắt đầu bằng "manager" hoặc "transfer", không phân biệt hoa thường — **đây là suy luận từ chuỗi text, không phải flag tường minh**, dễ sai nếu lý do được viết khác đi).
- Tính phương sai chất lượng lead: điểm `latest_score` trung bình mỗi staff.
- **Cảnh báo/`weekly_review.actions_required`** khi `(max - min) > max(1, average * 0.25)` — tức ngưỡng lệch **25%**, khác với con số 20%/tháng nêu trong PDF gốc.

### Unhappy case về phân quyền
- Theo code review: endpoint fairness report hiện **chưa enforce capability check** trước khi cho phép xem — nên coi đây là dữ liệu **nhạy cảm nội bộ** (hiệu suất từng nhân viên) và cần vá quyền truy cập trước khi public hóa rộng rãi (CRITICAL finding, chưa fix — xem ghi chú cuối tài liệu).

---

## 11. Bảng tổng hợp mã trạng thái/lỗi (status & error code reference)

| Mã | Ý nghĩa | Có tự động xử lý tiếp không? |
|---|---|---|
| `ROUTING_DISABLED` | Feature flag `routing` tắt | Không — toàn bộ pipeline dừng |
| `SLA_DISABLED` | Feature flag `sla` tắt | Không — không mở/tiến triển SLA |
| `STALE_OWNERSHIP_REVISION` (routing) | Student đã bị đổi ownership trước khi request này chạy | superseded, không retry tự động |
| `STALE_ZONE_MAPPING` | Zone đổi Team quản lý sau khi request được enqueue | deferred, phải retry để re-derive |
| `CAPACITY_BLOCKED` | Không còn ứng viên qua ngưỡng capacity | deferred, phải retry sau khi tải giảm |
| `NO_ACTIVE_POLICY` (routing) | Không có Routing Policy active cho pool | deferred |
| `NO_ACTIVE_POLICY` (SLA) | Không có SLA Policy active cho campus/pool | lỗi cứng khi mở SLA, không fallback |
| `AMBIGUOUS_SCHOOL_ZONE` | 1 trường active-map vào nhiều Zone | rơi Tier 4 (enrichment) |
| `CONFLICTING_GEOGRAPHY` | Zone theo trường ≠ Zone theo Province/Ward | rơi Tier 4 (enrichment) |
| `CTV_BATCH_UNAVAILABLE_OR_LEAD_COMPLEX` | Batch CTV đầy hoặc lead không đủ điều kiện batch | deferred |
| `LEASE_LOST` / `LEASE_ACTIVE` | Request routing đang bị worker khác giữ lease | worker khác xử lý, hoặc lease hết hạn tự giải phóng |
| `INVALID_TOPOLOGY` / `NOT_POOL_OWNED` / `AMBIGUOUS_POOL` | Dữ liệu pool/ownership hiện tại không hợp lệ | lỗi cứng, cần sửa dữ liệu |
| `OUT_OF_SCOPE` | Actor không có quyền/không thuộc phạm vi Student | từ chối request |
| `PAUSE_LIMIT_REACHED` / `INVALID_PAUSE_REASON` | Vi phạm ràng buộc pause SLA | từ chối pause |

---

## 12. Các sai lệch/rủi ro đã xác nhận qua code review (chưa fix — cần biết khi vận hành)

1. **[CRITICAL]** Một số endpoint quản lý (CTV batch operations, fairness report) chưa enforce capability `student.ownership.manage`/tương đương trước khi cho phép thao tác/xem — khác với pattern chuẩn mà `manager_reassign` áp dụng đúng.
2. **[HIGH]** `open_ctv_batch` có race condition check-then-insert, không có unique constraint DB — về lý thuyết có thể tạo 2 batch mở cùng lúc cho 1 CTV dưới tải đồng thời cao.
3. **[MEDIUM]** Capacity fail-open: staff/team chưa cấu hình `CRM Staff Capacity Period` bị coi là không giới hạn tải, không có cảnh báo hiển thị.
4. **[MEDIUM]** Hệ số auto-recall SLA hardcode 2x, field `auto_recall_multiplier` trên policy tồn tại nhưng không được đọc — cấu hình theo policy không có tác dụng thực tế.
5. **[LOW]** Ngưỡng fairness variance trong code là 25%, không phải 20% như tài liệu gốc — cần thống nhất lại con số mong muốn với nghiệp vụ nếu 20% mới là đúng ý định ban đầu.
6. **[LOW]** Trọng số scoring mặc định trong code (0.35/0.30/0.20/0.15) khác với plan gốc (0.35/0.25/0.20/0.20) — cấu hình được nên không chặn vận hành, nhưng cần biết giá trị mặc định thực tế khi chưa có ai chỉnh `policy.scoring_weights`.

Việc fix các mục trên **không nằm trong phạm vi tài liệu nghiệp vụ này** — đây là ghi chú để đội vận hành/QA biết trước khi coi hệ thống "đã hoàn thiện 100%" theo đúng ý định gốc trong PDF.
