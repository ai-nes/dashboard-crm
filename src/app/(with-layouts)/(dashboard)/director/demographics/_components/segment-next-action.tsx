import { Badge } from "@/components/tailgrids/core/badge";
import { Card, CardHeader, CardTitle } from "@/components/tailgrids/core/card";
import type { DemographicSegment, SegmentNextAction as SegmentNextActionType } from "@/services/api/demographics/types";

interface SegmentNextActionProps {
  segment: DemographicSegment;
  nextAction?: SegmentNextActionType;
}

export default function SegmentNextAction({ segment, nextAction }: SegmentNextActionProps) {
  const topChannel = [...segment.channels].sort((first, second) => second.value - first.value)[0];
  const isHighPriority = nextAction ? nextAction.priority === "high" : segment.opportunityScore >= 85;
  const primaryAction = nextAction?.title ?? (isHighPriority ? "Ưu tiên tiếp cận sớm" : "Thử nghiệm quy mô nhỏ");
  const primaryDescription =
    nextAction?.description ??
    (isHighPriority
      ? `Nhóm có ${segment.prospects.toLocaleString("vi-VN")} học sinh và đang tăng ${segment.growth}%.`
      : `Bắt đầu với một hoạt động nhỏ để kiểm tra nhu cầu của ${segment.prospects.toLocaleString("vi-VN")} học sinh.`);

  const steps = nextAction?.steps ?? [
    {
      order: 1,
      title: `Tiếp cận qua ${topChannel?.name ?? "Mạng xã hội"}`,
      detail: `${topChannel?.value ?? 38}% tương tác đầu tiên đến từ kênh này.`,
    },
    {
      order: 2,
      title: "Tổ chức một hoạt động tư vấn",
      detail: "Ưu tiên Career Talk hoặc tư vấn nhóm nhỏ.",
    },
    {
      order: 3,
      title: "Đánh giá lại sau 30 ngày",
      detail: "So sánh số học sinh được tiếp cận và số hồ sơ nhập học.",
    },
  ];

  return (
    <Card className="min-w-0 overflow-hidden border-primary-200 bg-card-background">
      <CardHeader className="border-b border-card-border p-5">
        <div>
          <CardTitle>Việc cần làm tiếp theo</CardTitle>
          <p className="mt-1 text-xs leading-5 text-text-tertiary">Ưu tiên dựa trên quy mô, tăng trưởng và kênh tiếp cận.</p>
        </div>
        <Badge color={isHighPriority ? "success" : "primary"}>
          {nextAction?.label ?? (isHighPriority ? "Ưu tiên cao" : "Cần thử nghiệm")}
        </Badge>
      </CardHeader>
      <div className="p-5">
        <div className="rounded-xl bg-background-gray-primary p-4">
          <p className="text-xs font-medium text-text-tertiary">Việc nên làm trước</p>
          <h3 className="mt-1 text-lg font-semibold text-text-primary">{primaryAction}</h3>
          <p className="mt-1 text-sm leading-6 text-text-secondary">{primaryDescription}</p>
        </div>
        <div className="mt-5 space-y-4">
          {steps.map((step) => (
            <ActionStep
              key={step.order}
              number={String(step.order)}
              title={step.title}
              detail={step.detail}
            />
          ))}
        </div>
      </div>
    </Card>
  );
}

interface ActionStepProps {
  number: string;
  title: string;
  detail: string;
}

function ActionStep({ number, title, detail }: ActionStepProps) {
  return (
    <div className="flex items-start gap-3">
      <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-badge-primary-background text-xs font-semibold text-badge-primary-text">
        {number}
      </span>
      <div className="min-w-0">
        <p className="text-sm font-semibold text-text-primary">{title}</p>
        <p className="mt-0.5 text-xs leading-5 text-text-tertiary">{detail}</p>
      </div>
    </div>
  );
}
