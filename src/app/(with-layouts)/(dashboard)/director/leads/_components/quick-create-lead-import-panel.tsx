"use client";

import { UploadCloud } from "@tailgrids/icons";
import { forwardRef, useImperativeHandle, useRef, useState } from "react";

import {
  CreateDialogField,
  CreateDialogSelect,
} from "@/components/common/create-dialog-field";
import { Badge } from "@/components/tailgrids/core/badge";
import { Button } from "@/components/tailgrids/core/button";
import {
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRoot,
  TableRow,
} from "@/components/tailgrids/core/table";
import { cn } from "@/utils/cn";
import {
  inspectLeadImport,
  previewLeadImport,
  type LeadImportFieldDefinition,
  type LeadImportInspectResponse,
  type LeadImportMapping,
  type LeadImportPreviewRow,
  type LeadImportPreviewResponse,
  type LeadImportResponse,
} from "@/services/api/lead-sale";
import { DropZone, FileTrigger, Text } from "react-aria-components";

import LeadImportMappingPreview from "./lead-import-mapping-preview";
import {
  StickyColumnPicker,
  reorderStickyColumns,
  stickyColumnClass,
  stickyColumnStyle,
} from "./sticky-column-picker";

export interface QuickCreateLeadImportPanelHandle {
  submit: () => Promise<void>;
  goBack: () => void;
}

interface QuickCreateLeadImportPanelProps {
  campaignOptions: { id: string; label: string }[];
  isSubmitting?: boolean;
  onStepChange?: (step: number) => void;
  onImport: (
    file: File,
    campaignCode: string,
    mapping: LeadImportMapping[],
  ) => Promise<LeadImportResponse>;
}

const QuickCreateLeadImportPanel = forwardRef<
  QuickCreateLeadImportPanelHandle,
  QuickCreateLeadImportPanelProps
