---
title: Expose major management in admin navigation
date: 2026-09-14
---

# Expose major management in admin navigation

## Context

Major Group và Major đã được triển khai bên trong màn hình cấu hình học sinh,
nhưng chưa có entry riêng trong sidebar nên người dùng không tìm thấy chức năng.

## Change

- Thêm route `/director/admin/majors` mở thẳng tab quản lý ngành học.
- Thêm mục sidebar và card trên trang quản trị tổng quan.
- Bổ sung route access theo nhóm quyền quản trị cấu hình.
- Thêm test bảo vệ mapping sidebar đến route mới.

## Verification

Sidebar regression test, lint các file liên quan và Next.js production build đều pass.
