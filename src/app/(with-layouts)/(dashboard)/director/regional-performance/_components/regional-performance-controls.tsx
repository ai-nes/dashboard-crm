"use client";

import { memo } from "react";

import {
  Select,
  SelectContent,
  SelectIndicator,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/tailgrids/core/select";
import { REGIONAL_SCOPE_LABEL } from "./data";
import type { RegionPerformance } from "./types";

interface RegionalPerformanceControlsProps {
  selectedProvinceId: string;
  provinces: RegionPerformance[];
  onProvinceChange: (id: string) => void;
  compact?: boolean;
}

function RegionalPerformanceControls({
  selectedProvinceId,
  provinces,
  onProvinceChange,
  compact = false,
}: RegionalPerformanceControlsProps) {
  return (
    <div
      className={
        compact
          ? "min-w-40"
          : "flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"
      }
      aria-label="Bộ lọc tỉnh trọng điểm"
    >
      <Select
        className={compact ? "w-full" : "w-full sm:max-w-md"}
        value={selectedProvinceId}
        onChange={(value) => onProvinceChange(String(value))}
        aria-label="Chọn tỉnh đang xem"
      >
        <SelectLabel className={compact ? "sr-only" : undefined}>
          Tỉnh đang xem
        </SelectLabel>
        <SelectTrigger size="sm">
          <SelectValue />
          <SelectIndicator />
        </SelectTrigger>
        <SelectContent>
          {provinces.map((province) => (
            <SelectItem
              key={province.id}
              id={province.id}
              textValue={province.name}
            >
              {province.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {!compact && (
        <p className="text-xs text-text-tertiary sm:pb-2">
          Phạm vi:{" "}
          <span className="font-medium text-text-secondary">
            {REGIONAL_SCOPE_LABEL}
          </span>
        </p>
      )}
    </div>
  );
}

export default memo(RegionalPerformanceControls);
