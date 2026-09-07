"use client";

import { useState, type ChangeEvent, type FormEvent } from "react";
import { toast } from "sonner";

import {
  CreateDialogField,
  CreateDialogInput,
} from "@/components/common/create-dialog-field";
import { MultiStepDialog } from "@/components/common/multi-step-dialog";
import { Button } from "@/components/tailgrids/core/button";
import type { LeadImportResponse } from "@/services/api/student-school-update";

interface LeadImportDialogProps {
  isOpen: boolean;
  isSubmitting?: boolean;
  result?: LeadImportResponse;
  onOpenChange: (open: boolean) => void;
  onImport: (
    csvContent: string,
    filename: string,
  ) => Promise<LeadImportResponse>;
}

export default function LeadImportDialog({
  isOpen,
  isSubmitting = false,
  result,
  onOpenChange,
  onImport,
}: LeadImportDialogProps) {
  const [filename, setFilename] = useState("");
  const [csvContent, setCsvContent] = useState("");

  const reset = () => {
    setFilename("");
    setCsvContent("");
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) reset();
    onOpenChange(open);
  };

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.currentTarget.files?.[0];
    if (!file) {
      setFilename("");
      setCsvContent("");
      return;
    }
    if (!file.name.toLowerCase().endsWith(".csv")) {
      toast.error("Vui lòng chọn tệp có định dạng CSV.");
      event.currentTarget.value = "";
      return;
    }
    setFilename(file.name);
    setCsvContent(await file.text());
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!csvContent.trim()) {
      toast.error("Vui lòng chọn tệp CSV cần nhập.");
      return;
    }
    try {
      await onImport(csvContent, filename);
    } catch {
      // The parent mutation owns the error toast; keep the dialog open for correction.
    }
  };

  return (
    <MultiStepDialog
      ariaLabel="Nhập Lead từ CSV"
      currentStep={0}
      description="Các cột Required trong mapping không được để trống: Họ và tên, Di động, Tỉnh/Thành phố, Nguồn và Giao cho."
      footer={
        <div className="flex w-full items-center justify-end gap-2">
          <Button
            appearance="outline"
            isDisabled={isSubmitting}
            onPress={() => handleOpenChange(false)}
            type="button"
          >
            Đóng
          </Button>
          {!result && (
            <Button isDisabled={isSubmitting} type="submit">
              {isSubmitting ? "Đang nhập…" : "Nhập dữ liệu"}
            </Button>
          )}
        </div>
      }
      isBusy={isSubmitting}
      isOpen={isOpen}
      onOpenChange={handleOpenChange}
      onSubmit={handleSubmit}
      steps={["Tệp CSV"]}
      title="Nhập Lead từ CSV"
    >
      {!result ? (
        <div className="space-y-4">
          <CreateDialogField label="Tệp CSV" required>
            <CreateDialogInput
              accept=".csv,text/csv"
              label="Tệp CSV"
              type="file"
              onChange={handleFileChange}
            />
          </CreateDialogField>
          <p className="text-xs leading-5 text-text-tertiary">
            Hệ thống nhận cả header tiếng Việt trong file mapping và các header
            tiếng Anh tương ứng. Mỗi dòng lỗi sẽ được rollback riêng, các dòng
            hợp lệ vẫn được tạo.
          </p>
          {filename && (
            <p className="rounded-lg bg-background-soft-50 px-3 py-2 text-sm text-text-secondary">
              Đã chọn: <span className="font-medium">{filename}</span>
            </p>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-3">
            <ResultStat label="Tổng dòng" value={result.total} />
            <ResultStat label="Đã tạo" value={result.created} />
            <ResultStat label="Lỗi" value={result.failed} />
          </div>
          {result.errors.length > 0 && (
            <div className="max-h-64 overflow-y-auto rounded-lg border border-card-border p-3">
              <p className="text-sm font-semibold text-text-primary">
                Chi tiết dòng lỗi
              </p>
              <ul className="mt-2 space-y-2 text-xs text-text-secondary">
                {result.errors.map((error) => (
                  <li key={`${error.row}-${error.code}`}>
                    Dòng {error.row}: {error.message}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {result.failed === 0 && (
            <p className="text-sm text-text-secondary">
              Tất cả dòng trong tệp đã được tạo thành công.
            </p>
          )}
        </div>
      )}
    </MultiStepDialog>
  );
}

function ResultStat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg bg-background-soft-50 px-3 py-3">
      <p className="text-xs text-text-tertiary">{label}</p>
      <p className="mt-1 text-xl font-semibold text-text-primary">{value}</p>
    </div>
  );
}
