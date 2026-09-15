"use client";

import {
  DropdownField,
  type DropdownOption,
} from "@/components/common/dropdown-field";

import {
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRoot,
  TableRow,
} from "@/components/tailgrids/core/table";
import { cn } from "@/utils/cn";
import type {
  LeadImportFieldDefinition,
  LeadImportHeader,
  LeadImportMapping,
  LeadImportSampleRow,
} from "@/services/api/lead-sale";
import {
  StickyColumnPicker,
  reorderStickyColumns,
  stickyColumnClass,
  stickyColumnStyle,
} from "./sticky-column-picker";

// Key giả cho lựa chọn "không map cột này" trong dropdown target.
const SKIP_KEY = "__skip__";
const SERVER_MANAGED_IMPORT_HEADERS = new Set([
  "tinh trang lead",
  "lead status",
  "conversion status",
  "enrollment status",
  "lifecycle stage",
]);

function normalizeImportHeader(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[đĐ]/g, "d")
    .replace(/_/g, " ")
    .toLocaleLowerCase("vi-VN")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

interface LeadImportMappingPreviewProps {
  headers: LeadImportHeader[];
  sampleRows: LeadImportSampleRow[];
  fieldCatalog: LeadImportFieldDefinition[];
  requiredFields: string[];
  mapping: LeadImportMapping[];
  onMappingChange: (mapping: LeadImportMapping[]) => void;
  stickyFields: string[];
  onStickyFieldsChange: (fields: string[]) => void;
  isDisabled?: boolean;
}

