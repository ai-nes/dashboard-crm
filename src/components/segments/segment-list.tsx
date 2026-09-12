"use client";

import { useMemo, useState } from "react";
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  useReactTable,
  type ColumnFiltersState,
} from "@tanstack/react-table";
import { toast } from "sonner";

import { DeleteRecordDialog } from "@/components/common/delete-record-dialog";
import { Pagination } from "@/components/tailgrids/core/pagination";
import {
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRoot,
  TableRow,
} from "@/components/tailgrids/core/table";
import { useDeleteSegmentMutation } from "@/hooks/use-segment-queries";
import { getSegmentListColumns } from "./segment-list-columns";
import { useSegmentData } from "./segment-data-provider";
import { SegmentListToolbar } from "./segment-list-toolbar";
import {
  SEGMENT_STATUS_LABELS,
  type SegmentListItem,
} from "./segment-list-types";

const normalizeSearch = (value: string) =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase();

export function SegmentList({
  detailBaseHref,
  canManage,
  compactStatus = false,
}: {
  detailBaseHref: string;
  canManage: boolean;
  compactStatus?: boolean;
}) {
  const {
    segments,
    isLoading,
    error,
    refetch,
    transitionSegment,
    total,
    currentPage,
    totalPages,
    isFetching,
    search,
    status,
    setPage,
    setSearch,
    setStatus,
    serverPaginated,
  } = useSegmentData();
  const hasSegmentFilter = Boolean(search.trim()) || status !== "ALL";
  const [globalFilter, setGlobalFilter] = useState("");
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [segmentToDelete, setSegmentToDelete] =
    useState<SegmentListItem | null>(null);
  const deleteMutation = useDeleteSegmentMutation();

  const handleConfirmDelete = async () => {
    if (!segmentToDelete) return;

    try {
      await deleteMutation.mutateAsync({
        name: segmentToDelete.id,
        expectedRevision: segmentToDelete.revision,
      });
      await refetch();
      setSegmentToDelete(null);
      toast.success("Đã xóa segment.");
    } catch (deleteError) {
      toast.error(
        deleteError instanceof Error
          ? deleteError.message
          : "Không thể xóa segment.",
      );
    }
  };

  const columns = useMemo(
    () =>
      getSegmentListColumns({
        detailBaseHref,
        canManage,
        onStatusChange: (segment, status) => {
          void transitionSegment({
            name: segment.id,
            status,
            expectedRevision: segment.revision,
          })
            .then(() => {
              toast.success(
                `Đã chuyển trạng thái segment sang ${SEGMENT_STATUS_LABELS[status]}`,
              );
            })
            .catch((transitionError) => {
              toast.error(
                transitionError instanceof Error
                  ? transitionError.message
                  : "Không thể cập nhật trạng thái segment.",
              );
            });
        },
        onDelete: setSegmentToDelete,
        isDeleteDisabled: deleteMutation.isPending,
        compactStatus,
      }),
    [
      canManage,
      compactStatus,
      deleteMutation.isPending,
      detailBaseHref,
      transitionSegment,
    ],
  );
  const table = useReactTable({
    data: segments,
    columns,
    state: { globalFilter, columnFilters },
    onGlobalFilterChange: setGlobalFilter,
    onColumnFiltersChange: setColumnFilters,
    globalFilterFn: (row, columnId, value: string) =>
      normalizeSearch(String(row.getValue(columnId))).includes(
        normalizeSearch(value.trim()),
      ),
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: serverPaginated ? undefined : getFilteredRowModel(),
    getRowId: (row) => row.id,
  });

  if (isLoading) {
    return (
      <section className="rounded-2xl border border-card-border bg-card-background p-8 text-center text-sm text-text-secondary">
        Đang tải danh sách segment từ Frappe CRM…
      </section>
    );
  }

  if (error) {
    return (
      <section className="rounded-2xl border border-badge-error-icon-color bg-badge-error-background p-8 text-center">
        <p className="text-sm text-badge-error-text">{error.message}</p>
        <button
          type="button"
          className="mt-4 text-sm font-semibold text-primary-500 hover:underline"
          onClick={() => void refetch()}
        >
          Thử lại
        </button>
      </section>
    );
  }

  return (
    <>
      <section
        aria-label="Danh sách segments"
        className="overflow-hidden rounded-2xl border border-card-border bg-card-background shadow-xs"
      >
        <SegmentListToolbar
          table={table}
          serverPagination={
            serverPaginated
              ? {
                  search,
                  status,
                  total,
                  onSearchChange: setSearch,
                  onStatusChange: (value) =>
                    setStatus(value as SegmentListItem["status"] | "ALL"),
                }
              : undefined
          }
        >
          <>
            <TableRoot
              fullBleed
              className="border-0"
              aria-label="Danh sách segments"
            >
              <TableHeader className="bg-background-gray-secondary">
                {table.getHeaderGroups().map((group) => (
                  <TableRow key={group.id}>
                    {group.headers.map((header) => (
                      <TableHead
                        key={header.id}
                        scope="col"
                        className="whitespace-nowrap"
                      >
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                      </TableHead>
                    ))}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    className="hover:bg-background-gray-secondary_alt"
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell
                        key={cell.id}
                        className="py-5 text-sm font-normal text-text-secondary"
                      >
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext(),
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
                {table.getRowModel().rows.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={columns.length}
                      className="py-16 text-center text-sm text-text-tertiary"
                    >
                      {!hasSegmentFilter
                        ? "Chưa có segment nào. Tạo segment để bắt đầu."
                        : "Không tìm thấy segment phù hợp. Thử từ khóa hoặc trạng thái khác."}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </TableRoot>
            {serverPaginated && totalPages > 1 ? (
              <div className="flex justify-end border-t border-card-border px-5 py-4">
                <div className="w-fit">
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setPage}
                    variant="compact"
                    isDisabled={
                      isFetching || isLoading || deleteMutation.isPending
                    }
                  />
                </div>
              </div>
            ) : null}
          </>
        </SegmentListToolbar>
      </section>

      <DeleteRecordDialog
        isOpen={Boolean(segmentToDelete)}
        recordType="segment"
        recordName={segmentToDelete?.name ?? ""}
        isDeleting={deleteMutation.isPending}
        onOpenChange={(open) => {
          if (!open && !deleteMutation.isPending) setSegmentToDelete(null);
        }}
        onConfirm={handleConfirmDelete}
      >
        <p className="text-sm text-text-secondary">
          Segment và danh sách học sinh kết quả sẽ được xóa khỏi CRM.
        </p>
      </DeleteRecordDialog>
    </>
  );
}
