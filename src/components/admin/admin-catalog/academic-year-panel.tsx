"use client";

import { useState } from "react";
import { toast } from "sonner";

import { ConfirmDialog } from "@/components/common/delete-record-dialog";
import { DatePickerField } from "@/components/common/date-picker-field";
import { Checkbox } from "@/components/tailgrids/core/checkbox";
import {
  useAdmissionYearsQuery,
  useCreateAdmissionYearMutation,
  useDeleteAdmissionYearMutation,
  useUpdateAdmissionYearMutation,
} from "@/hooks/use-admin-catalog-queries";
import { normalizeCatalogError } from "@/services/api/admin-catalog";

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

type YearForm = {
  name?: string;
  year_name: string;
  start_date: string;
  end_date: string;
  is_active: boolean;
};
type PendingDelete = {
  kind: "year";
  name: string;
  label: string;
  modified?: string;
};

const emptyYear: YearForm = {
  year_name: "",
  start_date: "",
  end_date: "",
  is_active: false,
};
export default function AcademicYearPanel() {
  const [yearSearch, setYearSearch] = useState("");
  const [yearPage, setYearPage] = useState(1);
  const yearsQuery = useAdmissionYearsQuery({
    search: yearSearch,
    start: (yearPage - 1) * PAGE_SIZE,
    pageLength: PAGE_SIZE,
  });
  const createYear = useCreateAdmissionYearMutation();
  const updateYear = useUpdateAdmissionYearMutation();
  const deleteYear = useDeleteAdmissionYearMutation();
  const [yearForm, setYearForm] = useState<YearForm>(emptyYear);
  const [isYearEditorOpen, setIsYearEditorOpen] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<PendingDelete | null>(
    null,
  );

  const saveYear = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      const data = {
        year_name: yearForm.year_name.trim(),
        start_date: yearForm.start_date || undefined,
        end_date: yearForm.end_date || undefined,
        is_active: yearForm.is_active,
      };
      if (yearForm.name) {
        await updateYear.mutateAsync({
          name: yearForm.name,
          data,
          expectedModified: yearsQuery.data?.years.find(
            (item) => item.name === yearForm.name,
          )?.modified,
        });
      } else {
        await createYear.mutateAsync(data);
      }
      toast.success("Đã lưu năm tuyển sinh.");
      setYearForm(emptyYear);
      setIsYearEditorOpen(false);
    } catch (error) {
      toast.error(
        normalizeCatalogError(error, "Không thể lưu năm tuyển sinh."),
      );
    }
  };

  const confirmDelete = async () => {
    if (!pendingDelete) return;
    try {
      await deleteYear.mutateAsync({
        name: pendingDelete.name,
        expectedModified: pendingDelete.modified,
      });
      toast.success("Đã xóa năm tuyển sinh.");
      setPendingDelete(null);
    } catch (error) {
      toast.error(normalizeCatalogError(error, "Không thể xóa bản ghi."));
    }
  };

  const isDeleting = deleteYear.isPending;

  const resetYear = () => {
    setYearForm(emptyYear);
    setIsYearEditorOpen(false);
  };

  return (
    <div className="space-y-5">
      <Panel
        title="Năm tuyển sinh"
        description="Quản lý các mốc thời gian dùng cho tuyển sinh."
        actions={
          <PanelHeaderActions
            createLabel="Thêm năm"
            isDisabled={createYear.isPending || updateYear.isPending}
            onCreate={() => {
              setYearForm(emptyYear);
              setIsYearEditorOpen(true);
            }}
          />
        }
      >
        {isYearEditorOpen ? (
          <CatalogEditorDialog
            title={
              yearForm.name ? "Chỉnh sửa năm tuyển sinh" : "Thêm năm tuyển sinh"
            }
            description="Khai báo thời gian áp dụng và chọn năm đang được sử dụng cho các nghiệp vụ tuyển sinh."
            isOpen={isYearEditorOpen}
            isSaving={createYear.isPending || updateYear.isPending}
            submitLabel={yearForm.name ? "Cập nhật năm" : "Thêm năm tuyển sinh"}
            onOpenChange={(open) => {
              if (!open) resetYear();
            }}
            onSubmit={saveYear}
          >
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
              <Field label="Tên năm">
                <TextInput
                  required
                  value={yearForm.year_name}
                  onChange={(event) =>
                    setYearForm({ ...yearForm, year_name: event.target.value })
                  }
                  placeholder="2026"
                />
              </Field>
              <Field label="Bắt đầu">
                <DatePickerField
                  value={yearForm.start_date}
                  onChange={(value) =>
                    setYearForm({ ...yearForm, start_date: value })
                  }
                  ariaLabel="Ngày bắt đầu năm tuyển sinh"
                  required
                />
              </Field>
              <Field label="Kết thúc">
                <DatePickerField
                  value={yearForm.end_date}
                  onChange={(value) =>
                    setYearForm({ ...yearForm, end_date: value })
                  }
                  ariaLabel="Ngày kết thúc năm tuyển sinh"
                  required
                />
              </Field>
              <Checkbox
                size="sm"
                isSelected={yearForm.is_active}
                onChange={(isActive) =>
                  setYearForm({ ...yearForm, is_active: isActive })
                }
                className="min-h-9 self-end text-sm text-text-secondary"
              >
                Đang dùng
              </Checkbox>
            </div>
          </CatalogEditorDialog>
        ) : null}
        <div className="mt-0">
          <CatalogListToolbar
            search={yearSearch}
            onSearchChange={(value) => {
              setYearSearch(value);
              setYearPage(1);
            }}
            total={yearsQuery.data?.total ?? 0}
            placeholder="Tìm theo tên năm…"
          />
          {yearsQuery.isPending ? (
            <LoadingState label="Đang tải năm tuyển sinh…" />
          ) : yearsQuery.error ? (
            <ErrorState
              message={yearsQuery.error.message}
              onRetry={() => void yearsQuery.refetch()}
            />
          ) : yearsQuery.data?.years.length ? (
            <>
              <Table
                caption="Danh sách năm tuyển sinh"
                headers={["Năm", "Thời gian áp dụng", "Trạng thái", "Thao tác"]}
              >
                {yearsQuery.data.years.map((year) => (
                  <tr key={year.name}>
                    <td className="px-3 py-3 font-medium text-text-primary">
                      {year.year_name}
                    </td>
                    <td className="px-3 py-3 text-text-secondary">
                      {year.start_date || "—"} → {year.end_date || "—"}
                    </td>
                    <td className="px-3 py-3">
                      <StatusBadge tone={year.is_active ? "success" : "gray"}>
                        {year.is_active ? "Đang dùng" : "Chưa dùng"}
                      </StatusBadge>
                    </td>
                    <td className="px-3 py-3">
                      <RowActions
                        isDisabled={isDeleting}
                        onEdit={() => {
                          setYearForm({
                            name: year.name,
                            year_name: year.year_name,
                            start_date: year.start_date?.slice(0, 10) ?? "",
                            end_date: year.end_date?.slice(0, 10) ?? "",
                            is_active: year.is_active,
                          });
                          setIsYearEditorOpen(true);
                        }}
                        onDelete={() =>
                          setPendingDelete({
                            kind: "year",
                            name: year.name,
                            label: year.year_name,
                            modified: year.modified,
                          })
                        }
                      />
                    </td>
                  </tr>
                ))}
              </Table>
              <CatalogPagination
                page={yearPage}
                total={yearsQuery.data.total}
                pageSize={PAGE_SIZE}
                onPageChange={setYearPage}
                isDisabled={yearsQuery.isFetching || isDeleting}
              />
            </>
          ) : (
            <EmptyState>
              {yearSearch
                ? "Không tìm thấy năm tuyển sinh."
                : "Chưa có năm tuyển sinh."}
            </EmptyState>
          )}
        </div>
      </Panel>

      <ConfirmDialog
        isOpen={Boolean(pendingDelete)}
        ariaLabel="Xác nhận xóa danh mục năm học"
        title={`Xóa ${pendingDelete?.label ?? "bản ghi"}?`}
        description="Dữ liệu sẽ bị xóa khỏi CRM và có thể bị chặn nếu đang được tham chiếu."
        confirmLabel={isDeleting ? "Đang xóa…" : "Xóa bản ghi"}
        confirmVariant="danger"
        isConfirming={isDeleting}
        onOpenChange={(open) => {
          if (!open && !isDeleting) setPendingDelete(null);
        }}
        onConfirm={confirmDelete}
      />
    </div>
  );
}
