"use client";
import { CheckCircle1, XmarkCircle } from "@tailgrids/icons";

import {
  ADMIN_TABLE_PAGE_SIZE,
  AdminTableBody,
  AdminTableCell,
  AdminTableFrame,
  AdminTablePagination,
  AdminTableRoot,
  AdminTableRow,
} from "@/components/common/admin/admin-table";
import { TableRowActions } from "@/components/common/table-row-actions";
import { Badge } from "@/components/tailgrids/core/badge";
import type { ProfileOption } from "@/services/api/profile-options";
import type { CrmDoctypePermissions } from "@/components/common/auth/permissions";
import ProfileOptionsTableHeader from "./profile-options-table-header";
import {
  ProfileOptionsRowsSkeleton,
  ProfileOptionsPaginationSkeleton,
} from "./profile-options-skeleton";

export default function ProfileOptionsTable({
  rows,
  busy,
  isLoading,
  permissions,
  currentPage,
  total,
  onPageChange,
  onEdit,
  onToggle,
  onDelete,
}: {
  rows: ProfileOption[];
  busy: boolean;
  isLoading: boolean;
  permissions: CrmDoctypePermissions;
  currentPage: number;
  total: number;
  onPageChange: (page: number) => void;
  onEdit: (row: ProfileOption) => void;
  onToggle: (row: ProfileOption) => void;
  onDelete: (row: ProfileOption) => void;
}) {
  return (
    <AdminTableFrame>
      <AdminTableRoot
        aria-label="Danh sách danh mục hồ sơ"
        aria-busy={isLoading}
      >
        <ProfileOptionsTableHeader />
        <AdminTableBody>
          {isLoading ? (
            <ProfileOptionsRowsSkeleton />
          ) : rows.length === 0 ? (
            <AdminTableRow>
              <AdminTableCell
                colSpan={5}
                className="py-16 text-center text-text-tertiary"
              >
                Chưa có danh mục phù hợp. Thêm mục mới hoặc thay đổi tìm kiếm.
              </AdminTableCell>
            </AdminTableRow>
          ) : (
            rows.map((row) => (
              <AdminTableRow key={row.id}>
                <AdminTableCell className="max-w-64 break-all font-mono text-xs text-text-tertiary">
                  {row.code}
                </AdminTableCell>
                <AdminTableCell className="break-words font-medium">
                  {row.name}
                </AdminTableCell>
                <AdminTableCell>{row.sortOrder}</AdminTableCell>
                <AdminTableCell>
                  <Badge color={row.isActive ? "success" : "gray"}>
                    {row.isActive ? "Đang dùng" : "Ngừng sử dụng"}
                  </Badge>
                </AdminTableCell>
                <AdminTableCell>
                  <TableRowActions
                    label={row.name}
                    isDisabled={busy}
                    actions={[
                      {
                        id: "edit",
                        label: "Sửa",
                        onAction: () => onEdit(row),
                        isVisible: permissions.canUpdate,
                      },
                      {
                        id: "toggle",
                        icon: row.isActive ? (
                          <XmarkCircle size={16} aria-hidden="true" />
                        ) : (
                          <CheckCircle1 size={16} aria-hidden="true" />
                        ),
                        label: row.isActive ? "Ngừng dùng" : "Kích hoạt",
                        onAction: () => onToggle(row),
                        isVisible: permissions.canUpdate,
                      },
                      {
                        id: "delete",
                        label: "Xóa",
                        onAction: () => onDelete(row),
                        variant: "danger",
                        isVisible: permissions.canDelete,
                      },
                    ]}
                  />
                </AdminTableCell>
              </AdminTableRow>
            ))
          )}
        </AdminTableBody>
      </AdminTableRoot>
      {isLoading ? (
        <ProfileOptionsPaginationSkeleton />
      ) : (
        <AdminTablePagination
          currentPage={currentPage}
          totalPages={Math.max(1, Math.ceil(total / ADMIN_TABLE_PAGE_SIZE))}
          totalItems={total}
          pageSize={ADMIN_TABLE_PAGE_SIZE}
          onPageChange={onPageChange}
          isDisabled={busy}
        />
      )}
    </AdminTableFrame>
  );
}
