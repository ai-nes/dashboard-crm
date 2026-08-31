import { ArrowRight, InfoCircle } from "@tailgrids/icons";
import Link from "next/link";

import { Badge } from "@/components/tailgrids/core/badge";
import { Card, CardHeader, CardTitle } from "@/components/tailgrids/core/card";
import { regionOpportunities } from "./data";
import { formatRate, safeRate } from "./chart-utils";
import type { DemographicSegment } from "./types";

export default function SegmentAnalysis({ segment }: { segment: DemographicSegment }) {
  const stages = [
    { label: "Tổng lead", value: segment.prospects },
    { label: "Đã tương tác", value: segment.engaged },
    { label: "Đủ điều kiện tư vấn", value: segment.qualified },
    { label: "Đã tư vấn", value: segment.counselling },
    { label: "Đã nộp hồ sơ", value: segment.applications },
    { label: "Đã nhập học", value: segment.enrolled },
  ].map((stage, index, allStages) => ({
    ...stage,
    conversion: index === 0 ? 100 : getTransitionRate(allStages[index - 1].value, stage.value),
  }));
  const isMonotonic = stages.every((stage, index) => index === 0 || stage.value <= stages[index - 1].value);

  return (
    <section className="grid min-w-0 gap-5 xl:grid-cols-[minmax(0,1.3fr)_minmax(340px,0.7fr)]">
      <Card className="min-w-0 overflow-hidden bg-background-gray-primary p-0">
        <CardHeader className="border-b border-card-border p-5"><div><CardTitle>Phễu từ lead đến nhập học</CardTitle><p className="mt-1 text-xs leading-5 text-text-tertiary">Tỷ lệ chuyển đổi giữa các bước của nhóm đang xem.</p></div><Badge color="primary">{segment.prospects.toLocaleString("vi-VN")} lead</Badge></CardHeader>
        <div className="p-5">
          {!isMonotonic ? (
            <div role="status" className="mb-4 rounded-xl border border-card-border bg-background-gray-primary px-3 py-2 text-xs leading-5 text-text-secondary">
              Số liệu các bước chưa giảm dần. Các tỷ lệ ở bước bất thường được hiển thị là — để tránh diễn giải sai phễu.
            </div>
          ) : null}
          <div className="mb-3 grid grid-cols-[100px_minmax(150px,1fr)_72px_62px] gap-3 text-[10px] font-semibold tracking-wide text-text-tertiary uppercase"><span>Bước</span><span>Tỷ lệ còn lại</span><span className="text-right">Số lead</span><span className="text-right">Tỷ lệ chuyển bước</span></div>
          <div className="space-y-3">{stages.map((stage, index) => { const width = getStageWidth(stage.value, segment.prospects); return <div key={stage.label} className="grid grid-cols-[100px_minmax(150px,1fr)_72px_62px] items-center gap-3"><span className="text-xs font-medium text-text-secondary">{stage.label}</span><div className="h-8 overflow-hidden rounded-lg bg-card-background"><div className={`flex h-full items-center rounded-lg px-2 ${index === 0 ? "bg-primary-200" : index === stages.length - 1 ? "bg-success-500" : "bg-brand-500"}`} style={{ width: `${width}%` }}><span className={`truncate text-[10px] font-semibold ${index === 0 ? "text-primary-text" : "text-white-100"}`}>{width >= 22 ? stage.label : ""}</span></div></div><strong className="text-right text-xs text-text-primary">{stage.value.toLocaleString("vi-VN")}</strong><span className={`text-right text-xs font-semibold ${index === stages.length - 1 ? "text-success-500" : "text-text-secondary"}`}>{formatRate(stage.conversion)}</span></div>; })}</div>
          <p className="mt-5 border-t border-card-border pt-4 text-xs leading-5 text-text-tertiary">Tỷ lệ được tính theo bước liền trước.</p>
        </div>
      </Card>
      <Card className="min-w-0 overflow-hidden bg-card-background p-0">
        <CardHeader className="border-b border-card-border p-5"><div><CardTitle>Địa bàn nên ưu tiên</CardTitle><p className="mt-1 text-xs leading-5 text-text-tertiary">Xếp theo quy mô, tăng trưởng và tỷ lệ nhập học.</p></div><InfoCircle size={17} className="text-text-tertiary" aria-label="Điểm ưu tiên theo địa bàn" /></CardHeader>
        <div className="p-3">{regionOpportunities.map((region) => <div key={region.name} className={`grid grid-cols-[24px_minmax(0,1fr)_88px_32px] items-center gap-3 rounded-xl px-3 py-3 ${region.name.includes(segment.region.split(" ")[0]) || region.selected ? "bg-background-gray-primary" : ""}`}><span className="text-xs font-semibold text-text-tertiary">{region.rank}</span><span className="truncate text-sm font-medium text-text-secondary">{region.name}</span><div className="h-2 overflow-hidden rounded-full bg-background-gray-secondary"><div className={region.selected ? "h-full rounded-full bg-brand-500" : "h-full rounded-full bg-success-500"} style={{ width: `${region.score}%` }} /></div><strong className="text-right text-xs text-text-primary">{region.score}</strong></div>)}</div>
        <div className="border-t border-card-border p-4"><Link href="/director/market-intelligence" className="flex items-center justify-between text-xs font-semibold text-brand-500 hover:text-brand-600">Xem bản đồ địa bàn<ArrowRight size={14} aria-hidden="true" /></Link></div>
      </Card>
    </section>
  );
}

function getTransitionRate(previous: number, current: number): number | null {
  if (current > previous) return null;
  return safeRate(current, previous);
}

function getStageWidth(value: number, total: number): number {
  if (value <= 0 || total <= 0) return 0;
  return Math.min(100, (value / total) * 100);
}
