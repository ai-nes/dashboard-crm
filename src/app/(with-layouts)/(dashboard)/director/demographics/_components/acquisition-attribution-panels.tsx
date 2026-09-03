"use client";

import { Bar, BarChart, CartesianGrid, Tooltip, XAxis, YAxis } from "recharts";

import { ChartContainer } from "@/components/tailgrids/core/chart";
import AcquisitionMapChartCard, { DemoLegend, DemoNote } from "./acquisition-map-chart-card";
import { useAcquisitionMapData } from "./acquisition-map-context";
import OverviewTooltip from "./overview-tooltip";

export function AcquisitionAttributionPanels() {
  return <FirstVsLastSourceChart />;
}
function FirstVsLastSourceChart() {
  const { firstVsLastSource } = useAcquisitionMapData();

  return (
    <AcquisitionMapChartCard
      chartId="16"
      title="Nguồn tạo quan tâm và tương tác cuối"
      description="Đối chiếu nguồn học sinh biết đến trường đầu tiên với nguồn tương tác cuối cùng."
      badge="Số học sinh"
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
            <Bar dataKey="first" name="Nguồn đầu tiên" fill="var(--primary-300)" radius={[5, 5, 0, 0]} barSize={18} />
            <Bar dataKey="last" name="Nguồn tương tác cuối" fill="var(--brand-500)" radius={[5, 5, 0, 0]} barSize={18} />
          </BarChart>
        </ChartContainer>
      </div>
      <DemoLegend items={[{ label: "Nguồn đầu tiên", color: "bg-primary-300" }, { label: "Nguồn tương tác cuối", color: "bg-brand-500" }]} />
      <DemoNote>Chênh lệch chỉ có ý nghĩa khi hai cách phân bổ dùng cùng tập học sinh và cùng thời điểm chốt dữ liệu.</DemoNote>
    </AcquisitionMapChartCard>
  );
}
