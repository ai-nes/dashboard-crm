"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";

import AdminPageHeader from "@/components/common/admin/admin-page-header";
import {
  AdminTabContent,
  AdminTabList,
  AdminTabRoot,
} from "@/components/common/admin/admin-tabs";
import { AdminTableFrame } from "@/components/common/admin/admin-table";
import { useAuth } from "@/components/common/auth/auth-provider";
import { hasCrmRole, hasTechnicalRole } from "@/components/common/auth/rbac";
import { Button } from "@/components/tailgrids/core/button";
import { TabTrigger } from "@/components/tailgrids/core/tabs";
import { useGovernedValuesQuery } from "@/hooks/use-admin-catalog-queries";
import {
  useCreateCrmUserMutation,
  useCrmUsersQuery,
  useRemoveUserMutation,
  useUpdateCrmUserProfileMutation,
  useUpdateUserRoleMutation,
} from "@/hooks/use-user-management-queries";
import type { CrmUser } from "@/services/api/user-management";
import { UserManagementApiError } from "@/services/api/user-management";

import RemoveUserConfirmDialog from "./remove-user-confirm-dialog";
import UserFormDialog from "./user-form-dialog";
import UserPermissionPanel from "./user-permission-panel";
import UserSearchFilterBar from "./user-search-filter-bar";
import UsersTable from "./users-table";

const USERS_PAGE_SIZE = 8;

function errorMessage(error: unknown): string {
  if (error instanceof UserManagementApiError) return error.message;
  if (error instanceof Error) return error.message;
  return "Đã có lỗi xảy ra. Vui lòng thử lại.";
}

