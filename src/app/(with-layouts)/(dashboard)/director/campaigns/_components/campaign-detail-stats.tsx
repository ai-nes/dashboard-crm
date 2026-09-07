import {
  CheckCircle1,
  ClockThree,
  LabelPercent1,
  UserMultiple1,
} from "@tailgrids/icons";

import type { LeadCampaignStats } from "@/services/api/lead-sale";

import type { CampaignLeadRow } from "./campaign-detail-leads";

const iconBackground = {
  primary: "bg-badge-primary-background text-badge-primary-text",
  sky: "bg-badge-sky-background text-badge-sky-text",
  success: "bg-badge-success-background text-badge-success-text",
  warning: "bg-badge-warning-background text-badge-warning-text",
} as const;

export default function CampaignDetailStats({
  leads,
  stats: campaignStats,
}: {
  leads: CampaignLeadRow[];
  stats?: LeadCampaignStats;
}) {
  const total = campaignStats?.total ?? leads.length;
  const inProgress =
    campaignStats?.inProgress ??
    leads.filter(
      (lead) => lead.status === "PROCESSED" || lead.status === "ASSIGNED",
    ).length;
  const converted =
    campaignStats?.closed ??
    leads.filter((lead) => lead.status === "CLOSED").length;
  const conversionRate =
    campaignStats?.conversionRate ??
    (total > 0 ? Math.round((converted / total) * 100) : 0);

  const statItems = [
    {
      label: "Tổng số lead",
      value: total,
      detail: "Từ chiến dịch này",
      icon: UserMultiple1,
      color: "primary" as const,
    },
    {
      label: "Đang chăm sóc",
      value: inProgress,
      detail: "Đang xử lý / đã phân công",
      icon: ClockThree,
      color: "sky" as const,
    },
    {
      label: "Đã đóng",
      value: converted,
      detail: "Đã hoàn tất xử lý",
      icon: CheckCircle1,
      color: "success" as const,
    },
    {
      label: "Tỷ lệ chuyển đổi",
      value: `${conversionRate}%`,
      detail: "Trên tổng số lead",
      icon: LabelPercent1,
      color: "warning" as const,
    },
  ];

  return (
    <section
      aria-label="Thống kê lead theo chiến dịch"
      className="grid divide-y divide-card-border rounded-xl border border-card-border bg-card-background sm:grid-cols-2 sm:divide-x sm:divide-y-0 xl:grid-cols-4"
    >
      {statItems.map((item) => {
        const Icon = item.icon;
        return (
          <div key={item.label} className="flex gap-3 p-4 lg:p-5">
            <span
              className={`flex size-10 shrink-0 items-center justify-center rounded-lg ${iconBackground[item.color]}`}
              aria-hidden="true"
            >
              <Icon size={19} />
            </span>
            <div className="min-w-0">
              <p className="text-sm text-text-tertiary">{item.label}</p>
              <p className="mt-1 text-xl leading-6 font-semibold tabular-nums text-text-primary">
                {item.value}
              </p>
              <p className="mt-1 text-xs leading-4 text-text-secondary">
                {item.detail}
              </p>
            </div>
          </div>
        );
      })}
    </section>
  );
}
