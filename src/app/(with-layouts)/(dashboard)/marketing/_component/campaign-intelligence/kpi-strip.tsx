import type { CampaignIntelligenceResponse } from "@/services/api/campaign-intelligence";
import { formatCompactCurrency, formatNumber } from "./formatters";

export function KpiStrip({
  summary,
}: Pick<CampaignIntelligenceResponse, "summary">) {
  const items = [
    {
      label: "Chi phí",
      value: formatCompactCurrency(summary.spend),
    },
    {
      label: "Lead đủ điều kiện",
      value: formatNumber(summary.qualifiedLeads),
    },
    {
      label: "Hồ sơ",
      value: formatNumber(summary.applications),
    },
    {
      label: "Nhập học",
      value: formatNumber(summary.enrollments),
    },
    {
      label: "Doanh thu",
      value: formatCompactCurrency(summary.confirmedRevenue),
    },
    { label: "ROAS", value: `${summary.roas.toFixed(2)}x` },
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
          <p className="mt-1.5 truncate text-xl font-bold tracking-tight tabular-nums text-text-primary">
            {item.value}
          </p>
        </div>
      ))}
    </section>
  );
}
