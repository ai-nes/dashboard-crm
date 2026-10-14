"use client";
import { Button } from "@/components/tailgrids/core/button";
import {
  ScrollArea,
  ScrollAreaViewport,
  ScrollBar,
} from "@/components/tailgrids/core/scroll-area";
import type { RecordExportPreview } from "@/services/api/record-export/types";

export function RecordExportPreviewTable({
  data,
  entityLabel = "học sinh",
  maxRows,
  isPending,
  onPageChange,
}: {
  data: RecordExportPreview;
  entityLabel?: string;
  maxRows: number;
  isPending: boolean;
  onPageChange: (page: number) => void;
}) {
  return (
    <section className="min-w-0 space-y-4" aria-label="Preview Excel">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="font-semibold text-text-primary">
          {data.meta.total.toLocaleString("vi-VN")} {entityLabel} phù hợp ·{" "}
          {data.columns.length} cột
        </p>
        <p className="text-sm text-text-tertiary">
          Excel sẽ gồm toàn bộ kết quả, không chỉ trang preview.
        </p>
      </div>
      {data.meta.total > maxRows && (
        <p role="alert" className="text-sm text-error">
          Có hơn {maxRows.toLocaleString("vi-VN")} hồ sơ. Hãy quay lại thu hẹp
          bộ lọc để xuất Excel.
        </p>
      )}
      {data.meta.total === 0 ? (
        <p className="rounded-lg border border-card-border p-8 text-center text-sm text-text-tertiary">
          Không có {entityLabel} phù hợp bộ lọc. Quay lại để điều chỉnh điều
          kiện.
        </p>
      ) : (
        <ScrollArea className="max-h-96 max-w-full overflow-hidden rounded-lg border border-card-border">
          <ScrollAreaViewport className="max-h-96">
            <table className="w-full text-left text-sm">
              <thead className="sticky top-0 bg-background-soft-50 text-text-secondary">
                <tr>
                  {data.columns.map((column) => (
                    <th
                      key={column.id}
                      className="min-w-40 border-b border-card-border px-4 py-3 font-medium"
                    >
                      {column.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-card-border">
                {data.rows.map((row, index) => (
                  <tr key={index}>
                    {data.columns.map((column) => (
                      <td
                        key={column.id}
                        className="max-w-80 min-w-40 px-4 py-3 align-top whitespace-pre-wrap break-words text-text-primary"
                      >
                        {row[column.id] === null || row[column.id] === ""
                          ? "—"
                          : String(row[column.id])}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </ScrollAreaViewport>
          <ScrollBar />
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      )}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-text-tertiary">
          Trang {data.meta.page}/{data.meta.totalPages} · {data.rows.length}{" "}
          dòng hiển thị
        </p>
        <div className="flex gap-2">
          <Button
            appearance="outline"
            size="sm"
            isDisabled={isPending || data.meta.page <= 1}
            onPress={() => onPageChange(data.meta.page - 1)}
          >
            Trang preview trước
          </Button>
          <Button
            appearance="outline"
            size="sm"
            isDisabled={isPending || data.meta.page >= data.meta.totalPages}
            onPress={() => onPageChange(data.meta.page + 1)}
          >
            Trang preview sau
          </Button>
        </div>
      </div>
      <p className="text-xs text-text-tertiary">
        Mỗi hồ sơ là một dòng. Thứ tự cột và giá trị được giữ trong file Excel.
      </p>
    </section>
  );
}
