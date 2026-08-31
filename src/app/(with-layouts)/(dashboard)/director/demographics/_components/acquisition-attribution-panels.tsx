"use client";

import { ArrowRight } from "@tailgrids/icons";
import { useState } from "react";

import { Button } from "@/components/tailgrids/core/button";
import AcquisitionMapChartCard, { DemoLegend, DemoNote, formatDemoNumber } from "./acquisition-map-chart-card";
import { attributionFlowDemo, firstTouchDemo, firstVsLastDemo, lastTouchDemo } from "./acquisition-map-demo";

export function AcquisitionAttributionPanels() {
  return (
    <div className="grid min-w-0 grid-cols-1 gap-5 xl:grid-cols-2">
      <TouchAttributionChart />
      <FirstVsLastChart />
      <AttributionFlowChart />
    </div>
  );
}

function TouchAttributionChart() {
  const [model, setModel] = useState<"first" | "last">("first");
  const data = model === "first" ? firstTouchDemo : lastTouchDemo;
  const max = Math.max(...data.map((item) => item.value));

  return (
    <AcquisitionMapChartCard
      chartId="14–15"
      title="Nguồn theo mô hình attribution"
      description="Một ranking có toggle First touch / Last touch để tránh lặp hai biểu đồ giống nhau."
      badge={model === "first" ? "First-touch" : "Last-touch"}
    >
      <div className="mb-5 flex gap-2">
        <Button size="xs" appearance={model === "first" ? "fill" : "outline"} onPress={() => setModel("first")} aria-pressed={model === "first"}>
          First touch
        </Button>
        <Button size="xs" appearance={model === "last" ? "fill" : "outline"} onPress={() => setModel("last")} aria-pressed={model === "last"}>
          Last touch
        </Button>
      </div>
      <div className="space-y-4">
        {data.map((item, index) => (
          <div key={item.source} className="grid grid-cols-[28px_72px_minmax(0,1fr)_56px] items-center gap-3">
            <span className="text-xs font-semibold text-text-tertiary">{index + 1}</span>
            <span className="text-xs text-text-secondary">{item.source}</span>
            <div className="h-2 overflow-hidden rounded-full bg-background-gray-primary">
              <div className="h-full rounded-full bg-brand-500" style={{ width: `${(item.value / max) * 100}%` }} />
            </div>
            <span className="text-right text-xs font-semibold text-text-primary">{formatDemoNumber(item.value)}</span>
          </div>
        ))}
      </div>
      <DemoNote>Hai model phải dùng cùng một lead set. Không trộn first-touch với interaction count.</DemoNote>
    </AcquisitionMapChartCard>
  );
}

function FirstVsLastChart() {
  const max = Math.max(...firstVsLastDemo.flatMap((item) => [item.first, item.last]));

  return (
    <AcquisitionMapChartCard
      chartId="16"
      title="First touch và last touch"
      description="Dumbbell cho thấy source nào được mở đầu và source nào thường chạm cuối trước handoff."
      badge="Cùng lead set"
    >
      <div className="space-y-5 pt-2">
        {firstVsLastDemo.map((item) => {
          const left = Math.min(item.first, item.last) / max * 100;
          const width = Math.abs(item.first - item.last) / max * 100;
          return (
            <div key={item.source}>
              <div className="mb-1.5 flex items-center justify-between gap-3 text-xs">
                <span className="text-text-secondary">{item.source}</span>
                <span className="text-text-tertiary">{formatDemoNumber(item.first)} → {formatDemoNumber(item.last)}</span>
              </div>
              <div className="relative h-5">
                <div className="absolute top-1/2 h-1 w-full -translate-y-1/2 rounded-full bg-background-gray-primary" />
                <div className="absolute top-1/2 h-1 -translate-y-1/2 rounded-full bg-primary-200" style={{ left: `${left}%`, width: `${Math.max(width, 0.8)}%` }} />
                <span className="absolute top-1/2 size-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand-500" style={{ left: `${(item.first / max) * 100}%` }} />
                <span className="absolute top-1/2 size-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-info-500" style={{ left: `${(item.last / max) * 100}%` }} />
              </div>
            </div>
          );
        })}
      </div>
      <DemoLegend items={[{ label: "First touch", color: "bg-brand-500" }, { label: "Last touch", color: "bg-info-500" }]} />
    </AcquisitionMapChartCard>
  );
}

function AttributionFlowChart() {
  return (
    <AcquisitionMapChartCard
      chartId="17"
      title="Luồng chạm trước handoff"
      description="Alluvial rút gọn để đọc các đường đi nổi bật; chỉ dùng khi touchpoint sequence đã đầy đủ."
      badge="Touchpoint flow"
    >
      <div className="space-y-3">
        {attributionFlowDemo.map((item, index) => (
          <div key={item.label} className="flex items-center gap-2 rounded-lg bg-background-gray-primary px-3 py-3">
            <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-brand-100 text-xs font-semibold text-primary-700">{index + 1}</span>
            <span className="min-w-0 flex-1 truncate text-xs font-medium text-text-secondary">{item.label}</span>
            <ArrowRight size={15} className="shrink-0 text-text-tertiary" aria-hidden="true" />
            <span className="shrink-0 text-xs font-semibold text-text-primary">{formatDemoNumber(item.value)}</span>
          </div>
        ))}
      </div>
      <DemoNote>Đây là dạng flow tối giản ở mockup; bản production có thể thay bằng Sankey khi API trả đủ sequence và link weight.</DemoNote>
    </AcquisitionMapChartCard>
  );
}