>(function QuickCreateLeadImportPanel(
  { campaignOptions, isSubmitting = false, onStepChange, onImport },
  ref,
) {
  const [file, setFile] = useState<File | null>(null);
  const [filename, setFilename] = useState("");
  const [inspection, setInspection] =
    useState<LeadImportInspectResponse | null>(null);
  const [mapping, setMapping] = useState<LeadImportMapping[]>([]);
  const [stickyFields, setStickyFields] = useState<string[]>(["student_name"]);
  const [preview, setPreview] = useState<LeadImportPreviewResponse | null>(
    null,
  );
  const [result, setResult] = useState<LeadImportResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [campaignCode, setCampaignCode] = useState("");
  const [step, setStep] = useState(0);
  const [isInspecting, setIsInspecting] = useState(false);
  const [isPreviewing, setIsPreviewing] = useState(false);
  const inspectRequestRef = useRef(0);

  const setCurrentStep = (nextStep: number) => {
    setStep(nextStep);
    onStepChange?.(nextStep);
  };

  const handleSelectedFile = async (nextFile: File | undefined) => {
    const requestId = ++inspectRequestRef.current;
    setError(null);
    setResult(null);
    setPreview(null);
    setInspection(null);
    setMapping([]);
    setFile(null);
    setFilename("");
    setIsInspecting(false);
    setCurrentStep(0);
    if (!nextFile) return;

    const extension = nextFile.name.toLowerCase().split(".").pop();
    if (extension !== "csv" && extension !== "xlsx") {
      setError("Vui lòng chọn file CSV hoặc XLSX.");
      return;
    }

    setFile(nextFile);
    setFilename(nextFile.name);
    setIsInspecting(true);
    try {
      const nextInspection = await inspectLeadImport(nextFile);
      if (requestId !== inspectRequestRef.current) return;
      setInspection(nextInspection);
      setMapping(
        nextInspection.headers.map((header) => ({
          sourceIndex: header.sourceIndex,
          targetField: header.inferredField,
          enabled: header.enabled && Boolean(header.inferredField),
        })),
      );
      // File đọc xong -> tự nhảy sang bước map cột & xem trước.
      setCurrentStep(1);
    } catch (requestError) {
      if (requestId === inspectRequestRef.current) {
        setError(
          requestError instanceof Error
            ? requestError.message
            : "Chưa thể kiểm tra file import.",
        );
      }
    } finally {
      if (requestId === inspectRequestRef.current) setIsInspecting(false);
    }
  };

  const hasCompleteMapping = () => {
    const requiredImportFields = inspection?.requiredFields ?? [];
    // Cột đang bật buộc phải có target (UI đã chặn, đây là lớp phòng thủ).
    if (mapping.some((item) => item.enabled && !item.targetField)) return false;
    const targets = mapping
      .filter((item) => item.enabled && item.targetField)
      .map((item) => item.targetField as string);
    return (
      requiredImportFields.length > 0 &&
      requiredImportFields.every((field) => targets.includes(field)) &&
      new Set(targets).size === targets.length
    );
  };

  const handleNext = async () => {
    setError(null);
    if (step === 0) {
      if (!file || !inspection) {
        setError("Vui lòng chọn file hợp lệ để kiểm tra trước.");
        return;
      }
      setCurrentStep(1);
      return;
    }
    if (step === 1) {
      if (!campaignCode.trim()) {
        setError("Vui lòng chọn chiến dịch trước khi kiểm tra dữ liệu.");
        return;
      }
      if (!hasCompleteMapping()) {
        setError(
          "Vui lòng chọn target cho tất cả trường bắt buộc và không map trùng target.",
        );
        return;
      }
      if (!file) {
        setError("Vui lòng chọn lại file import.");
        return;
      }

      setIsPreviewing(true);
      try {
        const nextPreview = await previewLeadImport(
          file,
          campaignCode,
          mapping,
        );
        setPreview(nextPreview);
        setCurrentStep(2);
      } catch (requestError) {
        setError(
          requestError instanceof Error
            ? requestError.message
            : "Chưa thể kiểm tra dữ liệu đã map.",
        );
      } finally {
        setIsPreviewing(false);
      }
    }
  };

  const handleSubmit = async () => {
    if (isSubmitting || isInspecting || isPreviewing) return;
    if (step < 2) {
      await handleNext();
      return;
    }
    if (!file || !preview || !campaignCode.trim() || result) return;
    if (preview.valid === 0) {
      setError("File không có dòng hợp lệ để nhập.");
      return;
    }

    setError(null);
    try {
      setResult(await onImport(file, campaignCode, mapping));
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Chưa thể nhập Lead.",
      );
    }
  };

  const handleGoBack = () => {
    if (step > 0 && !isSubmitting && !isInspecting && !isPreviewing) {
      setError(null);
      setCurrentStep(step - 1);
    }
  };

  useImperativeHandle(ref, () => ({
    submit: handleSubmit,
    goBack: handleGoBack,
  }));

  const isFilePickerDisabled = isSubmitting || isInspecting || isPreviewing;

  return (
    <div className="space-y-4">
      {step <= 1 && (
        <CreateDialogField label="Chiến dịch" required>
          <CreateDialogSelect
            label="Chiến dịch"
            options={campaignOptions}
            value={campaignCode}
            isDisabled={
              isSubmitting ||
              isInspecting ||
              isPreviewing ||
              campaignOptions.length === 0
            }
            onChange={(value) => {
              setCampaignCode(value);
              setError(null);
            }}
          />
        </CreateDialogField>
      )}

      {step === 0 && (
        <>
          <FileDropZone
            filename={filename}
            isDisabled={isFilePickerDisabled}
            onSelect={handleSelectedFile}
          />
          <p className="text-xs leading-5 text-text-tertiary">
            Chọn file trước hoặc sau khi chọn campaign. File được kiểm tra ngay
            và chưa tạo Lead ở bước này.
          </p>
        </>
      )}

      {step === 1 && inspection && (
        <LeadImportMappingPreview
          headers={inspection.headers}
          sampleRows={inspection.sampleRows}
          fieldCatalog={inspection.fieldCatalog}
          requiredFields={inspection.requiredFields}
          mapping={mapping}
          stickyFields={stickyFields}
          onStickyFieldsChange={setStickyFields}
          onMappingChange={(nextMapping) => {
            setMapping(nextMapping);
            setPreview(null);
            setError(null);
          }}
          isDisabled={isSubmitting || isPreviewing}
        />
      )}

      {step === 2 && preview && (
        <ValidationPreview
          fieldCatalog={inspection?.fieldCatalog ?? []}
          filename={filename}
          preview={preview}
          result={result}
          stickyFields={stickyFields}
          onStickyFieldsChange={setStickyFields}
        />
      )}

      {isInspecting && (
        <p className="text-sm text-text-secondary" role="status">
          Đang đọc header và dữ liệu mẫu…
        </p>
      )}
      {isPreviewing && (
        <p className="text-sm text-text-secondary" role="status">
          Đang kiểm tra dữ liệu đã map…
        </p>
      )}
      {error && (
        <p className="text-xs text-error-600" role="alert">
          {error}
        </p>
      )}
    </div>
  );
});

