"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  LabelList,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { Badge } from "@/components/tailgrids/core/badge";
import { Card, CardHeader, CardTitle } from "@/components/tailgrids/core/card";
import { ChartContainer } from "@/components/tailgrids/core/chart";
import type {
  SchoolIntelligenceData,
  SchoolPotentialIndicatorId,
} from "@/services/api/schools/types";

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
  {
    id: "P1",
    label: "Quy mô khả dụng",
    description: "Số học sinh khối 12 nằm trong dải điểm khả thi",
    weight: 25,
  },
  {
    id: "P2",
    label: "Mật độ khả dụng",
    description: "Tỷ lệ học sinh khả dụng trên tổng khối 12",
    weight: 15,
  },
  {
    id: "P3",
    label: "Mức khớp ngành",
    description: "Tỷ lệ học sinh có tổ hợp môn phù hợp nhóm ngành đào tạo",
    weight: 20,
  },
  {
    id: "P4",
    label: "Khả năng chi trả",
    description: "100% trừ tỷ lệ hồ sơ cần hỗ trợ tài chính",
    weight: 10,
  },
  {
    id: "P5",
    label: "Xu hướng đi học xa",
    description: "Tỷ lệ học sinh nhập học ngoài tỉnh trong ba mùa gần nhất",
    weight: 10,
  },
  {
    id: "P6",
    label: "Lịch sử chuyển đổi",
    description: "Số nhập học bình quân có trọng số trong ba mùa gần nhất",
    weight: 20,
  },
];

export default function SchoolPotentialDecomposition({
  data,
}: SchoolPotentialDecompositionProps) {
  const definitions = getIndicatorDefinitions(data);
  const sourceById = new Map(
    (data.potentialIndicators ?? []).map((indicator) => [
      indicator.id,
      indicator,
    ]),
  );
  const rows = definitions.map((definition) => {
    const source = sourceById.get(definition.id);
    const score = finiteScore(source?.score);
    const weight = finiteScore(source?.weight) ?? definition.weight;
    const contribution =
      score === null ? null : Math.round(((score * weight) / 100) * 10) / 10;

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
    ? Math.round(
        rows.reduce((total, row) => total + (row.contribution ?? 0), 0) * 10,
      ) / 10
    : null;
  const hasEstimate = rows.some((row) => row.status === "estimated");
  const badgeColor = !hasData
    ? "gray"
    : hasEstimate || !hasCompleteData
      ? "warning"
      : "success";
  const badgeLabel = !hasData
    ? "Chưa có dữ liệu"
    : hasEstimate
      ? "Có ước lượng"
      : !hasCompleteData
        ? "Thiếu dữ liệu"
        : `${totalContribution}/100`;
  const potentialScore = data.potentialScore ?? totalContribution;

  return (
    <Card className="min-w-0 overflow-hidden p-0">
      <CardHeader className="px-5 pt-5 pb-0 lg:px-6 lg:pt-6">
        <div className="min-w-0 flex-1">
          <CardTitle>Đánh giá tiềm năng trường</CardTitle>
        </div>
        <Badge color={badgeColor}>{data.classification.group}</Badge>
      </CardHeader>

      <div className="min-w-0 px-5 pt-4 pb-5 lg:px-6 lg:pt-5 lg:pb-6">
        <div className="grid min-w-0 gap-5 lg:grid-cols-[11rem_minmax(0,1fr)] lg:items-stretch">
          <div className="flex flex-col items-center justify-center text-center lg:border-r lg:border-card-border lg:pr-6">
            <p className="text-[10px] font-semibold tracking-[0.14em] text-text-tertiary uppercase">
              Điểm tiềm năng
            </p>
            <p className="mt-2 text-4xl leading-none font-semibold tracking-[-1px] text-primary-500">
              {potentialScore ?? "-"}
              <span className="text-lg font-medium text-text-tertiary">
                /100
              </span>
            </p>
            <p className="mt-2 text-xs text-text-tertiary">
              Điểm càng cao càng nên ưu tiên đầu tư
            </p>
            <p className="mt-3 text-xs font-semibold text-success-500">
              {badgeLabel}
            </p>
          </div>

          <div className="min-w-0 lg:pl-1">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm font-semibold text-text-primary">
                Theo từng chỉ số
              </p>
              <span className="text-xs text-text-tertiary">/ 100</span>
            </div>

            <div className="mt-3 h-72 min-h-72 w-full">
              <ChartContainer
                width="100%"
                height="100%"
                minWidth={0}
                minHeight={0}
              >
                <BarChart
                  data={rows}
                  layout="vertical"
                  margin={{ top: 4, right: 42, bottom: 4, left: 4 }}
                  barCategoryGap="24%"
                >
                  <CartesianGrid
                    horizontal={false}
                    stroke="var(--border-color-base-100)"
                  />
                  <XAxis
                    type="number"
                    domain={[0, 100]}
                    ticks={[0, 25, 50, 75, 100]}
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "var(--text-tertiary)", fontSize: 11 }}
                  />
                  <YAxis
                    type="category"
                    dataKey="displayLabel"
                    width={134}
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "var(--text-secondary)", fontSize: 11 }}
                  />
                  <Tooltip
                    cursor={{ fill: "var(--background-soft-50)" }}
                    content={<PotentialTooltip />}
                  />
                  <Bar
                    dataKey="scoreValue"
                    name="Điểm chỉ số"
                    fill="var(--primary-500)"
                    barSize={18}
                    radius={[0, 5, 5, 0]}
                  >
                    <LabelList
                      dataKey="scoreLabel"
                      position="right"
                      fill="var(--text-secondary)"
                      fontSize={11}
                    />
                  </Bar>
                </BarChart>
              </ChartContainer>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}

