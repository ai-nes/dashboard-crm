import { CalendarTime, CheckCircle1, ClockThree, Layers2 } from "@tailgrids/icons";

import type { CampaignListItem } from "./types";

const iconBackground = {
  primary: "bg-badge-primary-background text-badge-primary-text",
  success: "bg-badge-success-background text-badge-success-text",
  sky: "bg-badge-sky-background text-badge-sky-text",
  warning: "bg-badge-warning-background text-badge-warning-text",
} as const;

export default function CampaignStats({ campaigns }: { campaigns: CampaignListItem[] }) {
  const total = campaigns.length;
  const active = campaigns.filter((item) => item.status === "ACTIVE").length;
  const upcoming = campaigns.filter((item) => item.status === "UPCOMING").length;
  const closed = campaigns.filter((item) => item.status === "CLOSED").length;

  const stats = [
    { label: "Tổng số chiến dịch", value: total, detail: "Tất cả các kỳ tuyển sinh", icon: Layers2, color: "primary" as const },
    { label: "Đang diễn ra", value: active, detail: "Đang mở tiếp nhận hồ sơ", icon: CheckCircle1, color: "success" as const },
    { label: "Sắp diễn ra", value: upcoming, detail: "Đã lên lịch, chưa mở", icon: ClockThree, color: "sky" as const },
    { label: "Đã đóng", value: closed, detail: "Đã kết thúc kỳ tuyển sinh", icon: CalendarTime, color: "warning" as const },
  ];

  return (
    <section
      aria-label="Tổng quan chiến dịch tuyển sinh"
      className="grid divide-y divide-card-border rounded-xl border border-card-border bg-card-background sm:grid-cols-2 sm:divide-x sm:divide-y-0 xl:grid-cols-4"
    >
      {stats.map((item) => {
        const Icon = item.icon;
        return (
          <div key={item.label} className="flex gap-3 p-4 lg:p-5">
            <span className={`flex size-10 shrink-0 items-center justify-center rounded-lg ${iconBackground[item.color]}`} aria-hidden="true">
              <Icon size={19} />
            </span>
            <div className="min-w-0">
              <p className="text-sm text-text-tertiary">{item.label}</p>
              <p className="mt-1 text-xl leading-6 font-semibold tabular-nums text-text-primary">{item.value}</p>
              <p className="mt-1 text-xs leading-4 text-text-secondary">{item.detail}</p>
            </div>
          </div>
        );
      })}
    </section>
  );
}
