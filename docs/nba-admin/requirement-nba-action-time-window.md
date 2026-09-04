# Yêu cầu: Ràng buộc khung giờ cho Action (NBA) + Trang Admin quản lý

## 1. Nguồn gốc yêu cầu

Thầy yêu cầu (2026-09-04), tóm tắt:

> Em cho rằng buộc về thời gian phù hợp để có dữ liệu cho Action.
> Chia ngày ra các khung 0-6, 6-12, 12-18, 18-25.
> Vũ phối hợp làm nhánh quản lý này (Phần UI).

Diễn giải cụ thể từ trao đổi:

- Mỗi **Action** (vd. `CALL`) cần được cấu hình **nên hoạt động vào khung giờ nào**.
- Ví dụ: `CALL` không được phép xảy ra trong khung `0h - 6h sáng`.
- Mục đích: **tránh việc AI đề xuất (NBA) một action không phù hợp về mặt thời gian** (gọi điện lúc nửa đêm, nhắn tin quá khuya...).
- Cần có **trang Admin** để cấu hình/quản lý ràng buộc này cho từng Action.
- Phân công: **Backend xử lý toàn bộ logic**; **Frontend chỉ gọi API từ hệ thống Frappe này** để dựng lại giao diện quản lý phù hợp (không dùng UI mặc định của Frappe Desk).

## 2. Phạm vi đã triển khai (Backend — done)

Nhánh: `refactor/core-crm`.

| Hạng mục | File | Nội dung |
|---|---|---|
| Field cấu hình | `crm/fcrm/doctype/crm_action/crm_action.json` | Thêm `allowed_time_slots` (JSON array, subset của `0-6`/`6-12`/`12-18`/`18-24`). Rỗng/`null` = không giới hạn. |
| Helper thời gian | `crm/fcrm/nba_timing.py` | `slot_for_time()` (giờ → khung tương ứng), `is_time_allowed()` (thời điểm có nằm trong danh sách khung cho phép không). |
| Validate cấu hình | `crm/fcrm/action_constraints.py`, `crm/fcrm/doctype/crm_action/crm_action.py` | Từ chối lưu nếu `allowed_time_slots` chứa mã khung không hợp lệ hoặc trùng lặp. |
| Enforce khi tạo đề xuất | `crm/fcrm/recommendation_producer.py` (`produce_recommendation`), `crm/fcrm/nba.py` (`ensure_nba_recommendation`) | Khi hệ thống/AI tạo `CRM Recommendation`, nếu Action đó có `allowed_time_slots` và thời điểm đề xuất (`recommended_timing`/`due_at`) rơi ngoài khung cho phép → từ chối tạo, ném lỗi `ACTION_TIME_WINDOW`. |
| API cho Admin | `crm/api/action.py` | `create_action`/`update_action`/`list_actions`/`get_action` nhận thêm `allowed_time_slots`; API mới `list_time_slots()` trả `{time_slots: ["0-6","6-12","12-18","18-24"]}` để FE dựng option chọn. |
| Docs API | `docs/api-crm-action-nba.md` | Mô tả field + hành vi enforce. |
| Test | `crm/fcrm/test_nba_timing.py`, `crm/fcrm/test_crm_action_type.py` | Test thuần Python cho `slot_for_time`, `is_time_allowed`, validate config (44/44 pass, không cần bench). |

**Chưa làm** (cần Vũ / nhóm FE thực hiện theo phân công của thầy): giao diện Admin thực tế.

## 3. Đề xuất giao diện Admin (cho Vũ tham khảo khi build FE)

Không cần trang riêng phức tạp — làm dạng **bảng cấu hình + inline edit** trong khu Admin/Settings quản lý danh mục Action:

- Bảng liệt kê Action (`code`, loại, kênh mặc định, **khung giờ cho phép**, bật/tắt), có filter theo `action_type` (79 dòng nên cần filter).
- Cột "khung giờ cho phép": 4 chip/checkbox tương ứng `0-6 / 6-12 / 12-18 / 18-24`; tick khung nào là action được phép chạy khung đó. Không tick khung nào = không giới hạn (mặc định hiện tại).
- Nên có toggle rõ ràng "Không giới hạn giờ" (bật thì disable 4 chip) để tránh nhầm giữa "chưa cấu hình" và "cố tình bỏ trống".
- Sửa trực tiếp trên bảng (inline), gọi `update_action(name, allowed_time_slots=[...])` ngay khi đổi — không cần modal riêng cho thao tác lặp lại nhiều lần này.
- Gọi API:
  - `crm.api.action.list_time_slots` — load 1 lần lấy 4 option.
  - `crm.api.action.list_actions` — lấy danh sách + filter theo `action_type`.
  - `crm.api.action.update_action` — lưu thay đổi khung giờ.
- Version nâng cao (làm sau nếu cần): dải trực quan 24 ô/giờ theo màu khung, thay vì 4 chip.

## 4. Việc còn lại

- [ ] Vũ/nhóm FE: build trang Admin quản lý theo gợi ý mục 3, gọi API `crm.api.action`.
- [ ] Cân nhắc seed default `allowed_time_slots` cho các action nhạy cảm giờ giấc (vd. `CALL`, `SEND_SMS`, `SEND_ZALO`) qua patch, thay vì để trống hết và chờ admin tự cấu hình.
- [ ] Xác nhận với thầy: `CRM Action Type` (category) có cần cấu hình khung giờ mặc định theo nhóm không, hay chỉ cấu hình theo từng `code` là đủ.
