"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";

import { useAuth } from "@/components/common/auth/auth-provider";
import { hasCrmRole, hasFrappeTechnicalRole } from "@/components/common/auth/rbac";
import { Badge } from "@/components/tailgrids/core/badge";
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
  useUpdateUserRoleMutation,
} from "@/hooks/use-user-management-queries";
import type { CrmUser } from "@/services/api/user-management";
import { UserManagementApiError } from "@/services/api/user-management";

import BulkActionResultDialog, { type BulkActionResultRow } from "./bulk-action-result-dialog";
import BulkActionsToolbar from "./bulk-actions-toolbar";
import RemoveUserConfirmDialog from "./remove-user-confirm-dialog";
import UserFormDialog from "./user-form-dialog";
import { isUserSelectable } from "./users-table";
import UserRoleLogPanel from "./user-role-log-panel";
import UserSearchFilterBar from "./user-search-filter-bar";
import UsersTable from "./users-table";

const normalizeSearch = (value: string) =>
  value
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase();

function errorMessage(error: unknown): string {
  if (error instanceof UserManagementApiError) return error.message;
  if (error instanceof Error) return error.message;
  return "Đã có lỗi xảy ra. Vui lòng thử lại.";
}

export default function UserManagementAdminPage() {
  const { user } = useAuth();
  const canManageUsers =
    hasFrappeTechnicalRole(user?.roles, "System Manager") || hasCrmRole(user?.roles, "Administrator");

  const [activeTab, setActiveTab] = useState("users");
  const [search, setSearch] = useState("");
  const [role, setRole] = useState("all");
  const [userToRemove, setUserToRemove] = useState<CrmUser | null>(null);
  const [bulkUserToRemove, setBulkUserToRemove] = useState(false);
  const [selectedUserIds, setSelectedUserIds] = useState<Set<string>>(new Set());
  const [bulkResults, setBulkResults] = useState<BulkActionResultRow[] | null>(null);
  const [isBulkRunning, setIsBulkRunning] = useState(false);
  const [userFormTarget, setUserFormTarget] = useState<CrmUser | null>(null);
  const [isUserFormOpen, setIsUserFormOpen] = useState(false);

  const usersQuery = useCrmUsersQuery();
  const updateRoleMutation = useUpdateUserRoleMutation();
  const removeUserMutation = useRemoveUserMutation();
  const createUserMutation = useCreateCrmUserMutation();
  const updateUserProfileMutation = useUpdateCrmUserProfileMutation();

  const allUsers = useMemo(
    () => usersQuery.data?.crmUsers.filter((u) => u.name !== "Administrator") ?? [],
    [usersQuery.data?.crmUsers],
  );

  const users = useMemo(() => {
    const query = normalizeSearch(search.trim());
    return allUsers
      .filter((u) => role === "all" || u.role === role)
      .filter((u) => !query || normalizeSearch(`${u.fullName} ${u.email}`).includes(query));
  }, [allUsers, role, search]);

  const selectedUsers = useMemo(
    () => allUsers.filter((u) => selectedUserIds.has(u.name)),
    [allUsers, selectedUserIds],
  );

  const isMutating = updateRoleMutation.isPending || removeUserMutation.isPending || isBulkRunning;

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

  const runBulkAction = async (action: (targetUser: CrmUser) => Promise<void>) => {
    setIsBulkRunning(true);
    const targets = selectedUsers;
    const settled = await Promise.allSettled(targets.map((targetUser) => action(targetUser)));
    const rows: BulkActionResultRow[] = settled.map((result, index) => ({
      userName: targets[index].name,
      fullName: targets[index].fullName,
      success: result.status === "fulfilled",
      message: result.status === "rejected" ? errorMessage(result.reason) : undefined,
    }));
    setIsBulkRunning(false);
    setSelectedUserIds(new Set());
    setBulkResults(rows);
  };

  const handleBulkChangeRole = (newRole: string) => {
    void runBulkAction((targetUser) => updateRoleMutation.mutateAsync({ user: targetUser.name, newRole }));
  };

  const handleBulkRemove = async () => {
    setBulkUserToRemove(false);
    await runBulkAction((targetUser) => removeUserMutation.mutateAsync({ user: targetUser.name }));
  };

  const openCreateUser = () => {
    setUserFormTarget(null);
    setIsUserFormOpen(true);
  };

  const openEditUser = (targetUser: CrmUser) => {
    setUserFormTarget(targetUser);
    setIsUserFormOpen(true);
  };

  const handleCreateUser = async (fields: { email: string; fullName: string; password: string; role: string }) => {
    await createUserMutation.mutateAsync(fields);
    toast.success(`Đã tạo người dùng ${fields.fullName}.`);
    setIsUserFormOpen(false);
  };

  const handleUpdateUser = async (fields: { fullName: string; newPassword: string }) => {
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
    <main id="main-content" className="flex h-full min-h-0 min-w-0 flex-col gap-2 overflow-hidden px-2 pt-4 lg:px-6">
      <header className="relative isolate shrink-0 overflow-hidden rounded-2xl border border-card-border bg-card-background px-5 py-5 shadow-xs sm:px-6 lg:px-7 lg:py-6">
        <div className="pointer-events-none absolute -top-24 -right-8 -z-10 size-72 rounded-full bg-primary-50/70 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-28 left-1/3 -z-10 size-60 rounded-full bg-badge-sky-background/50 blur-3xl" />
        <div className="flex flex-wrap items-center justify-between gap-2.5">
          <div className="flex flex-wrap items-center gap-2.5">
            <Badge color="primary">QUẢN LÝ NGƯỜI DÙNG</Badge>
            <span className="text-xs text-text-tertiary">Cấu hình tuyển sinh</span>
          </div>
          {canManageUsers ? (
            <Button size="sm" onPress={openCreateUser}>
              Thêm người dùng
            </Button>
          ) : null}
        </div>
        <h1 className="mt-4 text-balance text-[26px] leading-8 font-semibold tracking-[-0.5px] text-text-primary sm:text-[30px]">
          Quản lý người dùng CRM
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-text-secondary">
          Xem danh sách người dùng CRM, thay đổi vai trò hoặc gỡ quyền truy cập.
        </p>
      </header>

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

        <TabContent value="users" className="min-h-0 flex-1 space-y-4 overflow-y-auto px-0 pt-5 pb-8">
          {usersQuery.error ? (
            <section className="rounded-xl border border-alert-danger-border bg-alert-danger-background p-4" role="alert">
              <p className="text-sm font-medium text-alert-danger-title">Không tải được danh sách người dùng.</p>
              <p className="mt-1 text-sm text-alert-danger-description">{errorMessage(usersQuery.error)}</p>
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
              <UserSearchFilterBar search={search} onSearchChange={setSearch} role={role} onRoleChange={setRole} />
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
                total={allUsers.length}
                isLoading={usersQuery.isPending}
                canManageUsers={canManageUsers}
                isMutating={isMutating}
                selectedUserIds={selectedUserIds}
                onToggleUser={handleToggleUser}
                onToggleAll={handleToggleAll}
                onChangeRole={handleChangeRole}
                onEdit={openEditUser}
                onRemove={setUserToRemove}
              />
            </section>
          )}
        </TabContent>

        <TabContent value="logs" className="min-h-0 flex-1 overflow-y-auto px-0 pt-5 pb-8">
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

      <BulkActionResultDialog results={bulkResults} onClose={() => setBulkResults(null)} />

      <UserFormDialog
        key={userFormTarget?.name ?? "create"}
        isOpen={isUserFormOpen}
        user={userFormTarget}
        isSubmitting={createUserMutation.isPending || updateUserProfileMutation.isPending}
        onOpenChange={setIsUserFormOpen}
        onCreate={handleCreateUser}
        onUpdate={handleUpdateUser}
      />
    </main>
  );
}
