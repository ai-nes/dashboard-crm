"use client";

import { Badge } from "@/components/tailgrids/core/badge";
import type { InteractionSummary } from "@/services/api/interaction-intelligence";

import {
  getChannelLabel,
  getDispositionLabel,
  getDirectionLabel,
  getInteractionActivitySummary,
  getInteractionStateColor,
  getInteractionStateLabel,
} from "./student-interaction-utils";

interface StudentInteractionActivityDetailsProps {
  interaction: InteractionSummary;
}

export default function StudentInteractionActivityDetails({
  interaction,
}: StudentInteractionActivityDetailsProps) {
  const disposition = getDispositionLabel(interaction.semantic?.disposition);

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <Badge
          color={getInteractionStateColor(interaction.analysis_state)}
          size="sm"
        >
          {getInteractionStateLabel(interaction.analysis_state)}
        </Badge>
      </div>

      <p className="text-sm leading-6 text-text-secondary">
        {getInteractionActivitySummary(interaction) || "-"}
      </p>

      <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-text-tertiary">
        <span>Kênh liên hệ: {getChannelLabel(interaction.channel)}</span>
        <span>Chiều liên hệ: {getDirectionLabel(interaction.direction)}</span>
        <span>Kết quả: {disposition || "-"}</span>
      </div>
    </div>
  );
}
