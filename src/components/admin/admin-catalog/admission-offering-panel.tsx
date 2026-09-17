"use client";

import { useState } from "react";
import { toast } from "sonner";

import { ConfirmDialog } from "@/components/common/delete-record-dialog";
import { DatePickerField } from "@/components/common/date-picker-field";
import { toMajorSelectorOptions } from "@/components/common/major-selector";
import { Button } from "@/components/tailgrids/core/button";
import { useAdmissionMethodsQuery } from "@/hooks/use-admission-catalog-queries";
import { useMajorsQuery } from "@/hooks/use-major-catalog-queries";
import {
  useAdmissionOfferingsQuery,
  useAdmissionYearsQuery,
  useCreateAdmissionOfferingMutation,
  useDeleteAdmissionOfferingMutation,
  useGovernedValuesQuery,
  useTransitionAdmissionOfferingMutation,
  useUpdateAdmissionOfferingMutation,
} from "@/hooks/use-admin-catalog-queries";
import {
  normalizeCatalogError,
  type AdmissionOffering,
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
  SelectInput,
  StatusBadge,
  Table,
  TextInput,
} from "./admin-catalog-ui";

const PAGE_SIZE = 10;
const OFFERING_STATUSES: AdmissionOffering["status"][] = [
  "Draft",
  "Pending Approval",
  "Closed",
  "Retired",
];
const OFFERING_STATUS_LABELS: Record<AdmissionOffering["status"], string> = {
  Draft: "Bản nháp",
  "Pending Approval": "Chờ duyệt",
  Active: "Đang dùng",
  Closed: "Đã đóng",
  Retired: "Đã ngừng",
};

type OfferingForm = {
  name?: string;
  admission_year: string;
  campus: string;
  major: string;
  admission_method: string;
  quota: string;
  effective_from: string;
  effective_until: string;
  status: AdmissionOffering["status"];
};

const emptyForm: OfferingForm = {
  admission_year: "",
  campus: "",
  major: "",
  admission_method: "",
  quota: "",
  effective_from: "",
  effective_until: "",
  status: "Draft",
};

