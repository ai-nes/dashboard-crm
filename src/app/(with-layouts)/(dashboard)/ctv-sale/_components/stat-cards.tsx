import { ArrowUpward, CheckCircle1, ClockThree, UserMultiple1 } from "@tailgrids/icons";

import { Card } from "@/components/tailgrids/core/card";

import type { DashboardStat, DashboardTone } from "./data";

const statIcons = {
  primary: UserMultiple1,
  warning: ClockThree,
  info: ClockThree,
  success: CheckCircle1,
} as const;

const toneStyles: Record<DashboardTone, { icon: string; value: string; trend: string }> = {
  primary: {
    icon: "bg-primary-50 text-primary-500",
    value: "text-primary-600",
    trend: "text-primary-600",
  },
  warning: {
    icon: "bg-badge-warning-background text-warning-500",
    value: "text-warning-600",
    trend: "text-warning-600",
  },
  info: {
    icon: "bg-badge-sky-background text-info-500",
    value: "text-info-600",
    trend: "text-info-600",
  },
  success: {
    icon: "bg-badge-success-background text-success-500",
    value: "text-success-600",
    trend: "text-success-600",
  },
};

interface StatCardProps {
  stat: DashboardStat;
}

function StatCard({ stat }: StatCardProps) {
  const Icon = statIcons[stat.tone];
  const styles = toneStyles[stat.tone];

  return (
    <Card className="group flex h-fit min-w-0 flex-col justify-start gap-4 p-4 transition duration-200 hover:-translate-y-0.5 hover:shadow-md sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <div className={`flex size-10 shrink-0 items-center justify-center rounded-xl ${styles.icon}`}>
          <Icon size={20} aria-hidden="true" />
        </div>
        {stat.trend ? (
          <span className={`inline-flex items-center gap-1 text-[11px] font-medium ${styles.trend}`}>
            <ArrowUpward size={12} aria-hidden="true" />
            {stat.trend}
          </span>
        ) : null}
      </div>
      <div>
        <p className="text-xs font-medium text-text-tertiary">{stat.label}</p>
        <p className={`mt-1 text-[28px] leading-8 font-semibold tracking-[-0.6px] ${styles.value}`}>
          {stat.value}
        </p>
        <p className="mt-1 text-[11px] leading-4 text-text-secondary">{stat.note}</p>
      </div>
    </Card>
  );
}

interface StatCardsProps {
  stats: DashboardStat[];
}

export default function StatCards({ stats }: StatCardsProps) {
  return (
    <section aria-label="Chỉ số công việc" className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
      {stats.map((stat) => (
        <StatCard key={stat.id} stat={stat} />
      ))}
    </section>
  );
}
