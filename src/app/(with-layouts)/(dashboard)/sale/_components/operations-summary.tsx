import { ArrowRight, ClockThree, FileTextMultiple } from "@tailgrids/icons";
import Link from "next/link";

import { Badge } from "@/components/tailgrids/core/badge";
import { Card, CardHeader, CardTitle } from "@/components/tailgrids/core/card";

const operationItems = [
  {
    id: "overdue-tasks",
    value: 3,
    label: "Task quá hạn",
    note: "Cần xử lý ngay để không trễ SLA",
    icon: ClockThree,
    iconClassName: "bg-badge-error-background text-badge-error-text",
    href: "/sale/tasks",
  },
  {
    id: "missing-documents",
    value: 2,
    label: "Hồ sơ thiếu giấy tờ",
    note: "Cần nhắc học sinh bổ sung",
    icon: FileTextMultiple,
    iconClassName: "bg-badge-warning-background text-badge-warning-text",
    href: "/sale/students",
  },
] as const;

export default function OperationsSummary() {
  return (
    <Card className="min-w-0 p-5 sm:p-6">
      <CardHeader className="items-start">
        <div>
          <CardTitle>Việc &amp; hồ sơ cần xử lý</CardTitle>
          <p className="mt-1 text-xs leading-5 text-text-tertiary">Các điểm nghẽn cần được dọn trong hôm nay.</p>
        </div>
        <Badge color="warning" size="sm">5 điểm cần xử lý</Badge>
      </CardHeader>

      <div className="mt-5 grid gap-3 md:grid-cols-2">
        {operationItems.map((item) => {
          const Icon = item.icon;

          return (
            <Link
              key={item.id}
              href={item.href}
              className="group flex items-center gap-3 rounded-xl border border-card-border bg-background-soft-50 p-3.5 transition-colors hover:border-primary-200 hover:bg-primary-50/40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500"
            >
              <div className={`flex size-10 shrink-0 items-center justify-center rounded-xl ${item.iconClassName}`}>
                <Icon size={19} aria-hidden="true" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline gap-2">
                  <span className="text-xl font-semibold tracking-[-0.4px] text-text-primary">{item.value}</span>
                  <span className="truncate text-sm font-semibold text-text-primary">{item.label}</span>
                </div>
                <p className="mt-0.5 truncate text-xs text-text-tertiary">{item.note}</p>
              </div>
              <ArrowRight size={16} aria-hidden="true" className="shrink-0 text-text-tertiary transition-transform group-hover:translate-x-0.5 group-hover:text-primary-500" />
            </Link>
          );
        })}
      </div>
    </Card>
  );
}
