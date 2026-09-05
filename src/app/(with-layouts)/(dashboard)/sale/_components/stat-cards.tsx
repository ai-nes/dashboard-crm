import { CheckCircle1, FileTextMultiple, Message1, Target3, UserMultiple1 } from "@tailgrids/icons";

import { Card } from "@/components/tailgrids/core/card";

import type { SaleKpi } from "@/services/api/sale";

import { KPI_PRESENTATION, type SaleDashboardTone } from "./data";

const statIcons = {
  primary: UserMultiple1,
  sky: Message1,
  violet: Target3,
  warning: FileTextMultiple,
  success: CheckCircle1,
} as const;

const toneStyles: Record<SaleDashboardTone, { icon: string; value: string }> = {
  primary: { icon: "bg-primary-50 text-primary-500", value: "text-primary-600" },
  sky: { icon: "bg-badge-sky-background text-info-500", value: "text-info-500" },
  violet: { icon: "bg-badge-violet-background text-badge-violet-text", value: "text-badge-violet-text" },
  warning: { icon: "bg-badge-warning-background text-warning-500", value: "text-badge-warning-text" },
  success: { icon: "bg-badge-success-background text-success-500", value: "text-badge-success-text" },
};

interface StatCardProps {
  stat: SaleKpi;
}

function StatCard({ stat }: StatCardProps) {
  const presentation = KPI_PRESENTATION[stat.id];
  const Icon = statIcons[presentation.tone];
  const styles = toneStyles[presentation.tone];

  return (
    <Card className="relative min-w-0 overflow-hidden p-4 sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <div className={`flex size-10 shrink-0 items-center justify-center rounded-xl ${styles.icon}`}>
          <Icon size={20} aria-hidden="true" />
        </div>
        <span className="text-[11px] font-medium text-text-tertiary">Hôm nay</span>
      </div>
      <div className="mt-4">
        <p className="text-xs font-medium text-text-tertiary">{presentation.label}</p>
        <p className={`mt-1 text-[28px] leading-8 font-semibold tracking-[-0.6px] ${styles.value}`}>{stat.value}</p>
        <p className="mt-1 text-[11px] leading-4 text-text-secondary">{presentation.note}</p>
      </div>
    </Card>
  );
}

interface StatCardsProps {
  stats: SaleKpi[];
}

export default function StatCards({ stats }: StatCardsProps) {
  return (
    <section aria-label="Chỉ số pipeline của Sale" className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 xl:grid-cols-5">
      {stats.map((stat) => <StatCard key={stat.id} stat={stat} />)}
    </section>
  );
}
