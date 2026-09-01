"use client";

import { Bar, BarChart, CartesianGrid, Tooltip, XAxis, YAxis } from "recharts";

import { ChartContainer } from "@/components/tailgrids/core/chart";
import type {
  AcquisitionFirstVsLastSource,
  AcquisitionSourceCount,
} from "@/services/api/demographics/types";
import AcquisitionMapChartCard, {
  DemoLegend,
  DemoNote,
  formatDemoNumber,
} from "./acquisition-map-chart-card";
import { useAcquisitionMapData } from "./acquisition-map-context";
import OverviewTooltip from "./overview-tooltip";

export function AcquisitionAttributionPanels() {
  return (
    <div className="grid min-w-0 grid-cols-1 gap-5 xl:grid-cols-2">
      <SourceAttributionChart
        chartId="14"
        title="Nguồn chạm đầu tiên"
        description="Nguồn đầu tiên tạo ra lead trong tập attribution đã resolve."
        badge="First-touch"
        dataKey="firstTouchBySource"
      />
      <SourceAttributionChart
        chartId="15"
        title="Nguồn chạm cuối cùng"
        description="Nguồn gần nhất trước khi lead chuyển bước tiếp theo."
        badge="Last-touch"
        dataKey="lastTouchBySource"
      />
      <FirstVsLastSourceChart />
      <AttributionFlowChart />
    </div>
  );
}

function SourceAttributionChart({
  chartId,
  title,
  description,
  badge,
  dataKey,
}: {
  chartId: string;
  title: string;
  description: string;
  badge: string;
  dataKey: "firstTouchBySource" | "lastTouchBySource";
}) {
  const data = useAcquisitionMapData()[dataKey];

  return (
    <AcquisitionMapChartCard
      chartId={chartId}
      title={title}
      description={description}
      badge={badge}
    >
      <div className="h-64">
        <ChartContainer
          className="h-full w-full"
          width="100%"
          height="100%"
          minWidth={0}
          minHeight={0}
        >
          <BarChart
            data={data}
            layout="vertical"
            margin={{ top: 8, right: 16, left: 8, bottom: 0 }}
            barCategoryGap={8}
          >
            <CartesianGrid horizontal={false} stroke="var(--border-color-base-100)" />
            <XAxis
              type="number"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "var(--text-tertiary)", fontSize: 11 }}
              tickFormatter={(value) => formatDemoNumber(Number(value))}
            />
            <YAxis
              type="category"
              dataKey="source"
              width={72}
              axisLine={false}
              tickLine={false}
              tick={{ fill: "var(--text-secondary)", fontSize: 11 }}
            />
            <Tooltip content={<OverviewTooltip />} />
            <Bar
              dataKey="value"
              name="Số lead"
              fill="var(--brand-500)"
              radius={[0, 5, 5, 0]}
              barSize={18}
            />
          </BarChart>
        </ChartContainer>
      </div>
      <DemoNote>
        Attribution chỉ bao gồm lead có lineage đã resolve; không suy diễn nguồn từ
        interaction thiếu định danh.
      </DemoNote>
    </AcquisitionMapChartCard>
  );
}

function FirstVsLastSourceChart() {
  const { firstVsLastSource } = useAcquisitionMapData();

  return (
    <AcquisitionMapChartCard
      chartId="16"
      title="First-touch và last-touch"
      description="Đối chiếu nguồn tạo nhu cầu với nguồn thúc đẩy tương tác cuối."
      badge="Số lead"
    >
      <div className="h-64">
        <ChartContainer
          className="h-full w-full"
          width="100%"
          height="100%"
          minWidth={0}
          minHeight={0}
        >
          <BarChart
            data={firstVsLastSource}
            margin={{ top: 8, right: 8, left: -12, bottom: 0 }}
          >
            <CartesianGrid vertical={false} stroke="var(--border-color-base-100)" strokeDasharray="4 4" />
            <XAxis dataKey="source" axisLine={false} tickLine={false} tick={{ fill: "var(--text-tertiary)", fontSize: 11 }} />
            <YAxis axisLine={false} tickLine={false} tick={{ fill: "var(--text-tertiary)", fontSize: 11 }} />
            <Tooltip content={<OverviewTooltip />} />
            <Bar dataKey="first" name="First-touch" fill="var(--primary-300)" radius={[5, 5, 0, 0]} barSize={18} />
            <Bar dataKey="last" name="Last-touch" fill="var(--brand-500)" radius={[5, 5, 0, 0]} barSize={18} />
          </BarChart>
        </ChartContainer>
      </div>
      <DemoLegend items={[{ label: "First-touch", color: "bg-primary-300" }, { label: "Last-touch", color: "bg-brand-500" }]} />
      <DemoNote>Delta chỉ có ý nghĩa khi hai model dùng cùng một tập lead và snapshot.</DemoNote>
    </AcquisitionMapChartCard>
  );
}

function AttributionFlowChart() {
  const { attributionFlow } = useAcquisitionMapData();
  const maximum = Math.max(...attributionFlow.map((item) => item.value), 0);

  return (
    <AcquisitionMapChartCard
      chartId="17"
      title="Luồng nguồn từ đầu đến cuối"
      description="Các tuyến first-touch → last-touch có đủ chuỗi điểm chạm."
      badge="Số lead"
    >
      <div className="space-y-4 pt-2">
        {attributionFlow.map((item) => (
          <div key={item.label} className="grid grid-cols-[minmax(140px,1fr)_minmax(0,1.4fr)_54px] items-center gap-3">
            <span className="truncate text-xs font-medium text-text-secondary">{item.label}</span>
            <div className="h-2 overflow-hidden rounded-full bg-background-gray-primary">
              <div className="h-full rounded-full bg-brand-500" style={{ width: `${maximum === 0 ? 0 : (item.value / maximum) * 100}%` }} />
            </div>
            <span className="text-right text-xs font-semibold text-text-primary">{formatDemoNumber(item.value)}</span>
          </div>
        ))}
      </div>
      <DemoNote>Chỉ hiển thị flow khi thứ tự touchpoint được ghi nhận đầy đủ.</DemoNote>
    </AcquisitionMapChartCard>
  );
}

export type { AcquisitionFirstVsLastSource, AcquisitionSourceCount };
