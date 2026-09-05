import { ArrowRight, ClockThree, FileTextMultiple } from "@tailgrids/icons";
import Link from "next/link";

import { Badge } from "@/components/tailgrids/core/badge";
import { Card, CardHeader, CardTitle } from "@/components/tailgrids/core/card";
import type { SaleOperations } from "@/services/api/sale";

import { OPERATION_PRESENTATION } from "./data";

interface OperationsSummaryProps {
  data: SaleOperations;
}

export default function OperationsSummary({ data }: OperationsSummaryProps) {
  return (
    <Card className="min-w-0 p-5 sm:p-6">
      <CardHeader className="items-start">
        <div>
          <CardTitle>Việc &amp; hồ sơ cần xử lý</CardTitle>
          <p className="mt-1 text-xs leading-5 text-text-tertiary">Các điểm nghẽn cần được dọn trong hôm nay.</p>
        </div>
        <Badge color="warning" size="sm">{data.total} điểm cần xử lý</Badge>
      </CardHeader>

      <div className="mt-5 grid gap-3 md:grid-cols-2">
        {data.items.map((item) => {
          const presentation = OPERATION_PRESENTATION[item.id];
          const Icon = item.id === "overdue-tasks" ? ClockThree : FileTextMultiple;

          return (
            <Link
              key={item.id}
              href={presentation.href}
              className="group flex items-center gap-3 rounded-xl border border-card-border bg-background-soft-50 p-3.5 transition-colors hover:border-primary-200 hover:bg-primary-50/40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500"
            >
              <div className={`flex size-10 shrink-0 items-center justify-center rounded-xl ${presentation.iconClassName}`}>
                <Icon size={19} aria-hidden="true" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline gap-2">
                  <span className="text-xl font-semibold tracking-[-0.4px] text-text-primary">{item.count}</span>
                  <span className="truncate text-sm font-semibold text-text-primary">{presentation.label}</span>
                </div>
                <p className="mt-0.5 truncate text-xs text-text-tertiary">{presentation.note}</p>
              </div>
              <ArrowRight size={16} aria-hidden="true" className="shrink-0 text-text-tertiary transition-transform group-hover:translate-x-0.5 group-hover:text-primary-500" />
            </Link>
          );
        })}
      </div>
    </Card>
  );
}