export default QuickCreateLeadImportPanel;

function FileDropZone({
  filename,
  isDisabled,
  onSelect,
}: {
  filename: string;
  isDisabled: boolean;
  onSelect: (file: File | undefined) => void | Promise<void>;
}) {
  return (
    <div className="space-y-1.5">
      <p className="text-xs font-semibold text-input-label-text">
        File CSV hoặc XLSX <span className="ml-1 text-error-500">*</span>
      </p>
      <DropZone
        aria-label="Khu vực kéo thả file CSV hoặc XLSX"
        isDisabled={isDisabled}
        onDrop={async (event) => {
          const fileItem = event.items.find((item) => item.kind === "file");
          if (fileItem) await onSelect(await fileItem.getFile());
        }}
        className={({
          isDropTarget,
          isFocusVisible,
          isDisabled: zoneDisabled,
        }) =>
          cn(
            "flex min-h-44 flex-col items-center justify-center gap-3 rounded-xl border border-dashed px-5 py-6 text-center outline-none transition",
            isDropTarget
              ? "border-input-primary-focus-border bg-input-primary-focus-border/5"
              : "border-button-primary-outline-stroke bg-input-background hover:bg-background-gray-secondary_alt_2",
            isFocusVisible && "ring-4 ring-input-primary-focus-border/20",
            zoneDisabled && "cursor-not-allowed opacity-60",
          )
        }
      >
        <Text slot="label" className="sr-only">
          Khu vực kéo thả file CSV hoặc XLSX
        </Text>
        <span className="flex size-11 items-center justify-center rounded-full border border-card-border bg-background-gray-secondary_alt text-text-secondary">
          <UploadCloud size={24} aria-hidden="true" />
        </span>
        <div className="max-w-full space-y-1">
          <p className="truncate text-sm font-medium text-text-primary">
            {filename || "Kéo thả file vào đây"}
          </p>
          <p className="text-xs text-text-tertiary">
            {filename
              ? "Có thể chọn file khác để kiểm tra lại."
              : "Hoặc bấm Chọn file để mở cửa sổ trên máy tính."}
          </p>
        </div>
        <FileTrigger
          acceptedFileTypes={[
            "text/csv",
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          ]}
          allowsMultiple={false}
          onSelect={(files) => onSelect(files?.[0])}
        >
          <Button
            type="button"
            variant="primary"
            appearance="outline"
            size="sm"
            isDisabled={isDisabled}
          >
            {filename ? "Chọn file khác" : "Chọn file"}
          </Button>
        </FileTrigger>
      </DropZone>
    </div>
  );
}

