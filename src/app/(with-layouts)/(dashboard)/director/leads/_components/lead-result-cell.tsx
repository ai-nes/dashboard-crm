"use client";

import {
  Select,
  SelectContent,
  SelectIndicator,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/tailgrids/core/select";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/tailgrids/core/tooltip";

import {
  canEditLeadResult,
  LEAD_RESULT_LOCKED_MESSAGE,
  leadResultLabel,
  leadResultOptions,
  type LeadResultStatus,
  type LeadStageStatus,
} from "./lead-status";

// Duplicate/Invalid/Spam/Failed are all "problem" outcomes, so they share the
// red family — orange → rose → error tracks rising severity.
const resultTriggerClass: Record<LeadResultStatus, string> = {
  MATCHED:
    "border-transparent bg-badge-success-background text-badge-success-text",
  CREATED: "border-transparent bg-badge-sky-background text-badge-sky-text",
  DUPLICATE:
    "border-transparent bg-badge-orange-background text-badge-orange-text",
  INVALID: "border-transparent bg-badge-rose-background text-badge-rose-text",
  SPAM: "border-transparent bg-badge-error-background text-badge-error-text",
  FAILED: "border-transparent bg-badge-error-background text-badge-error-text",
};

interface LeadResultCellProps {
  compact?: boolean;
  leadName: string;
  status: LeadStageStatus | null;
  result: LeadResultStatus | "";
  isUpdating?: boolean;
  onChange: (result: LeadResultStatus) => void;
}

export default function LeadResultCell({
  leadName,
  status,
  result,
  isUpdating = false,
  onChange,
  compact = false,
}: LeadResultCellProps) {
  const editable = canEditLeadResult(status);

  const select = (
    <Select
      value={result}
      onChange={(value) => onChange(String(value) as LeadResultStatus)}
      aria-label={`Cập nhật kết quả ${leadName}`}
      isDisabled={!editable || isUpdating}
      className={compact ? "w-fit max-w-full" : "w-fit min-w-36"}
    >
      <SelectTrigger
        size="sm"
        className={`w-full ${result ? resultTriggerClass[result] : ""} ${compact ? "h-7 w-auto gap-2 rounded-full px-2.5 py-0 text-xs font-medium shadow-none" : ""}`}
      >
        <SelectValue>
          {({ isPlaceholder, selectedText }) =>
            isPlaceholder ? "Chưa có kết quả" : selectedText
          }
        </SelectValue>
        <SelectIndicator />
      </SelectTrigger>
      <SelectContent>
        {leadResultOptions.map((item) => (
          <SelectItem key={item} id={item} textValue={leadResultLabel[item]}>
            {leadResultLabel[item]}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );

  if (editable) return select;

  return (
    <Tooltip placement="top">
      <TooltipTrigger asChild>
        <span tabIndex={0} className="inline-block cursor-not-allowed">
          {select}
        </span>
      </TooltipTrigger>
      <TooltipContent>
        <p className="max-w-56 text-xs">{LEAD_RESULT_LOCKED_MESSAGE}</p>
      </TooltipContent>
    </Tooltip>
  );
}
