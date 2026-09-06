"use client";

import type { ChangeEvent, ReactNode } from "react";

import { DatePickerField } from "@/components/common/date-picker-field";
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
  className,
  inputClassName,
  min,
  max,
  step,
  icon,
}: EditableDetailFieldProps) {
  const displayValue = value || "-";

  return (
    <div className={cn("min-w-0", className)}>
      <dt className="text-xs text-text-tertiary">{label}</dt>
      {isEditing && !readOnly && onChange ? (
        options ? (
          <Select
            aria-label={label}
            className="mt-1.5 gap-0"
            isDisabled={isDisabled}
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
            <SelectContent>
              {options.map((option) => (
                <SelectItem key={option.id} id={option.id}>
                  {option.label}
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
