"use client";

import { ArrowRight, InfoCircle } from "@tailgrids/icons";
import { useState } from "react";
import { CartesianGrid, Cell, ReferenceLine, Scatter, ScatterChart, Tooltip, XAxis, YAxis, ZAxis } from "recharts";

import { Badge } from "@/components/tailgrids/core/badge";
import { Button } from "@/components/tailgrids/core/button";
import { Card, CardHeader, CardTitle } from "@/components/tailgrids/core/card";
import { ChartContainer } from "@/components/tailgrids/core/chart";
import { demographicSegments } from "./data";
import OverviewTooltip from "./overview-tooltip";

const toneColors = { primary: "var(--brand-500)", info: "var(--info-500)", success: "var(--success-500)", warning: "var(--warning-500)", danger: "var(--error-500)" };

interface SegmentLandscapeChartProps {
  onOpenSegment: (segmentId: string) => void;
}

export default function SegmentLandscapeChart({ onOpenSegment }: SegmentLandscapeChartProps) {
  const [selectedId, setSelectedId] = useState(demographicSegments[0].id);
  const selected = demographicSegments.find((segment) => segment.id === selectedId) ?? demographicSegments[0];

  return (
    <Card className="min-w-0 overflow-hidden bg-background-gray-primary p-0">
      <CardHeader className="border-b border-card-border p-5"><div><CardTitle>Bản đồ phân khúc</CardTitle><p className="mt-1 text-xs leading-5 text-text-tertiary">Trục ngang là tăng trưởng, trục dọc là conversion; kích thước điểm thể hiện quy mô.</p></div><InfoCircle size={17} className="text-text-tertiary" aria-label="Giải thích bản đồ phân khúc" /></CardHeader>
      <div className="grid min-w-0 xl:grid-cols-[minmax(0,1.45fr)_minmax(260px,0.55fr)]">
        <div className="min-w-0 border-b border-card-border p-4 xl:border-r xl:border-b-0">
          <div className="h-80" aria-label="Biểu đồ phân bố các phân khúc người học">
            <ChartContainer className="h-full w-full" width="100%" height="100%" minWidth={0} minHeight={0}>
              <ScatterChart margin={{ top: 18, right: 18, left: -10, bottom: 12 }}>
                <CartesianGrid stroke="var(--border-color-base-100)" strokeDasharray="4 4" />
                <XAxis type="number" dataKey="growth" name="Tăng trưởng" unit="%" domain={[0, 35]} axisLine={false} tickLine={false} tick={{ fill: "var(--text-tertiary)", fontSize: 11 }} label={{ value: "Tăng trưởng MoM", position: "insideBottom", offset: -8, fill: "var(--text-tertiary)", fontSize: 11 }} />
                <YAxis type="number" dataKey="conversion" name="Conversion" unit="%" domain={[1, 3.2]} axisLine={false} tickLine={false} tick={{ fill: "var(--text-tertiary)", fontSize: 11 }} />
                <ZAxis type="number" dataKey="prospects" range={[100, 520]} />
                <ReferenceLine x={15} stroke="var(--text-tertiary)" strokeDasharray="4 4" />
                <ReferenceLine y={2} stroke="var(--text-tertiary)" strokeDasharray="4 4" />
                <Tooltip cursor={{ strokeDasharray: "3 3" }} content={<OverviewTooltip />} />
                <Scatter name="Phân khúc" data={demographicSegments} isAnimationActive={false}>{demographicSegments.map((segment) => <Cell key={segment.id} fill={toneColors[segment.tone]} fillOpacity={segment.id === selectedId ? 1 : 0.68} stroke={segment.id === selectedId ? "var(--card-background)" : "transparent"} strokeWidth={3} />)}</Scatter>
              </ScatterChart>
            </ChartContainer>
          </div>
          <div className="flex flex-wrap gap-2 px-1 pb-1">{demographicSegments.map((segment) => <Button key={segment.id} size="xs" appearance={segment.id === selectedId ? "fill" : "outline"} aria-pressed={segment.id === selectedId} onPress={() => setSelectedId(segment.id)}>{segment.shortName}</Button>)}</div>
        </div>
        <aside className="flex flex-col p-5" aria-live="polite">
          <div className="flex items-center justify-between gap-3"><p className="text-[10px] font-semibold tracking-[0.14em] text-text-tertiary uppercase">Phân khúc đang chọn</p><Badge color={selected.growth >= 20 ? "success" : "gray"}>+{selected.growth}% MoM</Badge></div>
          <h3 className="mt-3 text-base font-semibold leading-6 text-text-primary">{selected.name}</h3>
          <p className="mt-2 text-sm leading-6 text-text-secondary">{selected.description}</p>
          <div className="mt-5 grid grid-cols-2 gap-3"><Metric label="Quy mô" value={selected.prospects.toLocaleString("vi-VN")} /><Metric label="Conversion" value={`${selected.conversion}%`} /><Metric label="Cơ hội" value={`${selected.opportunityScore}/100`} /><Metric label="Độ phủ" value={`${selected.coverage}%`} /></div>
          <div className="mt-auto pt-5"><Button className="w-full" onPress={() => onOpenSegment(selected.id)}>Xem chi tiết phân khúc<ArrowRight size={15} aria-hidden="true" /></Button></div>
        </aside>
      </div>
    </Card>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return <div className="rounded-xl border border-card-border bg-card-background p-3"><p className="text-[11px] text-text-tertiary">{label}</p><p className="mt-1 text-lg font-semibold text-text-primary">{value}</p></div>;
}
