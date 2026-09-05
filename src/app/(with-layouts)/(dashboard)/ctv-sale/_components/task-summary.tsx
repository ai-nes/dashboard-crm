import {
  ArrowRight,
  CalendarTime,
  ClockThree,
  CheckCircle1,
} from "@tailgrids/icons";
import Link from "next/link";

import { Card, CardHeader, CardTitle } from "@/components/tailgrids/core/card";
import type { CtvSaleTasks } from "@/services/api/ctv-sale";

interface TaskSummaryProps {
  summary: CtvSaleTasks["summary"];
}

const summaryIcons = {
  today: CheckCircle1,
  overdue: ClockThree,
  upcoming: CalendarTime,
} as const;

const summaryStyles = {
  today: {
    icon: "bg-badge-success-background text-success-500",
    value: "text-success-600",
  },
  overdue: {
    icon: "bg-badge-warning-background text-warning-500",
    value: "text-warning-600",
  },
  upcoming: {
    icon: "bg-badge-sky-background text-info-500",
    value: "text-info-600",
  },
} as const;

export default function TaskSummary({ summary }: TaskSummaryProps) {
  const items = [
    {
      id: "today",
      label: "Hôm nay",
      value: summary.today.total,
      note: "việc cần làm",
    },
    {
      id: "overdue",
      label: "Quá hạn",
      value: summary.overdue.count,
      note: "cần xử lý ngay",
    },
    {
      id: "upcoming",
      label: "Sắp tới",
      value: summary.upcoming.count,
      note: `trong ${summary.upcoming.horizonDays} ngày`,
    },
  ] as const;

  return (
    <Card className="flex min-w-0 flex-col p-5 sm:p-6">
      <CardHeader className="items-start">
        <div>
          <CardTitle>Tiến độ công việc</CardTitle>
          <p className="mt-1 text-xs leading-5 text-text-tertiary">
            Tình hình task cá nhân trong ngày.
          </p>
        </div>
        <span className="rounded-full bg-primary-50 px-2.5 py-1 text-[11px] font-semibold text-primary-600">
          Hôm nay
        </span>
      </CardHeader>

      <div className="mt-6 space-y-4">
        {items.map((item) => {
          const Icon = summaryIcons[item.id as keyof typeof summaryIcons];
          const styles = summaryStyles[item.id as keyof typeof summaryStyles];

          return (
            <div key={item.id} className="flex items-center gap-3">
              <div
                className={`flex size-9 shrink-0 items-center justify-center rounded-lg ${styles.icon}`}
              >
                <Icon size={17} aria-hidden="true" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline justify-between gap-3">
                  <span className="text-sm font-medium text-text-secondary">
                    {item.label}
                  </span>
                  <span
                    className={`text-xl font-semibold tracking-[-0.4px] ${styles.value}`}
                  >
                    {item.value}
                  </span>
                </div>
                <p className="mt-0.5 text-[11px] text-text-tertiary">
                  {item.note}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-6 rounded-xl bg-background-soft-50 px-3.5 py-3">
        <div className="flex items-center justify-between text-xs">
          <span className="text-text-secondary">Đã hoàn thành hôm nay</span>
          <span className="font-semibold text-text-primary">
            {summary.completion.completed}/{summary.completion.total} việc
          </span>
        </div>
        <div
          className="mt-2 h-1.5 overflow-hidden rounded-full bg-background-soft-200"
          aria-hidden="true"
        >
          <div
            className="h-full rounded-full bg-primary-500"
            style={{ width: `${summary.completion.rate ?? 0}%` }}
          />
        </div>
      </div>

      <Link
        href="/ctv-sale/tasks"
        className="mt-5 inline-flex items-center gap-1.5 text-xs font-semibold text-primary-500 transition-colors hover:text-primary-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500"
      >
        Quản lý tất cả task
        <ArrowRight size={14} aria-hidden="true" />
      </Link>
    </Card>
  );
}
