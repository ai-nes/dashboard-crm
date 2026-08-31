"use client";

import { Bar, BarChart, CartesianGrid, LabelList, Tooltip, XAxis, YAxis } from "recharts";

import { Badge } from "@/components/tailgrids/core/badge";
import { Card, CardHeader, CardTitle } from "@/components/tailgrids/core/card";
import { ChartContainer } from "@/components/tailgrids/core/chart";
import type { SchoolIntelligenceData, SchoolPotentialIndicatorId } from "@/services/api/schools/types";

interface SchoolPotentialDecompositionProps {
  data: SchoolIntelligenceData;
}

interface IndicatorDefinition {
  id: SchoolPotentialIndicatorId;
  label: string;
  weight: number;
}

interface PotentialChartRow extends IndicatorDefinition {
  displayLabel: string;
  score: number | null;
  contribution: number | null;
  scoreValue: number;
  contributionValue: number;
  scoreLabel: string;
  contributionLabel: string;
  status: "available" | "estimated" | "unavailable";
}

const INDICATORS: IndicatorDefinition[] = [
  { id: "P1", label: "Quy mô khả dụng", weight: 25 },
  { id: "P2", label: "Mật độ khả dụng", weight: 15 },
  { id: "P3", label: "Mức khớp ngành", weight: 20 },
  { id: "P4", label: "Khả năng chi trả", weight: 10 },
  { id: "P5", label: "Xu hướng đi học xa", weight: 10 },
  { id: "P6", label: "Lịch sử chuyển đổi", weight: 20 },
];

export default function SchoolPotentialDecomposition({ data }: SchoolPotentialDecompositionProps) {
  const sourceById = new Map((data.potentialIndicators ?? []).map((indicator) => [indicator.id, indicator]));
  const rows = INDICATORS.map((definition) => {
    const source = sourceById.get(definition.id);
    const score = finiteScore(source?.score);
    const contribution = score === null ? null : Math.round((score * definition.weight) / 100 * 10) / 10;

    return {
      ...definition,
      displayLabel: `${definition.id} · ${definition.label}`,
      score,
      contribution,
      scoreValue: score ?? 0,
      contributionValue: contribution ?? 0,
      scoreLabel: score === null ? "-" : `${score}`,
      contributionLabel: contribution === null ? "-" : `${contribution}`,
      status: source?.status ?? (score === null ? "unavailable" : "available"),
    } satisfies PotentialChartRow;
  });
  const hasData = rows.some((row) => row.score !== null);
  const hasCompleteData = rows.every((row) => row.score !== null);
  const totalContribution = hasCompleteData
    ? Math.round(rows.reduce((total, row) => total + (row.contribution ?? 0), 0) * 10) / 10
    : null;
  const hasEstimate = rows.some((row) => row.status === "estimated");
  const badgeColor = !hasData ? "gray" : hasEstimate || !hasCompleteData ? "warning" : "success";
  const badgeLabel = !hasData
    ? "Chưa có dữ liệu"
    : hasEstimate
      ? "Có ước lượng"
      : !hasCompleteData
        ? "Thiếu dữ liệu"
        : `${totalContribution}/100`;

  return (
    <Card className="min-w-0 overflow-hidden p-0">
      <CardHeader className="border-b border-card-border p-5 pb-4 lg:p-6 lg:pb-4">
        <div className="min-w-0">
          <CardTitle>Phân rã điểm tiềm năng</CardTitle>
          <p className="mt-1 text-xs text-text-tertiary">Thấy điểm trường được hình thành từ sáu chỉ số P1–P6</p>
        </div>
        <Badge color={badgeColor}>{badgeLabel}</Badge>
      </CardHeader>

      <div className="min-w-0 p-5 lg:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-[11px] text-text-tertiary">
            <span className="flex items-center gap-1.5"><span className="size-2 rounded-full bg-primary-500" aria-hidden="true" />Điểm chỉ số</span>
            <span className="flex items-center gap-1.5"><span className="size-2 rounded-full bg-success-500" aria-hidden="true" />Đóng góp theo trọng số</span>
          </div>
          <p className="text-xs text-text-tertiary">Thang điểm chuẩn hoá 0–100</p>
        </div>

        <div className="mt-4 h-[25rem] min-h-[25rem] w-full">
          <ChartContainer width="100%" height="100%" minWidth={0} minHeight={0}>
            <BarChart data={rows} layout="vertical" margin={{ top: 4, right: 42, bottom: 4, left: 4 }} barCategoryGap={12}>
              <CartesianGrid horizontal={false} stroke="var(--border-color-base-100)" />
              <XAxis type="number" domain={[0, 100]} ticks={[0, 25, 50, 75, 100]} axisLine={false} tickLine={false} tick={{ fill: "var(--text-tertiary)", fontSize: 11 }} />
              <YAxis type="category" dataKey="displayLabel" width={175} axisLine={false} tickLine={false} tick={{ fill: "var(--text-secondary)", fontSize: 11 }} />
              <Tooltip cursor={{ fill: "var(--background-soft-50)" }} content={<PotentialTooltip />} />
              <Bar dataKey="scoreValue" name="Điểm chỉ số" fill="var(--primary-500)" barSize={10} radius={[0, 5, 5, 0]}>
                <LabelList dataKey="scoreLabel" position="right" fill="var(--text-secondary)" fontSize={11} />
              </Bar>
              <Bar dataKey="contributionValue" name="Đóng góp" fill="var(--success-500)" barSize={10} radius={[0, 5, 5, 0]}>
                <LabelList dataKey="contributionLabel" position="right" fill="var(--text-tertiary)" fontSize={11} />
              </Bar>
            </BarChart>
          </ChartContainer>
        </div>

        <div className="mt-4 border-t border-card-border pt-4">
          <p className="text-xs leading-5 text-text-secondary">Công thức: P1 × 25% + P2 × 15% + P3 × 20% + P4 × 10% + P5 × 10% + P6 × 20%</p>
          {!hasData ? <p className="mt-2 text-xs text-text-tertiary">Chưa thu thập các chỉ số P1–P6. Khung biểu đồ vẫn được giữ để cập nhật khi có dữ liệu.</p> : null}
        </div>
      </div>
    </Card>
  );
}

function finiteScore(value: number | null | undefined): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function PotentialTooltip({ active, payload }: { active?: boolean; payload?: { payload?: PotentialChartRow }[] }) {
  const item = payload?.[0]?.payload;
  if (!active || !item) return null;

  return (
    <div className="rounded-xl border border-card-border bg-card-background p-3 text-xs shadow-theme-md">
      <p className="font-semibold text-text-primary">{item.id} · {item.label}</p>
      <p className="mt-1 text-text-secondary">Điểm chỉ số: <strong className="text-text-primary">{item.score === null ? "-" : `${item.score}/100`}</strong></p>
      <p className="mt-1 text-text-secondary">Trọng số: <strong className="text-text-primary">{item.weight}%</strong></p>
      <p className="mt-1 text-text-secondary">Đóng góp: <strong className="text-text-primary">{item.contribution === null ? "-" : `${item.contribution} điểm`}</strong></p>
    </div>
  );
}
