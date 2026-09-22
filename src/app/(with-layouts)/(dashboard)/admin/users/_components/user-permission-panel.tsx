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
import {
  AdminTabList,
  AdminTabRoot,
} from "@/components/common/admin/admin-tabs";
import { Checkbox } from "@/components/tailgrids/core/checkbox";
import {
  Select,
  SelectContent,
  SelectIndicator,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/tailgrids/core/select";
import { TabTrigger } from "@/components/tailgrids/core/tabs";
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
  PermissionProfileViewMode,
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

const DELETE_POLICY_OPTIONS = [
  {
    value: "owner",
    label: "Chỉ xóa hồ sơ được phân công",
  },
  {
    value: "role",
    label: "Cho phép xóa theo quyền của vai trò",
  },
] as const;

const FALLBACK_PERMISSION_LABELS: Record<string, string> = {
  "CRM Lead": "Lead",
  "CRM Student": "Học sinh",
  "CRM Student Admission Profile": "Hồ sơ tuyển sinh",
  "CRM Student Document": "Tài liệu tuyển sinh",
  "CRM Major": "Danh mục tuyển sinh",
  "CRM Campaign": "Chiến dịch tuyển sinh",
  "CRM Event": "Sự kiện tuyển sinh",
  "CRM Lead Source": "Nguồn Lead",
  "CRM Campus": "Cơ sở tuyển sinh",
  "CRM Student Payment Account": "Thông tin thanh toán",
  "CRM Recommendation": "Đề xuất và hành động tuyển sinh",
  "CRM Marketing Engagement": "Tương tác tuyển sinh",
};

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
  const [isSaving, setIsSaving] = useState(false);
  const [viewMode, setViewMode] =
    useState<PermissionProfileViewMode>("grouped");
  const profilesQuery = usePermissionProfilesQuery(
    {
      role: selectedRole || undefined,
      start: (doctypePage - 1) * ADMIN_TABLE_PAGE_SIZE,
      pageLength: ADMIN_TABLE_PAGE_SIZE,
      viewMode,
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
    if (isSaving && draft?.role === selectedProfile.role) return draft;
    return cloneProfile(selectedProfile);
  }, [draft, isSaving, selectedProfile]);

  const totalDoctypes =
    profilesQuery.data?.total ?? activeDraft?.applicableDoctypes.length ?? 0;
  const doctypeTotalPages = Math.max(
    1,
    Math.ceil(totalDoctypes / ADMIN_TABLE_PAGE_SIZE),
  );

  const persistProfileChange = (
    change: (current: PermissionProfile) => PermissionProfile,
  ) => {
    if (!activeDraft || updateMutation.isPending) return;

    const previousProfile = cloneProfile(activeDraft);
    const nextProfile = change(previousProfile);

    setDraft(nextProfile);
    setIsSaving(true);

    void updateMutation
      .mutateAsync({
        role: nextProfile.role,
        rowScope: nextProfile.rowScope,
        deleteRequiresOwnership: nextProfile.deleteRequiresOwnership,
        applicableDoctypes: nextProfile.applicableDoctypes,
        replaceApplicableDoctypes: false,
        viewMode,
      })
      .then(() => {
        setIsSaving(false);
      })
      .catch((error) => {
        setDraft(previousProfile);
        setIsSaving(false);
        toast.error(errorMessage(error));
      });
  };

  const handleViewModeChange = (value: string) => {
    if (isSaving || updateMutation.isPending) return;
    const nextViewMode = value as PermissionProfileViewMode;
    if (nextViewMode === viewMode) return;
    setViewMode(nextViewMode);
    setDoctypePage(1);
    setDraft(null);
    setIsSaving(false);
  };

  const updatePermission = (
    documentType: string,
    permission: PermissionFlag,
    checked: boolean,
  ) => {
    persistProfileChange((current) => ({
      ...current,
      applicableDoctypes: current.applicableDoctypes.map((row) =>
        row.documentType === documentType
          ? { ...row, [permission]: checked }
          : row,
      ),
    }));
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
                setIsSaving(false);
              }}
              isDisabled={updateMutation.isPending || isSaving}
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
              Phạm vi dữ liệu
            </label>
            <Select
              value={activeDraft.rowScope}
              onChange={(value) =>
                persistProfileChange((current) => ({
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

          <div className="w-full sm:w-72">
            <label
              htmlFor="permission-profile-delete-policy"
              className="mb-1.5 block text-xs font-semibold text-text-secondary"
            >
              Quyền xóa
            </label>
            <Select
              value={activeDraft.deleteRequiresOwnership ? "owner" : "role"}
              onChange={(value) =>
                persistProfileChange((current) => ({
                  ...current,
                  deleteRequiresOwnership: String(value) === "owner",
                }))
              }
              isDisabled={updateMutation.isPending}
              aria-label="Chọn chính sách xóa"
            >
              <SelectTrigger
                id="permission-profile-delete-policy"
                size="sm"
                className="w-full"
              >
                <SelectValue />
                <SelectIndicator />
              </SelectTrigger>
              <SelectContent>
                {DELETE_POLICY_OPTIONS.map((option) => (
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
        </div>

        <AdminTabRoot
          defaultValue="grouped"
          value={viewMode}
          onValueChange={handleViewModeChange}
          className="w-fit min-w-0 !rounded-lg !border !border-card-border !bg-background-gray-secondary !p-1 [&>div]:!border-0 [&>div]:!p-0 [&>div>div]:!w-auto"
        >
          <AdminTabList className="!gap-0">
            <TabTrigger
              value="grouped"
              disabled={updateMutation.isPending || isSaving}
              className="!rounded-md !px-3 !py-1.5 !text-text-secondary transition-colors duration-150 hover:bg-background-gray-secondary_alt focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-primary-500 data-[active=true]:!border-0 data-[active=true]:!bg-card-background data-[active=true]:!text-neutral-brand-color data-[active=true]:!shadow-xs"
            >
              Nhóm nghiệp vụ
            </TabTrigger>
            <TabTrigger
              value="detailed"
              disabled={updateMutation.isPending || isSaving}
              className="!rounded-md !px-3 !py-1.5 !text-text-secondary transition-colors duration-150 hover:bg-background-gray-secondary_alt focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-primary-500 data-[active=true]:!border-0 data-[active=true]:!bg-card-background data-[active=true]:!text-neutral-brand-color data-[active=true]:!shadow-xs"
            >
              Chi tiết DocType
            </TabTrigger>
          </AdminTabList>
        </AdminTabRoot>
      </div>

      <div className="overflow-x-auto">
        <AdminTableRoot
          aria-label={`Ma trận quyền hạn vai trò ${activeDraft.role}`}
          className="min-w-[780px]"
        >
          <AdminTableHeader>
            <AdminTableRow>
              <AdminTableHead scope="col" className="w-12 text-center">
                STT
              </AdminTableHead>
              <AdminTableHead scope="col">
                {viewMode === "detailed" ? "DocType" : "Đối tượng"}
              </AdminTableHead>
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
                viewMode={viewMode}
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
        isDisabled={updateMutation.isPending || isSaving}
      />
    </AdminTableFrame>
  );
}

interface PermissionMatrixRowProps {
  row: PermissionProfileDoctype;
  viewMode: PermissionProfileViewMode;
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
  viewMode,
  index,
  disabled,
  onChange,
}: PermissionMatrixRowProps) {
  const groupedLabel =
    row.label ??
    FALLBACK_PERMISSION_LABELS[row.documentType] ??
    row.documentType;
  const label = viewMode === "detailed" ? row.documentType : groupedLabel;
  const description =
    viewMode === "detailed" && row.groupLabel
      ? `Nhóm: ${row.groupLabel}`
      : row.description;

  return (
    <AdminTableRow>
      <AdminTableCell className="text-center text-text-tertiary">
        {index + 1}
      </AdminTableCell>
      <AdminTableCell className="font-medium">
        <div className="min-w-52">
          <p>{label}</p>
          {description ? (
            <p className="mt-0.5 text-xs font-normal text-text-tertiary">
              {description}
            </p>
          ) : null}
        </div>
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
