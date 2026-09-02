import { Card, CardHeader, CardTitle } from "@/components/tailgrids/core/card";

import { useAdmissionFunnelData } from "./admission-funnel-context";
import type { FunnelPriorityAction, FunnelPriorityTone } from "@/services/api/director-admission-funnel";

const toneStyles: Record<FunnelPriorityTone, string> = {
  error: "bg-badge-error-background text-badge-error-text",
  warning: "bg-badge-warning-background text-badge-warning-text",
  success: "bg-badge-success-background text-badge-success-text",
};

const toneLabels: Record<FunnelPriorityTone, string> = {
  error: "Ưu tiên cao",
  warning: "Cần xử lý",
  success: "Nên nhân rộng",
};

const suggestedPriorityAction: FunnelPriorityAction = {
  id: "review-lead-response-time",
  title: "Rà soát tốc độ phản hồi hồ sơ tiềm năng",
  detail: "Ưu tiên liên hệ trong ngày để không bỏ lỡ hồ sơ mới phát sinh.",
  tone: "warning",
};

export default function FunnelPriorityActions() {
  const { priorityActions: actions } = useAdmissionFunnelData();
  const visibleActions = actions.length === 3 ? [...actions, suggestedPriorityAction] : actions;

  return (
    <Card className="flex min-w-0 flex-col p-5 xl:h-full">
      <CardHeader className="mb-5 items-start">
        <div>
          <CardTitle>Việc cần ưu tiên</CardTitle>
          <p className="mt-1 text-xs leading-5 text-text-tertiary">Việc có thể cải thiện số hồ sơ nhập học.</p>
        </div>
      </CardHeader>

      <ol className="grid flex-1 gap-2.5">
        {visibleActions.map((action, index) => (
          <li key={action.id} className="rounded-lg bg-background-soft-50 p-3 xl:flex xl:flex-col xl:justify-center">
            <div className="flex items-start justify-between gap-3">
              <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-card-background text-xs font-semibold text-text-tertiary">{index + 1}</span>
              <span className={`rounded-full px-2 py-1 text-[11px] font-medium ${toneStyles[action.tone]}`}>{toneLabels[action.tone]}</span>
            </div>
            <p className="mt-3 text-sm font-medium leading-5 text-text-primary">{action.title}</p>
            <p className="mt-1 text-xs leading-5 text-text-tertiary">{action.detail}</p>
          </li>
        ))}
      </ol>
    </Card>
  );
}
