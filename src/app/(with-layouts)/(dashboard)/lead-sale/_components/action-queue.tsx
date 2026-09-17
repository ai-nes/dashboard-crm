import { ClockThree, FileTextMultiple, InfoTriangle, UserPencil } from "@tailgrids/icons";

import { Badge } from "@/components/tailgrids/core/badge";
import { Button } from "@/components/tailgrids/core/button";
import { Card, CardHeader, CardTitle } from "@/components/tailgrids/core/card";

import type { LeadSaleAction, LeadSaleDetailId, LeadSaleTone } from "./lead-sale-dashboard.types";

interface ActionQueueProps {
  items: LeadSaleAction[];
  onOpenDetail: (detailId: LeadSaleDetailId) => void;
}

const toneStyles: Record<LeadSaleTone, { icon: string; value: string; badge: "primary" | "warning" | "error" | "violet" | "success" }> = {
  primary: { icon: "bg-primary-50 text-primary-600", value: "text-primary-600", badge: "primary" },
  success: { icon: "bg-badge-success-background text-badge-success-text", value: "text-success-500", badge: "success" },
  warning: { icon: "bg-badge-warning-background text-badge-warning-text", value: "text-warning-500", badge: "warning" },
  danger: { icon: "bg-badge-error-background text-badge-error-text", value: "text-badge-error-text", badge: "error" },
  violet: { icon: "bg-badge-violet-background text-badge-violet-text", value: "text-badge-violet-text", badge: "violet" },
};

export default function ActionQueue({ items, onOpenDetail }: ActionQueueProps) {
  return (
    <Card className="h-full min-w-0 p-0">
      <CardHeader className="border-b border-card-border px-5 py-4 sm:px-6">
        <div>
          <CardTitle>Công việc ưu tiên</CardTitle>
          <p className="mt-1 text-xs leading-5 text-text-tertiary">
            Chọn từng nhóm để xem phân bổ theo nhân viên tư vấn và giai đoạn.
          </p>
        </div>
        <Badge color="warning" size="sm">Ưu tiên</Badge>
      </CardHeader>

      <div className="grid divide-y divide-card-border sm:grid-cols-2 sm:divide-x sm:divide-y-0">
        {items.map((item) => {
          const styles = toneStyles[item.tone];

          return (
            <Button
              key={item.id}
              type="button"
              variant="ghost"
              appearance="ghost"
              onPress={() => onOpenDetail(item.detailId)}
              className="group flex h-auto min-h-28 w-full items-start justify-between gap-3 rounded-none px-5 py-4 text-left hover:bg-background-soft-50 sm:px-6"
            >
              <div className="flex min-w-0 items-start gap-3">
                <div className={`flex size-9 shrink-0 items-center justify-center rounded-xl ${styles.icon}`}>
                  <ActionIcon id={item.id} />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-text-primary">{item.label}</p>
                  <p className="mt-1 text-[11px] leading-4 text-text-tertiary">{item.description}</p>
                  <p className="mt-2 text-[11px] font-medium text-text-secondary">{item.subtext}</p>
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <span className={`text-2xl font-semibold tracking-[-0.7px] ${styles.value}`}>{item.value}</span>
                <span className="text-text-tertiary transition-transform group-hover:translate-x-0.5" aria-hidden="true">›</span>
              </div>
            </Button>
          );
        })}
      </div>
    </Card>
  );
}

function ActionIcon({ id }: { id: string }) {
  if (id === "unassigned") return <UserPencil size={17} aria-hidden="true" />;
  if (id === "due-today") return <ClockThree size={17} aria-hidden="true" />;
  if (id === "aging") return <FileTextMultiple size={17} aria-hidden="true" />;
  return <InfoTriangle size={17} aria-hidden="true" />;
}
