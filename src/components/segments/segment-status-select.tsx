"use client";

import { Badge } from "@/components/tailgrids/core/badge";
import {
  ADMIN_STATUS_SELECT_CONTENT_CLASS,
  ADMIN_STATUS_SELECT_INDICATOR_CLASS,
  ADMIN_STATUS_SELECT_TRIGGER_CLASS,
} from "@/components/common/admin/admin-status-select-styles";
import {
  Select,
  SelectContent,
  SelectIndicator,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/tailgrids/core/select";
import { cn } from "@/utils/cn";

import {
  SEGMENT_STATUS_BADGE_COLORS,
  SEGMENT_STATUS_LABELS,
  SEGMENT_STATUS_OPTIONS,
  SEGMENT_STATUS_SELECT_STYLES,
  type SegmentStatus,
} from "./segment-list-types";

interface SegmentStatusSelectProps {
  value: SegmentStatus;
  ariaLabel: string;
  onChange: (status: SegmentStatus) => void;
  isDisabled?: boolean;
  labels?: Partial<Record<SegmentStatus, string>>;
  compact?: boolean;
}

export function SegmentStatusSelect({
  value,
  ariaLabel,
  onChange,
  isDisabled = false,
  labels,
  compact = false,
}: SegmentStatusSelectProps) {
  const getLabel = (status: SegmentStatus) => labels?.[status] ?? SEGMENT_STATUS_LABELS[status];

  return (
    <Select
      aria-label={ariaLabel}
      isDisabled={isDisabled}
      className="w-fit gap-0"
      value={value}
      onChange={(nextValue) => onChange(nextValue as SegmentStatus)}
    >
      <SelectTrigger
        appearance="ghost"
        size={compact ? "sm" : undefined}
        className={cn(
          compact
            ? ADMIN_STATUS_SELECT_TRIGGER_CLASS
            : "h-10 w-40 justify-between rounded-xl border-0 px-3.5 py-2 text-base font-medium shadow-none outline-none data-[focused=true]:ring-4 data-[focused=true]:ring-button-outline-focus-ring",
          SEGMENT_STATUS_SELECT_STYLES[value],
        )}
      >
        <SelectValue className="max-w-none text-inherit">
          {getLabel(value)}
        </SelectValue>
        <SelectIndicator
          className={cn(
            "text-inherit",
            compact && ADMIN_STATUS_SELECT_INDICATOR_CLASS,
          )}
        />
      </SelectTrigger>
      <SelectContent
        className={compact ? ADMIN_STATUS_SELECT_CONTENT_CLASS : "min-w-40"}
      >
        {SEGMENT_STATUS_OPTIONS.filter((option) =>
          value === "draft"
            ? option.value === "draft" ||
              option.value === "active" ||
              option.value === "archive"
            : value === "active"
              ? option.value === "active" ||
                option.value === "inactive" ||
                option.value === "archive"
              : value === "inactive"
                ? option.value === "inactive" ||
                  option.value === "active" ||
                  option.value === "archive"
                : option.value === "archive",
        ).map((option) => (
          <SelectItem
            key={option.value}
            id={option.value}
            textValue={option.label}
          >
            <Badge color={SEGMENT_STATUS_BADGE_COLORS[option.value]}>
              {getLabel(option.value)}
            </Badge>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