function finiteScore(value: number | null | undefined): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function PotentialTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: { payload?: PotentialChartRow }[];
}) {
  const item = payload?.[0]?.payload;
  if (!active || !item) return null;

  return (
    <div className="rounded-xl border border-card-border bg-card-background p-3 text-xs shadow-theme-md">
      <p className="font-semibold text-text-primary">{item.label}</p>
      <p className="mt-1 max-w-64 leading-4 text-text-tertiary">
        {item.description}
      </p>
      <p className="mt-2 text-text-secondary">
        Điểm chuẩn hoá:{" "}
        <strong className="text-text-primary">
          {item.score === null ? "-" : `${item.score}/100`}
        </strong>
      </p>
      <p className="mt-1 text-text-secondary">
        Trọng số:{" "}
        <strong className="text-text-primary">
          {formatWeight(item.weight)}%
        </strong>
      </p>
      <p className="mt-1 text-text-secondary">
        Đóng góp vào tổng điểm:{" "}
        <strong className="text-text-primary">
          {item.contribution === null ? "-" : `${item.contribution} điểm`}
        </strong>
      </p>
    </div>
  );
}

function getIndicatorDefinitions(
  data: SchoolIntelligenceData,
): IndicatorDefinition[] {
  const hasPotentialData = Boolean(data.potentialIndicators?.length);
  const distanceStatus = data.dataAvailability?.fields["locality.travelTime"];
  const distanceIsKnown =
    !data.dataAvailability || distanceStatus === "available";
  const isWithinOneHour =
    hasPotentialData &&
    distanceIsKnown &&
    data.geography.distanceTier === "Dưới 1 giờ";
  const sourceById = new Map(
    (data.potentialIndicators ?? []).map((indicator) => [
      indicator.id,
      indicator,
    ]),
  );
  const definitions = INDICATORS.filter(
    (definition) => !isWithinOneHour || definition.id !== "P5",
  ).map((definition) => ({
    ...definition,
    weight:
      finiteScore(sourceById.get(definition.id)?.weight) ?? definition.weight,
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
    if (definition.id === "P1")
      return {
        ...definition,
        weight: roundWeight(
          definition.weight + (redistributedWeight * p1.weight) / baseWeight,
        ),
      };
    if (definition.id === "P3")
      return {
        ...definition,
        weight: roundWeight(
          definition.weight + (redistributedWeight * p3.weight) / baseWeight,
        ),
      };
    return definition;
  });
}

function roundWeight(value: number): number {
  return Math.round(value * 10) / 10;
}

function formatWeight(value: number): string {
  return Number.isInteger(value) ? String(value) : value.toFixed(1);
}
