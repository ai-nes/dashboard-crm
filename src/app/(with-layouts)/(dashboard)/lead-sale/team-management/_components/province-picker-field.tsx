"use client";

import { Badge } from "@/components/tailgrids/core/badge";
import {
  Select,
  SelectContent,
  SelectIndicator,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/tailgrids/core/select";

interface ProvincePickerFieldProps {
  options: Array<{ id: string; label: string }>;
  value: string | null | undefined;
  onChange: (id: string | null) => void;
  ariaLabel: string;
  isDisabled?: boolean;
}

export default function ProvincePickerField({
  options,
  value,
  onChange,
  ariaLabel,
  isDisabled = false,
}: ProvincePickerFieldProps) {
  const selectedProvince = options.find((province) => province.id === value);

  return (
    <Select
      value={value || undefined}
      onChange={(key) => onChange(key ? String(key) : null)}
      aria-label={ariaLabel}
      isDisabled={isDisabled || options.length === 0}
      className="w-fit gap-0"
    >
      <SelectTrigger
        appearance="ghost"
        className="h-auto min-h-6 w-fit min-w-0 gap-1 rounded-full border-0 bg-transparent p-0 shadow-none focus:ring-2 focus:ring-primary-500/25"
      >
        <SelectValue>
          <Badge color={selectedProvince ? "sky" : "gray"} size="sm">
            {selectedProvince?.label ?? "Chưa chọn tỉnh"}
          </Badge>
        </SelectValue>
        <SelectIndicator className="mr-1 size-3 text-text-tertiary" />
      </SelectTrigger>
      <SelectContent className="min-w-48">
        {options.map((province) => (
          <SelectItem key={province.id} id={province.id}>
            {province.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
