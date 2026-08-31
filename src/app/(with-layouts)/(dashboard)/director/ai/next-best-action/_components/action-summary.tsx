import { Calendar, ClockThree, InfoTriangle, Sparkle } from "@tailgrids/icons";

import { Card } from "@/components/tailgrids/core/card";

import { actionSlaSummary } from "./data";
import type { RecommendedAction } from "./types";

interface ActionSummaryProps {
  actions: RecommendedAction[];
}

const summaryStyles = {
  overdue: {
    icon: InfoTriangle,
    iconClassName: "bg-badge-error-background text-badge-error-text",
    valueClassName: "text-error-500",
  },
  today: {
    icon: Calendar,
    iconClassName: "bg-badge-warning-background text-badge-warning-text",
    valueClassName: "text-warning-500",
  },
  soon: {
    icon: ClockThree,
    iconClassName: "bg-badge-primary-background text-badge-primary-text",
    valueClassName: "text-primary-500",
  },
  onTime: {
    icon: Sparkle,
    iconClassName: "bg-background-soft-50 text-text-secondary",
    valueClassName: "text-text-primary",
  },
} as const;

export default function ActionSummary({ actions }: ActionSummaryProps) {
  const overdueCount = actions.filter((action) => action.status === "overdue").length;
  const todayCount = actions.filter((action) => action.status === "today").length;
  const soonCount = actions.filter((action) => action.status === "soon").length;

  const items = [
    { key: "overdue" as const, label: "Quá hạn", value: overdueCount, note: "Cần xử lý trước tiên" },
    { key: "today" as const, label: "Hôm nay", value: todayCount, note: "Hạn xử lý trong ngày" },
    { key: "soon" as const, label: "Sắp đến hạn", value: soonCount, note: "Hạn trong 1–2 ngày" },
    { key: "onTime" as const, label: "Xử lý đúng hạn", value: actionSlaSummary.onTimeRate, note: actionSlaSummary.detail },
  ];

  return (
    <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4" aria-label="Tóm tắt việc cần xử lý">
      {items.map((item) => {
        const style = summaryStyles[item.key];
        const Icon = style.icon;

        return (
          <Card key={item.key} className="flex items-center gap-3 p-4">
            <span className={`flex size-9 shrink-0 items-center justify-center rounded-lg ${style.iconClassName}`} aria-hidden="true">
              <Icon size={17} />
            </span>
            <div className="min-w-0">
              <p className="text-xs text-text-tertiary">{item.label}</p>
              <p className={`mt-0.5 text-2xl leading-7 font-semibold tabular-nums ${style.valueClassName}`}>{item.value}</p>
              <p className="mt-0.5 truncate text-xs text-text-secondary">{item.note}</p>
            </div>
          </Card>
        );
      })}
    </section>
  );
}
