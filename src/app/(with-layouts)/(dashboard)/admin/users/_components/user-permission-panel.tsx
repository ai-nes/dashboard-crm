"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";

import {
  AdminTableCell,
  AdminTableHead,
  AdminTableHeader,
  AdminTablePagination,
  AdminTableRoot,
  AdminTableRow,
  AdminTableFrame,
  ADMIN_TABLE_PAGE_SIZE,
} from "@/components/common/admin/admin-table";
import { Button } from "@/components/tailgrids/core/button";
import { Checkbox } from "@/components/tailgrids/core/checkbox";
import {
  Select,
  SelectContent,
  SelectIndicator,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/tailgrids/core/select";
import { TableBody } from "@/components/tailgrids/core/table";
import {
  usePermissionProfilesQuery,
  useUpdatePermissionProfileMutation,
} from "@/hooks/use-user-management-queries";
import { UserManagementApiError } from "@/services/api/user-management";
import type {
  PermissionFlag,
  PermissionProfile,
  PermissionProfileDoctype,
  PermissionProfileRowScope,
} from "@/services/api/user-management";

const PERMISSION_COLUMNS: Array<{ key: PermissionFlag; label: string }> = [
  { key: "read", label: "Đọc" },
  { key: "write", label: "Ghi" },
  { key: "create", label: "Tạo" },
  { key: "delete", label: "Xóa" },
  { key: "export", label: "Xuất" },
];

const ROW_SCOPE_OPTIONS: Array<{
  value: PermissionProfileRowScope;
  label: string;
}> = [
  { value: "assigned", label: "Lead và học sinh được phân công" },
  { value: "own_assigned", label: "Lead và học sinh tự phân công" },
  { value: "campus_assigned", label: "Lead và học sinh trong cơ sở" },
  { value: "campus_assigned_contact", label: "Học sinh trong cơ sở" },
  { value: "team_and_team_pool", label: "Lead và học sinh của team và pool" },
  {
    value: "team_members_and_own_team_pool",
    label: "Lead và học sinh của thành viên team và pool",
  },
  { value: "no_case_scope", label: "Không có phạm vi Lead/học sinh" },
  { value: "all", label: "Tất cả Lead và học sinh" },
  { value: "deny", label: "Từ chối" },
];

function cloneProfile(profile: PermissionProfile): PermissionProfile {
  return {
    ...profile,
    applicableDoctypes: profile.applicableDoctypes.map((row) => ({ ...row })),
  };
}

function errorMessage(error: unknown): string {
  if (error instanceof UserManagementApiError) return error.message;
  if (error instanceof Error) return error.message;
  return "Đã có lỗi xảy ra. Vui lòng thử lại.";
}

interface UserPermissionPanelProps {
  canEdit: boolean;
}

export default function UserPermissionPanel({
  canEdit,
}: UserPermissionPanelProps) {
  const [selectedRole, setSelectedRole] = useState("");
  const [doctypePage, setDoctypePage] = useState(1);
  const [draft, setDraft] = useState<PermissionProfile | null>(null);
  const [isDirty, setIsDirty] = useState(false);
  const profilesQuery = usePermissionProfilesQuery(
    {
      role: selectedRole || undefined,
      start: (doctypePage - 1) * ADMIN_TABLE_PAGE_SIZE,
      pageLength: ADMIN_TABLE_PAGE_SIZE,
    },
    { enabled: canEdit },
  );
  const updateMutation = useUpdatePermissionProfileMutation();
  const profiles = useMemo(
    () => profilesQuery.data?.profiles ?? [],
    [profilesQuery.data?.profiles],
  );
  const activeRole = selectedRole || profiles[0]?.role || "";

  const selectedProfile = useMemo(
    () => profiles.find((profile) => profile.role === activeRole) ?? null,
    [activeRole, profiles],
  );

  const activeDraft = useMemo(() => {
    if (!selectedProfile) return null;
    if (isDirty && draft?.role === selectedProfile.role) return draft;
    return cloneProfile(selectedProfile);
  }, [draft, isDirty, selectedProfile]);

  const totalDoctypes =
    profilesQuery.data?.total ?? activeDraft?.applicableDoctypes.length ?? 0;
  const doctypeTotalPages = Math.max(
    1,
    Math.ceil(totalDoctypes / ADMIN_TABLE_PAGE_SIZE),
  );

  const updateDraft = (
    change: (current: PermissionProfile) => PermissionProfile,
  ) => {
    setDraft((current) => {
      const source = current?.role === activeRole ? current : activeDraft;
      return source ? change(source) : source;
    });
    setIsDirty(true);
  };

  const updatePermission = (
    documentType: string,
    permission: PermissionFlag,
    checked: boolean,
  ) => {
    updateDraft((current) => ({
      ...current,
      applicableDoctypes: current.applicableDoctypes.map((row) =>
        row.documentType === documentType
          ? { ...row, [permission]: checked }
          : row,
      ),
    }));
  };

  const handleSave = async () => {
    if (!activeDraft || !isDirty || updateMutation.isPending) return;

    try {
      await updateMutation.mutateAsync({
        role: activeDraft.role,
        rowScope: activeDraft.rowScope,
        deleteRequiresOwnership: activeDraft.deleteRequiresOwnership,
        applicableDoctypes: activeDraft.applicableDoctypes,
        replaceApplicableDoctypes: false,
      });
      setIsDirty(false);
      toast.success(`Đã lưu quyền hạn cho vai trò ${activeDraft.role}.`);
    } catch (error) {
      toast.error(errorMessage(error));
    }
  };

  if (!canEdit) {
    return (
      <section
        className="rounded-xl border border-alert-danger-border bg-alert-danger-background p-5"
        role="alert"
      >
        <p className="text-sm font-medium text-alert-danger-title">
          Bạn không có quyền xem cấu hình quyền hạn.
        </p>
      </section>
    );
  }

  if (profilesQuery.error) {
    return (
      <section
        className="rounded-xl border border-alert-danger-border bg-alert-danger-background p-5"
        role="alert"
      >
        <p className="text-sm font-medium text-alert-danger-title">
          Không tải được cấu hình quyền hạn.
        </p>
        <p className="mt-1 text-sm text-alert-danger-description">
          {errorMessage(profilesQuery.error)}
        </p>
        <button
          type="button"
          className="mt-3 text-sm font-semibold text-primary-500 hover:underline"
          onClick={() => void profilesQuery.refetch()}
        >
          Thử lại
        </button>
      </section>
    );
  }

  if (profilesQuery.isPending) {
    return (
      <AdminTableFrame className="p-5">
        <div className="h-9 w-64 animate-pulse rounded-lg bg-background-gray-secondary" />
        <div className="mt-5 space-y-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div
              key={index}
              className="h-11 animate-pulse rounded bg-background-gray-secondary"
            />
          ))}
        </div>
      </AdminTableFrame>
    );
  }

  if (profiles.length === 0 || !activeDraft) {
    return (
      <AdminTableFrame className="p-12 text-center text-sm text-text-tertiary">
        Chưa có cấu hình quyền hạn nào.
      </AdminTableFrame>
    );
  }

  return (
    <AdminTableFrame>
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-card-border px-4 py-4">
        <div className="flex flex-wrap items-end gap-4">
          <div className="w-full sm:w-56">
            <label
              htmlFor="permission-profile-role"
              className="mb-1.5 block text-xs font-semibold text-text-secondary"
            >
              Vai trò
            </label>
            <Select
              value={activeRole}
              onChange={(value) => {
                setSelectedRole(String(value));
                setDoctypePage(1);
                setDraft(null);
                setIsDirty(false);
              }}
              isDisabled={updateMutation.isPending || isDirty}
              aria-label="Chọn vai trò để cấu hình quyền hạn"
            >
              <SelectTrigger
                id="permission-profile-role"
                size="sm"
                className="w-full"
              >
                <SelectValue />
                <SelectIndicator />
              </SelectTrigger>
              <SelectContent>
                {profiles.map((profile) => (
                  <SelectItem
                    key={profile.role}
                    id={profile.role}
                    textValue={profile.role}
                  >
                    {profile.role}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="w-full sm:w-80 lg:w-96">
            <label
              htmlFor="permission-profile-row-scope"
              className="mb-1.5 block text-xs font-semibold text-text-secondary"
            >
              Phạm vi dòng
            </label>
            <Select
              value={activeDraft.rowScope}
              onChange={(value) =>
                updateDraft((current) => ({
                  ...current,
                  rowScope: String(value) as PermissionProfileRowScope,
                }))
              }
              isDisabled={updateMutation.isPending}
              aria-label="Chọn phạm vi dòng"
            >
              <SelectTrigger
                id="permission-profile-row-scope"
                size="sm"
                className="w-full"
              >
                <SelectValue />
                <SelectIndicator />
              </SelectTrigger>
              <SelectContent>
                {ROW_SCOPE_OPTIONS.map((option) => (
                  <SelectItem
                    key={option.value}
                    id={option.value}
                    textValue={option.label}
                  >
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex min-h-8 items-center gap-4 pb-0.5">
            <Checkbox
              isSelected={activeDraft.deleteRequiresOwnership}
              isDisabled={updateMutation.isPending}
              onChange={(checked) =>
                updateDraft((current) => ({
                  ...current,
                  deleteRequiresOwnership: checked,
                }))
              }
            >
              <span className="text-sm text-text-secondary">
                Xóa cần đúng chủ sở hữu
              </span>
            </Checkbox>
            <Checkbox isSelected={activeDraft.isSystemManaged} isDisabled>
              <span className="text-sm text-text-tertiary">
                Hệ thống quản lý
              </span>
            </Checkbox>
          </div>
        </div>

        <Button
          size="sm"
          isDisabled={!isDirty || updateMutation.isPending}
          onPress={() => void handleSave()}
        >
          {updateMutation.isPending ? "Đang lưu..." : "Lưu thay đổi"}
        </Button>
      </div>

      <div className="overflow-x-auto">
        <AdminTableRoot
          aria-label={`Ma trận quyền hạn vai trò ${activeDraft.role}`}
          className="min-w-[720px]"
        >
          <AdminTableHeader>
            <AdminTableRow>
              <AdminTableHead scope="col" className="w-12 text-center">
                STT
              </AdminTableHead>
              <AdminTableHead scope="col">Loại tài liệu</AdminTableHead>
              {PERMISSION_COLUMNS.map((column) => (
                <AdminTableHead
                  key={column.key}
                  scope="col"
                  className="w-24 text-center"
                >
                  {column.label}
                </AdminTableHead>
              ))}
            </AdminTableRow>
          </AdminTableHeader>
          <TableBody>
            {activeDraft.applicableDoctypes.map((row, index) => (
              <PermissionMatrixRow
                key={row.documentType}
                row={row}
                index={index + (doctypePage - 1) * ADMIN_TABLE_PAGE_SIZE}
                disabled={updateMutation.isPending}
                onChange={updatePermission}
              />
            ))}
          </TableBody>
        </AdminTableRoot>
      </div>
      <AdminTablePagination
        currentPage={doctypePage}
        totalPages={doctypeTotalPages}
        totalItems={totalDoctypes}
        pageSize={ADMIN_TABLE_PAGE_SIZE}
        onPageChange={setDoctypePage}
        isDisabled={updateMutation.isPending || isDirty}
      />
    </AdminTableFrame>
  );
}

interface PermissionMatrixRowProps {
  row: PermissionProfileDoctype;
  index: number;
  disabled: boolean;
  onChange: (
    documentType: string,
    permission: PermissionFlag,
    checked: boolean,
  ) => void;
}

function PermissionMatrixRow({
  row,
  index,
  disabled,
  onChange,
}: PermissionMatrixRowProps) {
  return (
    <AdminTableRow>
      <AdminTableCell className="text-center text-text-tertiary">
        {index + 1}
      </AdminTableCell>
      <AdminTableCell className="font-medium">
        {row.documentType}
      </AdminTableCell>
      {PERMISSION_COLUMNS.map((column) => (
        <AdminTableCell key={column.key} className="text-center">
          <div className="flex justify-center">
            <Checkbox
              aria-label={`${column.label} ${row.documentType}`}
              isSelected={row[column.key]}
              isDisabled={disabled}
              onChange={(checked) =>
                onChange(row.documentType, column.key, checked)
              }
            />
          </div>
        </AdminTableCell>
      ))}
    </AdminTableRow>
  );
}
