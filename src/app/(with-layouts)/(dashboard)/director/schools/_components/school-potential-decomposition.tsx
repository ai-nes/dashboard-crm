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
  description: string;
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
  { id: "P1", label: "Quy mô khả dụng", description: "Số học sinh khối 12 nằm trong dải điểm khả thi", weight: 25 },
  { id: "P2", label: "Mật độ khả dụng", description: "Tỷ lệ học sinh khả dụng trên tổng khối 12", weight: 15 },
  { id: "P3", label: "Mức khớp ngành", description: "Tỷ lệ học sinh có tổ hợp môn phù hợp nhóm ngành đào tạo", weight: 20 },
  { id: "P4", label: "Khả năng chi trả", description: "100% trừ tỷ lệ hồ sơ cần hỗ trợ tài chính", weight: 10 },
  { id: "P5", label: "Xu hướng đi học xa", description: "Tỷ lệ học sinh nhập học ngoài tỉnh trong ba mùa gần nhất", weight: 10 },
  { id: "P6", label: "Lịch sử chuyển đổi", description: "Số nhập học bình quân có trọng số trong ba mùa gần nhất", weight: 20 },
];

export default function SchoolPotentialDecomposition({ data }: SchoolPotentialDecompositionProps) {
  const p5NotApplicable = hasKnownPotentialData(data) && data.geography.distanceTier === "Dưới 1 giờ";
  const definitions = getIndicatorDefinitions(data);
  const sourceById = new Map((data.potentialIndicators ?? []).map((indicator) => [indicator.id, indicator]));
  const rows = definitions.map((definition) => {
    const source = sourceById.get(definition.id);
    const score = finiteScore(source?.score);
    const weight = finiteScore(source?.weight) ?? definition.weight;
    const contribution = score === null ? null : Math.round((score * weight) / 100 * 10) / 10;

    return {
      ...definition,
      weight,
      displayLabel: `${definition.label} · ${formatWeight(weight)}%`,
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
          <p className="mt-1 text-xs text-text-tertiary">Các nhóm chỉ số cấu thành điểm tiềm năng của trường{p5NotApplicable ? "; xu hướng đi học xa không áp dụng trong bán kính 1 giờ" : ""}</p>
        </div>
        <Badge color={badgeColor}>{badgeLabel}</Badge>
      </CardHeader>

      <div className="min-w-0 p-5 lg:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-[11px] text-text-tertiary">
            <span className="flex items-center gap-1.5"><span className="size-2 rounded-full bg-primary-500" aria-hidden="true" />Điểm chỉ số (chuẩn hoá)</span>
            <span className="flex items-center gap-1.5"><span className="size-2 rounded-full bg-success-500" aria-hidden="true" />Đóng góp vào tổng điểm</span>
          </div>
          <p className="text-xs text-text-tertiary">Chỉ số và tổng điểm đều quy về 0–100</p>
        </div>

        <div className="mt-4 h-[25rem] min-h-[25rem] w-full">
          <ChartContainer width="100%" height="100%" minWidth={0} minHeight={0}>
            <BarChart data={rows} layout="vertical" margin={{ top: 4, right: 42, bottom: 4, left: 4 }} barCategoryGap={12}>
              <CartesianGrid horizontal={false} stroke="var(--border-color-base-100)" />
              <XAxis type="number" domain={[0, 100]} ticks={[0, 25, 50, 75, 100]} axisLine={false} tickLine={false} tick={{ fill: "var(--text-tertiary)", fontSize: 11 }} />
              <YAxis type="category" dataKey="displayLabel" width={150} axisLine={false} tickLine={false} tick={{ fill: "var(--text-secondary)", fontSize: 11 }} />
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
      <p className="font-semibold text-text-primary">{item.label}</p>
      <p className="mt-1 max-w-64 leading-4 text-text-tertiary">{item.description}</p>
      <p className="mt-2 text-text-secondary">Điểm chuẩn hoá: <strong className="text-text-primary">{item.score === null ? "-" : `${item.score}/100`}</strong></p>
      <p className="mt-1 text-text-secondary">Trọng số: <strong className="text-text-primary">{formatWeight(item.weight)}%</strong></p>
      <p className="mt-1 text-text-secondary">Đóng góp vào tổng điểm: <strong className="text-text-primary">{item.contribution === null ? "-" : `${item.contribution} điểm`}</strong></p>
    </div>
  );
}

function getIndicatorDefinitions(data: SchoolIntelligenceData): IndicatorDefinition[] {
  const hasPotentialData = Boolean(data.potentialIndicators?.length);
  const distanceStatus = data.dataAvailability?.fields["locality.travelTime"];
  const distanceIsKnown = !data.dataAvailability || distanceStatus === "available";
  const isWithinOneHour = hasPotentialData && distanceIsKnown && data.geography.distanceTier === "Dưới 1 giờ";
  const sourceById = new Map((data.potentialIndicators ?? []).map((indicator) => [indicator.id, indicator]));
  const definitions = INDICATORS
    .filter((definition) => !isWithinOneHour || definition.id !== "P5")
    .map((definition) => ({
      ...definition,
      weight: finiteScore(sourceById.get(definition.id)?.weight) ?? definition.weight,
    }));

  if (!isWithinOneHour) return definitions;

  const p1 = definitions.find((definition) => definition.id === "P1");
  const p3 = definitions.find((definition) => definition.id === "P3");
  if (!p1 || !p3) return definitions;

  const redistributedWeight = finiteScore(sourceById.get("P5")?.weight) ?? 0;
  if (!redistributedWeight) return definitions;
  const baseWeight = p1.weight + p3.weight;
  if (!baseWeight) return definitions;

  return definitions.map((definition) => {
    if (definition.id === "P1") return { ...definition, weight: roundWeight(definition.weight + (redistributedWeight * p1.weight) / baseWeight) };
    if (definition.id === "P3") return { ...definition, weight: roundWeight(definition.weight + (redistributedWeight * p3.weight) / baseWeight) };
    return definition;
  });
}

function hasKnownPotentialData(data: SchoolIntelligenceData): boolean {
  return Boolean(data.potentialIndicators?.length) && (!data.dataAvailability || data.dataAvailability.fields["locality.travelTime"] === "available");
}

function roundWeight(value: number): number {
  return Math.round(value * 10) / 10;
}

function formatWeight(value: number): string {
  return Number.isInteger(value) ? String(value) : value.toFixed(1);
}
