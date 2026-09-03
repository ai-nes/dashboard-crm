import { ArrowUpward, CheckCircle1, TrendUp2, User2 } from "@tailgrids/icons";

import { Badge } from "@/components/tailgrids/core/badge";
import type { DirectorStudentsSummary } from "@/services/api/students/types";

interface StudentKpiStripProps {
  summary?: DirectorStudentsSummary;
}

const iconBackground = {
  primary: "bg-badge-primary-background text-badge-primary-text",
  success: "bg-badge-success-background text-badge-success-text",
  warning: "bg-badge-warning-background text-badge-warning-text",
  violet: "bg-badge-violet-background text-badge-violet-text",
} as const;

export default function StudentKpiStrip({ summary }: StudentKpiStripProps) {
  const trackedCount = summary?.trackedStudents != null ? summary.trackedStudents.toLocaleString("vi-VN") : "-";
  const trackedDelta = summary?.trackedStudentsDeltaPercent != null
    ? `${summary.trackedStudentsDeltaPercent > 0 ? "+" : ""}${summary.trackedStudentsDeltaPercent.toFixed(1).replace(".", ",")}% so với tháng trước`
    : "-";

  const highIntentCount = summary?.highIntentStudents != null ? summary.highIntentStudents.toLocaleString("vi-VN") : "-";
  const highIntentRate = summary?.highIntentRate != null
    ? `${summary.highIntentRate.toFixed(1).replace(".", ",")}% tổng tệp học sinh`
    : "-";

  const actionsDue = summary?.actionsDueToday != null ? summary.actionsDueToday.toLocaleString("vi-VN") : "-";

  const avgProb = summary?.averageEnrollmentProbability != null ? `${summary.averageEnrollmentProbability}%` : "-";
  const avgProbDelta = summary?.averageEnrollmentProbabilityDelta != null
    ? `${summary.averageEnrollmentProbabilityDelta > 0 ? "+" : ""}${summary.averageEnrollmentProbabilityDelta} điểm trong 7 ngày`
    : "Chưa có biến động";

  const kpis = [
    {
      label: "Học sinh đang theo dõi",
      value: trackedCount,
      detail: trackedDelta,
      icon: User2,
      color: "primary" as const,
    },
    {
      label: "Khả năng nhập học cao",
      value: highIntentCount,
      detail: highIntentRate,
      icon: CheckCircle1,
      color: "success" as const,
    },
    {
      label: "Cần hành động hôm nay",
      value: actionsDue,
      detail: "Theo thời hạn tư vấn hiện tại",
      icon: TrendUp2,
      color: "warning" as const,
    },
    {
      label: "Khả năng nhập học trung bình",
      value: avgProb,
      detail: avgProbDelta,
      icon: ArrowUpward,
      color: "violet" as const,
    },
  ];

  return (
    <section aria-label="Tổng quan tệp học sinh" className="grid divide-y divide-card-border rounded-xl border border-card-border bg-card-background sm:grid-cols-2 sm:divide-x sm:divide-y-0 xl:grid-cols-4">
      {kpis.map((item) => {
        const Icon = item.icon;

        return (
          <div key={item.label} className="flex gap-3 p-4 lg:p-5">
            <span className={`flex size-10 shrink-0 items-center justify-center rounded-lg ${iconBackground[item.color]}`} aria-hidden="true">
              <Icon size={19} />
            </span>
            <div className="min-w-0">
              <p className="text-sm text-text-tertiary">{item.label}</p>
              <div className="mt-1 flex flex-wrap items-center gap-2">
                <p className="text-xl leading-6 font-semibold text-text-primary">{item.value}</p>
                {item.color === "success" && <Badge color="success">Ổn định</Badge>}
              </div>
              <p className="mt-1 text-xs leading-4 text-text-secondary">{item.detail}</p>
            </div>
          </div>
        );
      })}
    </section>
  );
}
