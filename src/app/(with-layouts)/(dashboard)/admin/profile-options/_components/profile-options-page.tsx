"use client";

import { useDeferredValue, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useAuth } from "@/components/common/auth/auth-provider";
import {
  canReadCrmPath,
  getCrmDoctypePermissions,
} from "@/components/common/auth/permissions";
import AdminPageHeader from "@/components/common/admin/admin-page-header";
import { Button } from "@/components/tailgrids/core/button";
import { AdminSearchInput } from "@/components/common/admin/admin-search-input";
import { DropdownField } from "@/components/common/dropdown-field";
import {
  TabRoot,
  TabList,
  TabTrigger,
  TabContent,
} from "@/components/tailgrids/core/tabs";
import { Skeleton } from "@/components/tailgrids/core/skeleton";
import { PROFILE_OPTIONS_QUERY_KEY } from "@/hooks/use-profile-options";
import {
  PROFILE_OPTION_LABELS,
  listProfileOptions,
  getAllProfileOptions,
  saveProfileOptionsOrder,
  saveProfileOption,
  deleteProfileOption,
  type ProfileOption,
  type ProfileOptionInput,
  type ProfileOptionType,
} from "@/services/api/profile-options";
import { ADMIN_TABLE_PAGE_SIZE } from "@/components/common/admin/admin-table";
import { CatalogOrderingPanel } from "@/components/segments/catalog-ordering-panel";
import ProfileOptionDialog from "./profile-option-dialog";
import ProfileOptionsPageSkeleton from "./profile-options-skeleton";
import ProfileOptionsTable from "./profile-options-table";
import { profileOptionChanges } from "./profile-option-form-model";

export default function ProfileOptionsPage() {
  const { user, isLoading } = useAuth();
  if (isLoading) return <ProfileOptionsPageSkeleton />;
  if (!canReadCrmPath("/admin/profile-options", user))
    return (
      <p role="alert" className="p-6 text-text-secondary">
        Chỉ quản trị viên được truy cập cấu hình danh mục hồ sơ.
      </p>
    );
  return <ProfileOptionsWorkspace />;
}

