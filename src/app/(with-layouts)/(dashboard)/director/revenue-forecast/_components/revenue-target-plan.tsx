import { Card, CardHeader, CardTitle } from "@/components/tailgrids/core/card";
import {
  money,
  percent,
  useRevenueForecastData,
} from "./revenue-forecast-context";

const TARGETS = [
  {
    id: "tuition",
    label: "Thu học phí",
    value: "346B / 420B",
    progress: 82.4,
    tone: "bg-brand-500",
  },
  {
    id: "deposit",
    label: "Đặt cọc nhập học",
    value: "74B / 96B",
    progress: 77,
    tone: "bg-info-500",
  },
  {
    id: "application",
    label: "Phí hồ sơ",
    value: "18B / 24B",
    progress: 75,
    tone: "bg-success-500",
  },
];

export default function RevenueTargetPlan() {
  const { meta, targetPlan } = useRevenueForecastData();
  const TARGETS = targetPlan.map((target, index) => ({
    ...target,
    value: `${money(target.actual)} / ${money(target.target)}`,
    progress: target.progress ?? 0,
    tone:
      ["bg-brand-500", "bg-info-500", "bg-success-500"][index] ??
      "bg-brand-500",
  }));
  return (
    <Card className="min-w-0 bg-background-gray-primary">
      <CardHeader className="items-start">
        <div>
          <CardTitle className="text-base">Kế hoạch thu</CardTitle>
          <p className="mt-1 text-xs leading-5 text-text-tertiary">
            Tiến độ các khoản thu chính
          </p>
        </div>
        <span className="rounded-full bg-badge-primary-background px-2 py-1 text-[11px] font-semibold text-badge-primary-text">
          {meta.admissionYear}
        </span>
      </CardHeader>

      <div className="mt-5 space-y-5">
        {TARGETS.map((target) => (
          <div key={target.id}>
            <div className="flex items-center justify-between gap-2 text-[11px]">
              <span className="truncate font-medium text-text-secondary">
                {target.label}
              </span>
              <span className="shrink-0 font-semibold text-text-primary">
                {target.value}
              </span>
            </div>
            <div className="mt-2 flex items-center gap-2">
              <div className="h-1.5 min-w-0 flex-1 overflow-hidden rounded-full bg-card-border">
                <div
                  className={`h-full rounded-full ${target.tone}`}
                  style={{ width: `${target.progress}%` }}
                />
              </div>
              <span className="w-8 shrink-0 text-right text-[10px] text-text-tertiary">
                {target.progress}%
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-5 border-t border-card-border pt-4 text-[11px] text-text-tertiary">
        <span>Phân bổ theo 3 nhóm thu · </span>
        <span className="font-semibold text-success-500">còn 2 kỳ</span>
        <span> cần hoàn tất.</span>
      </div>
    </Card>
  );
}
