"use client";

import {
  useDeferredValue,
  useMemo,
  useState,
  type ChangeEvent,
  type ReactNode,
} from "react";

import { Search1 } from "@tailgrids/icons";

import { DatePickerField } from "@/components/common/date-picker-field";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/tailgrids/core/input-group";
import { useInfinityScroll } from "@/hooks/use-infinity-scroll";
import { Input } from "@/components/tailgrids/core/input";
import {
  Select,
  SelectContent,
  SelectIndicator,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/tailgrids/core/select";
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
      `${option.label} ${option.id}`
        .toLocaleLowerCase("vi-VN")
        .includes(query),
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
          <Select
            aria-label={label}
            className="mt-1.5 gap-0"
            isDisabled={isDisabled}
            onOpenChange={(open) => {
              if (!open) setOptionsQuery("");
            }}
            onChange={(key) => onChange(String(key ?? ""))}
            value={value || undefined}
          >
            <SelectTrigger className="h-9 min-w-0 w-full px-3 py-2 text-sm">
              <SelectValue>
                {options.find((option) => option.id === value)?.label ??
                  placeholder ??
                  "Chọn giá trị"}
              </SelectValue>
              <SelectIndicator />
            </SelectTrigger>
            <SelectContent
              className={cn("max-h-36", dropdownClassName)}
              header={
                searchable ? (
                  <div className="sticky top-0 z-10 border-b border-card-border bg-background-white-secondary p-1.5">
                    <InputGroup className="h-8 rounded-md">
                      <InputGroupAddon className="px-2 text-text-tertiary">
                        <Search1 size={14} aria-hidden="true" />
                      </InputGroupAddon>
                      <InputGroupInput
                        autoFocus
                        aria-label={`Tìm ${label.toLocaleLowerCase("vi-VN")}`}
                        className="h-8 py-1 text-xs"
                        placeholder={searchPlaceholder}
                        value={optionsQuery}
                        onChange={(event) => setOptionsQuery(event.target.value)}
                      />
                    </InputGroup>
                  </div>
                ) : undefined
              }
            >
              {renderedOptions.map((option, index) => (
                <SelectItem
                  key={option.id}
                  id={option.id}
                  textValue={option.label}
                >
                  <span
                    ref={
                      hasMore && index === renderedOptions.length - 1
                        ? sentinelRef
                        : undefined
                    }
                    className="block truncate"
                  >
                    {option.label}
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
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
