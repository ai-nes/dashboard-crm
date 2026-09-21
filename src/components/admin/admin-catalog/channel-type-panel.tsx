"use client";

import { useState } from "react";
import { toast } from "sonner";

import { ConfirmDialog } from "@/components/common/delete-record-dialog";
import { Checkbox } from "@/components/tailgrids/core/checkbox";
import {
  useCampaignChannelTypeMutation,
  useCampaignChannelTypesAdminQuery,
  useDeleteCampaignChannelTypeMutation,
} from "@/hooks/use-admin-catalog-queries";
import {
  normalizeCatalogError,
  type CampaignChannelType,
} from "@/services/api/admin-catalog";

import {
  CatalogListToolbar,
  CatalogPagination,
  CatalogEditorDialog,
  EmptyState,
  ErrorState,
  Field,
  LoadingState,
  Panel,
  PanelHeaderActions,
  RowActions,
  StatusBadge,
  Table,
  TextInput,
} from "./admin-catalog-ui";

const PAGE_SIZE = 10;
type ChannelForm = {
  name?: string;
  code: string;
  display_name: string;
  is_online: boolean;
  is_offline: boolean;
  enabled: boolean;
  sort_order: string;
  description: string;
};
const emptyForm: ChannelForm = {
  code: "",
  display_name: "",
  is_online: true,
  is_offline: false,
  enabled: true,
  sort_order: "1",
  description: "",
};

