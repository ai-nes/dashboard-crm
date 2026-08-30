"use client";

import { CheckCircle1, Target3 } from "@tailgrids/icons";
import { CartesianGrid, ReferenceLine, Scatter, ScatterChart, Tooltip, XAxis, YAxis, ZAxis } from "recharts";

import { Badge } from "@/components/tailgrids/core/badge";
import { Card, CardHeader, CardTitle } from "@/components/tailgrids/core/card";
import { ChartContainer } from "@/components/tailgrids/core/chart";
import type { SchoolIntelligenceData, SchoolQuadrantPoint } from "@/services/api/schools/types";

interface SchoolPotentialBreakdownProps {
  data: SchoolIntelligenceData;
}

const QUADRANT_META = [
  { label: "Mở rộng", hint: "Tiềm năng cao · quan hệ còn mỏng", className: "bg-badge-primary-background text-badge-primary-text" },
  { label: "Trọng điểm", hint: "Tiềm năng cao · quan hệ tốt", className: "bg-badge-success-background text-badge-success-text" },
  { label: "Sàng lọc", hint: "Tiềm năng vừa · quan hệ còn mỏng", className: "bg-badge-neutral-background text-badge-neutral-text" },
  { label: "Duy trì", hint: "Tiềm năng vừa · quan hệ tốt", className: "bg-badge-warning-background text-badge-warning-text" },
];

export default function SchoolPotentialBreakdown({ data }: SchoolPotentialBreakdownProps) {
  const current = data.quadrantPeers.find((point) => point.isCurrent);
  const peers = data.quadrantPeers.filter((point) => !point.isCurrent);

  return (
    <Card className="min-w-0 overflow-hidden p-0">
      <CardHeader className="border-b border-card-border p-5 pb-4 lg:p-6 lg:pb-4">
        <div className="flex min-w-0 items-start gap-3">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-badge-primary-background text-badge-primary-text" aria-hidden="true"><Target3 size={18} /></span>
          <div className="min-w-0">
            <CardTitle>Bản đồ cơ hội trường</CardTitle>
            <p className="mt-1 text-xs leading-5 text-text-tertiary">Đặt trường vào tương quan các trường trong cùng cụm địa bàn.</p>
          </div>
        </div>
        <Badge color="primary">Tiềm năng × quan hệ</Badge>
      </CardHeader>

      <div className="p-5 lg:p-6">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2 text-xs text-text-tertiary">
          <span>Trục dọc: tiềm năng</span>
          <span>Trục ngang: quan hệ · kích thước: nhập học</span>
        </div>

        <div className="relative h-72 min-h-72 w-full sm:h-80 sm:min-h-80">
          <div className="pointer-events-none absolute inset-2 grid grid-cols-2 grid-rows-2 overflow-hidden rounded-xl text-[10px] font-medium sm:inset-3 sm:text-xs">
            <div className="flex items-start rounded-tl-xl bg-badge-primary-background/35 p-2 text-badge-primary-text">Mở rộng</div>
            <div className="flex items-start justify-end rounded-tr-xl bg-badge-success-background/35 p-2 text-badge-success-text">Trọng điểm</div>
            <div className="flex items-end rounded-bl-xl bg-badge-neutral-background/35 p-2 text-text-tertiary">Sàng lọc</div>
            <div className="flex items-end justify-end rounded-br-xl bg-badge-warning-background/35 p-2 text-badge-warning-text">Duy trì</div>
          </div>
          <ChartContainer width="100%" height="100%" minWidth={0} minHeight={0}>
            <ScatterChart margin={{ top: 10, right: 10, bottom: 12, left: -10 }}>
              <CartesianGrid stroke="var(--border-color-base-100)" strokeDasharray="4 4" />
              <XAxis dataKey="relationship" type="number" domain={[0, 100]} ticks={[0, 25, 50, 75, 100]} axisLine={false} tickLine={false} tick={{ fill: "var(--text-tertiary)", fontSize: 11 }} tickFormatter={(value) => String(value)} label={{ value: "Quan hệ", position: "insideBottom", offset: -8, fill: "var(--text-tertiary)", fontSize: 11 }} />
              <YAxis dataKey="potential" type="number" domain={[55, 100]} ticks={[60, 70, 80, 90, 100]} axisLine={false} tickLine={false} tick={{ fill: "var(--text-tertiary)", fontSize: 11 }} tickFormatter={(value) => String(value)} />
              <ZAxis dataKey="availableStudents" range={[100, 560]} />
              <ReferenceLine x={58} stroke="var(--text-tertiary)" strokeDasharray="4 4" />
              <ReferenceLine y={82} stroke="var(--text-tertiary)" strokeDasharray="4 4" />
              <Tooltip cursor={false} content={<QuadrantTooltip />} />
              <Scatter name="Trường trong cụm" data={peers} fill="var(--primary-300)" fillOpacity={0.8} />
              {current && <Scatter name="Trường đang xem" data={[current]} fill="var(--primary-500)" stroke="var(--card-background)" strokeWidth={3} />}
            </ScatterChart>
          </ChartContainer>
        </div>

        <div className="mt-4 grid gap-2 sm:grid-cols-2">
          {QUADRANT_META.map((item) => <div key={item.label} className={"rounded-lg px-3 py-2 " + item.className}><p className="text-xs font-semibold">{item.label}</p><p className="mt-0.5 text-[11px] opacity-80">{item.hint}</p></div>)}
        </div>

        <p className="mt-4 flex items-start gap-1.5 border-t border-card-border pt-4 text-xs leading-5 text-text-secondary">
          <CheckCircle1 size={14} className="mt-0.5 shrink-0 text-success-500" />
          Trường đang xem: <strong className="font-semibold text-text-primary">{data.classification.group}</strong> · đường chia là trung vị cụm · {data.availableStudents.toLocaleString("vi-VN")} học sinh khả dụng làm mẫu số ưu tiên.
        </p>
      </div>
    </Card>
  );
}

function QuadrantTooltip({ active, payload }: { active?: boolean; payload?: { payload?: SchoolQuadrantPoint }[] }) {
  const item = payload?.[0]?.payload;
  if (!active || !item) return null;

  return (
    <div className="rounded-xl border border-card-border bg-card-background p-3 text-xs shadow-theme-md">
      <p className="max-w-48 font-semibold text-text-primary">{item.name}</p>
      <p className="mt-2 text-text-secondary">Tiềm năng: <strong className="text-text-primary">{item.potential}/100</strong></p>
      <p className="mt-1 text-text-secondary">Quan hệ: <strong className="text-text-primary">{item.relationship}/100</strong></p>
      <p className="mt-1 text-text-secondary">Khả dụng: <strong className="text-text-primary">{item.availableStudents.toLocaleString("vi-VN")}</strong></p>
    </div>
  );
}
