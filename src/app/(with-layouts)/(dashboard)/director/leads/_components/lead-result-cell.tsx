import { Badge } from "@/components/tailgrids/core/badge";
import { cn } from "@/utils/cn";

import {
  leadResultColor,
  leadResultLabel,
  type LeadResultStatus,
} from "./lead-status";

interface LeadResultCellProps {
  compact?: boolean;
  current?: boolean;
  result: LeadResultStatus | "";
}

export default function LeadResultCell({
  compact = false,
  current = false,
  result,
}: LeadResultCellProps) {
  const label = result ? leadResultLabel[result] : "Chưa có kết quả";
  const color = result ? leadResultColor[result] : "gray";

  return (
    <Badge
      color={color}
      size={current ? "md" : compact ? "sm" : "md"}
      className={cn(
        "whitespace-nowrap",
        current &&
          "border border-current px-2.5 py-1 text-sm font-semibold shadow-xs",
      )}
    >
      {current && (
        <span
          aria-hidden="true"
          className="size-2 rounded-full bg-current ring-2 ring-current/20"
        />
      )}
      {label}
    </Badge>
  );
}