export default function LeadImportMappingPreview({
  headers,
  sampleRows,
  fieldCatalog,
  requiredFields,
  mapping,
  onMappingChange,
  stickyFields,
  onStickyFieldsChange,
  isDisabled = false,
}: LeadImportMappingPreviewProps) {
  const mappingBySource = new Map(
    mapping.map((item) => [item.sourceIndex, item]),
  );

  const requiredFieldSet = new Set(requiredFields);
  const mappedTargets = mapping
    .filter((item) => item.enabled && item.targetField)
    .map((item) => item.targetField as string);
  const duplicateTargets = [
    ...new Set(
      mappedTargets.filter(
        (target, index) => mappedTargets.indexOf(target) !== index,
      ),
    ),
  ];
  const mappedRequiredCount = requiredFields.filter((key) =>
    mappedTargets.includes(key),
  ).length;
  const visibleHeaders = headers.filter(
    (header) =>
      !SERVER_MANAGED_IMPORT_HEADERS.has(normalizeImportHeader(header.label)),
  );

  // Bảng gộp: mỗi cột nguồn là một cột, tiêu đề cột là dropdown chọn target CRM.
  const columnPriority = (targetField: string | null) => {
    if (targetField === null) return 2;
    return requiredFieldSet.has(targetField) ? 0 : 1;
  };
  const projectedColumns = visibleHeaders
    .map((header) => {
      const item = mappingBySource.get(header.sourceIndex);
      const targetField = item?.enabled ? (item.targetField ?? null) : null;
      return {
        sourceIndex: header.sourceIndex,
        sourceLabel: header.label || `Cột ${header.sourceIndex + 1}`,
        targetField,
        isDuplicate: Boolean(
          targetField && duplicateTargets.includes(targetField),
        ),
      };
    })
    .sort(
      (left, right) =>
        columnPriority(left.targetField) - columnPriority(right.targetField) ||
        left.sourceIndex - right.sourceIndex,
    );
  const orderedColumns = reorderStickyColumns(
    projectedColumns.map((column) => ({
      ...column,
      id: column.targetField ?? `source-${column.sourceIndex}`,
    })),
    stickyFields,
  );
  const stickyOptions = orderedColumns
    .filter((column) => column.targetField)
    .map((column) => ({
      id: column.targetField as string,
      label:
        fieldCatalog.find((field) => field.key === column.targetField)?.label ??
        column.sourceLabel,
    }));

  const setTarget = (sourceIndex: number, targetField: string | null) => {
    onMappingChange(
      headers.map((header) => {
        const current = mappingBySource.get(header.sourceIndex) ?? {
          sourceIndex: header.sourceIndex,
          targetField: null,
          enabled: false,
        };
        if (header.sourceIndex !== sourceIndex) return current;
        return { ...current, targetField, enabled: Boolean(targetField) };
      }),
    );
  };

  return (
    <section aria-labelledby="lead-import-mapping-title" className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h3
            id="lead-import-mapping-title"
            className="text-sm font-semibold text-text-primary"
          >
            Xem trước dữ liệu theo target CRM
          </h3>
          <p className="mt-1 text-xs text-text-tertiary">
            Trường bắt buộc có dấu * và được ưu tiên xếp bên trái. Cột CSV để
            trống sẽ bị bỏ qua khi nhập. Tình trạng Lead tự động là Mới.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <StickyColumnPicker
            options={stickyOptions}
            selected={stickyFields}
            onChange={onStickyFieldsChange}
          />
          <span
            className="shrink-0 rounded-full bg-badge-primary-background px-2.5 py-1 text-xs font-semibold text-badge-primary-text"
            aria-label={`${mappedRequiredCount} trên ${requiredFields.length} trường bắt buộc đã được map`}
          >
            {mappedRequiredCount}/{requiredFields.length} trường bắt buộc
          </span>
        </div>
      </div>

      {duplicateTargets.length > 0 && (
        <p
          className="rounded-lg border border-error-200 bg-badge-error-background px-3 py-2 text-xs text-error-600"
          role="alert"
        >
          Một target CRM chỉ được map một lần: {duplicateTargets.join(", ")}.
        </p>
      )}

      <div
        className="overflow-x-auto rounded-lg border border-border-primary"
        aria-live="polite"
      >
        <TableRoot className="min-w-[640px]">
          <TableHeader>
            <TableRow>
              <TableHead
                className={cn("sticky left-0 z-20 w-14 bg-background-white-secondary align-top")}
              >
                Dòng
              </TableHead>
              {orderedColumns.map((column) => {
                const isSticky = Boolean(
                  column.targetField && stickyFields.includes(column.targetField),
                );
                const stickyIndex = isSticky
                  ? stickyFields.indexOf(column.targetField as string)
                  : -1;
                return (
                <TableHead
                  key={column.sourceIndex}
                  className={cn(
                    "min-w-[220px] align-top",
                    stickyColumnClass(isSticky),
                  )}
                  style={stickyColumnStyle(stickyIndex, 220)}
                >
                  <div className="space-y-1.5 py-1.5">
                    <p className="truncate text-xs font-normal text-text-tertiary">
                      {column.sourceLabel}
                    </p>
                    <TargetFieldCombobox
                      ariaLabel={`Target CRM cho cột ${column.sourceLabel}`}
                      value={column.targetField}
                      fieldCatalog={fieldCatalog}
                      isDisabled={isDisabled}
                      onChange={(key) => setTarget(column.sourceIndex, key)}
                    />
                    {column.isDuplicate && (
                      <p className="text-xs text-error-600">Target bị trùng</p>
                    )}
                  </div>
                </TableHead>
                );
              })}
            </TableRow>
          </TableHeader>
          <TableBody>
            {sampleRows.map((sample) => (
              <TableRow key={sample.row}>
                <TableCell
                  className={cn(
                    "sticky left-0 z-10 w-14 bg-background-white-secondary text-text-tertiary",
                  )}
                >
                  {sample.row}
                </TableCell>
                {orderedColumns.map((column) => (
                  <TableCell
                    key={`${sample.row}-${column.sourceIndex}`}
                    className={cn(
                      stickyColumnClass(
                        Boolean(
                          column.targetField && stickyFields.includes(column.targetField),
                        ),
                      ),
                      isEmptyImportValue(sample.values[column.sourceIndex]) &&
                        "bg-badge-error-background/35",
                    )}
                    style={stickyColumnStyle(
                      column.targetField
                        ? stickyFields.indexOf(column.targetField)
                        : -1,
                      220,
                    )}
                  >
                    <span
                      className={cn(
                        "block max-w-64 truncate text-sm",
                        column.targetField
                          ? "text-text-secondary"
                          : "text-text-tertiary line-through",
                      )}
                    >
                      {sample.values[column.sourceIndex] ?? "—"}
                    </span>
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </TableRoot>
      </div>
    </section>
  );
}

function isEmptyImportValue(value: string | null | undefined): boolean {
  return value === null || value === undefined || value.trim() === "";
}

function TargetFieldCombobox({
  value,
  fieldCatalog,
  isDisabled = false,
  ariaLabel,
  onChange,
}: {
  value: string | null;
  fieldCatalog: LeadImportFieldDefinition[];
  isDisabled?: boolean;
  ariaLabel: string;
  onChange: (key: string | null) => void;
}) {
  const requiredFieldKeys = new Set(
    fieldCatalog.filter((field) => field.required).map((field) => field.key),
  );
  const options = [
    { id: SKIP_KEY, label: "— Bỏ qua —", searchText: "bo qua" },
    ...fieldCatalog.map((field) => ({
      id: field.key,
      label: field.label,
      searchText: field.label,
    })),
  ];

  const renderFieldLabel = (option: DropdownOption) => (
    <span className="min-w-0 truncate text-text-primary">
      {option.label}
      {requiredFieldKeys.has(option.id) && (
        <span aria-hidden="true" className="ml-1 text-error-500">
          *
        </span>
      )}
    </span>
  );

  return (
    <DropdownField
      ariaLabel={ariaLabel}
      contentClassName="max-h-56"
      emptyMessage="Không tìm thấy target phù hợp."
      isDisabled={isDisabled}
      isSearchable
      onChange={(key) => onChange(!key || key === SKIP_KEY ? null : key)}
      options={options}
      placeholder="— Bỏ qua —"
      renderOption={renderFieldLabel}
      renderValue={(option) => (option ? renderFieldLabel(option) : null)}
      searchPlaceholder="Tìm target CRM…"
      triggerClassName="h-9 px-3 text-sm"
      value={value ?? SKIP_KEY}
    />
  );
}