function ProfileOptionsWorkspace() {
  const { user } = useAuth();
  const permissions = getCrmDoctypePermissions(user, "CRM Profile Option");
  const queryClient = useQueryClient();
  const [type, setType] = useState<ProfileOptionType>("nationality");
  const [search, setSearch] = useState("");
  const q = useDeferredValue(search);
  const [status, setStatus] = useState<"" | "true" | "false">("");
  const [page, setPage] = useState(1);
  const [isOrdering, setIsOrdering] = useState(false);
  const [editor, setEditor] = useState<ProfileOption | null | undefined>(
    undefined,
  );
  const [deleting, setDeleting] = useState<ProfileOption | null>(null);
  const query = useQuery({
    queryKey: [
      ...PROFILE_OPTIONS_QUERY_KEY,
      user?.user,
      "admin",
      type,
      q,
      status,
      page,
    ],
    queryFn: ({ signal }) =>
      listProfileOptions(
        {
          type,
          q,
          isActive: status || undefined,
          page,
          pageSize: ADMIN_TABLE_PAGE_SIZE,
        },
        signal,
      ),
    enabled: permissions.canRead,
    retry: false,
  });
  const mutation = useMutation({
    mutationFn: async (
      action:
        | { kind: "save"; input: ProfileOptionInput }
        | { kind: "update"; input: Partial<ProfileOptionInput>; id: string }
        | { kind: "delete"; id: string },
    ) =>
      action.kind === "update"
        ? saveProfileOption(action.input, action.id)
        : action.kind === "save"
          ? saveProfileOption(action.input)
          : deleteProfileOption(action.id),
    onSuccess: async (_result, action) => {
      setEditor(undefined);
      setDeleting(null);
      if (action.kind === "delete" && query.data?.data.length === 1 && page > 1)
        setPage((current) => current - 1);
      await queryClient.invalidateQueries({
        queryKey: PROFILE_OPTIONS_QUERY_KEY,
      });
      toast.success("Đã cập nhật danh mục hồ sơ.");
    },
    onError: (error: Error) => toast.error(error.message),
  });
  const orderingQuery = useQuery({
    queryKey: [...PROFILE_OPTIONS_QUERY_KEY, user?.user, "ordering", type],
    queryFn: ({ signal }) => getAllProfileOptions(type, signal),
    enabled: isOrdering && permissions.canUpdate,
    retry: false,
    staleTime: 0,
  });
  const orderMutation = useMutation({
    mutationFn: saveProfileOptionsOrder,
    onSuccess: () => {
      setIsOrdering(false);
      setPage(1);
      toast.success("Đã lưu thứ tự hiển thị.");
    },
    onError: (error: Error) =>
      toast.error(
        `Chưa lưu được toàn bộ thứ tự. Vui lòng thử lưu lại. ${error.message}`,
      ),
    onSettled: () =>
      queryClient.invalidateQueries({ queryKey: PROFILE_OPTIONS_QUERY_KEY }),
  });
  const busy = mutation.isPending || orderMutation.isPending;
  const total = query.data?.meta.pagination.total ?? 0;
  return (
    <main className="space-y-5 p-4 sm:p-6">
      <AdminPageHeader
        section="Cấu hình hệ thống"
        title="Danh mục hồ sơ"
        description="Quản lý lựa chọn dùng chung cho quốc tịch, dân tộc, tôn giáo và nơi cấp giấy tờ."
        actions={
          permissions.canCreate && (
            <Button
              size="sm"
              onPress={() => {
                setDeleting(null);
                setEditor(null);
              }}
              isDisabled={busy || isOrdering}
            >
              Thêm danh mục
            </Button>
          )
        }
      />
      <TabRoot
        defaultValue="nationality"
        value={type}
        onValueChange={(next) => {
          setIsOrdering(false);
          setType(next as ProfileOptionType);
          setPage(1);
          setSearch("");
          setEditor(undefined);
          setDeleting(null);
        }}
        variant="minimal"
        className="border-0 p-0"
      >
        <TabList className="overflow-x-auto">
          {Object.entries(PROFILE_OPTION_LABELS).map(([key, label]) => (
            <TabTrigger key={key} value={key} disabled={busy}>
              {label}
            </TabTrigger>
          ))}
        </TabList>
        <TabContent value={type} className="space-y-4 px-0">
          <div className="flex flex-wrap items-center gap-3">
            <AdminSearchInput
              inputClassName="h-full py-0"
              aria-label="Tìm danh mục"
              placeholder="Tìm theo mã hoặc tên…"
              disabled={isOrdering}
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setPage(1);
              }}
              className="w-full sm:w-80"
            />
            <DropdownField
              isDisabled={isOrdering}
              ariaLabel="Lọc trạng thái"
              className="w-44"
              options={[
                { id: "", label: "Tất cả trạng thái" },
                { id: "true", label: "Đang dùng" },
                { id: "false", label: "Ngừng sử dụng" },
              ]}
              value={status}
              onChange={(value) => {
                setStatus((value ?? "") as typeof status);
                setPage(1);
              }}
            />
            {permissions.canUpdate && (
              <Button
                size="sm"
                appearance="outline"
                isDisabled={
                  busy || isOrdering || !!search.trim() || status !== ""
                }
                onPress={() => {
                  setEditor(undefined);
                  setDeleting(null);
                  setIsOrdering(true);
                }}
              >
                Sắp xếp
              </Button>
            )}
            <div className="ml-auto shrink-0 text-right">
              {query.isPending ? (
                <Skeleton className="h-4 w-20" />
              ) : (
                <p className="text-sm text-text-tertiary">{total} danh mục</p>
              )}
            </div>
          </div>
          {editor !== undefined &&
            (editor ? permissions.canUpdate : permissions.canCreate) && (
              <ProfileOptionDialog
                key={editor?.id ?? `new-${type}`}
                type={type}
                initial={editor}
                busy={busy}
                onClose={() => setEditor(undefined)}
                onSave={(input) => {
                  if (!editor) {
                    mutation.mutate({ kind: "save", input });
                    return;
                  }
                  const changes = profileOptionChanges(input, editor);
                  if (Object.keys(changes).length === 0) {
                    setEditor(undefined);
                    return;
                  }
                  mutation.mutate({
                    kind: "update",
                    input: changes,
                    id: editor.id,
                  });
                }}
              />
            )}
          {deleting && permissions.canDelete && (
            <div
              role="alert"
              className="flex flex-wrap items-center gap-3 rounded-lg border border-card-border p-4"
            >
              <p className="flex-1 text-sm text-text-primary">
                Xóa “{deleting.name}”? Chỉ xóa được danh mục chưa có trong hồ
                sơ.
              </p>
              <Button
                variant="danger"
                size="sm"
                isDisabled={busy}
                onPress={() =>
                  mutation.mutate({ kind: "delete", id: deleting.id })
                }
              >
                Xác nhận xóa
              </Button>
              <Button
                appearance="outline"
                size="sm"
                isDisabled={busy}
                onPress={() => setDeleting(null)}
              >
                Hủy
              </Button>
            </div>
          )}
          {isOrdering ? (
            orderingQuery.isPending ? (
              <p className="p-5 text-sm text-text-tertiary">
                Đang tải danh mục để sắp xếp…
              </p>
            ) : orderingQuery.isError ? (
              <div role="alert" className="space-y-2 text-sm text-error-500">
                <p>{orderingQuery.error.message}</p>
                <Button
                  size="sm"
                  appearance="outline"
                  onPress={() => void orderingQuery.refetch()}
                >
                  Thử lại
                </Button>
                <Button
                  size="sm"
                  appearance="outline"
                  onPress={() => setIsOrdering(false)}
                >
                  Hủy
                </Button>
              </div>
            ) : (
              <CatalogOrderingPanel
                key={type}
                title={PROFILE_OPTION_LABELS[type].toLocaleLowerCase("vi-VN")}
                items={(orderingQuery.data ?? []).map((row) => ({
                  id: row.id,
                  code: row.code,
                  label: row.name,
                }))}
                isSaving={orderMutation.isPending}
                onCancel={() => setIsOrdering(false)}
                onSave={async (items) => {
                  await orderMutation.mutateAsync(items).catch(() => undefined);
                }}
              />
            )
          ) : query.isError ? (
            <div role="alert" className="space-y-2 text-sm text-error-500">
              <p>{query.error.message}</p>
              <Button
                appearance="outline"
                size="sm"
                onPress={() => void query.refetch()}
              >
                Thử lại
              </Button>
            </div>
          ) : (
            <>
              <ProfileOptionsTable
                rows={query.data?.data ?? []}
                busy={busy}
                isLoading={query.isPending}
                currentPage={page}
                total={total}
                onPageChange={setPage}
                permissions={permissions}
                onEdit={(row) => {
                  setDeleting(null);
                  setEditor(row);
                }}
                onToggle={(row) =>
                  mutation.mutate({
                    kind: "update",
                    id: row.id,
                    input: {
                      isActive: !row.isActive,
                    },
                  })
                }
                onDelete={(row) => {
                  setEditor(undefined);
                  setDeleting(row);
                }}
              />
            </>
          )}
        </TabContent>
      </TabRoot>
    </main>
  );
}
