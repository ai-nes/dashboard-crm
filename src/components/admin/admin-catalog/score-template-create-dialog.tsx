"use client";

import type { FormEvent } from "react";

import { CreateDialogSelect } from "@/components/common/create-dialog-field";
import type { ScoreTemplate } from "@/services/api/admin-catalog";

import {
  CatalogEditorDialog,
  DateTimePickerField,
  Field,
  TextInput,
} from "./admin-catalog-ui";

interface ScoreTemplateCreateDialogProps {
  isOpen: boolean;
  isSaving: boolean;
  templateName: string;
  status: ScoreTemplate["status"];
  startTime: string;
  endTime: string;
  statusOptions: Array<{
    id: ScoreTemplate["status"];
    label: string;
  }>;
  showErrors: boolean;
  onTemplateNameChange: (value: string) => void;
  onStatusChange: (value: ScoreTemplate["status"]) => void;
  onStartTimeChange: (value: string) => void;
  onEndTimeChange: (value: string) => void;
  onCancel: () => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}

export default function ScoreTemplateCreateDialog({
  isOpen,
  isSaving,
  templateName,
  status,
  startTime,
  endTime,
  statusOptions,
  showErrors,
  onTemplateNameChange,
  onStatusChange,
  onStartTimeChange,
  onEndTimeChange,
  onCancel,
  onSubmit,
}: ScoreTemplateCreateDialogProps) {
  const nameError =
    showErrors && !templateName.trim()
      ? "Nhập tên template trước khi tạo."
      : undefined;

  return (
    <CatalogEditorDialog
      title="Thêm Score Template"
      description="Tạo template nền trước. Sau đó, thêm từng rubric ở trang chi tiết."
      isOpen={isOpen}
      isSaving={isSaving}
      submitLabel="Tạo template"
      onOpenChange={(open) => {
        if (!open && !isSaving) onCancel();
      }}
      onSubmit={onSubmit}
    >
      <Field label="Tên template" required error={nameError}>
        <TextInput
          autoFocus
          value={templateName}
          aria-invalid={Boolean(nameError)}
          aria-required="true"
          placeholder="Ví dụ: Default Scoring 2026"
          onChange={(event) => onTemplateNameChange(event.target.value)}
        />
      </Field>

      <Field
        label="Trạng thái"
        hint="Bạn có thể thay đổi trạng thái và thời gian áp dụng trong phần chỉnh sửa."
      >
        <CreateDialogSelect
          label="Trạng thái"
          value={status}
          options={statusOptions}
          isDisabled={isSaving}
          onChange={(value) => onStatusChange(value as ScoreTemplate["status"])}
        />
      </Field>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Bắt đầu">
          <DateTimePickerField
            value={startTime}
            onChange={onStartTimeChange}
            ariaLabel="Thời điểm bắt đầu template"
            disabled={isSaving}
          />
        </Field>
        <Field label="Kết thúc">
          <DateTimePickerField
            value={endTime}
            onChange={onEndTimeChange}
            ariaLabel="Thời điểm kết thúc template"
            disabled={isSaving}
          />
        </Field>
      </div>

      <p className="rounded-lg bg-background-gray-secondary/40 px-3 py-2.5 text-xs leading-5 text-text-secondary">
        Template có thể được tạo trước khi có rubric. Trong trang chi tiết, chọn{" "}
        <span className="font-medium text-text-primary">Thêm rubric</span>
        để tạo từng thành phần điểm và lưu độc lập.
      </p>
    </CatalogEditorDialog>
  );
}
