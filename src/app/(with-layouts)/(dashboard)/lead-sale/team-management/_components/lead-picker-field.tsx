"use client";

import { DropdownField } from "@/components/common/dropdown-field";

import type { TeamMember } from "./types";

const UNASSIGNED_KEY = "__unassigned__";

interface LeadPickerFieldProps {
  candidates: TeamMember[];
  value: string | null;
  onChange: (id: string | null) => void;
  ariaLabel: string;
  placeholder?: string;
  className?: string;
  isDisabled?: boolean;
}

export default function LeadPickerField({
  candidates,
  value,
  onChange,
  ariaLabel,
  placeholder = "Chọn trưởng nhóm",
  className,
  isDisabled = false,
}: LeadPickerFieldProps) {
  const options = [
    { id: UNASSIGNED_KEY, label: "Chưa phân công" },
    ...candidates.map((member) => ({ id: member.id, label: member.name })),
  ];

  return (
    <DropdownField
      ariaLabel={ariaLabel}
      className={className}
      isDisabled={isDisabled}
      isSearchable
      onChange={(key) =>
        onChange(!key || key === UNASSIGNED_KEY ? null : String(key))
      }
      options={options}
      placeholder={placeholder}
      value={value ?? UNASSIGNED_KEY}
    />
  );
}
