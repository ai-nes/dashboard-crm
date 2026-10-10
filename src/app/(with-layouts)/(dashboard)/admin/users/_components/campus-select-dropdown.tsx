"use client";

import {
  Select,
  SelectContent,
  SelectIndicator,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/tailgrids/core/select";

export interface CampusOption {
  id: string;
  name: string;
}

interface CampusSelectDropdownProps {
  campus: CampusOption | null;
  options: CampusOption[];
  userLabel: string;
  disabled: boolean;
  onChange: (campusId: string | null) => void;
}

const UNASSIGNED = "unassigned";

export default function CampusSelectDropdown({
  campus,
  options,
  userLabel,
  disabled,
  onChange,
}: CampusSelectDropdownProps) {
  const value = campus
    ? options.some((option) => option.id === campus.id)
      ? campus.id
      : undefined
    : UNASSIGNED;

  return (
    <Select
      value={value}
      onChange={(next) => {
        if (next !== null) onChange(next === UNASSIGNED ? null : String(next));
      }}
      isDisabled={disabled}
      placeholder={campus?.name ?? "Chưa có Campus"}
      aria-label={`Đổi Campus của ${userLabel}`}
      className="w-60"
    >
      <SelectTrigger size="sm" className="w-full">
        <SelectValue />
        <SelectIndicator />
      </SelectTrigger>
      <SelectContent className="[&_[role=listbox]]:max-h-80">
        <SelectItem id={UNASSIGNED} textValue="Chưa có Campus">
          Chưa có Campus
        </SelectItem>
        {options.map((option) => (
          <SelectItem key={option.id} id={option.id} textValue={option.name}>
            {option.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
