---
title: Tách contract response pipeline phân công
date: 2026-09-06
status: completed
---

# Tách contract response pipeline phân công

## Context

Nút chạy pipeline hiển thị lỗi `Phản hồi chạy pipeline phân công học sinh không hợp lệ.` dù backend trả report chạy thành công.

## What happened

Frontend dùng `normalizeWorkspace()` để validate cả snapshot workspace bên trong response command. Đây là coupling không cần thiết: mutation chỉ dùng `run/results`, sau đó query workspace đã được invalidate để lấy snapshot mới.

## Decision

Tách `RunStudentAssignmentPipelineResponse` thành report gồm `run/results`; giữ validation workspace độc lập với command report. Chuẩn hóa `tier` nhận cả số và chuỗi vì backend runtime trả tier số.

## Verification

- Lead Sale API tests: 13 passed.
- TypeScript check: passed.
- Production build: passed.
- Lint riêng hai file pipeline: passed.