function ValidationPreview({
  fieldCatalog,
  filename,
  preview,
  result,
  stickyFields,
  onStickyFieldsChange,
}: {
  fieldCatalog: LeadImportFieldDefinition[];
  filename: string;
  preview: LeadImportPreviewResponse;
  result: LeadImportResponse | null;
  stickyFields: string[];
  onStickyFieldsChange: (fields: string[]) => void;
}) {
  const fieldLabels = new Map(
    fieldCatalog.map((field) => [field.key, field.label]),
  );
  const mappedFieldLabels = preview.mappedFields.map(
    (field) => fieldLabels.get(field) ?? IMPORT_FIELD_LABELS[field] ?? field,
  );
  const requiredFieldSet = new Set(
    fieldCatalog.filter((field) => field.required).map((field) => field.key),
  );
  const mappedFieldOrder = new Map(
    preview.mappedFields.map((field, index) => [field, index]),
  );
  const previewFieldKeys = [
    ...new Set(
      (preview.mappedFields.length > 0
        ? preview.mappedFields
        : fieldCatalog.map((field) => field.key)
      ).filter((field) => field !== "campaign"),
    ),
  ].sort(
    (left, right) =>
      Number(!requiredFieldSet.has(left)) -
        Number(!requiredFieldSet.has(right)) ||
      (mappedFieldOrder.get(left) ?? Number.MAX_SAFE_INTEGER) -
        (mappedFieldOrder.get(right) ?? Number.MAX_SAFE_INTEGER),
  );
  const orderedPreviewFieldKeys = reorderStickyColumns(
    previewFieldKeys.map((id) => ({ id })),
    stickyFields,
  ).map((column) => column.id);
  const stickyOptions = orderedPreviewFieldKeys.map((field) => ({
    id: field,
    label: fieldLabels.get(field) ?? IMPORT_FIELD_LABELS[field] ?? field,
  }));
  const outcomeCounts = preview.rows.reduce(
    (counts, row) => {
      const outcome = row.processingOutcome;
      if (outcome === "DUPLICATE") counts.duplicates += 1;
      else if (outcome === "MATCHED") counts.matched += 1;
      else if (outcome === "CREATED") counts.created += 1;
      else if (outcome === "INVALID" || row.errors.length > 0) {
        counts.invalid += 1;
      }
      return counts;
    },
    { created: 0, matched: 0, duplicates: 0, invalid: 0 },
  );

  return (
    <section
      aria-labelledby="lead-import-validation-title"
      className="space-y-3"
    >
      <div>
        <h2
          id="lead-import-validation-title"
          className="text-sm font-semibold text-text-primary"
        >
          Kiểm tra dữ liệu trước khi nhập
        </h2>
        <p className="mt-1 truncate text-xs text-text-tertiary">{filename}</p>
      </div>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        <ResultStat label="Tổng dòng" value={preview.total} />
        <ResultStat label="Có thể nhập" value={outcomeCounts.created} />
        <ResultStat label="Đã có hồ sơ" value={outcomeCounts.matched} />
        <ResultStat
          label="Trùng"
          value={outcomeCounts.duplicates}
          tone="error"
        />
      </div>
      {preview.mappedFields.length > 0 && (
        <p className="text-xs text-text-secondary">
          Đã map: {mappedFieldLabels.join(", ")}.
        </p>
      )}
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs text-text-tertiary">
          Mỗi dòng đã được đối chiếu trước khi nhập. Dấu{" "}
          <span className="font-semibold text-error-600">Trùng</span> màu đỏ là
          hồ sơ cần xem lại; không có dữ liệu nào được tạo ở bước này.
        </p>
        <StickyColumnPicker
          options={stickyOptions}
          selected={stickyFields}
          onChange={onStickyFieldsChange}
        />
      </div>
      {outcomeCounts.invalid > 0 && (
        <Badge color="warning">Cần bổ sung: {outcomeCounts.invalid}</Badge>
      )}
      <div
        className="overflow-x-auto rounded-lg border border-border-primary"
        aria-live="polite"
      >
        <TableRoot className="min-w-[980px]">
          <TableHeader>
            <TableRow>
              <TableHead
                className={cn("sticky left-0 z-20 w-14 bg-background-white-secondary align-top")}
              >
                Dòng
              </TableHead>
              {orderedPreviewFieldKeys.map((field) => {
                const stickyIndex = stickyFields.indexOf(field);
                return (
                <TableHead
                  key={field}
                  className={cn(
                    "min-w-[170px] align-top",
                    stickyColumnClass(stickyIndex >= 0),
                  )}
                  style={stickyColumnStyle(stickyIndex, 170)}
                >
                  {fieldLabels.get(field) ??
                    IMPORT_FIELD_LABELS[field] ??
                    field}
                  {requiredFieldSet.has(field) && (
                    <span aria-hidden="true" className="ml-1 text-error-500">
                      *
                    </span>
                  )}
                </TableHead>
                );
              })}
              <TableHead className="min-w-[230px] align-top">
                Đối chiếu hồ sơ
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {preview.rows.length > 0 ? (
              preview.rows.map((row) => (
                <ImportPreviewTableRow
                  key={row.row}
                  fieldKeys={orderedPreviewFieldKeys}
                  stickyFields={stickyFields}
                  row={row}
                />
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={previewFieldKeys.length + 2}
                  className="py-8 text-center text-sm text-text-tertiary"
                >
                  Chưa có dòng dữ liệu để hiển thị.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </TableRoot>
      </div>
      {result && (
        <div className="space-y-3" aria-live="polite">
          <p className="text-sm font-medium text-text-primary">
            Đã tạo {result.created}/{result.total} Lead.
          </p>
          {result.errors.length > 0 && (
            <div className="space-y-1 text-xs text-error-600">
              <p>
                {result.errors.length} dòng chưa được nhập; kiểm tra lỗi trên
                từng dòng.
              </p>
              <ul className="list-disc space-y-1 pl-5">
                {result.errors.map((error) => (
                  <li key={`${error.row}-${error.code}-${error.message}`}>
                    Dòng {error.row || "?"}: {humanizeImportMessage(error.message)}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </section>
  );
}

type ImportPreviewBadgeColor = "gray" | "warning" | "success" | "error";

function ImportPreviewTableRow({
  fieldKeys,
  row,
  stickyFields,
}: {
  fieldKeys: string[];
  row: LeadImportPreviewRow;
  stickyFields: string[];
}) {
  const status = getImportPreviewStatus(row);
  return (
    <TableRow className={status.rowClassName}>
      <TableCell
        className="sticky left-0 z-10 w-14 bg-background-white-secondary text-text-tertiary"
      >
        {row.row}
      </TableCell>
      {fieldKeys.map((field) => (
        <TableCell
          key={field}
          className={cn(
            field === "student_name"
              ? "font-medium text-text-primary"
              : "text-text-secondary",
            isEmptyPreviewField(row.fields, field) &&
              "bg-badge-error-background/35",
            stickyColumnClass(stickyFields.includes(field)),
          )}
          style={stickyColumnStyle(stickyFields.indexOf(field), 170)}
        >
          {previewField(row.fields, field)}
        </TableCell>
      ))}
      <TableCell>
        <div className="space-y-1.5">
          <Badge color={status.color}>{status.label}</Badge>
          <p className="text-xs leading-5 text-text-tertiary">
            {status.detail}
          </p>
        </div>
      </TableCell>
    </TableRow>
  );
}

function getImportPreviewStatus(row: LeadImportPreviewRow): {
  label: string;
  color: ImportPreviewBadgeColor;
  detail: string;
  rowClassName?: string;
} {
  if (row.processingOutcome === "DUPLICATE") {
    const reference = row.duplicateOf
      ? `Trùng với hồ sơ ${row.duplicateOf}.`
      : row.reason || "Đã phát hiện hồ sơ trùng trong dữ liệu nhập.";
    return {
      label: "Trùng",
      color: "error",
      detail: reference,
      rowClassName: "bg-badge-error-background/30",
    };
  }
  if (row.processingOutcome === "MATCHED") {
    return {
      label: "Đã có hồ sơ học sinh",
      color: "warning",
      detail: row.targetStudent
        ? `Khớp hồ sơ học sinh ${row.targetStudent}.`
        : row.reason || "Đã khớp một hồ sơ học sinh.",
      rowClassName: "bg-badge-warning-background/20",
    };
  }
  if (row.processingOutcome === "CREATED") {
    return {
      label: "Không trùng",
      color: "success",
      detail: "Chưa phát hiện hồ sơ trùng.",
    };
  }
  if (row.processingOutcome === "INVALID" || row.errors.length > 0) {
    return {
      label: "Cần bổ sung",
      color: "warning",
      detail: humanizeImportMessage(
        row.reason || row.errors[0]?.message || "Thiếu thông tin bắt buộc.",
      ),
      rowClassName: "bg-badge-warning-background/10",
    };
  }
  return {
    label: "Cần kiểm tra",
    color: "gray",
    detail: row.reason || "Chưa có kết quả đối chiếu.",
  };
}

function previewField(fields: Record<string, unknown>, key: string): string {
  const value = fields[key];
  return value === null || value === undefined || String(value).trim() === ""
    ? "—"
    : String(value);
}

function isEmptyPreviewField(
  fields: Record<string, unknown>,
  key: string,
): boolean {
  const value = fields[key];
  return value === null || value === undefined || String(value).trim() === "";
}

function ResultStat({
  label,
  value,
  tone = "default",
}: {
  label: string;
  value: number;
  tone?: "default" | "error";
}) {
  return (
    <div className="rounded-lg bg-background-soft-50 px-3 py-2">
      <p className="text-xs text-text-tertiary">{label}</p>
      <p
        className={cn(
          "mt-1 text-lg font-semibold",
          tone === "error" ? "text-error-600" : "text-text-primary",
        )}
      >
        {value}
      </p>
    </div>
  );
}

// Backend đôi khi kèm thẻ HTML (<b>) và tiền tố mã lỗi ("INVALID_LOOKUP: ")
// trong message — bỏ đi để người dùng đọc được câu tiếng Việt thuần.
function humanizeImportMessage(message: string): string {
  return message
    .replace(/<\/?[a-z][^>]*>/gi, "")
    .replace(/^(?:[A-Za-z_][A-Za-z0-9_]*\.)+[A-Za-z_][A-Za-z0-9_]*:\s*/, "")
    .replace(/^\s*[A-Z][A-Z0-9_]*:\s*/, "")
    .trim();
}

const IMPORT_FIELD_LABELS: Record<string, string> = {
  student_name: "Họ và tên",
  phone: "Di động",
  email: "Email",
  other_email: "Email khác",
  id_number: "CCCD",
  gender: "Giới tính",
  date_of_birth: "Ngày sinh",
  religion: "Tôn giáo",
  province: "Tỉnh/Thành phố",
  ward: "Phường/Xã",
  high_school: "Trường THPT",
  major: "Ngành quan tâm",
  current_grade: "Khối hiện tại",
  study_stage: "Giai đoạn học tập",
  advertising_channel: "Kênh quảng cáo",
  segments: "Phân khúc",
  admission_year: "Năm tuyển sinh",
  conversion_potential: "Khả năng chuyển đổi",
  source: "Nguồn",
  assigned_to: "Giao cho",
  branch: "Chi nhánh",
  tags: "Tags",
  aspiration: "Nguyện vọng vào FPT",
  event_participated: "Sự kiện tham gia",
  description: "Mô tả",
  notes: "Ghi chú",
  alt_name: "Tên người liên hệ khác",
  alt_phone: "Số điện thoại khác",
  alt_address: "Địa chỉ khác",
};
