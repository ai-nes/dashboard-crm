"use client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { MultiStepDialog } from "@/components/common/multi-step-dialog";
import { Button } from "@/components/tailgrids/core/button";
import type {
  RecordExportCatalog,
  RecordExportConditions,
  RecordExportConfig,
  RecordExportPreview,
} from "@/services/api/record-export/types";
import { RecordExportFilters } from "./record-export-filters";
import { RecordExportColumnsPicker } from "./record-export-columns-picker";
import { RecordExportPreviewTable } from "./record-export-preview";
import {
  exportConfigKey,
  hasCurrentPreview,
  validateExportDraft,
} from "./record-export-state";

export interface RecordExportDialogProps<Filters extends object> {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  canExport: boolean;
  scopeKey: string;
  initialFilters: Filters;
  cacheKey: string;
  title: string;
  entityLabel: string;
  getFields: (signal?: AbortSignal) => Promise<RecordExportCatalog>;
  previewExport: (
    config: RecordExportConfig<Filters>,
    page: number,
  ) => Promise<RecordExportPreview>;
  exportFile: (config: RecordExportConfig<Filters>) => Promise<Blob>;
  downloadWorkbook: (blob: Blob) => void;
  describeFilters: (filters: Filters, catalog: RecordExportCatalog) => string[];
  clearFilters: (filters: Filters) => Filters;
}
const steps = ["Bộ lọc", "Chọn cột", "Preview và tải"];
function errorMessage(error: unknown) {
  return error instanceof Error
    ? error.message
    : "Chưa thể xử lý yêu cầu xuất Excel.";
}

export default function RecordExportDialog<Filters extends object>(
  props: RecordExportDialogProps<Filters>,
) {
  const catalog = useQuery({
    queryKey: [props.cacheKey, props.scopeKey],
    queryFn: ({ signal }) => props.getFields(signal),
    enabled: props.isOpen && props.canExport,
    retry: false,
  });
  if (!props.canExport) return null;
  if (catalog.data && !catalog.isError)
    return (
      <RecordExportBuilder
        {...props}
        catalog={catalog.data}
        catalogChecking={catalog.isFetching}
      />
    );
  return (
    <MultiStepDialog
      isOpen={props.isOpen}
      onOpenChange={props.onOpenChange}
      title={props.title}
      description="Lọc hồ sơ, chọn cột và xem trước dữ liệu để xuất."
      steps={steps}
      currentStep={0}
      formClassName="flex min-h-0 flex-1 flex-col"
      bodyClassName="min-h-0 flex-1"
      scrollable
      size="wide"
      onSubmit={(event) => event.preventDefault()}
      footer={
        <Button appearance="outline" onPress={() => props.onOpenChange(false)}>
          Hủy
        </Button>
      }
    >
      {catalog.isError ? (
        <div role="alert" className="space-y-3">
          <p>{errorMessage(catalog.error)}</p>
          <Button appearance="outline" onPress={() => catalog.refetch()}>
            Thử tải lại các field
          </Button>
        </div>
      ) : (
        <p role="status" className="py-8 text-center text-text-tertiary">
          Đang tải các field được phép xuất…
        </p>
      )}
    </MultiStepDialog>
  );
}

