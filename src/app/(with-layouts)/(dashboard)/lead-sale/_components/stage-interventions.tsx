"use client";

import { ErrorCircle, InfoTriangle } from "@tailgrids/icons";

import { Badge } from "@/components/tailgrids/core/badge";
import { Button } from "@/components/tailgrids/core/button";

import type { LeadSaleDetailId, LeadSaleStageAnalysis } from "./mock-data";

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

  return (
    <Button
      type="button"
      variant="ghost"
      appearance="ghost"
      onPress={() => onOpenDetail(item.stage.detailId)}
      aria-label={`Xem hồ sơ cần can thiệp ở giai đoạn ${item.stage.label}`}
      className={`group h-auto w-full items-stretch justify-start rounded-xl border p-4 text-left transition-colors ${item.tone === "error" ? "border-badge-error-text/30 bg-badge-error-background/20 hover:bg-badge-error-background/35" : "border-badge-warning-text/30 bg-badge-warning-background/20 hover:bg-badge-warning-background/35"}`}
    >
      <div className="flex w-full min-w-0 items-start gap-3">
        <span className={`flex size-9 shrink-0 items-center justify-center rounded-lg ${item.tone === "error" ? "bg-badge-error-background text-badge-error-text" : "bg-badge-warning-background text-badge-warning-text"}`}>
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
      const slaDelta = stage.slaDays > 0 ? stage.averageDays - stage.slaDays : 0;
      const isOverSla = slaDelta > 0;
      const isLowestConversion = stage.id === lowestConversionId;
      const hasStalledRecords = stage.stalledCount > 0;

      if (!isOverSla && !isLowestConversion && !hasStalledRecords) return null;

      const nextStageLabel = stages[index + 1]?.label;
      const detail = isLowestConversion
        ? `Chỉ ${stage.nextStepConversion}% sang ${nextStageLabel ?? "bước tiếp theo"}${isOverSla ? ` · vượt SLA ${formatDays(slaDelta)}` : ""}${hasStalledRecords ? ` · ${stage.stalledCount} hồ sơ tồn` : ""}.`
        : isOverSla
          ? `Vượt SLA ${formatDays(slaDelta)} · ${stage.stalledCount} hồ sơ tồn cần được xử lý trước.`
          : `${stage.stalledCount} hồ sơ đang chờ bước tiếp theo · cần rà lại trong ngày.`;

      return {
        stage,
        reason: isLowestConversion ? "Chuyển bước thấp" : isOverSla ? "Vượt SLA" : "Hồ sơ tồn",
        detail,
        tone: isOverSla ? "error" : "warning",
        priority: (isLowestConversion ? 4 : 0) + (isOverSla ? 3 : 0) + (hasStalledRecords ? 1 : 0),
      } satisfies StageIntervention;
    })
    .filter((item): item is StageIntervention => item !== null)
    .sort((a, b) => b.priority - a.priority || b.stage.stalledCount - a.stage.stalledCount)
    .slice(0, 3);
}

function formatDays(value: number) {
  return `${value.toFixed(1).replace(".", ",")} ngày`;
}
