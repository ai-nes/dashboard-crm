"use client";

import {
  Select,
  SelectContent,
  SelectIndicator,
  SelectItem,
  SelectTrigger,
} from "@/components/tailgrids/core/select";

interface SegmentLogicSelectProps {
  value: "AND" | "OR";
  onChange: (value: "AND" | "OR") => void;
  label: string;
}

export function SegmentLogicSelect({
  value,
  onChange,
  label,
}: SegmentLogicSelectProps) {
  return (
    <Select
      aria-label={label}
      value={value}
      onChange={onChange}
      className="w-24 shrink-0"
    >
      <SelectTrigger className="h-10 bg-card-surface-area font-semibold">
        {value === "AND" ? "và" : "hoặc"}
        <SelectIndicator />
      </SelectTrigger>
      <SelectContent>
        <SelectItem id="AND" textValue="và">
          và
        </SelectItem>
        <SelectItem id="OR" textValue="hoặc">
          hoặc
        </SelectItem>
      </SelectContent>
    </Select>
  );
}