export default function UserManagementAdminPage() {
  const { user } = useAuth();
  const canManageUsers =
    hasTechnicalRole(user?.roles, "System Manager") ||
    hasCrmRole(user?.roles, "Administrator");

  const [activeTab, setActiveTab] = useState("users");
  const [search, setSearch] = useState("");
  const [role, setRole] = useState("all");
  const [page, setPage] = useState(1);
  const [userToRemove, setUserToRemove] = useState<CrmUser | null>(null);
  const [userFormTarget, setUserFormTarget] = useState<CrmUser | null>(null);
  const [isUserFormOpen, setIsUserFormOpen] = useState(false);

  const usersQuery = useCrmUsersQuery({
    search,
    role,
    start: (page - 1) * USERS_PAGE_SIZE,
    pageLength: USERS_PAGE_SIZE,
  });
  const updateRoleMutation = useUpdateUserRoleMutation();
  const removeUserMutation = useRemoveUserMutation();
  const createUserMutation = useCreateCrmUserMutation();
  const updateUserProfileMutation = useUpdateCrmUserProfileMutation();
  const updateCampusMutation = useUpdateCrmUserProfileMutation();
  const campusesQuery = useGovernedValuesQuery("CRM Campus", {
    pageLength: 100,
    enabled: canManageUsers,
  });
  const campusOptions = useMemo(
    () =>
      campusesQuery.data?.records.flatMap((campus) =>
        campus.id
          ? [{ id: campus.id, name: campus.campus_name ?? campus.name }]
          : [],
      ) ?? [],
    [campusesQuery.data],
  );

  const allUsers = useMemo(
    () => usersQuery.data?.crmUsers ?? [],
    [usersQuery.data?.crmUsers],
  );
  const users = allUsers;
  const totalUsers = usersQuery.data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalUsers / USERS_PAGE_SIZE));

  const isMutating =
    updateRoleMutation.isPending ||
    removeUserMutation.isPending ||
    updateCampusMutation.isPending;

  const handleChangeCampus = async (
    targetUser: CrmUser,
    campusId: string | null,
  ) => {
    if (!canManageUsers || (targetUser.campus?.id ?? null) === campusId) return;
    try {
      await updateCampusMutation.mutateAsync({
        user: targetUser.name,
        campusId,
      });
      toast.success(`Đã cập nhật Campus của ${targetUser.fullName}.`);
    } catch (error) {
      toast.error(errorMessage(error));
    }
  };

  const handleChangeRole = async (targetUser: CrmUser, newRole: string) => {
    if (targetUser.role === newRole) return;
    try {
      await updateRoleMutation.mutateAsync({ user: targetUser.name, newRole });
      toast.success(`${targetUser.fullName} đã được cấp vai trò ${newRole}.`);
    } catch (error) {
      toast.error(errorMessage(error));
    }
  };

  const handleConfirmRemove = async () => {
    if (!userToRemove) return;
    try {
      await removeUserMutation.mutateAsync({ user: userToRemove.name });
      toast.success(`Đã gỡ ${userToRemove.fullName} khỏi CRM.`);
      setUserToRemove(null);
    } catch (error) {
      toast.error(errorMessage(error));
    }
  };

  const openCreateUser = () => {
    setUserFormTarget(null);
    setIsUserFormOpen(true);
  };

  const openEditUser = (targetUser: CrmUser) => {
    setUserFormTarget(targetUser);
    setIsUserFormOpen(true);
  };

  const handleCreateUser = async (fields: {
    email: string;
    fullName: string;
    password: string;
    role: string;
  }) => {
    await createUserMutation.mutateAsync(fields);
    toast.success(`Đã tạo người dùng ${fields.fullName}.`);
    setIsUserFormOpen(false);
  };

  const handleUpdateUser = async (fields: {
    fullName: string;
    newPassword: string;
  }) => {
    if (!userFormTarget) return;
    await updateUserProfileMutation.mutateAsync({
      user: userFormTarget.name,
      fullName: fields.fullName,
      newPassword: fields.newPassword || undefined,
    });
    toast.success(`Đã cập nhật ${fields.fullName}.`);
    setIsUserFormOpen(false);
  };

  return (
    <main
      id="main-content"
      className="flex h-full min-h-0 min-w-0 flex-col gap-2 overflow-hidden px-2 pt-4 lg:px-6"
    >
      <AdminPageHeader
        section="Người dùng"
        title="Quản lý người dùng CRM"
        description="Quản lý quyền truy cập CRM."
        canEdit={canManageUsers}
        actions={
          canManageUsers ? (
            <Button size="sm" onPress={openCreateUser}>
              Thêm người dùng
            </Button>
          ) : null
        }
        metaLabel="Tài khoản CRM"
        metaValue={
          <>
            <span className="font-semibold text-text-primary">
              {totalUsers}
            </span>{" "}
            người dùng
          </>
        }
      />

      <AdminTabRoot
        defaultValue="users"
        value={activeTab}
        onValueChange={setActiveTab}
        className="flex min-h-0 flex-1 flex-col overflow-hidden"
      >
        <AdminTabList>
          <TabTrigger value="users">Người dùng</TabTrigger>
          <TabTrigger value="permissions">Quyền hạn</TabTrigger>
        </AdminTabList>

        <AdminTabContent
          value="users"
          className="min-h-0 flex-1 space-y-4 overflow-y-auto px-0"
        >
          {usersQuery.error ? (
            <section
              className="rounded-xl border border-alert-danger-border bg-alert-danger-background p-4"
              role="alert"
            >
              <p className="text-sm font-medium text-alert-danger-title">
                Không tải được danh sách người dùng.
              </p>
              <p className="mt-1 text-sm text-alert-danger-description">
                {errorMessage(usersQuery.error)}
              </p>
              <button
                type="button"
                className="mt-3 text-sm font-semibold text-primary-500 hover:underline"
                onClick={() => void usersQuery.refetch()}
              >
                Thử lại
              </button>
            </section>
          ) : (
            <AdminTableFrame>
              <UserSearchFilterBar
                search={search}
                onSearchChange={(value) => {
                  setSearch(value);
                  setPage(1);
                }}
                role={role}
                onRoleChange={(value) => {
                  setRole(value);
                  setPage(1);
                }}
              />
              <UsersTable
                users={users}
                total={totalUsers}
                isLoading={usersQuery.isPending}
                canManageUsers={canManageUsers}
                isMutating={isMutating}
                campusOptions={campusOptions}
                isCampusLoading={
                  campusesQuery.isPending || campusesQuery.isError
                }
                onChangeCampus={handleChangeCampus}
                onChangeRole={handleChangeRole}
                onEdit={openEditUser}
                onRemove={setUserToRemove}
                currentPage={page}
                totalPages={totalPages}
                onPageChange={setPage}
              />
              {canManageUsers && campusesQuery.isError ? (
                <div
                  role="alert"
                  className="flex items-center gap-2 px-5 py-3 text-sm text-text-secondary"
                >
                  Không tải được danh sách Campus.
                  <Button
                    size="sm"
                    variant="ghost"
                    appearance="ghost"
                    onPress={() => void campusesQuery.refetch()}
                  >
                    Thử lại
                  </Button>
                </div>
              ) : null}
            </AdminTableFrame>
          )}
        </AdminTabContent>

        <AdminTabContent
          value="permissions"
          className="min-h-0 flex-1 overflow-y-auto px-0"
        >
          <UserPermissionPanel canEdit={canManageUsers} />
        </AdminTabContent>
      </AdminTabRoot>

      <RemoveUserConfirmDialog
        isOpen={Boolean(userToRemove)}
        targetLabel={userToRemove?.fullName ?? "người dùng này"}
        isRemoving={removeUserMutation.isPending}
        onOpenChange={(open) => {
          if (!open && !removeUserMutation.isPending) setUserToRemove(null);
        }}
        onConfirm={handleConfirmRemove}
      />

      <UserFormDialog
        key={userFormTarget?.name ?? "create"}
        isOpen={isUserFormOpen}
        user={userFormTarget}
        isSubmitting={
          createUserMutation.isPending || updateUserProfileMutation.isPending
        }
        onOpenChange={setIsUserFormOpen}
        onCreate={handleCreateUser}
        onUpdate={handleUpdateUser}
      />
    </main>
  );
}
