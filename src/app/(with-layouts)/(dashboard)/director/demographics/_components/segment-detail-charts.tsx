"use client";

import { Area, Bar, BarChart, CartesianGrid, Cell, ComposedChart, LabelList, Line, Tooltip, XAxis, YAxis } from "recharts";

import { Card, CardHeader, CardTitle } from "@/components/tailgrids/core/card";
import { ChartContainer } from "@/components/tailgrids/core/chart";
import ChartEmptyState from "./chart-empty-state";
import { formatCountTick, formatGrowth, getCountAxisMax } from "./chart-utils";
import OverviewTooltip from "./overview-tooltip";
import SegmentScoreComparison from "./segment-score-comparison";
import type { ChannelAttributionModel, DemographicSegment } from "./types";

export default function SegmentDetailCharts({
  segment,
  benchmark,
}: {
  segment: DemographicSegment;
  benchmark?: DemographicSegment;
}) {
  const trendValues = segment.monthlyProspects.flatMap((point) => [point.current, point.benchmark]);
  const hasTrendData = trendValues.some((value) => typeof value === "number" && Number.isFinite(value));
  const trendAxisMax = getCountAxisMax(trendValues);
  const attributionModel = segment.channelAttributionModel ?? "observed-interactions";
  const channelTitle = getChannelTitle(attributionModel);
  const channelDescription = getChannelDescription(attributionModel);

  return (
    <section aria-label="Biểu đồ chi tiết phân khúc" className="space-y-5">
      <div className="grid min-w-0 gap-5 xl:grid-cols-[minmax(0,1.35fr)_minmax(340px,0.65fr)]">
        <Card className="min-w-0 overflow-hidden bg-background-gray-primary">
          <CardHeader className="mb-4">
            <div>
              <CardTitle>Diễn biến số học sinh theo tháng</CardTitle>
              <p className="mt-1 text-xs leading-5 text-text-tertiary">So sánh số học sinh của nhóm đang xem với nhóm gần nhất.</p>
            </div>
            <span className="text-xs font-semibold text-text-secondary">
              {segment.growth == null ? "Chưa đủ dữ liệu tăng trưởng" : `${formatGrowth(segment.growth)} so với tháng trước`}
            </span>
          </CardHeader>
          <div className="h-72">
            {hasTrendData ? (
              <ChartContainer className="h-full w-full" width="100%" height="100%" minWidth={0} minHeight={0}>
                <ComposedChart data={segment.monthlyProspects} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
                  <defs><linearGradient id={`segment-momentum-${segment.id}`} x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="var(--brand-500)" stopOpacity={0.2} /><stop offset="95%" stopColor="var(--brand-500)" stopOpacity={0} /></linearGradient></defs>
                  <CartesianGrid vertical={false} strokeDasharray="4 4" />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} />
                  <YAxis domain={[0, trendAxisMax]} tickCount={5} axisLine={false} tickLine={false} tickFormatter={formatCountTick} />
                  <Tooltip content={<OverviewTooltip />} />
                  <Area type="monotone" dataKey="current" name="Nhóm đang xem" stroke="var(--brand-500)" strokeWidth={2.5} fill={`url(#segment-momentum-${segment.id})`} dot={false} connectNulls={false} isAnimationActive={false} />
                  <Line type="monotone" dataKey="benchmark" name="Nhóm gần nhất" stroke="var(--text-300)" strokeWidth={2} strokeDasharray="5 5" dot={false} connectNulls={false} isAnimationActive={false} />
                </ComposedChart>
              </ChartContainer>
            ) : (
              <ChartEmptyState message="Chưa có dữ liệu theo thời gian" detail="Không vẽ đường xu hướng từ số liệu thiếu hoặc chưa đủ kỳ so sánh." />
            )}
          </div>
        </Card>
        <SegmentScoreComparison segment={segment} benchmark={benchmark} />
      </div>

      <Card className="min-w-0 overflow-hidden bg-card-background">
        <CardHeader className="mb-4">
          <div>
            <CardTitle>{channelTitle}</CardTitle>
            <p className="mt-1 text-xs leading-5 text-text-tertiary">{channelDescription}</p>
          </div>
          <span className="text-xs text-text-tertiary">Tỷ trọng (%)</span>
        </CardHeader>
        <div className="h-64 sm:h-72">
          {segment.channels.length > 0 ? (
            <ChartContainer className="h-full w-full" width="100%" height="100%" minWidth={0} minHeight={0}>
              <BarChart data={segment.channels} layout="vertical" margin={{ top: 8, right: 34, left: 8, bottom: 8 }}>
                <CartesianGrid horizontal={false} strokeDasharray="4 4" />
                <XAxis type="number" domain={[0, 100]} ticks={[0, 25, 50, 75, 100]} axisLine={false} tickLine={false} tickFormatter={(value) => `${value}%`} />
                <YAxis type="category" dataKey="name" width={102} axisLine={false} tickLine={false} tick={{ fill: "var(--text-secondary)", fontSize: 12 }} />
                <Tooltip content={<OverviewTooltip suffix="%" />} />
                <Bar dataKey="value" name="Tỷ trọng theo kênh" radius={[0, 6, 6, 0]} maxBarSize={28} isAnimationActive={false}>
                  {segment.channels.map((channel, index) => <Cell key={channel.name} fill={channel.fill ?? getChannelColor(index)} />)}
                  <LabelList dataKey="value" position="right" formatter={(value) => `${value}%`} fill="var(--text-secondary)" fontSize={12} />
                </Bar>
              </BarChart>
            </ChartContainer>
          ) : (
            <ChartEmptyState message="Chưa có dữ liệu nguồn" detail="Cần ghi nhận nguồn hoặc kênh tương tác trước khi so sánh." />
          )}
        </div>
      </Card>
    </section>
  );
}

function getChannelTitle(model: ChannelAttributionModel): string {
  if (model === "first-touch") return "Nguồn đầu tiên";
  if (model === "last-touch") return "Nguồn cuối";
  return "Kênh tương tác được ghi nhận";
}

function getChannelDescription(model: ChannelAttributionModel): string {
  if (model === "first-touch") return "Tỷ trọng học sinh theo nơi biết đến trường đầu tiên.";
  if (model === "last-touch") return "Tỷ trọng học sinh theo nguồn tại lúc gửi biểu mẫu.";
  return "Tỷ trọng tương tác được ghi nhận, chưa phải nguồn đầu hay nguồn cuối.";
}

function getChannelColor(index: number): string {
  const colors = ["var(--brand-500)", "var(--success-500)", "var(--info-500)", "var(--warning-500)"];
  return colors[index % colors.length];
}
