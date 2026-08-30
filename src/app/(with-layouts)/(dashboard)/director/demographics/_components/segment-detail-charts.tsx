"use client";

import { Area, Bar, BarChart, CartesianGrid, Cell, ComposedChart, LabelList, Line, Tooltip, XAxis, YAxis } from "recharts";

import { Card, CardHeader, CardTitle } from "@/components/tailgrids/core/card";
import { ChartContainer } from "@/components/tailgrids/core/chart";
import OverviewTooltip from "./overview-tooltip";
import SegmentScoreComparison from "./segment-score-comparison";
import type { DemographicSegment } from "./types";

export default function SegmentDetailCharts({ segment }: { segment: DemographicSegment }) {
  return (
    <section aria-label="Biểu đồ chi tiết phân khúc" className="space-y-5">
      <div className="grid min-w-0 gap-5 xl:grid-cols-[minmax(0,1.35fr)_minmax(340px,0.65fr)]">
        <Card className="min-w-0 overflow-hidden bg-background-gray-primary">
          <CardHeader className="mb-4">
            <div>
              <CardTitle>Diễn biến số hồ sơ theo tháng</CardTitle>
              <p className="mt-1 text-xs leading-5 text-text-tertiary">Nhóm đang xem và nhóm so sánh.</p>
            </div>
            <span className="text-xs font-semibold text-success-500">+{segment.growth}% tháng</span>
          </CardHeader>
          <div className="h-72">
            <ChartContainer className="h-full w-full" width="100%" height="100%" minWidth={0} minHeight={0}>
              <ComposedChart data={segment.monthlyProspects} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
                <defs><linearGradient id={`segment-momentum-${segment.id}`} x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="var(--brand-500)" stopOpacity={0.2} /><stop offset="95%" stopColor="var(--brand-500)" stopOpacity={0} /></linearGradient></defs>
                <CartesianGrid vertical={false} strokeDasharray="4 4" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} />
                <Tooltip content={<OverviewTooltip />} />
                <Area type="monotone" dataKey="current" name="Nhóm đang xem" stroke="var(--brand-500)" strokeWidth={2.5} fill={`url(#segment-momentum-${segment.id})`} dot={false} isAnimationActive={false} />
                <Line type="monotone" dataKey="benchmark" name="Nhóm gần nhất" stroke="var(--text-300)" strokeWidth={2} strokeDasharray="5 5" dot={false} isAnimationActive={false} />
              </ComposedChart>
            </ChartContainer>
          </div>
        </Card>
        <SegmentScoreComparison segment={segment} />
      </div>

      <Card className="min-w-0 overflow-hidden bg-card-background">
        <CardHeader className="mb-4">
          <div>
            <CardTitle>Kênh tiếp cận đầu tiên</CardTitle>
            <p className="mt-1 text-xs leading-5 text-text-tertiary">Tỷ lệ học sinh đến từ từng kênh.</p>
          </div>
          <span className="text-xs text-text-tertiary">Tỷ lệ (%)</span>
        </CardHeader>
        <div className="h-64 sm:h-72">
          <ChartContainer className="h-full w-full" width="100%" height="100%" minWidth={0} minHeight={0}>
            <BarChart data={segment.channels} layout="vertical" margin={{ top: 8, right: 34, left: 8, bottom: 8 }}>
              <CartesianGrid horizontal={false} strokeDasharray="4 4" />
              <XAxis type="number" domain={[0, 100]} ticks={[0, 25, 50, 75, 100]} axisLine={false} tickLine={false} tickFormatter={(value) => `${value}%`} />
              <YAxis type="category" dataKey="name" width={102} axisLine={false} tickLine={false} tick={{ fill: "var(--text-secondary)", fontSize: 12 }} />
              <Tooltip content={<OverviewTooltip suffix="%" />} />
              <Bar dataKey="value" name="Tỷ lệ học sinh" radius={[0, 6, 6, 0]} maxBarSize={28} isAnimationActive={false}>
                {segment.channels.map((channel) => <Cell key={channel.name} fill={channel.fill} />)}
                <LabelList dataKey="value" position="right" formatter={(value) => `${value}%`} fill="var(--text-secondary)" fontSize={12} />
              </Bar>
            </BarChart>
          </ChartContainer>
        </div>
      </Card>
    </section>
  );
}
