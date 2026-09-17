"use client";

import { Pencil1, Trash1 } from "@tailgrids/icons";

import { Avatar, AvatarFallback } from "@/components/tailgrids/core/avatar";
import {
  AdminTableCell,
  AdminTableHead,
  AdminTableHeader,
  AdminTablePagination,
  AdminTableRoot,
  AdminTableRow,
} from "@/components/common/admin/admin-table";
import { Badge } from "@/components/tailgrids/core/badge";
import { Button } from "@/components/tailgrids/core/button";
import { Checkbox } from "@/components/tailgrids/core/checkbox";
import { TableBody } from "@/components/tailgrids/core/table";
import type { CrmUser } from "@/services/api/user-management";

import RoleSelectDropdown from "./role-select-dropdown";

export function isUserSelectable(user: CrmUser): boolean {
  return user.role !== "System Manager" && !user.sessionUser;
}

/** Only Sale/CTV Sale receive Leads, so only they have a meaningful capacity. */
export const LEAD_RECIPIENT_ROLES = new Set(["Sale", "CTV Sale"]);

export function capacityDisplay(user: CrmUser): string {
  if (!LEAD_RECIPIENT_ROLES.has(user.role ?? "")) return "—";
  if (!user.capacity) return "Chưa vào Team";
  const { active, limit, configured } = user.capacity;
  if (!configured) return "Chưa thiết lập";
  return limit ? `${active}/${limit}` : `${active}`;
}

interface UsersTableProps {
  users: CrmUser[];
  total: number;
  isLoading: boolean;
  canManageUsers: boolean;
  isMutating: boolean;
  selectedUserIds: Set<string>;
  onToggleUser: (user: CrmUser, checked: boolean) => void;
  onToggleAll: (checked: boolean) => void;
  onChangeRole: (user: CrmUser, newRole: string) => void;
  onEdit: (user: CrmUser) => void;
  onRemove: (user: CrmUser) => void;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

function initialsFor(fullName: string): string {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  return (parts[0][0] + (parts[parts.length - 1]?.[0] ?? "")).toUpperCase();
}

export default function UsersTable({
  users,
  total,
  isLoading,
  canManageUsers,
  isMutating,
  selectedUserIds,
  onToggleUser,
  onToggleAll,
  onChangeRole,
  onEdit,
  onRemove,
  currentPage,
  totalPages,
  onPageChange,
}: UsersTableProps) {
  const columnCount = 4 + (canManageUsers ? 2 : 0);
  const selectableUsers = users.filter(isUserSelectable);
  const isAllSelected =
    selectableUsers.length > 0 &&
    selectableUsers.every((u) => selectedUserIds.has(u.name));

  return (
    <>
      <AdminTableRoot aria-label="Danh sách người dùng CRM">
        <AdminTableHeader>
          <AdminTableRow>
            {canManageUsers ? (
              <AdminTableHead scope="col" className="w-10">
                <Checkbox
                  aria-label="Chọn tất cả người dùng"
                  isSelected={isAllSelected}
                  isDisabled={selectableUsers.length === 0}
                  onChange={onToggleAll}
                />
              </AdminTableHead>
            ) : null}
            <AdminTableHead scope="col">Người dùng</AdminTableHead>
            <AdminTableHead scope="col">Email</AdminTableHead>
            <AdminTableHead scope="col">Vai trò</AdminTableHead>
            <AdminTableHead scope="col">Capacity</AdminTableHead>
            {canManageUsers ? (
              <AdminTableHead scope="col">Hành động</AdminTableHead>
            ) : null}
          </AdminTableRow>
        </AdminTableHeader>
        <TableBody>
          {isLoading
            ? Array.from({ length: 4 }).map((_, index) => (
                <AdminTableRow key={index}>
                  <AdminTableCell colSpan={columnCount} className="py-5">
                    <div className="h-4 animate-pulse rounded bg-background-gray-secondary" />
                  </AdminTableCell>
                </AdminTableRow>
              ))
            : null}
          {!isLoading && users.length === 0 ? (
            <AdminTableRow>
              <AdminTableCell
                colSpan={columnCount}
                className="py-16 text-center text-sm text-text-tertiary"
              >
                {total === 0
                  ? "Chưa có người dùng CRM nào."
                  : "Không tìm thấy người dùng phù hợp. Thử từ khóa hoặc bộ lọc khác."}
              </AdminTableCell>
            </AdminTableRow>
          ) : null}
          {!isLoading
            ? users.map((user) => {
                const isSystemManager = user.role === "System Manager";
                return (
                  <AdminTableRow key={user.name}>
                    {canManageUsers ? (
                      <AdminTableCell className="py-3.5">
                        <Checkbox
                          aria-label={`Chọn ${user.fullName}`}
                          isSelected={selectedUserIds.has(user.name)}
                          isDisabled={!isUserSelectable(user) || isMutating}
                          onChange={(checked) => onToggleUser(user, checked)}
                        />
                      </AdminTableCell>
                    ) : null}
                    <AdminTableCell className="py-3.5">
                      <div className="flex min-w-0 items-center gap-2.5">
                        <Avatar size="sm">
                          <AvatarFallback className="bg-badge-primary-background text-badge-primary-text">
                            {initialsFor(user.fullName)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <p
                            title={user.fullName}
                            className="truncate text-sm font-medium text-text-primary"
                          >
                            {user.fullName}
                            {user.sessionUser ? (
                              <span className="ml-1.5 text-xs font-normal text-text-tertiary">
                                (Bạn)
                              </span>
                            ) : null}
                          </p>
                        </div>
                      </div>
                    </AdminTableCell>
                    <AdminTableCell className="py-3.5 text-text-secondary">
                      {user.email}
                    </AdminTableCell>
                    <AdminTableCell className="py-3.5">
                      {canManageUsers && !isSystemManager ? (
                        <RoleSelectDropdown
                          value={user.role ?? ""}
                          disabled={isMutating}
                          onChange={(newRole) => onChangeRole(user, newRole)}
                        />
                      ) : (
                        <Badge color={isSystemManager ? "primary" : "gray"}>
                          {user.role ?? "Chưa có vai trò"}
                        </Badge>
                      )}
                    </AdminTableCell>
                    <AdminTableCell className="py-3.5 whitespace-nowrap text-text-secondary">
                      {capacityDisplay(user)}
                    </AdminTableCell>
                    {canManageUsers ? (
                      <AdminTableCell className="py-3.5">
                        <div className="flex items-center gap-2">
                          <Button
                            iconOnly
                            size="sm"
                            variant="ghost"
                            appearance="ghost"
                            aria-label={`Sửa ${user.fullName}`}
                            isDisabled={isMutating}
                            className="text-text-tertiary hover:text-primary-500"
                            onPress={() => onEdit(user)}
                          >
                            <Pencil1 size={16} aria-hidden="true" />
                          </Button>
                          <Button
                            iconOnly
                            size="sm"
                            variant="ghost"
                            appearance="ghost"
                            aria-label={`Gỡ ${user.fullName} khỏi CRM`}
                            isDisabled={
                              isMutating || isSystemManager || user.sessionUser
                            }
                            className="text-text-tertiary hover:text-error-500"
                            onPress={() => onRemove(user)}
                          >
                            <Trash1 size={16} aria-hidden="true" />
                          </Button>
                        </div>
                      </AdminTableCell>
                    ) : null}
                  </AdminTableRow>
                );
              })
            : null}
        </TableBody>
      </AdminTableRoot>
      <AdminTablePagination
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={total}
        onPageChange={onPageChange}
        isDisabled={isLoading || isMutating}
      />
    </>
  );
}
