import { ArrowUpward } from "@tailgrids/icons";

import type { DemographicSegment } from "./types";

export default function SegmentKpiStrip({ segment }: { segment: DemographicSegment }) {
  const items = [
    { label: "Hồ sơ phù hợp", value: segment.prospects.toLocaleString("vi-VN"), helper: `${((segment.prospects / 57840) * 100).toFixed(1)}% tổng hồ sơ`, tone: "bg-brand-500" },
    { label: "Tỷ lệ nhập học", value: `${segment.conversion}%`, helper: "Mặt bằng chung: 6,54%", tone: "bg-info-500" },
    { label: "Học phí ròng trung bình", value: `${segment.tuition.toLocaleString("vi-VN")} tr`, helper: "Trên mỗi học sinh nhập học", tone: "bg-success-500" },
    { label: "Doanh thu ghi nhận", value: `${segment.revenue.toLocaleString("vi-VN")} tỷ`, helper: "Từ nhóm này", tone: "bg-warning-500" },
    { label: "Tăng trưởng tháng", value: `+${segment.growth}%`, helper: "So với tháng trước", tone: "bg-error-500" },
  ];

  return <section aria-label="Chỉ số phân khúc" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">{items.map((item, index) => <article key={item.label} className="rounded-2xl border border-card-border/70 bg-card-background p-5"><div className="flex items-center justify-between gap-3"><p className="text-xs font-medium text-text-tertiary">{item.label}</p><span className={`size-2 rounded-full ${item.tone}`} /></div><p className="mt-4 text-2xl font-semibold tracking-[-0.6px] text-text-primary">{item.value}</p><p className={`mt-2 flex items-center gap-1 text-xs ${index === 4 ? "font-semibold text-success-500" : "text-text-tertiary"}`}>{index === 4 ? <ArrowUpward size={13} aria-hidden="true" /> : null}{item.helper}</p></article>)}</section>;
}
