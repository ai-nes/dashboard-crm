"use client";

import { UploadCloud } from "@tailgrids/icons";
import {
  forwardRef,
  useImperativeHandle,
  useRef,
  useState,
} from "react";

import {
  CreateDialogField,
  CreateDialogSelect,
} from "@/components/common/create-dialog-field";
import { Button } from "@/components/tailgrids/core/button";
import { cn } from "@/utils/cn";
import {
  inspectLeadImport,
  previewLeadImport,
  type LeadImportInspectResponse,
  type LeadImportMapping,
  type LeadImportPreviewResponse,
  type LeadImportResponse,
} from "@/services/api/lead-sale";
import { DropZone, FileTrigger, Text } from "react-aria-components";

import LeadImportMappingPreview from "./lead-import-mapping-preview";

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
  {
    campaignOptions,
    isSubmitting = false,
    onStepChange,
    onImport,
  },
  ref,
) {
  const [file, setFile] = useState<File | null>(null);
  const [filename, setFilename] = useState("");
  const [inspection, setInspection] = useState<LeadImportInspectResponse | null>(
    null,
  );
  const [mapping, setMapping] = useState<LeadImportMapping[]>([]);
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
        setError("Vui lòng chọn campaign trước khi kiểm tra dữ liệu.");
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
        <CreateDialogField label="Campaign" required>
          <CreateDialogSelect
            label="Campaign"
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
          filename={filename}
          preview={preview}
          result={result}
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
        className={({ isDropTarget, isFocusVisible, isDisabled: zoneDisabled }) =>
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
  filename,
  preview,
  result,
}: {
  filename: string;
  preview: LeadImportPreviewResponse;
  result: LeadImportResponse | null;
}) {
  return (
    <section aria-labelledby="lead-import-validation-title" className="space-y-3">
      <div>
        <h2
          id="lead-import-validation-title"
          className="text-sm font-semibold text-text-primary"
        >
          Kiểm tra dữ liệu trước khi nhập
        </h2>
        <p className="mt-1 truncate text-xs text-text-tertiary">{filename}</p>
      </div>
      <div className="grid grid-cols-3 gap-2">
        <ResultStat label="Tổng dòng" value={preview.total} />
        <ResultStat label="Hợp lệ" value={preview.valid} />
        <ResultStat label="Lỗi" value={preview.failed} />
      </div>
      {preview.mappedFields.length > 0 && (
        <p className="text-xs text-text-secondary">
          Đã map: {preview.mappedFields.join(", ")}.
        </p>
      )}
      {preview.errors.length > 0 && !result && (
        <ImportErrors errors={preview.errors} />
      )}
      {result && (
        <div className="space-y-3" aria-live="polite">
          <p className="text-sm font-medium text-text-primary">
            Đã tạo {result.created}/{result.total} Lead.
          </p>
          {result.errors.length > 0 && <ImportErrors errors={result.errors} />}
        </div>
      )}
    </section>
  );
}

function ResultStat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg bg-background-soft-50 px-3 py-2">
      <p className="text-xs text-text-tertiary">{label}</p>
      <p className="mt-1 text-lg font-semibold text-text-primary">{value}</p>
    </div>
  );
}

// Backend đôi khi kèm thẻ HTML (<b>) và tiền tố mã lỗi ("INVALID_LOOKUP: ")
// trong message — bỏ đi để người dùng đọc được câu tiếng Việt thuần.
function humanizeImportMessage(message: string): string {
  return message
    .replace(/<\/?[a-z][^>]*>/gi, "")
    .replace(/^\s*[A-Z][A-Z0-9_]*:\s*/, "")
    .trim();
}

function ImportErrors({
  errors,
}: {
  errors: { row: number; code: string; message: string }[];
}) {
  return (
    <div className="max-h-40 overflow-y-auto rounded-lg border border-card-border p-3">
      <p className="text-sm font-semibold text-text-primary">Dòng cần kiểm tra</p>
      <ul className="mt-2 space-y-1.5 text-xs text-text-secondary">
        {errors.map((item) => (
          <li key={`${item.row}-${item.code}`}>
            Dòng {item.row}: {humanizeImportMessage(item.message)}
          </li>
        ))}
      </ul>
    </div>
  );
}
