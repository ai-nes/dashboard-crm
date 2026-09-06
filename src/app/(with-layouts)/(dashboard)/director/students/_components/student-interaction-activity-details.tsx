"use client";

import { Badge } from "@/components/tailgrids/core/badge";
import type { InteractionSummary } from "@/services/api/interaction-intelligence";

import {
  getChannelLabel,
  getDispositionLabel,
  getDirectionLabel,
  getEpisodeStateLabel,
  getEvidenceKindLabel,
  getInteractionActivitySummary,
  getInteractionStateColor,
  getInteractionStateLabel,
  getPurposeLabel,
} from "./student-interaction-utils";

interface StudentInteractionActivityDetailsProps {
  interaction: InteractionSummary;
}

export default function StudentInteractionActivityDetails({
  interaction,
}: StudentInteractionActivityDetailsProps) {
  const purpose = getPurposeLabel(interaction.semantic?.purpose);
  const disposition = getDispositionLabel(interaction.semantic?.disposition);
  const evidenceKind = getEvidenceKindLabel(
    interaction.semantic?.evidence_kind,
  );

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
        {getInteractionActivitySummary(interaction) ||
          "Chưa có mô tả cho hoạt động này."}
      </p>

      <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-text-tertiary">
        <span>Kênh liên hệ: {getChannelLabel(interaction.channel)}</span>
        <span>Chiều liên hệ: {getDirectionLabel(interaction.direction)}</span>
        <span>Theo dõi: {getEpisodeStateLabel(interaction.episode_state)}</span>
        {purpose ? <span>Mục đích: {purpose}</span> : null}
        {disposition ? <span>Kết quả: {disposition}</span> : null}
        {interaction.semantic?.is_direct_touchpoint !== undefined &&
        interaction.semantic?.is_direct_touchpoint !== null ? (
          <span>
            {interaction.semantic.is_direct_touchpoint
              ? "Liên hệ trực tiếp"
              : "Cập nhật nội bộ"}
          </span>
        ) : null}
        {evidenceKind ? <span>Căn cứ: {evidenceKind}</span> : null}
        {interaction.has_evidence ? <span>Có nội dung tham chiếu</span> : null}
      </div>
    </div>
  );
}
