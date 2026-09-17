"use client";

import { ArrowRight } from "@tailgrids/icons";

import { Badge } from "@/components/tailgrids/core/badge";
import { Button } from "@/components/tailgrids/core/button";

import type { LeadSaleDetailId, LeadSaleStageAnalysis } from "./mock-data";

interface StagePipelineOverviewProps {
  stages: LeadSaleStageAnalysis[];
  maxVolume: number;
  lowestConversionId?: string;
  onOpenDetail: (detailId: LeadSaleDetailId) => void;
}

export default function StagePipelineOverview({
  stages,
  maxVolume,
  lowestConversionId,
  onOpenDetail,
}: StagePipelineOverviewProps) {
  return (
    <div
      className="rounded-2xl border border-card-border bg-background-soft-50/50 p-3 sm:p-4"
      aria-label="Tổng quan phễu tuyển sinh theo giai đoạn"
    >
      <div className="hidden xl:grid xl:items-stretch xl:grid-cols-[minmax(0,1fr)_48px_minmax(0,1fr)_48px_minmax(0,1fr)_48px_minmax(0,1fr)_48px_minmax(0,1fr)_48px_minmax(0,1fr)]">
        {stages.map((stage, index) => (
          <div key={stage.id} className="contents">
            <PipelineStage
              stage={stage}
              maxVolume={maxVolume}
              isLowestConversion={stage.id === lowestConversionId}
              onOpenDetail={onOpenDetail}
            />
            {index < stages.length - 1 && (
              <PipelineConnector
                fromStage={stage}
                toStage={stages[index + 1]}
              />
            )}
          </div>
        ))}
      </div>

      <div className="grid gap-3 md:grid-cols-2 xl:hidden">
        {stages.map((stage, index) => (
          <div key={stage.id} className="min-w-0">
            <PipelineStage
              stage={stage}
              maxVolume={maxVolume}
              isLowestConversion={stage.id === lowestConversionId}
              onOpenDetail={onOpenDetail}
            />
            {index < stages.length - 1 && (
              <PipelineTransition
                fromStage={stage}
                toStage={stages[index + 1]}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function PipelineStage({
  stage,
  maxVolume,
  isLowestConversion,
  onOpenDetail,
}: {
  stage: LeadSaleStageAnalysis;
  maxVolume: number;
  isLowestConversion: boolean;
  onOpenDetail: (detailId: LeadSaleDetailId) => void;
}) {
  const slaDelta = stage.slaDays > 0 ? stage.averageDays - stage.slaDays : null;
  const isOverSla = slaDelta !== null && slaDelta > 0;
  const volumeWidth = maxVolume ? Math.max((stage.volume / maxVolume) * 100, 4) : 0;
  const status = getStageStatus(stage, isOverSla);

  return (
    <Button
      type="button"
      variant="ghost"
      appearance="ghost"
      onPress={() => onOpenDetail(stage.detailId)}
      aria-label={`Xem hồ sơ giai đoạn ${stage.label}, ${stage.volume} hồ sơ`}
      className={`group h-auto min-h-0 w-full items-stretch justify-start rounded-xl border p-3 text-left transition-colors xl:min-h-[142px] xl:p-3.5 ${getStageCardClassName({ isLowestConversion, isOverSla })}`}
    >
      <div className="flex w-full min-w-0 flex-col">
        <p className="min-w-0 break-words text-sm font-semibold leading-5 text-text-primary">
          {stage.label}
        </p>

        <div className="mt-3 flex items-baseline gap-1.5">
          <span className="text-2xl font-semibold tracking-[-0.04em] text-text-primary">
            {stage.volume}
          </span>
          <span className="text-[11px] text-text-tertiary">hồ sơ</span>
        </div>

        <div className="mt-4 xl:mt-auto xl:pt-3">
          <div className="h-1.5 overflow-hidden rounded-full bg-background-soft-100" aria-hidden="true">
            <div
              className={`h-full rounded-full transition-[width] ${getVolumeBarClassName({ isLowestConversion, isOverSla })}`}
              style={{ width: `${volumeWidth}%` }}
            />
          </div>
          <div className="mt-2 flex min-w-0 items-center justify-between gap-2">
            <Badge color={status.color} size="sm" className="whitespace-nowrap">
              {status.label}
            </Badge>
            {stage.stalledCount > 0 && !isOverSla && (
              <span className="truncate text-[10px] text-text-tertiary">
                {stage.stalledCount} hồ sơ tồn
              </span>
            )}
          </div>
        </div>
      </div>
    </Button>
  );
}

function PipelineConnector({
  fromStage,
  toStage,
}: {
  fromStage: LeadSaleStageAnalysis;
  toStage: LeadSaleStageAnalysis;
}) {
  const conversion = fromStage.nextStepConversion;

  return (
    <div
      className="flex min-w-0 flex-col items-center justify-center gap-1 text-center text-text-tertiary"
      aria-label={`${conversion ?? 0}% chuyển từ ${fromStage.label} sang ${toStage.label}`}
    >
      <ArrowRight size={15} aria-hidden="true" />
      <span className="whitespace-nowrap text-xs font-semibold text-text-secondary">
        {conversion === null ? "—" : `${conversion}%`}
      </span>
    </div>
  );
}

function PipelineTransition({
  fromStage,
  toStage,
}: {
  fromStage: LeadSaleStageAnalysis;
  toStage: LeadSaleStageAnalysis;
}) {
  return (
    <div
      className="flex items-center justify-center gap-2 px-2 py-1.5 text-center text-xs text-text-secondary md:justify-start md:text-left"
      aria-label={`${fromStage.nextStepConversion ?? 0}% chuyển từ ${fromStage.label} sang ${toStage.label}`}
    >
      <ArrowRight size={14} aria-hidden="true" className="rotate-90 shrink-0 text-text-tertiary md:hidden" />
      <span className="font-semibold">{fromStage.nextStepConversion ?? "—"}%</span>
      <span className="truncate text-text-tertiary">sang {toStage.label}</span>
    </div>
  );
}

function getStageStatus(
  stage: LeadSaleStageAnalysis,
  isOverSla: boolean,
): { label: string; color: "gray" | "warning" | "error" | "success" } {
  if (isOverSla) return { label: `SLA +${formatDays(stage.averageDays - stage.slaDays)}`, color: "error" };
  if (stage.nextStepConversion === null) return { label: "Kết quả", color: "success" };
  if (stage.stalledCount > 0) return { label: "Theo dõi", color: "warning" };
  return { label: "Trong SLA", color: "gray" };
}

function getStageCardClassName({
  isLowestConversion,
  isOverSla,
}: {
  isLowestConversion: boolean;
  isOverSla: boolean;
}) {
  if (isOverSla) return "border-badge-error-text/30 bg-badge-error-background/20 hover:bg-badge-error-background/35";
  if (isLowestConversion) return "border-badge-warning-text/30 bg-badge-warning-background/20 hover:bg-badge-warning-background/35";
  return "border-card-border bg-card-background hover:border-button-primary-outline-stroke hover:bg-background-soft-50";
}

function getVolumeBarClassName({
  isLowestConversion,
  isOverSla,
}: {
  isLowestConversion: boolean;
  isOverSla: boolean;
}) {
  if (isOverSla) return "bg-badge-error-text";
  if (isLowestConversion) return "bg-warning-500";
  return "bg-primary-500";
}

function formatDays(value: number) {
  return `${value.toFixed(1).replace(".", ",")} ngày`;
}
