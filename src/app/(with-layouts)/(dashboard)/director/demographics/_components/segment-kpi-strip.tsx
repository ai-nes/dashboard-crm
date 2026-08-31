import { ArrowDownward, ArrowUpward } from "@tailgrids/icons";

import type { DemographicSegment } from "./types";
import { formatGrowth } from "./chart-utils";

export default function SegmentKpiStrip({ segment }: { segment: DemographicSegment }) {
  const tuitionDisplay = segment.tuition != null ? `${segment.tuition.toLocaleString("vi-VN")} tr` : "-";
  const revenueDisplay = segment.revenue != null ? `${segment.revenue.toLocaleString("vi-VN")} tỷ` : "-";
  const growthDisplay = formatGrowth(segment.growth);

  const items = [
    {
      label: "Tổng lead",
      value: segment.prospects != null ? segment.prospects.toLocaleString("vi-VN") : "-",
      helper: segment.prospects != null ? `${((segment.prospects / 57840) * 100).toLocaleString("vi-VN", { maximumFractionDigits: 1 })}% tổng lead` : "-",
      tone: "bg-brand-500",
    },
    {
      label: "Tỷ lệ nhập học",
      value: segment.conversion != null ? `${segment.conversion}%` : "-",
      helper: "Mặt bằng chung: 6,54%",
      tone: "bg-info-500",
    },
    {
      label: "Học phí ròng trung bình",
      value: tuitionDisplay,
      helper: "Trên mỗi học sinh nhập học",
      tone: "bg-success-500",
    },
    {
      label: "Doanh thu ghi nhận",
      value: revenueDisplay,
      helper: "Từ nhóm này",
      tone: "bg-warning-500",
    },
    {
      label: "Tăng trưởng tháng",
      value: growthDisplay,
      helper: "So với tháng trước",
      tone: "bg-error-500",
    },
  ];

  return (
    <section aria-label="Chỉ số phân khúc" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
      {items.map((item, index) => (
        <article key={item.label} className="rounded-2xl border border-card-border/70 bg-card-background p-5">
          <div className="flex items-center justify-between gap-3">
            <p className="text-xs font-medium text-text-tertiary">{item.label}</p>
            <span className={`size-2 rounded-full ${item.tone}`} />
          </div>
          <p className="mt-4 text-2xl font-semibold tracking-[-0.6px] text-text-primary">{item.value}</p>
          <p
            className={`mt-2 flex items-center gap-1 text-xs ${
              index === 4 && segment.growth != null
                ? `font-semibold ${segment.growth >= 0 ? "text-success-500" : "text-error-500"}`
                : "text-text-tertiary"
            }`}
          >
            {index === 4 && segment.growth != null ? (
              segment.growth >= 0 ? <ArrowUpward size={13} aria-hidden="true" /> : <ArrowDownward size={13} aria-hidden="true" />
            ) : null}
            {item.helper}
          </p>
        </article>
      ))}
    </section>
  );
}
