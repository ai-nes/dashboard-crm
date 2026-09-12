"use client";

import { Pencil1 } from "@tailgrids/icons";
import { useState } from "react";

import { DropdownField } from "@/components/common/dropdown-field";
import { Badge } from "@/components/tailgrids/core/badge";
import { Button } from "@/components/tailgrids/core/button";

import type { TeamMember } from "./types";

const UNASSIGNED_KEY = "__unassigned__";

interface EditableLeadPickerFieldProps {
  candidates: TeamMember[];
  value: string | null;
  onChange: (id: string | null) => void;
  ariaLabel: string;
  isDisabled?: boolean;
}

export default function EditableLeadPickerField({
  candidates,
  value,
  onChange,
  ariaLabel,
  isDisabled = false,
}: EditableLeadPickerFieldProps) {
  const [isOpen, setIsOpen] = useState(false);
  const selectedLead = candidates.find((candidate) => candidate.id === value);
  const options = [
    { id: UNASSIGNED_KEY, label: "Chưa phân công" },
    ...candidates.map((candidate) => ({
      id: candidate.id,
      label: candidate.name,
    })),
  ];

  const handleChange = (key: string | null) => {
    onChange(!key || key === UNASSIGNED_KEY ? null : key);
  };

  if (isOpen) {
    return (
      <DropdownField
        ariaLabel={ariaLabel}
        appearance="ghost"
        className="w-fit min-w-0 gap-0"
        contentClassName="min-w-52"
        isDisabled={isDisabled}
        isOpen
        onChange={handleChange}
        onOpenChange={setIsOpen}
        options={options}
        triggerClassName="h-8 min-w-44 justify-start rounded-md border border-card-border bg-transparent px-2.5 shadow-none focus:ring-2 focus:ring-primary-500/25"
        value={value ?? UNASSIGNED_KEY}
      />
    );
  }

  return (
    <div className="group/lead flex min-h-8 items-center gap-1.5">
      <Badge color={selectedLead ? "orange" : "gray"} size="sm">
        {selectedLead?.name ?? "Chưa phân công"}
      </Badge>
      {!isDisabled && (
        <Button
          iconOnly
          appearance="ghost"
          size="xs"
          type="button"
          aria-label={`Sửa ${ariaLabel}`}
          onPress={() => setIsOpen(true)}
          className="size-7 shrink-0 text-icon-tertiary opacity-0 transition-opacity group-hover/lead:opacity-100 focus-visible:opacity-100 hover:bg-background-gray-secondary hover:text-text-primary"
        >
          <Pencil1 size={14} aria-hidden="true" />
        </Button>
      )}
    </div>
  );
}
