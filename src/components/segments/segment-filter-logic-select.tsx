"use client";

import {
  Select,
  SelectContent,
  SelectIndicator,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/tailgrids/core/select";

import type { SegmentFilterLogic } from "./segment-filter-config";

interface SegmentFilterLogicSelectProps {
  value: SegmentFilterLogic;
  onChange: (logic: SegmentFilterLogic) => void;
  ariaLabel: string;
}

const LOGIC_OPTIONS: Array<{ value: SegmentFilterLogic; label: string }> = [
  { value: "AND", label: "và" },
  { value: "OR", label: "hoặc" },
];

export function SegmentFilterLogicSelect({
  value,
  onChange,
  ariaLabel,
}: SegmentFilterLogicSelectProps) {
  return (
    <Select
      aria-label={ariaLabel}
      value={value}
      onChange={(nextLogic) => onChange(nextLogic as SegmentFilterLogic)}
      className="relative z-10 w-auto"
    >
      <SelectTrigger
        size="sm"
        className="h-9 min-w-20 justify-center border-0 bg-background-gray-secondary px-3 font-semibold text-text-secondary shadow-none hover:bg-background-gray-secondary_alt"
      >
        <SelectValue />
        <SelectIndicator />
      </SelectTrigger>
      <SelectContent className="min-w-24">
        {LOGIC_OPTIONS.map((logicOption) => (
          <SelectItem
            key={logicOption.value}
            id={logicOption.value}
            textValue={`${logicOption.label} ${logicOption.value}`}
          >
            {logicOption.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
