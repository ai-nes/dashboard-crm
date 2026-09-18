"use client";

import { ErrorCircle, InfoTriangle } from "@tailgrids/icons";

import { Badge } from "@/components/tailgrids/core/badge";
import { Button } from "@/components/tailgrids/core/button";

import type { LeadSaleDetailId, LeadSaleStageAnalysis } from "./lead-sale-dashboard.types";

interface StageInterventionsProps {
  stages: LeadSaleStageAnalysis[];
  lowestConversionId?: string;
  onOpenDetail: (detailId: LeadSaleDetailId) => void;
}

interface StageIntervention {
  stage: LeadSaleStageAnalysis;
  reason: string;
  detail: string;
  tone: "warning" | "error";
  priority: number;
}

export default function StageInterventions({
  stages,
  lowestConversionId,
  onOpenDetail,
}: StageInterventionsProps) {
  const interventions = getInterventions(stages, lowestConversionId);

  return (
    <section className="mt-4" aria-label="Các giai đoạn cần can thiệp">
      <div className="flex items-center gap-2 px-1">
        <h3 className="text-sm font-semibold text-text-primary">Cần can thiệp</h3>
        <Badge color="warning" size="sm">{interventions.length} giai đoạn</Badge>
      </div>

      {interventions.length > 0 ? (
        <div className="mt-3 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {interventions.map((item) => (
            <StageInterventionCard
              key={item.stage.id}
              item={item}
              onOpenDetail={onOpenDetail}
            />
          ))}
        </div>
      ) : (
        <div className="mt-3 rounded-xl border border-badge-success-text/30 bg-badge-success-background/30 px-4 py-3 text-xs text-badge-success-text">
          Các giai đoạn đang trong ngưỡng xử lý.
        </div>
      )}
    </section>
  );
}

function StageInterventionCard({
  item,
  onOpenDetail,
}: {
  item: StageIntervention;
  onOpenDetail: (detailId: LeadSaleDetailId) => void;
}) {
  const Icon = item.tone === "error" ? ErrorCircle : InfoTriangle;
  const toneClasses = item.tone === "error"
    ? "border-badge-error-text/30 bg-badge-error-background/20 hover:bg-badge-error-background/35"
    : "border-badge-warning-text/30 bg-badge-warning-background/20 hover:bg-badge-warning-background/35";
  const iconClasses = item.tone === "error"
    ? "bg-badge-error-background text-badge-error-text"
    : "bg-badge-warning-background text-badge-warning-text";

  return (
    <Button
      type="button"
      variant="ghost"
      appearance="ghost"
      onPress={() => onOpenDetail(item.stage.detailId)}
      aria-label={`Xem hồ sơ cần can thiệp ở giai đoạn ${item.stage.label}`}
      className={`group h-auto w-full items-stretch justify-start rounded-xl border p-4 text-left transition-colors ${toneClasses}`}
    >
      <div className="flex w-full min-w-0 items-start gap-3">
          <span className={`flex size-9 shrink-0 items-center justify-center rounded-lg ${iconClasses}`}>
          <Icon size={18} aria-hidden="true" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <span className="text-sm font-semibold text-text-primary">{item.stage.label}</span>
            <Badge color={item.tone} size="sm">{item.reason}</Badge>
          </span>
          <span className="mt-2 block text-xs leading-5 text-text-secondary">{item.detail}</span>
        </span>
      </div>
    </Button>
  );
}

function getInterventions(
  stages: LeadSaleStageAnalysis[],
  lowestConversionId?: string,
): StageIntervention[] {
  return stages
    .map((stage, index) => {
      const isLowestConversion = stage.id === lowestConversionId;
      const hasActionItems = stage.actionItemCount > 0;

      if (!isLowestConversion && !hasActionItems) return null;

      const nextStageLabel = stages[index + 1]?.label;
      const detail = isLowestConversion
        ? `Chỉ ${stage.nextStepConversion ?? 0}% sang ${nextStageLabel ?? "bước tiếp theo"}${hasActionItems ? ` · ${stage.actionItemCount} hồ sơ cần xử lý` : ""}.`
        : `${stage.actionItemCount} hồ sơ cần cập nhật bước tiếp theo trong ngày.`;

      return {
        stage,
        reason: isLowestConversion ? "Chuyển bước thấp" : "Cần xử lý",
        detail,
        tone: isLowestConversion ? "error" : "warning",
        priority: (isLowestConversion ? 4 : 0) + (hasActionItems ? 1 : 0),
      } satisfies StageIntervention;
    })
    .filter((item): item is StageIntervention => item !== null)
    .sort((a, b) => b.priority - a.priority || b.stage.actionItemCount - a.stage.actionItemCount)
    .slice(0, 3);
}
