import { Badge } from "@/components/tailgrids/core/badge";

import {
  leadResultColor,
  leadResultLabel,
  type LeadResultStatus,
} from "./lead-status";

interface LeadResultCellProps {
  compact?: boolean;
  result: LeadResultStatus | "";
}

export default function LeadResultCell({
  compact = false,
  result,
}: LeadResultCellProps) {
  const label = result ? leadResultLabel[result] : "Chưa có kết quả";
  const color = result ? leadResultColor[result] : "gray";

  return (
    <Badge
      color={color}
      size={compact ? "sm" : "md"}
      className="whitespace-nowrap"
    >
      {label}
    </Badge>
  );
}