export default function ChannelTypePanel() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [form, setForm] = useState<ChannelForm>(emptyForm);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [pendingDelete, setPendingDelete] =
    useState<CampaignChannelType | null>(null);
  const query = useCampaignChannelTypesAdminQuery({
    search,
    start: (page - 1) * PAGE_SIZE,
    pageLength: PAGE_SIZE,
  });
  const save = useCampaignChannelTypeMutation();
  const remove = useDeleteCampaignChannelTypeMutation();

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      await save.mutateAsync({
        name: form.name,
        data: {
          code: form.code.trim().toUpperCase(),
          display_name: form.display_name.trim(),
          is_online: form.is_online,
          is_offline: form.is_offline,
          enabled: form.enabled,
          sort_order: Number(form.sort_order),
          description: form.description.trim() || undefined,
        },
      });
      toast.success("Đã lưu loại kênh campaign.");
      setForm(emptyForm);
      setIsEditorOpen(false);
    } catch (error) {
      toast.error(normalizeCatalogError(error, "Không thể lưu loại kênh."));
    }
  };

  const confirmDelete = async () => {
    if (!pendingDelete) return;
    try {
      await remove.mutateAsync(pendingDelete.code);
      toast.success("Đã xóa loại kênh.");
      setPendingDelete(null);
    } catch (error) {
      toast.error(
        normalizeCatalogError(
          error,
          "Không thể xóa loại kênh đang được tham chiếu.",
        ),
      );
    }
  };

  const resetEditor = () => {
    setForm(emptyForm);
    setIsEditorOpen(false);
  };

  return (
    <Panel
      title="Kênh chiến dịch"
      description="Quản lý các kênh được phép dùng trong campaign."
      showHeader={false}
      toolbar={
        <CatalogListToolbar
          search={search}
          onSearchChange={(value) => {
            setSearch(value);
            setPage(1);
          }}
          total={query.data?.total ?? 0}
          placeholder="Tìm theo code hoặc tên loại kênh…"
          actions={
            <PanelHeaderActions
              createLabel="Thêm loại kênh"
              isDisabled={save.isPending || remove.isPending}
              onCreate={() => {
                setForm(emptyForm);
                setIsEditorOpen(true);
              }}
            />
          }
        />
      }
    >
      {isEditorOpen ? (
        <CatalogEditorDialog
          title={form.name ? "Chỉnh sửa loại kênh" : "Thêm loại kênh"}
          description="Khai báo code dùng trong hệ thống, tên hiển thị và các kênh mà campaign hỗ trợ."
          isOpen={isEditorOpen}
          isSaving={save.isPending}
          submitLabel={form.name ? "Cập nhật loại kênh" : "Thêm loại kênh"}
          onOpenChange={(open) => {
            if (!open) resetEditor();
          }}
          onSubmit={submit}
        >
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            <Field label="Code">
              <TextInput
                required
                disabled={Boolean(form.name) || save.isPending}
                value={form.code}
                onChange={(event) =>
                  setForm({ ...form, code: event.target.value })
                }
                placeholder="FACEBOOK_ADS"
              />
            </Field>
            <Field label="Tên hiển thị">
              <TextInput
                required
                disabled={save.isPending}
                value={form.display_name}
                onChange={(event) =>
                  setForm({ ...form, display_name: event.target.value })
                }
              />
            </Field>
            <Field label="Thứ tự">
              <TextInput
                required
                type="number"
                min="0"
                disabled={save.isPending}
                value={form.sort_order}
                onChange={(event) =>
                  setForm({ ...form, sort_order: event.target.value })
                }
              />
            </Field>
            <Field label="Mô tả">
              <TextInput
                disabled={save.isPending}
                value={form.description}
                onChange={(event) =>
                  setForm({ ...form, description: event.target.value })
                }
              />
            </Field>
            <div className="flex flex-wrap items-center gap-x-5 gap-y-3 pt-2 text-sm text-text-secondary md:col-span-2 xl:col-span-4">
              <Checkbox
                size="sm"
                isSelected={form.is_online}
                isDisabled={save.isPending}
                onChange={(isOnline) =>
                  setForm({ ...form, is_online: isOnline })
                }
              >
                Online
              </Checkbox>
              <Checkbox
                size="sm"
                isSelected={form.is_offline}
                isDisabled={save.isPending}
                onChange={(isOffline) =>
                  setForm({ ...form, is_offline: isOffline })
                }
              >
                Offline
              </Checkbox>
              <Checkbox
                size="sm"
                isSelected={form.enabled}
                isDisabled={save.isPending}
                onChange={(enabled) => setForm({ ...form, enabled })}
              >
                Đang bật
              </Checkbox>
            </div>
          </div>
        </CatalogEditorDialog>
      ) : null}
      <div className="mt-0">
        {query.isPending ? (
          <LoadingState label="Đang tải loại kênh campaign…" />
        ) : query.error ? (
          <ErrorState
            message={query.error.message}
            onRetry={() => void query.refetch()}
          />
        ) : query.data?.channel_types.length ? (
          <>
            <Table
              caption="Danh sách campaign channel type"
              headers={["Code", "Tên", "Modes", "Trạng thái", "Thao tác"]}
            >
              {query.data.channel_types.map((type) => (
                <tr key={type.code}>
                  <td className="px-3 py-3 font-mono text-xs font-semibold text-text-primary">
                    {type.code}
                  </td>
                  <td className="px-3 py-3 text-text-primary">
                    {type.display_name}
                  </td>
                  <td className="px-3 py-3 text-text-secondary">
                    {type.modes?.join(" / ") || "—"}
                  </td>
                  <td className="px-3 py-3">
                    <StatusBadge tone={type.enabled ? "success" : "gray"}>
                      {type.enabled ? "Enabled" : "Disabled"}
                    </StatusBadge>
                  </td>
                  <td className="px-3 py-3">
                    <RowActions
                      isDisabled={save.isPending || remove.isPending}
                      onEdit={() => {
                        setForm({
                          name: type.code,
                          code: type.code,
                          display_name: type.display_name,
                          is_online: type.is_online,
                          is_offline: type.is_offline,
                          enabled: type.enabled,
                          sort_order: String(type.sort_order),
                          description: type.description ?? "",
                        });
                        setIsEditorOpen(true);
                      }}
                      onDelete={() => setPendingDelete(type)}
                    />
                  </td>
                </tr>
              ))}
            </Table>
            <CatalogPagination
              page={page}
              total={query.data.total}
              pageSize={PAGE_SIZE}
              onPageChange={setPage}
              isDisabled={
                query.isFetching || save.isPending || remove.isPending
              }
            />
          </>
        ) : (
          <EmptyState>
            {search
              ? "Không tìm thấy loại kênh campaign."
              : "Chưa có campaign channel type."}
          </EmptyState>
        )}
      </div>
      <ConfirmDialog
        isOpen={Boolean(pendingDelete)}
        ariaLabel="Xác nhận xóa loại kênh campaign"
        title={`Xóa ${pendingDelete?.display_name ?? "loại kênh"}?`}
        description="Không thể xóa loại kênh đang được tham chiếu bởi campaign."
        confirmLabel={remove.isPending ? "Đang xóa…" : "Xóa loại kênh"}
        confirmVariant="danger"
        isConfirming={remove.isPending}
        onOpenChange={(open) => {
          if (!open && !remove.isPending) setPendingDelete(null);
        }}
        onConfirm={confirmDelete}
      />
    </Panel>
  );
}
