"use client";

import { Badge } from "@/components/tailgrids/core/badge";
import { DropdownField } from "@/components/common/dropdown-field";

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
  return (
    <DropdownField
      ariaLabel={ariaLabel}
      className="w-fit gap-0"
      contentClassName="min-w-48"
      isDisabled={isDisabled || options.length === 0}
      onChange={(key) => onChange(key ? String(key) : null)}
      options={options}
      appearance="ghost"
      renderValue={(option) => (
        <Badge color={option ? "sky" : "gray"} size="sm">
          {option?.label ?? "Chưa chọn tỉnh"}
        </Badge>
      )}
      triggerClassName="h-auto min-h-6 w-fit min-w-0 gap-1 rounded-full border-0 bg-transparent p-0 shadow-none focus:ring-2 focus:ring-primary-500/25"
      value={value || undefined}
    />
  );
}
