"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";

import AdminPageHeader from "@/components/common/admin/admin-page-header";
import { useAuth } from "@/components/common/auth/auth-provider";
import {
  hasCrmRole,
  hasFrappeTechnicalRole,
} from "@/components/common/auth/rbac";
import { Button } from "@/components/tailgrids/core/button";
import {
  TabContent,
  TabList,
  TabRoot,
  TabTrigger,
} from "@/components/tailgrids/core/tabs";
import {
  useCreateCrmUserMutation,
  useCrmUsersQuery,
  useRemoveUserMutation,
  useUpdateCrmUserProfileMutation,
  useUpdateUserCapacityMutation,
  useUpdateUserRoleMutation,
} from "@/hooks/use-user-management-queries";
import type { CrmUser } from "@/services/api/user-management";
import { UserManagementApiError } from "@/services/api/user-management";

import BulkActionResultDialog, {
  type BulkActionResultRow,
} from "./bulk-action-result-dialog";
import BulkActionsToolbar from "./bulk-actions-toolbar";
import RemoveUserConfirmDialog from "./remove-user-confirm-dialog";
import UserFormDialog from "./user-form-dialog";
import { isUserSelectable } from "./users-table";
import UserRoleLogPanel from "./user-role-log-panel";
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
    hasFrappeTechnicalRole(user?.roles, "System Manager") ||
    hasCrmRole(user?.roles, "Administrator");

  const [activeTab, setActiveTab] = useState("users");
  const [search, setSearch] = useState("");
  const [role, setRole] = useState("all");
  const [page, setPage] = useState(1);
  const [userToRemove, setUserToRemove] = useState<CrmUser | null>(null);
  const [bulkUserToRemove, setBulkUserToRemove] = useState(false);
  const [selectedUserIds, setSelectedUserIds] = useState<Set<string>>(
    new Set(),
  );
  const [bulkResults, setBulkResults] = useState<BulkActionResultRow[] | null>(
    null,
  );
  const [isBulkRunning, setIsBulkRunning] = useState(false);
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
  const updateUserCapacityMutation = useUpdateUserCapacityMutation();

  const allUsers = useMemo(
    () => usersQuery.data?.crmUsers ?? [],
    [usersQuery.data?.crmUsers],
  );
  const users = allUsers;
  const totalUsers = usersQuery.data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalUsers / USERS_PAGE_SIZE));

  const selectedUsers = useMemo(
    () => allUsers.filter((u) => selectedUserIds.has(u.name)),
    [allUsers, selectedUserIds],
  );

  const isMutating =
    updateRoleMutation.isPending ||
    removeUserMutation.isPending ||
    isBulkRunning;

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

  const handleToggleUser = (targetUser: CrmUser, checked: boolean) => {
    setSelectedUserIds((prev) => {
      const next = new Set(prev);
      if (checked) next.add(targetUser.name);
      else next.delete(targetUser.name);
      return next;
    });
  };

  const handleToggleAll = (checked: boolean) => {
    setSelectedUserIds(() => {
      if (!checked) return new Set();
      return new Set(users.filter(isUserSelectable).map((u) => u.name));
    });
  };

  const runBulkAction = async (
    action: (targetUser: CrmUser) => Promise<void>,
  ) => {
    setIsBulkRunning(true);
    const targets = selectedUsers;
    const settled = await Promise.allSettled(
      targets.map((targetUser) => action(targetUser)),
    );
    const rows: BulkActionResultRow[] = settled.map((result, index) => ({
      userName: targets[index].name,
      fullName: targets[index].fullName,
      success: result.status === "fulfilled",
      message:
        result.status === "rejected" ? errorMessage(result.reason) : undefined,
    }));
    setIsBulkRunning(false);
    setSelectedUserIds(new Set());
    setBulkResults(rows);
  };

  const handleBulkChangeRole = (newRole: string) => {
    void runBulkAction((targetUser) =>
      updateRoleMutation.mutateAsync({ user: targetUser.name, newRole }),
    );
  };

  const handleBulkRemove = async () => {
    setBulkUserToRemove(false);
    await runBulkAction((targetUser) =>
      removeUserMutation.mutateAsync({ user: targetUser.name }),
    );
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
    capacity: number | null;
  }) => {
    if (!userFormTarget) return;
    await updateUserProfileMutation.mutateAsync({
      user: userFormTarget.name,
      fullName: fields.fullName,
      newPassword: fields.newPassword || undefined,
    });
    if (
      fields.capacity != null &&
      fields.capacity !== userFormTarget.capacity?.limit
    ) {
      await updateUserCapacityMutation.mutateAsync({
        user: userFormTarget.name,
        maxActiveStudents: fields.capacity,
      });
    }
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

      <TabRoot
        defaultValue="users"
        value={activeTab}
        onValueChange={setActiveTab}
        variant="minimal"
        className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-none border-0 bg-transparent"
      >
        <TabList className="px-1 sm:px-2">
          <TabTrigger value="users">Người dùng</TabTrigger>
          <TabTrigger value="logs">Lịch sử thay đổi</TabTrigger>
        </TabList>

        <TabContent
          value="users"
          className="min-h-0 flex-1 space-y-4 overflow-y-auto px-0 pt-5 pb-8"
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
            <section className="overflow-hidden rounded-2xl border border-card-border bg-card-background shadow-xs">
              <UserSearchFilterBar
                search={search}
                onSearchChange={(value) => {
                  setSearch(value);
                  setPage(1);
                  setSelectedUserIds(new Set());
                }}
                role={role}
                onRoleChange={(value) => {
                  setRole(value);
                  setPage(1);
                  setSelectedUserIds(new Set());
                }}
              />
              {canManageUsers ? (
                <BulkActionsToolbar
                  selectedCount={selectedUserIds.size}
                  isBusy={isMutating}
                  onChangeRole={handleBulkChangeRole}
                  onRemove={() => setBulkUserToRemove(true)}
                  onClearSelection={() => setSelectedUserIds(new Set())}
                />
              ) : null}
              <UsersTable
                users={users}
                total={totalUsers}
                isLoading={usersQuery.isPending}
                canManageUsers={canManageUsers}
                isMutating={isMutating}
                selectedUserIds={selectedUserIds}
                onToggleUser={handleToggleUser}
                onToggleAll={handleToggleAll}
                onChangeRole={handleChangeRole}
                onEdit={openEditUser}
                onRemove={setUserToRemove}
                currentPage={page}
                totalPages={totalPages}
                onPageChange={(nextPage) => {
                  setPage(nextPage);
                  setSelectedUserIds(new Set());
                }}
              />
            </section>
          )}
        </TabContent>

        <TabContent
          value="logs"
          className="min-h-0 flex-1 overflow-y-auto px-0 pt-5 pb-8"
        >
          <UserRoleLogPanel />
        </TabContent>
      </TabRoot>

      <RemoveUserConfirmDialog
        isOpen={Boolean(userToRemove)}
        targetLabel={userToRemove?.fullName ?? "người dùng này"}
        isRemoving={removeUserMutation.isPending}
        onOpenChange={(open) => {
          if (!open && !removeUserMutation.isPending) setUserToRemove(null);
        }}
        onConfirm={handleConfirmRemove}
      />

      <RemoveUserConfirmDialog
        isOpen={bulkUserToRemove}
        targetLabel={`${selectedUserIds.size} người dùng`}
        isRemoving={isBulkRunning}
        onOpenChange={(open) => {
          if (!open && !isBulkRunning) setBulkUserToRemove(false);
        }}
        onConfirm={handleBulkRemove}
      />

      <BulkActionResultDialog
        results={bulkResults}
        onClose={() => setBulkResults(null)}
      />

      <UserFormDialog
        key={userFormTarget?.name ?? "create"}
        isOpen={isUserFormOpen}
        user={userFormTarget}
        isSubmitting={
          createUserMutation.isPending ||
          updateUserProfileMutation.isPending ||
          updateUserCapacityMutation.isPending
        }
        onOpenChange={setIsUserFormOpen}
        onCreate={handleCreateUser}
        onUpdate={handleUpdateUser}
      />
    </main>
  );
}
