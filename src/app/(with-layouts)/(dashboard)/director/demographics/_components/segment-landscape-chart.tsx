"use client";

import { ArrowRight, InfoCircle } from "@tailgrids/icons";
import { useState } from "react";
import { Bar, BarChart, CartesianGrid, Cell, LabelList, Tooltip, XAxis, YAxis } from "recharts";

import { Badge } from "@/components/tailgrids/core/badge";
import { Button } from "@/components/tailgrids/core/button";
import { Card, CardHeader, CardTitle } from "@/components/tailgrids/core/card";
import { ChartContainer } from "@/components/tailgrids/core/chart";
import { demographicSegments } from "./data";
import OverviewTooltip from "./overview-tooltip";

const rankedSegments = [...demographicSegments].sort((first, second) => second.opportunityScore - first.opportunityScore);

function priorityColor(score: number, isSelected: boolean) {
  if (isSelected) return "var(--brand-500)";
  if (score >= 85) return "var(--success-500)";
  if (score >= 70) return "var(--info-500)";
  return "var(--warning-500)";
}

interface SegmentLandscapeChartProps {
  onOpenSegment: (segmentId: string) => void;
}

export default function SegmentLandscapeChart({ onOpenSegment }: SegmentLandscapeChartProps) {
  const [selectedId, setSelectedId] = useState(demographicSegments[0].id);
  const selected = demographicSegments.find((segment) => segment.id === selectedId) ?? demographicSegments[0];

  return (
    <Card className="min-w-0 overflow-hidden bg-background-gray-primary p-0">
      <CardHeader className="border-b border-card-border p-5"><div><CardTitle>Mức độ ưu tiên của từng nhóm</CardTitle><p className="mt-1 text-xs leading-5 text-text-tertiary">Ưu tiên dựa trên quy mô, tỷ lệ nhập học và tăng trưởng.</p></div><InfoCircle size={17} className="text-text-tertiary" aria-label="Giải thích biểu đồ ưu tiên" /></CardHeader>
      <div className="grid min-w-0 xl:grid-cols-[minmax(0,1.45fr)_minmax(260px,0.55fr)]">
        <div className="min-w-0 border-b border-card-border p-4 xl:border-r xl:border-b-0">
          <div className="h-80" aria-label="Xếp hạng các nhóm học sinh theo mức ưu tiên">
            <ChartContainer className="h-full w-full" width="100%" height="100%" minWidth={0} minHeight={0}>
              <BarChart data={rankedSegments} layout="vertical" margin={{ top: 10, right: 34, left: 8, bottom: 8 }}>
                <CartesianGrid horizontal={false} stroke="var(--border-color-base-100)" strokeDasharray="4 4" />
                <XAxis type="number" dataKey="opportunityScore" name="Mức ưu tiên" domain={[0, 100]} ticks={[0, 25, 50, 75, 100]} axisLine={false} tickLine={false} tick={{ fill: "var(--text-tertiary)", fontSize: 11 }} tickFormatter={(value) => `${value}`} />
                <YAxis type="category" dataKey="shortName" width={126} axisLine={false} tickLine={false} tick={{ fill: "var(--text-secondary)", fontSize: 11 }} />
                <Tooltip cursor={{ fill: "var(--background-gray-primary)" }} content={<OverviewTooltip />} />
                <Bar dataKey="opportunityScore" name="Mức ưu tiên" radius={[0, 6, 6, 0]} maxBarSize={28} isAnimationActive={false}>
                  {rankedSegments.map((segment) => <Cell key={segment.id} fill={priorityColor(segment.opportunityScore, segment.id === selectedId)} stroke={segment.id === selectedId ? "var(--text-primary)" : "transparent"} strokeWidth={segment.id === selectedId ? 2 : 0} />)}
                  <LabelList dataKey="opportunityScore" position="right" fill="var(--text-secondary)" fontSize={11} />
                </Bar>
              </BarChart>
            </ChartContainer>
          </div>
          <div className="mb-3 flex flex-wrap items-center gap-x-4 gap-y-2 px-1 text-[11px] text-text-tertiary"><span className="inline-flex items-center gap-1.5"><span className="size-2 rounded-full bg-success-500" />Ưu tiên cao</span><span className="inline-flex items-center gap-1.5"><span className="size-2 rounded-full bg-info-500" />Theo dõi</span><span className="inline-flex items-center gap-1.5"><span className="size-2 rounded-full bg-warning-500" />Ưu tiên thấp</span></div>
          <div className="flex flex-wrap gap-2 px-1 pb-1">{demographicSegments.map((segment) => <Button key={segment.id} size="xs" appearance={segment.id === selectedId ? "fill" : "outline"} aria-pressed={segment.id === selectedId} onPress={() => setSelectedId(segment.id)}>{segment.shortName}</Button>)}</div>
        </div>
        <aside className="flex flex-col p-5" aria-live="polite">
          <div className="flex items-center justify-between gap-3"><p className="text-[10px] font-semibold tracking-[0.14em] text-text-tertiary uppercase">Nhóm đang xem</p><Badge color={selected.growth >= 20 ? "success" : "gray"}>+{selected.growth}% tháng</Badge></div>
          <h3 className="mt-3 text-base font-semibold leading-6 text-text-primary">{selected.name}</h3>
          <p className="mt-2 text-sm leading-6 text-text-secondary">{selected.description}</p>
          <div className="mt-5 grid grid-cols-2 gap-3"><Metric label="Số học sinh" value={selected.prospects.toLocaleString("vi-VN")} /><Metric label="Tỷ lệ nhập học" value={`${selected.conversion}%`} /><Metric label="Mức ưu tiên" value={`${selected.opportunityScore}/100`} /><Metric label="Được tiếp cận" value={`${selected.coverage}%`} /></div>
          <div className="mt-auto pt-5"><Button className="w-full" onPress={() => onOpenSegment(selected.id)}>Xem nhóm này<ArrowRight size={15} aria-hidden="true" /></Button></div>
        </aside>
      </div>
    </Card>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return <div className="rounded-xl border border-card-border bg-card-background p-3"><p className="text-[11px] text-text-tertiary">{label}</p><p className="mt-1 text-lg font-semibold text-text-primary">{value}</p></div>;
}
