title: Hợp nhất Profile Template khi cập nhật hồ sơ tuyển sinh
date: 2026-09-10
status: completed
---

# Hợp nhất Profile Template khi cập nhật hồ sơ tuyển sinh

## Context

Card thông tin tuyển sinh đã gọi API cập nhật, nhưng đổi Profile Template bị lỗi
`DuplicateEntryError` vì cùng học sinh đã có nhiều application/profile nháp.

## Decision

API cập nhật giữ nguyên application đang chỉnh sửa. Khi template đích đã có profile
nháp, backend tái sử dụng profile đích, archive profile cũ, chuyển application nháp
trùng sang `Withdrawn` và không xóa tài liệu đã upload. Projection chỉ trả profile
đang hoạt động và ưu tiên profile được cập nhật gần nhất.

## Verification

- Test materialization với duplicate Profile Template: passed.
- Admission runtime, catalog API và student document tests: passed.
- Frontend API test: 6 passed.
- TypeScript check và lint các file liên quan: passed.
- `crm.api.test_director_students`: còn 1 lỗi assertion `owner_staff` tồn tại sẵn,
  không liên quan thay đổi admission profile.
