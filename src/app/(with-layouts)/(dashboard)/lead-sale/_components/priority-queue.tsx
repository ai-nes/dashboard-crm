import { ArrowRight, ClockThree } from "@tailgrids/icons";

import { Badge } from "@/components/tailgrids/core/badge";
import { Button } from "@/components/tailgrids/core/button";
import { Card, CardHeader, CardTitle } from "@/components/tailgrids/core/card";

import type { LeadSaleDetailId, LeadSaleQueueRecord, LeadSaleTone } from "./mock-data";

interface PriorityQueueProps {
  records: LeadSaleQueueRecord[];
  onOpenDetail: (detailId: LeadSaleDetailId) => void;
}

const toneBadge: Record<LeadSaleTone, "primary" | "warning" | "error" | "violet" | "success"> = {
  primary: "primary",
  success: "success",
  warning: "warning",
  danger: "error",
  violet: "violet",
};

export default function PriorityQueue({ records, onOpenDetail }: PriorityQueueProps) {
  return (
    <Card className="h-full min-w-0 p-0">
      <CardHeader className="border-b border-card-border px-5 py-4 sm:px-6">
        <div>
          <CardTitle>Hồ sơ ưu tiên</CardTitle>
          <p className="mt-1 text-xs leading-5 text-text-tertiary">
            Một vài hồ sơ nên được mở trước trong buổi sáng.
          </p>
        </div>
        <ClockThree size={18} className="text-icon-tertiary" aria-label="Công việc trong ngày" />
      </CardHeader>

      <div className="divide-y divide-card-border">
        {records.length ? records.map((record) => (
          <Button
            key={record.id}
            type="button"
            variant="ghost"
            appearance="ghost"
            onPress={() => onOpenDetail(record.detailId)}
            className="group flex h-auto w-full items-center justify-start gap-3 rounded-none px-5 py-3.5 text-left hover:bg-background-soft-50 sm:px-6"
          >
            <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary-50 text-[10px] font-bold text-primary-600">
              {record.initials}
            </span>
            <span className="min-w-0 flex-1">
              <span className="flex flex-wrap items-center gap-2">
                <span className="truncate text-xs font-semibold text-text-primary">{record.name}</span>
                <Badge color={toneBadge[record.tone]} size="sm">{record.issue}</Badge>
              </span>
              <span className="mt-1 flex flex-wrap gap-x-2 gap-y-1 text-[11px] text-text-tertiary">
                <span>{record.owner}</span>
                <span aria-hidden="true">·</span>
                <span>{record.stage}</span>
                <span aria-hidden="true">·</span>
                <span>{record.age}</span>
              </span>
              <span className="mt-1 block text-[11px] font-medium text-primary-600">{record.nextAction}</span>
            </span>
            <ArrowRight size={15} aria-hidden="true" className="shrink-0 text-text-tertiary transition-transform group-hover:translate-x-0.5" />
          </Button>
        )) : (
          <div className="px-5 py-8 text-center sm:px-6">
            <p className="text-sm font-semibold text-text-primary">Không có hồ sơ ưu tiên</p>
            <p className="mt-1 text-xs leading-5 text-text-tertiary">Hiện chưa có hồ sơ cần ưu tiên xử lý.</p>
          </div>
        )}
      </div>
    </Card>
  );
}
