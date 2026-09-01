"use client";

import { ArrowRight } from "@tailgrids/icons";
import { Cell, Pie, PieChart } from "recharts";

import { Button } from "@/components/tailgrids/core/button";
import { ChartContainer } from "@/components/tailgrids/core/chart";
import type {
  AnalysisClaimKind,
  AnalysisRunStage,
} from "@/services/api/analysis-runs";

import { claimKindMeta, computeAnalysisKpis } from "./analysis-run-meta";

interface AnalysisSignalProfileProps {
  stages: AnalysisRunStage[];
  onOpenDrawer: () => void;
}

const signalKinds: AnalysisClaimKind[] = [
  "recommendation",
  "inference",
  "fact",
  "uncertainty",
];

export default function AnalysisSignalProfile({
  stages,
  onOpenDrawer,
}: AnalysisSignalProfileProps) {
  const kpis = computeAnalysisKpis(stages);
  const data = signalKinds.map((kind) => ({
    kind,
    label: claimKindMeta[kind].shortLabel,
    value: countForKind(kind, kpis),
  }));

  if (kpis.totalClaims === 0) {
    return (
      <div className="min-w-0 py-5 lg:py-6">
        <p className="text-sm font-semibold text-text-primary">
          Tổng quan tín hiệu
        </p>
        <p className="mt-1 text-sm leading-6 text-text-secondary">
          Chưa có tín hiệu phân tích trong lần chạy này.
        </p>
      </div>
    );
  }

  return (
    <section
      className="min-w-0 py-5 lg:border-r lg:border-card-border lg:py-6 lg:pr-6"
      aria-labelledby="analysis-signal-heading"
    >
      <h4
        id="analysis-signal-heading"
        className="text-sm font-semibold text-text-primary"
      >
        Tổng quan tín hiệu
      </h4>

      <div className="mt-4 flex min-w-0 items-center gap-4">
        <div
          className="relative size-32 shrink-0"
          role="img"
          aria-label={`${kpis.totalClaims} tín hiệu phân tích`}
        >
          <ChartContainer width="100%" height="100%" minWidth={0} minHeight={0}>
            <PieChart>
              <Pie
                data={data}
                dataKey="value"
                nameKey="label"
                cx="50%"
                cy="50%"
                innerRadius={38}
                outerRadius={55}
                paddingAngle={2}
                stroke="var(--card-background)"
                strokeWidth={2}
                isAnimationActive={false}
              >
                {data.map((item) => (
                  <Cell
                    key={item.kind}
                    fill={claimKindMeta[item.kind].chartColor}
                  />
                ))}
              </Pie>
            </PieChart>
          </ChartContainer>
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
            <span className="text-2xl leading-none font-semibold tabular-nums text-text-primary">
              {kpis.totalClaims}
            </span>
            <span className="mt-1 text-[11px] text-text-tertiary">
              tín hiệu
            </span>
          </div>
        </div>

        <dl className="min-w-0 flex-1 space-y-2">
          {data.map((item) => (
            <div
              key={item.kind}
              className="flex items-center justify-between gap-3 text-sm"
            >
              <dt className="flex min-w-0 items-center gap-2 text-text-secondary">
                <span
                  className={`size-2 shrink-0 rounded-full ${claimKindMeta[item.kind].dotClassName}`}
                  aria-hidden="true"
                />
                <span>{item.label}</span>
              </dt>
              <dd className="font-semibold tabular-nums text-text-primary">
                {item.value}
              </dd>
            </div>
          ))}
        </dl>
      </div>

      <div className="mt-5 border-t border-card-border pt-4">
        <div className="flex items-center justify-between gap-3 text-xs">
          <span className="text-text-secondary">Nguồn đối soát</span>
          <span className="font-semibold tabular-nums text-text-primary">
            {kpis.sourcedPercent}% có nguồn
          </span>
        </div>
        <div
          className="mt-2 h-1.5 overflow-hidden rounded-full bg-background-soft-100"
          role="progressbar"
          aria-label="Tỷ lệ tín hiệu có nguồn đối soát"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={kpis.sourcedPercent}
        >
          <div
            className="h-full rounded-full bg-success-500"
            style={{ width: `${kpis.sourcedPercent}%` }}
          />
        </div>
        <Button
          appearance="ghost"
          className="mt-2 text-primary-600 hover:text-primary-700"
          onPress={onOpenDrawer}
          size="xs"
        >
          Xem chi tiết {kpis.totalClaims} tín hiệu
          <ArrowRight aria-hidden="true" size={14} />
        </Button>
      </div>
    </section>
  );
}

function countForKind(
  kind: AnalysisClaimKind,
  kpis: ReturnType<typeof computeAnalysisKpis>,
): number {
  if (kind === "recommendation") return kpis.recommendationsCount;
  if (kind === "inference") return kpis.inferencesCount;
  if (kind === "fact") return kpis.factsCount;
  return kpis.uncertaintiesCount;
}
