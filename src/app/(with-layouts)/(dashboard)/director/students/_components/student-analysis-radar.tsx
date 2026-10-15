"use client";
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
} from "recharts";
import { ChartContainer } from "@/components/tailgrids/core/chart";
import { formatDate } from "@/utils/format-date";
import type { AnalysisDimensionView } from "./student-analysis-view";
import StudentAnalysisRadarShape from "./student-analysis-radar-shape";

interface Props {
  compact?: boolean;
  dimensions: AnalysisDimensionView[];
  previous?: AnalysisDimensionView[];
  showPrevious: boolean;
  selectedCode: string;
  generatedAt?: string;
  previousAt?: string;
}
export default function StudentAnalysisRadar({
  compact = false,
  dimensions,
  previous,
  showPrevious,
  selectedCode,
  generatedAt,
  previousAt,
}: Props) {
  const known = dimensions.filter((d) => d.score !== null).length;
  const previousKnown = showPrevious
    ? (previous?.filter((d) => d.score !== null).length ?? 0)
    : 0;
  const hasData = known > 0 || previousKnown > 0;
  const allKnownZero =
    known > 0 && dimensions.every((d) => d.score === null || d.score === 0);
  const scores = Object.fromEntries(
    dimensions.map((d) => [d.chartLabel, d.score]),
  );
  const data = dimensions.map((d) => ({
    code: d.code,
    label: d.chartLabel,
    current: d.score,
    previous: previous?.find((p) => p.code === d.code)?.score ?? null,
  }));
  const matchesPrevious =
    previousKnown > 0 &&
    data.every((point) => point.current === point.previous);
  return (
    <section
      className={compact ? "min-w-0 p-3" : "min-w-0 p-4 sm:p-5"}
      aria-label="Radar phân tích 6 chiều"
    >
      {hasData ? (
        <div
          className={
            compact
              ? "mx-auto h-[260px] w-full max-w-[620px]"
              : "mx-auto h-[260px] w-full max-w-[620px]"
          }
          role="img"
          aria-label={`Radar hiện tại có ${known}/6 chiều, lần trước có ${previousKnown}/6 chiều; chiều thiếu dữ liệu không được vẽ.`}
        >
          <ChartContainer width="100%" height="100%">
            <RadarChart
              data={data}
              outerRadius="65%"
              startAngle={90}
              endAngle={-270}
            >
              <PolarGrid stroke="var(--card-border)" />
              <PolarAngleAxis
                dataKey="label"
                tick={<RadarAxisLabel scores={scores} />}
              />
              <PolarRadiusAxis
                domain={[0, 100]}
                ticks={[25, 50, 75, 100]}
                axisLine={false}
                tick={false}
                angle={90}
              />
              <Radar
                dataKey="current"
                isAnimationActive="auto"
                animationDuration={200}
                shape={
                  <StudentAnalysisRadarShape selectedCode={selectedCode} />
                }
              />
              {showPrevious && (
                <Radar
                  dataKey="previous"
                  isAnimationActive={false}
                  shape={<StudentAnalysisRadarShape previous />}
                />
              )}
            </RadarChart>
          </ChartContainer>
        </div>
      ) : (
        <div className="flex min-h-48 flex-col items-center justify-center px-4 py-8 text-center">
          <p className="text-sm font-medium text-text-primary">
            Chưa đủ dữ liệu để vẽ radar
          </p>
          <p className="mt-2 text-xs text-text-secondary">
            Các chiều chưa xác định sẽ được giữ trống.
          </p>
        </div>
      )}
      {hasData && (
        <div className="flex flex-wrap justify-center gap-4 text-xs text-text-secondary">
          <span className="inline-flex items-center gap-2">
            <span className="h-0.5 w-4 bg-primary-700" />
            {compact
              ? "Hiện tại"
              : generatedAt
                ? formatDate(generatedAt)
                : "Hiện tại"}
          </span>
          {showPrevious && previousAt && (
            <span className="inline-flex items-center gap-2">
              <span className="w-4 border-t-2 border-dashed border-info-500" />
              {compact ? "Lần trước" : formatDate(previousAt)}
              {matchesPrevious && " (trùng hiện tại)"}
            </span>
          )}
        </div>
      )}
      {known > 0 && known < dimensions.length && (
        <p className="mt-2 text-center text-xs text-text-secondary">
          {allKnownZero
            ? `${known} chiều ở mức 0 · ${dimensions.length - known} chiều chưa rõ`
            : `${dimensions.length - known} chiều chưa đủ dữ liệu`}
        </p>
      )}
      <p className="mt-3 text-center text-xs text-text-secondary">
        <span title="Mức chuẩn hoá: thấp = 0, vừa = 50, cao = 100; cao hơn = sẵn sàng hơn">
          0 · 50 · 100
        </span>
      </p>
    </section>
  );
}

function RadarAxisLabel({
  x = 0,
  y = 0,
  textAnchor = "middle",
  payload,
  scores,
}: {
  x?: number;
  y?: number;
  textAnchor?: "start" | "middle" | "end";
  payload?: { value?: string };
  scores: Record<string, number | null>;
}) {
  const label = payload?.value ?? "";
  const lines =
    label === "Vượt rào cản"
      ? ["Vượt", "rào cản"]
      : label === "Tương tác"
        ? ["Tương", "tác"]
        : label === "Xét tuyển"
          ? ["Xét", "tuyển"]
          : [label];
  return (
    <text
      x={x}
      y={textAnchor === "middle" && label !== "Gia đình" ? y - 16 : y}
      textAnchor={textAnchor}
      fill="var(--text-primary)"
      fontSize={11}
    >
      {lines.map((line, index) => (
        <tspan key={index} x={x} dy={index === 0 ? 0 : 13}>
          {line}
        </tspan>
      ))}
      <tspan
        x={x}
        dy={13}
        fontSize={10}
        fontWeight={600}
        fill={
          scores[label] == null ? "var(--text-tertiary)" : "var(--primary-700)"
        }
      >
        {scores[label] ?? "—"}
      </tspan>
    </text>
  );
}
