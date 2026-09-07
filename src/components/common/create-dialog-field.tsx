"use client";

import type { ReactNode } from "react";

import { Input } from "@/components/tailgrids/core/input";
import {
  Select,
  SelectContent,
  SelectIndicator,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/tailgrids/core/select";
import { TextArea } from "@/components/tailgrids/core/text-area";
import { cn } from "@/utils/cn";

interface CreateDialogFieldProps {
  label: string;
  required?: boolean;
  className?: string;
  children: ReactNode;
}

export function CreateDialogField({
  label,
  required = false,
  className,
  children,
}: CreateDialogFieldProps) {
  return (
    <label className={cn("block space-y-1.5", className)}>
      <span className="text-xs font-semibold text-input-label-text">
        {label}
        {required && <span className="ml-1 text-error-500">*</span>}
      </span>
      {children}
    </label>
  );
}

interface CreateDialogInputProps extends Omit<
  React.ComponentProps<typeof Input>,
  "aria-label"
> {
  label: string;
}

export function CreateDialogInput({
  label,
  className,
  ...props
}: CreateDialogInputProps) {
  return (
    <Input
      aria-label={label}
      className={cn("block h-10 w-full px-3 py-2.5 text-sm", className)}
      {...props}
    />
  );
}

interface CreateDialogTextAreaProps extends Omit<
  React.ComponentProps<typeof TextArea>,
  "aria-label"
> {
  label: string;
}

export function CreateDialogTextArea({
  label,
  className,
  ...props
}: CreateDialogTextAreaProps) {
  return (
    <TextArea
      aria-label={label}
      className={cn("block w-full px-3 py-2.5 text-sm", className)}
      {...props}
    />
  );
}

interface CreateDialogSelectProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { id: string; label: string }[];
  placeholder?: string;
  isDisabled?: boolean;
}

export function CreateDialogSelect({
  label,
  value,
  onChange,
  options,
  placeholder = "Chọn giá trị",
  isDisabled = false,
}: CreateDialogSelectProps) {
  return (
    <Select
      aria-label={label}
      className="gap-0"
      isDisabled={isDisabled}
      onChange={(key) => onChange(String(key ?? ""))}
      value={value || undefined}
    >
      <SelectTrigger className="h-10 w-full px-3 py-2.5 text-sm">
        <SelectValue>
          {options.find((option) => option.id === value)?.label ?? placeholder}
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
  );
}
