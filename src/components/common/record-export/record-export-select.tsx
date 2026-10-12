"use client";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectIndicator,
  SelectTrigger,
  SelectValue,
} from "@/components/tailgrids/core/select";

export function RecordExportSelect({
  label,
  value,
  options,
  onChange,
  triggerClassName,
}: {
  triggerClassName?: string;
  label: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (value: string) => void;
}) {
  return (
    <Select
      placeholder="Chọn giá trị"
      aria-label={label}
      value={value}
      onChange={(value) => onChange(String(value))}
      className="min-w-0 w-full"
    >
      <SelectTrigger size="sm" className={triggerClassName}>
        <SelectValue />
        <SelectIndicator />
      </SelectTrigger>
      <SelectContent className="max-h-72 max-w-[calc(100vw-4rem)] overflow-y-auto">
        {options.map((option) => (
          <SelectItem
            key={option.value}
            id={option.value}
            textValue={option.label}
          >
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
