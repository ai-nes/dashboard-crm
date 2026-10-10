"use client";

import {
  useDeferredValue,
  useMemo,
  useState,
  type ChangeEvent,
  type ReactNode,
} from "react";

import { DatePickerField } from "@/components/common/date-picker-field";
import { DropdownField } from "@/components/common/dropdown-field";
import { Input } from "@/components/tailgrids/core/input";
import { cn } from "@/utils/cn";
import type { ScrollToLoadMoreOptions } from "@/hooks/use-scroll-to-load-more";

export interface EditableDetailOption {
  id: string;
  label: string;
}

interface EditableDetailFieldProps {
  label: string;
  value: string;
  isEditing?: boolean;
  onChange?: (value: string) => void;
  type?: "date" | "email" | "number" | "tel" | "text";
  placeholder?: string;
  readOnly?: boolean;
  isDisabled?: boolean;
  options?: EditableDetailOption[];
  pagination?: ScrollToLoadMoreOptions;
  searchable?: boolean;
  searchPlaceholder?: string;
  dropdownClassName?: string;
  className?: string;
  inputClassName?: string;
  min?: string | number;
  max?: string | number;
  step?: string | number;
  icon?: ReactNode;
}

export function EditableDetailField({
  label,
  value,
  isEditing = false,
  onChange,
  type = "text",
  placeholder,
  readOnly = false,
  isDisabled = false,
  options,
  pagination,
  searchable = false,
  searchPlaceholder = "Tìm kiếm...",
  dropdownClassName,
  className,
  inputClassName,
  min,
  max,
  step,
  icon,
}: EditableDetailFieldProps) {
  const displayValue = value || "-";
  const [optionsQuery, setOptionsQuery] = useState("");
  const deferredOptionsQuery = useDeferredValue(optionsQuery);
  const optionItems = options ?? EMPTY_OPTIONS;
  const filteredOptionItems = useMemo(() => {
    const query = deferredOptionsQuery.trim().toLocaleLowerCase("vi-VN");
    if (!query) return optionItems;

    return optionItems.filter((option) =>
      `${option.label} ${option.id}`.toLocaleLowerCase("vi-VN").includes(query),
    );
  }, [deferredOptionsQuery, optionItems]);

  return (
    <div className={cn("min-w-0", className)}>
      <dt className="text-xs text-text-tertiary">{label}</dt>
      {isEditing && !readOnly && onChange ? (
        options ? (
          <DropdownField
            options={filteredOptionItems}
            pagination={pagination}
            ariaLabel={label}
            className="mt-1.5"
            contentClassName={dropdownClassName}
            filterOptions={false}
            isDisabled={isDisabled}
            isSearchable={searchable}
            onChange={(nextValue) => onChange(nextValue ?? "")}
            onSearchChange={setOptionsQuery}
            placeholder={placeholder ?? "Chọn giá trị"}
            searchPlaceholder={searchPlaceholder}
            selectedLabel={
              optionItems.find((option) => option.id === value)?.label
            }
            value={value || undefined}
          />
        ) : type === "date" ? (
          <DatePickerField
            ariaLabel={label}
            className={cn("mt-1.5", inputClassName)}
            max={typeof max === "string" ? max : undefined}
            min={typeof min === "string" ? min : undefined}
            onChange={onChange}
            disabled={isDisabled}
            value={value}
          />
        ) : (
          <Input
            aria-label={label}
            className={cn(
              "mt-1.5 h-9 w-full px-3 py-2 text-sm",
              inputClassName,
            )}
            max={max}
            min={min}
            onChange={(event: ChangeEvent<HTMLInputElement>) =>
              onChange(event.target.value)
            }
            placeholder={placeholder}
            step={step}
            type={type}
            value={value}
            disabled={isDisabled}
          />
        )
      ) : (
        <dd
          className={cn(
            "mt-1 flex items-start gap-1.5 text-sm font-medium text-text-primary",
            type === "number" && "tabular-nums",
          )}
          title={displayValue}
        >
          {icon}
          {displayValue}
        </dd>
      )}
    </div>
  );
}

const EMPTY_OPTIONS: EditableDetailOption[] = [];
