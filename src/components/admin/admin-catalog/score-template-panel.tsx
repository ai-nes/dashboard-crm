"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { ConfirmDialog } from "@/components/common/delete-record-dialog";
import {
  useDeleteScoreTemplateMutation,
  useScoreTemplatesQuery,
} from "@/hooks/use-admin-catalog-queries";
import {
  normalizeCatalogError,
  type ScoreTemplate,
} from "@/services/api/admin-catalog";

import {
  CatalogListToolbar,
  CatalogPagination,
  EmptyState,
  ErrorState,
  LoadingState,
  Panel,
  PanelHeaderActions,
  RowActions,
  StatusBadge,
  Table,
} from "./admin-catalog-ui";

const PAGE_SIZE = 10;
const SCORE_TEMPLATE_LIST_PATH = "/director/admin/catalogs";

export default function ScoreTemplatePanel() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pendingDelete, setPendingDelete] = useState<ScoreTemplate | null>(
    null,
  );
  const query = useScoreTemplatesQuery({
    search,
    start: (page - 1) * PAGE_SIZE,
    pageLength: PAGE_SIZE,
  });
  const remove = useDeleteScoreTemplateMutation();

  const openTemplate = (template: ScoreTemplate) => {
    router.push(
      `${SCORE_TEMPLATE_LIST_PATH}/${encodeURIComponent(template.name)}`,
    );
  };

  const confirmDelete = async () => {
    if (!pendingDelete) return;
    try {
      await remove.mutateAsync({
        name: pendingDelete.name,
        expectedModified: pendingDelete.modified,
      });
      toast.success("Đã xóa Score Template.");
      setPendingDelete(null);
    } catch (error) {
      toast.error(
        normalizeCatalogError(error, "Không thể xóa Score Template."),
      );
    }
  };

  return (
    <Panel
      title="Mẫu chấm điểm"
      description="Thiết lập các mẫu và rubric chấm điểm cho lead."
      showHeader={false}
      toolbar={
        <CatalogListToolbar
          search={search}
          onSearchChange={(value) => {
            setSearch(value);
            setPage(1);
          }}
          total={query.data?.total ?? 0}
          placeholder="Tìm theo tên Score Template…"
          actions={
            <PanelHeaderActions
              createLabel="Thêm template"
              isDisabled={remove.isPending}
              onCreate={() => router.push(`${SCORE_TEMPLATE_LIST_PATH}/new`)}
            />
          }
        />
      }
    >
      <div className="mt-0">
        {query.isPending ? (
          <LoadingState label="Đang tải Score Template…" />
        ) : query.error ? (
          <ErrorState
            message={query.error.message}
            onRetry={() => void query.refetch()}
          />
        ) : query.data?.templates.length ? (
          <>
            <Table
              caption="Danh sách Score Template"
              headers={[
                "Template",
                "Status",
                "Thời gian",
                "Revision",
                "Thao tác",
              ]}
            >
              {query.data.templates.map((template) => (
                <tr
                  key={template.name}
                  tabIndex={0}
                  className="cursor-pointer outline-none hover:bg-background-gray-secondary/30 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary-500"
                  onClick={(event) => {
                    const target = event.target as HTMLElement;
                    if (target.closest("button, a")) return;
                    openTemplate(template);
                  }}
                  onKeyDown={(event) => {
                    if (event.target !== event.currentTarget) return;
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      openTemplate(template);
                    }
                  }}
                >
                  <td className="px-3 py-3 font-medium text-primary-500">
                    {template.template_name}
                  </td>
                  <td className="px-3 py-3">
                    <StatusBadge
                      tone={
                        template.status === "Active"
                          ? "success"
                          : template.status === "Inactive"
                            ? "danger"
                            : "gray"
                      }
                    >
                      {template.status}
                    </StatusBadge>
                  </td>
                  <td className="px-3 py-3 text-text-secondary">
                    {template.start_time?.slice(0, 16) || "—"} →{" "}
                    {template.end_time?.slice(0, 16) || "—"}
                  </td>
                  <td className="px-3 py-3 text-text-secondary">
                    {template.policy_revision ?? "—"}
                  </td>
                  <td className="px-3 py-3">
                    <RowActions
                      isDisabled={remove.isPending}
                      onEdit={() => openTemplate(template)}
                      onDelete={() => setPendingDelete(template)}
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
              isDisabled={query.isFetching || remove.isPending}
            />
          </>
        ) : (
          <EmptyState>
            {search
              ? "Không tìm thấy Score Template."
              : "Chưa có Score Template."}
          </EmptyState>
        )}
      </div>
      <ConfirmDialog
        isOpen={Boolean(pendingDelete)}
        ariaLabel="Xác nhận xóa Score Template"
        title={`Xóa ${pendingDelete?.template_name ?? "template"}?`}
        description="Chỉ xóa template không còn được tham chiếu bởi nghiệp vụ chấm điểm."
        confirmLabel={remove.isPending ? "Đang xóa…" : "Xóa template"}
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
