"use client";

import { Pencil1 } from "@tailgrids/icons";
import { useState } from "react";

import { Badge } from "@/components/tailgrids/core/badge";
import { Button } from "@/components/tailgrids/core/button";
import {
  Select,
  SelectContent,
  SelectIndicator,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/tailgrids/core/select";

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

  const handleChange = (key: string | null) => {
    onChange(!key || key === UNASSIGNED_KEY ? null : key);
    setIsOpen(false);
  };

  if (isOpen) {
    return (
      <Select
        aria-label={ariaLabel}
        value={value ?? UNASSIGNED_KEY}
        isOpen
        onOpenChange={setIsOpen}
        onChange={(key) => handleChange(key ? String(key) : null)}
        isDisabled={isDisabled}
        className="w-fit min-w-0 gap-0"
      >
        <SelectTrigger
          autoFocus
          appearance="ghost"
          className="h-8 min-w-44 justify-start rounded-md border border-card-border bg-transparent px-2.5 shadow-none focus:ring-2 focus:ring-primary-500/25"
        >
          <SelectValue>
            {selectedLead?.name ?? "Chưa phân công"}
          </SelectValue>
          <SelectIndicator />
        </SelectTrigger>
        <SelectContent className="min-w-52">
          <SelectItem id={UNASSIGNED_KEY} textValue="Chưa phân công">
            <span className="text-text-tertiary">Chưa phân công</span>
          </SelectItem>
          {candidates.map((candidate) => (
            <SelectItem key={candidate.id} id={candidate.id}>
              {candidate.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
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
