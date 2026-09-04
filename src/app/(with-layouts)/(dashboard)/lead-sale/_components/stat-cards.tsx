import { ClockThree, FileTextMultiple, Message1, UserMultiple1, UserPencil } from "@tailgrids/icons";

import { Card } from "@/components/tailgrids/core/card";

import type { LeadSaleStat, LeadSaleTone } from "./data";

const statIcons = {
  primary: UserMultiple1,
  sky: Message1,
  violet: UserPencil,
  warning: ClockThree,
  error: ClockThree,
  success: FileTextMultiple,
} as const;

const toneStyles: Record<LeadSaleTone, { icon: string; value: string }> = {
  primary: { icon: "bg-primary-50 text-primary-500", value: "text-primary-600" },
  sky: { icon: "bg-badge-sky-background text-info-500", value: "text-info-500" },
  violet: { icon: "bg-badge-violet-background text-badge-violet-text", value: "text-badge-violet-text" },
  warning: { icon: "bg-badge-warning-background text-warning-500", value: "text-badge-warning-text" },
  error: { icon: "bg-badge-error-background text-badge-error-text", value: "text-badge-error-text" },
  success: { icon: "bg-badge-success-background text-badge-success-text", value: "text-badge-success-text" },
};

interface StatCardsProps {
  stats: LeadSaleStat[];
}

export default function StatCards({ stats }: StatCardsProps) {
  return (
    <section aria-label="Chỉ số tổng quan đội ngũ Sale" className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 xl:grid-cols-6">
      {stats.map((stat) => {
        const Icon = statIcons[stat.tone];
        const styles = toneStyles[stat.tone];

        return (
          <Card key={stat.id} className="min-w-0 p-4 sm:p-5">
            <div className="flex items-start justify-between gap-2">
              <div className={`flex size-9 shrink-0 items-center justify-center rounded-xl ${styles.icon}`}>
                <Icon size={18} aria-hidden="true" />
              </div>
              <span className="text-[10px] font-medium text-text-tertiary">Hôm nay</span>
            </div>
            <div className="mt-3">
              <p className="text-xs font-medium text-text-tertiary">{stat.label}</p>
              <p className={`mt-1 text-[26px] leading-8 font-semibold tracking-[-0.6px] ${styles.value}`}>{stat.value}</p>
              <p className="mt-1 text-[11px] leading-4 text-text-secondary">{stat.note}</p>
            </div>
          </Card>
        );
      })}
    </section>
  );
}
