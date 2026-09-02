import { ArrowUpward } from "@tailgrids/icons";
import type { CampaignIntelligenceResponse } from "@/services/api/campaign-intelligence";
import { formatCompactCurrency, formatNumber } from "./formatters";

export function KpiStrip({
  summary,
}: Pick<CampaignIntelligenceResponse, "summary">) {
  const items = [
    {
      label: "Ngân sách",
      value: formatCompactCurrency(summary.spend),
      change: "+5,7%",
    },
    {
      label: "Người quan tâm đủ điều kiện",
      value: formatNumber(summary.qualifiedLeads),
      change: "+12,7%",
    },
    {
      label: "Hồ sơ",
      value: formatNumber(summary.applications),
      change: "+10,3%",
    },
    {
      label: "Nhập học",
      value: formatNumber(summary.enrollments),
      change: "+8,3%",
    },
    {
      label: "Doanh thu xác nhận",
      value: formatCompactCurrency(summary.confirmedRevenue),
      change: "+15,6%",
    },
    { label: "ROAS", value: `${summary.roas.toFixed(2)}x`, change: "+26,7%" },
  ];

  return (
    <section
      aria-label="Tổng quan hiệu quả"
      className="grid grid-cols-2 divide-x divide-y divide-card-border overflow-hidden rounded-xl border border-card-border bg-card-background sm:grid-cols-3 xl:grid-cols-6 xl:divide-y-0"
    >
      {items.map((item) => (
        <div
          key={item.label}
          className="min-w-0 p-4 transition-colors hover:bg-background-soft-50/40"
        >
          <p className="truncate text-xs font-medium text-text-tertiary">
            {item.label}
          </p>
          <p className="mt-1 truncate text-lg font-bold tracking-tight tabular-nums text-text-primary">
            {item.value}
          </p>
          <div className="mt-1.5 flex items-center gap-1 text-xs font-semibold text-success-500">
            <ArrowUpward size={13} className="shrink-0" />
            <span className="tabular-nums">{item.change}</span>
            <span className="truncate font-normal text-text-tertiary">
              kỳ trước
            </span>
          </div>
        </div>
      ))}
    </section>
  );
}
