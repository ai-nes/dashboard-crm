"use client";

import { useState } from "react";

import { ChevronDown, Search1 } from "@tailgrids/icons";
import {
  DialogTrigger,
  ListBox,
  ListBoxItem,
  Popover,
} from "react-aria-components";

import { Button } from "@/components/tailgrids/core/button";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/tailgrids/core/input-group";
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

// Key giả cho lựa chọn "không map cột này" trong dropdown target.
const SKIP_KEY = "__skip__";

interface LeadImportMappingPreviewProps {
  headers: LeadImportHeader[];
  sampleRows: LeadImportSampleRow[];
  fieldCatalog: LeadImportFieldDefinition[];
  requiredFields: string[];
  mapping: LeadImportMapping[];
  onMappingChange: (mapping: LeadImportMapping[]) => void;
  isDisabled?: boolean;
}

export default function LeadImportMappingPreview({
  headers,
  sampleRows,
  fieldCatalog,
  requiredFields,
  mapping,
  onMappingChange,
  isDisabled = false,
}: LeadImportMappingPreviewProps) {
  const mappingBySource = new Map(
    mapping.map((item) => [item.sourceIndex, item]),
  );

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

  // Bảng gộp: mỗi cột nguồn là một cột, tiêu đề cột là dropdown chọn target CRM.
  const projectedColumns = headers.map((header) => {
    const item = mappingBySource.get(header.sourceIndex);
    const targetField = item?.enabled ? item.targetField ?? null : null;
    return {
      sourceIndex: header.sourceIndex,
      sourceLabel: header.label || `Cột ${header.sourceIndex + 1}`,
      targetField,
      isDuplicate: Boolean(
        targetField && duplicateTargets.includes(targetField),
      ),
    };
  });

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
            Chọn target CRM cho từng cột ngay trên tiêu đề bảng (có tìm kiếm). Cột
            để trống sẽ bị bỏ qua khi nhập.
          </p>
        </div>
        <span
          className="shrink-0 rounded-full bg-badge-primary-background px-2.5 py-1 text-xs font-semibold text-badge-primary-text"
          aria-label={`${mappedRequiredCount} trên ${requiredFields.length} trường bắt buộc đã được map`}
        >
          {mappedRequiredCount}/{requiredFields.length} trường bắt buộc
        </span>
      </div>

      {duplicateTargets.length > 0 && (
        <p
          className="rounded-lg border border-error-200 bg-badge-error-background px-3 py-2 text-xs text-error-600"
          role="alert"
        >
          Một target CRM chỉ được map một lần: {duplicateTargets.join(", ")}.
        </p>
      )}

      <div className="rounded-lg border border-border-primary" aria-live="polite">
        <TableRoot className="min-w-[640px]">
          <TableHeader>
            <TableRow>
              <TableHead className="w-14 align-top">Dòng</TableHead>
              {projectedColumns.map((column) => (
                <TableHead
                  key={column.sourceIndex}
                  className="min-w-[220px] align-top"
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
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {sampleRows.map((sample) => (
              <TableRow key={sample.row}>
                <TableCell className="text-text-tertiary">
                  {sample.row}
                </TableCell>
                {projectedColumns.map((column) => (
                  <TableCell key={`${sample.row}-${column.sourceIndex}`}>
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
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");

  const selected = fieldCatalog.find((field) => field.key === value) ?? null;
  const normalizedQuery = query.trim().toLowerCase();
  const options = fieldCatalog.filter(
    (field) =>
      !normalizedQuery || field.label.toLowerCase().includes(normalizedQuery),
  );

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) setQuery("");
  };

  const optionClassName =
    "flex w-full cursor-pointer items-center rounded-md px-2 py-1.5 text-sm text-text-secondary outline-hidden select-none focus:bg-background-gray-secondary_alt focus:text-text-primary data-selected:font-medium data-selected:text-text-primary";

  return (
    <DialogTrigger isOpen={isOpen} onOpenChange={handleOpenChange}>
      <Button
        appearance="outline"
        aria-label={ariaLabel}
        isDisabled={isDisabled}
        type="button"
        className="h-9 w-full justify-between border-card-border bg-background-white-secondary px-3 text-left text-sm font-normal shadow-xs"
      >
        <span
          className={cn("min-w-0 truncate", !selected && "text-text-tertiary")}
        >
          {selected
            ? `${selected.label}${selected.required ? " *" : ""}`
            : "— Bỏ qua —"}
        </span>
        <ChevronDown className="size-4 shrink-0 text-text-tertiary" />
      </Button>
      <Popover
        placement="bottom start"
        className="w-(--trigger-width) overflow-hidden rounded-xl border border-card-border bg-background-white-secondary shadow-lg"
      >
        <div className="border-b border-card-border p-1.5">
          <InputGroup className="h-8 rounded-md">
            <InputGroupAddon className="px-2 text-text-tertiary">
              <Search1 size={14} aria-hidden="true" />
            </InputGroupAddon>
            <InputGroupInput
              autoFocus
              aria-label="Tìm target CRM"
              className="h-8 py-1 text-xs"
              placeholder="Tìm target CRM…"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </InputGroup>
        </div>
        <ListBox
          aria-label={ariaLabel}
          className="max-h-56 overflow-y-auto p-1.5 outline-none"
          selectionMode="single"
          selectedKeys={new Set([value ?? SKIP_KEY])}
          onSelectionChange={(keys) => {
            if (keys === "all") return;
            const key = Array.from(keys)[0];
            onChange(!key || key === SKIP_KEY ? null : String(key));
            handleOpenChange(false);
          }}
        >
          <ListBoxItem
            id={SKIP_KEY}
            textValue="Bỏ qua"
            className={optionClassName}
          >
            <span className="text-text-tertiary">— Bỏ qua —</span>
          </ListBoxItem>
          {options.map((field) => (
            <ListBoxItem
              key={field.key}
              id={field.key}
              textValue={field.label}
              className={optionClassName}
            >
              {field.label}
              {field.required ? " *" : ""}
            </ListBoxItem>
          ))}
        </ListBox>
        {options.length === 0 && (
          <p className="px-3 py-4 text-center text-xs text-text-tertiary">
            Không tìm thấy target phù hợp.
          </p>
        )}
      </Popover>
    </DialogTrigger>
  );
}