function RecordExportBuilder<Filters extends object>({
  catalog,
  catalogChecking = false,
  ...props
}: RecordExportDialogProps<Filters> & {
  catalog: RecordExportCatalog;
  catalogChecking?: boolean;
}) {
  const queryClient = useQueryClient();
  const [step, setStep] = useState(1);
  const [filters, setFilters] = useState(props.initialFilters);
  const [advancedFilters, setAdvancedFilters] =
    useState<RecordExportConditions>({ logic: "AND", conditions: [] });
  const [columnIds, setColumnIds] = useState(catalog.defaultColumnIds);
  const [preview, setPreview] = useState<{
    key: string;
    data: RecordExportPreview;
  }>();
  const [error, setError] = useState("");
  const config: RecordExportConfig<Filters> = {
    filters,
    advancedFilters,
    columnIds,
  };
  const validation = validateExportDraft(
    catalog.fields,
    columnIds,
    advancedFilters,
  );
  const filterValidation = validateExportDraft(
    catalog.fields,
    [catalog.fields[0].id],
    advancedFilters,
  );
  const currentPreview =
    !validation && hasCurrentPreview(config, preview?.key)
      ? preview?.data
      : undefined;
  const onError = (error: unknown) => {
    setError(errorMessage(error));
    if (
      typeof error === "object" &&
      error &&
      "status" in error &&
      error.status === 403
    )
      void queryClient.invalidateQueries({
        queryKey: [props.cacheKey, props.scopeKey],
      });
  };
  const previewMutation = useMutation({
    mutationFn: ({
      config,
      page,
    }: {
      config: RecordExportConfig<Filters>;
      page: number;
    }) => props.previewExport(config, page),
    onSuccess: (data, variables) => {
      setPreview({ key: exportConfigKey(variables.config), data });
      setError("");
    },
    onError: (error) => {
      setPreview(undefined);
      onError(error);
    },
  });
  const downloadMutation = useMutation({
    mutationFn: () => {
      if (
        !props.canExport ||
        !currentPreview ||
        validation ||
        currentPreview.meta.total === 0 ||
        currentPreview.meta.total > catalog.maxRows
      )
        throw new Error("Vui lòng xem lại preview hợp lệ trước khi xuất.");
      return props.exportFile(config);
    },
    onSuccess: (blob) => {
      props.downloadWorkbook(blob);
      toast.success(`Đã xuất file Excel ${props.entityLabel}.`);
    },
    onError,
  });
  const isBusy =
    previewMutation.isPending || downloadMutation.isPending || catalogChecking;
  function loadPreview(page = 1) {
    if (validation || !props.canExport) {
      setError(validation ?? "Bạn không có quyền xuất.");
      return;
    }
    setError("");
    setStep(3);
    previewMutation.mutate({ config, page });
  }
  const inherited = props.describeFilters(filters, catalog);
  return (
    <MultiStepDialog
      isOpen={props.isOpen}
      onOpenChange={props.onOpenChange}
      title={props.title}
      description={`Xuất toàn bộ ${props.entityLabel} phù hợp bộ lọc và trong phạm vi bạn được xem.`}
      steps={steps}
      currentStep={step - 1}
      formClassName="flex min-h-0 flex-1 flex-col"
      bodyClassName="min-h-0 flex-1"
      scrollable
      size="wide"
      isBusy={isBusy}
      onSubmit={(event) => event.preventDefault()}
      footer={
        <div className="grid w-full grid-cols-2 gap-2 sm:flex sm:w-auto sm:flex-wrap sm:justify-end">
          <Button
            appearance="outline"
            isDisabled={isBusy}
            onPress={() => props.onOpenChange(false)}
          >
            Hủy
          </Button>
          {step > 1 && (
            <Button
              appearance="outline"
              isDisabled={isBusy}
              onPress={() => {
                setStep(step - 1);
                setError("");
              }}
            >
              Quay lại
            </Button>
          )}
          {step === 1 && (
            <Button
              isDisabled={isBusy || Boolean(filterValidation)}
              onPress={() => {
                setStep(2);
                setError("");
              }}
            >
              Tiếp: Chọn cột
            </Button>
          )}
          {step === 2 && (
            <Button
              isDisabled={isBusy || Boolean(validation)}
              onPress={() => loadPreview()}
            >
              Xem preview
            </Button>
          )}
          {step === 3 && (
            <>
              <Button
                appearance="outline"
                isDisabled={isBusy || Boolean(validation)}
                onPress={() => loadPreview(currentPreview?.meta.page ?? 1)}
              >
                Làm mới preview
              </Button>
              <Button
                isDisabled={
                  isBusy ||
                  !currentPreview ||
                  currentPreview.meta.total === 0 ||
                  currentPreview.meta.total > catalog.maxRows ||
                  Boolean(error)
                }
                onPress={() => downloadMutation.mutate()}
              >
                {downloadMutation.isPending ? "Đang xuất…" : "Tải file Excel"}
              </Button>
            </>
          )}
        </div>
      }
    >
      {error && (
        <p
          role="alert"
          className="rounded-lg border border-card-border p-3 text-sm text-text-primary"
        >
          {error}
        </p>
      )}
      {step === 1 && (
        <>
          <section
            aria-label="Bộ lọc từ danh sách"
            className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1 text-sm"
          >
            <p className="min-w-0 text-text-secondary">
              <span className="text-text-tertiary">Bộ lọc danh sách: </span>
              {inherited.length ? inherited.join(" · ") : "Không áp dụng"}
            </p>
            <Button
              appearance="ghost"
              size="sm"
              className="h-7 shrink-0 px-2 py-1 text-xs"
              onPress={() =>
                setFilters(
                  inherited.length
                    ? props.clearFilters(filters)
                    : props.initialFilters,
                )
              }
            >
              {inherited.length
                ? "Bỏ bộ lọc danh sách"
                : "Dùng bộ lọc danh sách"}
            </Button>
          </section>
          <RecordExportFilters
            fields={catalog.fields}
            value={advancedFilters}
            onChange={(value) => {
              setAdvancedFilters(value);
              setError("");
            }}
          />
          {filterValidation && (
            <p role="alert" className="text-sm text-text-secondary">
              {filterValidation}
            </p>
          )}
        </>
      )}
      {step === 2 && (
        <>
          <RecordExportColumnsPicker
            fields={catalog.fields}
            columns={columnIds}
            defaults={catalog.defaultColumnIds}
            onChange={(value) => {
              setColumnIds(value);
              setError("");
            }}
          />
          {validation && (
            <p role="alert" className="text-sm text-text-secondary">
              {validation}
            </p>
          )}
        </>
      )}
      {step === 3 && (
        <>
          {previewMutation.isPending && (
            <p role="status" className="text-text-tertiary">
              Đang tải preview…
            </p>
          )}
          {currentPreview ? (
            <RecordExportPreviewTable
              data={currentPreview}
              entityLabel={props.entityLabel}
              maxRows={catalog.maxRows}
              isPending={isBusy}
              onPageChange={loadPreview}
            />
          ) : (
            !previewMutation.isPending && (
              <p className="py-8 text-center text-text-tertiary">
                Chưa có preview hợp lệ cho cấu hình hiện tại. Hãy kiểm tra bộ
                lọc/cột và bấm “Làm mới preview”.
              </p>
            )
          )}
        </>
      )}
    </MultiStepDialog>
  );
}
