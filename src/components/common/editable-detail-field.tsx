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
import { useInfinityScroll } from "@/hooks/use-infinity-scroll";
import { Input } from "@/components/tailgrids/core/input";
import { cn } from "@/utils/cn";

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
  optionsPageSize?: number;
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
  optionsPageSize,
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
  const { visibleItems, hasMore, sentinelRef } = useInfinityScroll(
    filteredOptionItems,
    {
      enabled: Boolean(options) && isEditing && !readOnly,
      getItemKey: (option) => option.id,
      pageSize: optionsPageSize,
    },
  );
  const selectedOption =
    !deferredOptionsQuery.trim() &&
    optionItems.find((option) => option.id === value);
  const renderedOptions =
    selectedOption && !visibleItems.some((option) => option.id === value)
      ? [selectedOption, ...visibleItems]
      : visibleItems;

  return (
    <div className={cn("min-w-0", className)}>
      <dt className="text-xs text-text-tertiary">{label}</dt>
      {isEditing && !readOnly && onChange ? (
        options ? (
          <DropdownField
            options={renderedOptions}
            ariaLabel={label}
            className="mt-1.5"
            contentClassName={cn("max-h-36", dropdownClassName)}
            filterOptions={false}
            isDisabled={isDisabled}
            isSearchable={searchable}
            onChange={(nextValue) => onChange(nextValue ?? "")}
            onSearchChange={setOptionsQuery}
            placeholder={placeholder ?? "Chọn giá trị"}
            searchPlaceholder={searchPlaceholder}
            renderOption={(option, { isSelected }) => {
              const index = renderedOptions.findIndex(
                (item) => item.id === option.id,
              );
              return (
                <span
                  ref={
                    hasMore && index === renderedOptions.length - 1
                      ? sentinelRef
                      : undefined
                  }
                  className={cn(
                    "block min-w-0 truncate",
                    isSelected && "font-medium text-text-primary",
                  )}
                >
                  {option.label}
                </span>
              );
            }}
            selectedLabel={
              optionItems.find((option) => option.id === value)?.label
            }
            triggerClassName="h-9 min-w-0 px-3 py-2 text-sm"
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
