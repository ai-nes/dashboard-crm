# FE Handoff: NBA Recommendation Response Shape

Ngày: 2026-09-06
Branch: `refactor/core-crm`
Commit liên quan:
- `refactor(nba): render explanation as a work item, not an analysis` (crm/fcrm + crm/api)
- `refactor(api): collapse recommendation read models into one nested shape` (crm/api)

## Endpoint bị ảnh hưởng

1. `GET /api/method/crm.api.student_worklist.*` (worklist Sale) — object trả về bởi `_recommendation_dto()`.
2. `GET /director/ai/next-best-action` → field `recommendations` — object trả về bởi `_map_recommendation()` (`crm.api.director_next_best_action.get_director_recommendations`).

**Không đổi:** endpoint URL, params, envelope ngoài (`meta`, `pagination`, `recommendations`/`items`...). Chỉ đổi shape của **từng recommendation item**.

## Tóm tắt thay đổi

Mỗi recommendation item giờ có thêm một khối field mới, sạch, không lặp lại:

```
target -> action -> priority -> rank -> reason -> objective -> context -> timing -> status
```

**Các field cũ vẫn còn nguyên, không bị xoá** (`aiPayload`, `explanation`, `actionId`, `studentId`, `channel`, `student`, `studentName`, `recommendationKey`, `evaluation`, `generatedAt`, `expected_revision`, `revision`, `permitted_decisions`, `explanationSource`...). Lý do giữ: `aiPayload` hiện đang là nguồn dữ liệu cho logic identity-check/diff khi Accept/Accept-with-changes (`studentDecision.js`, `actionWorkbench.js`, `studentAdmissionsActions.js`) — không đổi để tránh vỡ luồng quyết định.

→ **FE không bắt buộc phải sửa gì ngay** để không bị crash — response vẫn tương thích ngược 100%. Nhưng nên dùng field mới cho phần hiển thị (card/list recommendation) vì nó gọn và không phải tự ráp từ `aiPayload`/`explanation` nữa.

## Shape field mới (`view`)

```json
{
  "id": "NBA-EVAL-1-1",
  "target": { "type": "CRM Student", "id": "ENR-2026-00042" },
  "action": { "code": "ACT-CALL", "title": "Gọi điện" },
  "priority": "high",
  "rank": 1,
  "reason": "Học viên im lặng 9 ngày sau khi hỏi về học phí.",
  "objective": "Xác nhận học viên còn quan tâm và tìm hiểu rào cản hiện tại.",
  "context": [
    "Chưa có tương tác 9 ngày",
    "Lần cuối tương tác là câu hỏi về học phí"
  ],
  "timing": {
    "scheduled_at": "2026-09-10T00:00:00+00:00",
    "expires_at": "2026-09-20 00:00:00",
    "timezone": "Asia/Ho_Chi_Minh"
  },
  "status": {
    "lifecycle": "proposed",
    "decision": "pending",
    "execution": "not_started"
  }
}
```

### Giải thích từng field

| Field | Nguồn | Ghi chú |
|---|---|---|
| `action.title` | Server-resolved từ action type catalog | **Không** lấy từ AI. Luôn là tên hiển thị tiếng Việt canonical cho action code. |
| `priority` | `CRM Recommendation.priority` | `high` / `medium` / `low`. |
| `reason` | `CRM Recommendation.reason` | Fact kernel-generated (deterministic), khác với `objective`. |
| `objective` | `explanation.objective` | Do AI viết, 1-2 câu, mục tiêu của hành động. **`null`** nếu explanation chưa render xong. |
| `context` | `explanation.context` | Tối đa 3 fact ngắn, do AI viết. **`[]`** nếu explanation chưa có. |
| `timing.scheduled_at` | `ai_payload.recommended_timing.scheduled_at` | ISO 8601 có offset. |
| `timing.expires_at` | `CRM Recommendation.expires_at` | ⚠️ **Format khác nhau giữa 2 endpoint**, xem mục Known Issues bên dưới. |
| `status.*` | `lifecycle_status` / `decision_status` / `execution_status` | Enum có sẵn trên DocType, không đổi giá trị. |

### Field **không** có ở layer này

- `why_this_action` — vẫn tồn tại trong `explanation` raw (`explanation.why_this_action`), nhưng **cố ý không đưa vào view mới** theo yêu cầu rút gọn. Nếu FE cần hiển thị, đọc trực tiếp `explanation.why_this_action`.

## Known Issues / cần lưu ý khi FE tích hợp

1. **`timing.expires_at` không đồng nhất format giữa 2 endpoint:**
   - Sale worklist (`student_worklist.py`): `"YYYY-MM-DD HH:MM:SS"` (Frappe datetime string thô, không có timezone offset).
   - Director queue (`director_next_best_action.py`): ISO 8601 có offset, vd `"2026-09-20T00:00:00+07:00"`.
   - FE parse ngày nên xử lý cả hai dạng, hoặc báo lại để BE chuẩn hoá thêm nếu cần 1 format duy nhất.

2. **`objective`/`context` có thể null/rỗng** — recommendation vừa được kernel tạo nhưng AI chưa render xong explanation (best-effort, chạy sau commit). FE nên có fallback hiển thị (vd hiện `reason` thay `objective` khi `objective` là `null`).

3. **`action.title` fallback**: nếu action code không có trong catalog (case hiếm, code lỗi thời/không hợp lệ), `title` sẽ fallback về đúng raw code (vd `"ACT-CALL"` thay vì `"Gọi điện"`).

4. **`priority`/`status` giờ xuất hiện ở review queue Director** — trước đây review queue này cố tình *không* có các field mang tính "task semantics" (priority, status) để tránh nhầm với `CRM Action Item`. Giờ đã đổi ý theo yêu cầu hiển thị rõ ràng hơn — đây là thay đổi có chủ đích, không phải leak.

## Việc FE cần làm

- [ ] Đổi UI card/list recommendation (worklist Sale + review queue Director) sang đọc field mới thay vì tự ráp từ `aiPayload`/`explanation`.
- [ ] Xử lý `objective`/`context` null-safe.
- [ ] Xử lý 2 format `expires_at` khác nhau (hoặc yêu cầu BE chuẩn hoá nếu muốn 1 format).
- [ ] **Không đổi** logic Accept/Accept-with-changes hiện tại (`recommendationActionIdentity`, `diffRecommendationDelta`) — vẫn dùng `aiPayload` như cũ, không có gì thay đổi ở đây.

## Câu hỏi mở

- Có cần chuẩn hoá `timing.expires_at`/`generatedAt` về cùng 1 format (ISO có offset) trên cả 2 endpoint không, hay giữ nguyên như hiện tại vì FE đã quen xử lý cả hai?
- Có cần hiển thị `why_this_action` ở UI nào không, hay chỉ dùng nội bộ/audit?