export default function AdmissionOfferingPanel() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [form, setForm] = useState<OfferingForm>(emptyForm);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<AdmissionOffering | null>(
    null,
  );
  const query = useAdmissionOfferingsQuery({
    search,
    start: (page - 1) * PAGE_SIZE,
    pageLength: PAGE_SIZE,
  });
  const yearsQuery = useAdmissionYearsQuery({ pageLength: 100 });
  const campusesQuery = useGovernedValuesQuery("CRM Campus", {
    pageLength: 100,
  });
  const majorsQuery = useMajorsQuery({
    includeInactive: false,
    pageLength: 100,
  });
  const methodsQuery = useAdmissionMethodsQuery({
    includeDisabled: false,
    pageLength: 100,
  });
  const create = useCreateAdmissionOfferingMutation();
  const update = useUpdateAdmissionOfferingMutation();
  const transition = useTransitionAdmissionOfferingMutation();
  const remove = useDeleteAdmissionOfferingMutation();

  const lookupPending =
    yearsQuery.isPending ||
    campusesQuery.isPending ||
    majorsQuery.isPending ||
    methodsQuery.isPending;
  const lookupError =
    yearsQuery.error ||
    campusesQuery.error ||
    majorsQuery.error ||
    methodsQuery.error;
  const isMutating =
    create.isPending ||
    update.isPending ||
    transition.isPending ||
    remove.isPending;

  const save = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      const data = {
        admission_year: form.admission_year,
        campus: form.campus,
        major: form.major,
        admission_method: form.admission_method,
        quota: Number(form.quota),
        effective_from: form.effective_from,
        effective_until: form.effective_until,
        status: form.status,
      };
      const current = query.data?.offerings.find(
        (item) => item.name === form.name,
      );
      if (form.name) {
        await update.mutateAsync({
          name: form.name,
          data,
          expectedModified: current?.modified,
        });
      } else {
        await create.mutateAsync(data);
      }
      toast.success("Đã lưu admission offering.");
      setForm(emptyForm);
      setIsEditorOpen(false);
    } catch (error) {
      toast.error(
        normalizeCatalogError(error, "Không thể lưu admission offering."),
      );
    }
  };

  const setStatus = async (
    offering: AdmissionOffering,
    status: AdmissionOffering["status"],
  ) => {
    try {
      await transition.mutateAsync({
        name: offering.name,
        status,
        expectedModified: offering.modified,
      });
      toast.success(
        `Đã chuyển đợt tuyển sinh sang ${OFFERING_STATUS_LABELS[status]}.`,
      );
    } catch (error) {
      toast.error(
        normalizeCatalogError(error, "Không thể chuyển trạng thái offering."),
      );
    }
  };

  const confirmDelete = async () => {
    if (!pendingDelete) return;
    try {
      await remove.mutateAsync({
        name: pendingDelete.name,
        expectedModified: pendingDelete.modified,
      });
      toast.success("Đã xóa offering.");
      setPendingDelete(null);
    } catch (error) {
      toast.error(normalizeCatalogError(error, "Không thể xóa offering."));
    }
  };

  const majorOptions = toMajorSelectorOptions(
    (majorsQuery.data?.majors ?? []).map((major) => ({
      value: major.id,
      label: major.code ? `${major.name} (${major.code})` : major.name,
      groupName: major.majorGroupName,
    })),
  );

  const resetEditor = () => {
    setForm(emptyForm);
    setIsEditorOpen(false);
  };

  return (
    <Panel
      title="Đợt tuyển sinh"
      description="Kết hợp năm, campus, ngành và phương thức tuyển sinh."
      actions={
        <PanelHeaderActions
          createLabel="Thêm đợt tuyển sinh"
          isDisabled={isMutating}
          onCreate={() => {
            setForm(emptyForm);
            setIsEditorOpen(true);
          }}
        />
      }
    >
      {isEditorOpen ? (
        <CatalogEditorDialog
          title={form.name ? "Chỉnh sửa đợt tuyển sinh" : "Thêm đợt tuyển sinh"}
          description="Chọn các danh mục liên quan, thời gian hiệu lực và quota trước khi lưu."
          isOpen={isEditorOpen}
          isSaving={create.isPending || update.isPending}
          submitLabel={
            form.name ? "Cập nhật đợt tuyển sinh" : "Thêm đợt tuyển sinh"
          }
          onOpenChange={(open) => {
            if (!open) resetEditor();
          }}
          onSubmit={save}
        >
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            <Field
              label="Năm tuyển sinh"
              hint={
                lookupError
                  ? "Không thể tải catalog năm tuyển sinh."
                  : undefined
              }
            >
              <SelectInput
                required
                value={form.admission_year}
                disabled={lookupPending || Boolean(lookupError) || isMutating}
                onChange={(event) =>
                  setForm({ ...form, admission_year: event.target.value })
                }
              >
                <option value="">Chọn năm tuyển sinh</option>
                {(yearsQuery.data?.years ?? []).map((year) => (
                  <option key={year.name} value={year.name}>
                    {year.year_name} ({year.name})
                  </option>
                ))}
              </SelectInput>
            </Field>
            <Field label="Campus" hint="Chọn cơ sở áp dụng.">
              <SelectInput
                required
                value={form.campus}
                disabled={lookupPending || Boolean(lookupError) || isMutating}
                onChange={(event) =>
                  setForm({ ...form, campus: event.target.value })
                }
              >
                <option value="">Chọn campus</option>
                {(campusesQuery.data?.records ?? []).map((campus) => (
                  <option key={campus.name} value={campus.name}>
                    {campus.campus_name ?? campus.name} ({campus.name})
                  </option>
                ))}
              </SelectInput>
            </Field>
            <Field
              label="Ngành"
              hint={
                majorOptions.length
                  ? "Chọn ngành áp dụng."
                  : "Chưa có ngành active để chọn."
              }
            >
              <SelectInput
                required
                value={form.major}
                disabled={lookupPending || Boolean(lookupError) || isMutating}
                onChange={(event) =>
                  setForm({ ...form, major: event.target.value })
                }
              >
                <option value="">Chọn ngành</option>
                {majorOptions.map((major) => (
                  <option key={major.id} value={major.id}>
                    {major.label}
                  </option>
                ))}
              </SelectInput>
            </Field>
            <Field
              label="Phương thức tuyển sinh"
              hint="Chọn phương thức áp dụng."
            >
              <SelectInput
                required
                value={form.admission_method}
                disabled={lookupPending || Boolean(lookupError) || isMutating}
                onChange={(event) =>
                  setForm({ ...form, admission_method: event.target.value })
                }
              >
                <option value="">Chọn phương thức</option>
                {(methodsQuery.data?.methods ?? []).map((method) => (
                  <option key={method.id} value={method.id}>
                    {method.name} ({method.code})
                  </option>
                ))}
              </SelectInput>
            </Field>
            <Field label="Chỉ tiêu">
              <TextInput
                required
                type="number"
                min="0"
                value={form.quota}
                disabled={isMutating}
                onChange={(event) =>
                  setForm({ ...form, quota: event.target.value })
                }
              />
            </Field>
            <Field label="Từ ngày">
              <DatePickerField
                value={form.effective_from}
                onChange={(value) =>
                  setForm({ ...form, effective_from: value })
                }
                ariaLabel="Ngày bắt đầu đợt tuyển sinh"
                required
                disabled={isMutating}
              />
            </Field>
            <Field label="Đến ngày">
              <DatePickerField
                value={form.effective_until}
                onChange={(value) =>
                  setForm({ ...form, effective_until: value })
                }
                ariaLabel="Ngày kết thúc đợt tuyển sinh"
                required
                disabled={isMutating}
              />
            </Field>
            <Field
              label="Trạng thái"
              hint="Trạng thái đang dùng chỉ được chuyển bằng nút Duyệt trong danh sách."
            >
              <SelectInput
                value={form.status}
                disabled={
                  Boolean(form.name && form.status === "Active") || isMutating
                }
                onChange={(event) =>
                  setForm({
                    ...form,
                    status: event.target.value as OfferingForm["status"],
                  })
                }
              >
                {OFFERING_STATUSES.map((status) => (
                  <option key={status} value={status}>
                    {OFFERING_STATUS_LABELS[status]}
                  </option>
                ))}
              </SelectInput>
            </Field>
          </div>
          {lookupPending ? (
            <p
              className="mt-3 text-xs text-text-tertiary"
              role="status"
              aria-live="polite"
            >
              Đang tải các danh mục liên quan…
            </p>
          ) : null}
          {lookupError ? (
            <ErrorState
              message={
                lookupError instanceof Error
                  ? lookupError.message
                  : "Không thể tải catalog liên quan."
              }
              onRetry={() => {
                void yearsQuery.refetch();
                void campusesQuery.refetch();
                void majorsQuery.refetch();
                void methodsQuery.refetch();
              }}
            />
          ) : null}
        </CatalogEditorDialog>
      ) : null}
      <div className="mt-0">
        <CatalogListToolbar
          search={search}
          onSearchChange={(value) => {
            setSearch(value);
            setPage(1);
          }}
          total={query.data?.total ?? 0}
          placeholder="Tìm theo đợt, campus hoặc ngành…"
        />
        {query.isPending ? (
          <LoadingState label="Đang tải đợt tuyển sinh…" />
        ) : query.error ? (
          <ErrorState
            message={query.error.message}
            onRetry={() => void query.refetch()}
          />
        ) : query.data?.offerings.length ? (
          <>
            <Table
              caption="Danh sách đợt tuyển sinh"
              headers={[
                "Đợt tuyển sinh",
                "Thông tin tuyển sinh",
                "Chỉ tiêu",
                "Thời gian áp dụng",
                "Trạng thái",
                "Thao tác",
              ]}
            >
              {query.data.offerings.map((offering) => (
                <tr key={offering.name}>
                  <td className="px-3 py-3 font-medium text-text-primary">
                    {offering.name}
                  </td>
                  <td className="px-3 py-3 text-text-secondary">
                    {offering.campus} · {offering.major} ·{" "}
                    {offering.admission_method}
                  </td>
                  <td className="px-3 py-3 text-text-secondary">
                    {offering.quota}
                  </td>
                  <td className="px-3 py-3 text-text-secondary">
                    {offering.effective_from} → {offering.effective_until}
                  </td>
                  <td className="px-3 py-3">
                    <StatusBadge
                      tone={
                        offering.status === "Active"
                          ? "success"
                          : offering.status === "Retired"
                            ? "danger"
                            : offering.status === "Pending Approval"
                              ? "warning"
                              : "gray"
                      }
                    >
                      {OFFERING_STATUS_LABELS[offering.status]}
                    </StatusBadge>
                  </td>
                  <td className="px-3 py-3">
                    <div className="flex flex-wrap justify-end gap-1">
                      <RowActions
                        isDisabled={isMutating}
                        onEdit={
                          offering.status === "Active"
                            ? undefined
                            : () => {
                                setForm({
                                  name: offering.name,
                                  admission_year: offering.admission_year,
                                  campus: offering.campus,
                                  major: offering.major,
                                  admission_method: offering.admission_method,
                                  quota: String(offering.quota),
                                  effective_from: offering.effective_from,
                                  effective_until: offering.effective_until,
                                  status: offering.status,
                                });
                                setIsEditorOpen(true);
                              }
                        }
                        onDelete={
                          offering.status === "Active"
                            ? undefined
                            : () => setPendingDelete(offering)
                        }
                      />
                      {offering.status === "Draft" ||
                      offering.status === "Pending Approval" ? (
                        <Button
                          size="sm"
                          appearance="outline"
                          isDisabled={isMutating}
                          onPress={() => void setStatus(offering, "Active")}
                        >
                          Duyệt
                        </Button>
                      ) : null}
                      {offering.status === "Active" ? (
                        <Button
                          size="sm"
                          appearance="ghost"
                          variant="danger"
                          isDisabled={isMutating}
                          onPress={() => void setStatus(offering, "Retired")}
                        >
                          Ngừng dùng
                        </Button>
                      ) : null}
                    </div>
                  </td>
                </tr>
              ))}
            </Table>
            <CatalogPagination
              page={page}
              total={query.data.total}
              pageSize={PAGE_SIZE}
              onPageChange={setPage}
              isDisabled={query.isFetching || isMutating}
            />
          </>
        ) : (
          <EmptyState>
            {search
              ? "Không tìm thấy đợt tuyển sinh."
              : "Chưa có đợt tuyển sinh."}
          </EmptyState>
        )}
      </div>
      <ConfirmDialog
        isOpen={Boolean(pendingDelete)}
        ariaLabel="Xác nhận xóa đợt tuyển sinh"
        title={`Xóa đợt tuyển sinh ${pendingDelete?.name ?? "này"}?`}
        description="Đợt tuyển sinh đang được dùng không thể xóa; hãy ngừng dùng trước."
        confirmLabel={remove.isPending ? "Đang xóa…" : "Xóa đợt tuyển sinh"}
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
