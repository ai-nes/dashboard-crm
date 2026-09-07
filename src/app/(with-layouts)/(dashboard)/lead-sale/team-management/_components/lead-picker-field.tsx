"use client";

import { Combobox, ComboboxItem } from "@/components/tailgrids/core/combobox";

import type { TeamMember } from "./types";

const UNASSIGNED_KEY = "__unassigned__";

interface LeadPickerFieldProps {
  candidates: TeamMember[];
  value: string | null;
  onChange: (id: string | null) => void;
  ariaLabel: string;
  placeholder?: string;
  className?: string;
}

export default function LeadPickerField({
  candidates,
  value,
  onChange,
  ariaLabel,
  placeholder = "Chọn trưởng nhóm",
  className,
}: LeadPickerFieldProps) {
  return (
    <Combobox
      value={value ?? UNASSIGNED_KEY}
      onChange={(key) =>
        onChange(!key || key === UNASSIGNED_KEY ? null : String(key))
      }
      aria-label={ariaLabel}
      placeholder={placeholder}
      className={className}
    >
      <ComboboxItem id={UNASSIGNED_KEY} textValue="Chưa phân công">
        <span className="text-text-tertiary">Chưa phân công</span>
      </ComboboxItem>
      {candidates.map((member) => (
        <ComboboxItem key={member.id} id={member.id} textValue={member.name}>
          {member.name}
        </ComboboxItem>
      ))}
    </Combobox>
  );
}
