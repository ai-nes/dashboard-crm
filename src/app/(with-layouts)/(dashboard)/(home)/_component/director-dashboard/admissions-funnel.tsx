import { Card, CardHeader, CardTitle } from "@/components/tailgrids/core/card";
import Link from "next/link";

import { admissionsPipeline } from "./data";

const STAGE_COLORS = {
  prospect: "bg-brand-500",
  engaged: "bg-info-500",
  qualified: "bg-primary-400",
  counselling: "bg-primary-500",
  application: "bg-warning-500",
  accepted: "bg-primary-600",
  enrolled: "bg-success-500",
} as const;

const biggestDrop = admissionsPipeline.reduce(
  (drop, stage, index) => {
    if (index === 0) return drop;
    const previous = admissionsPipeline[index - 1];
    const difference = previous.percentage - stage.percentage;
    return difference > drop.difference ? { from: previous.label, to: stage.label, difference } : drop;
  },
  { from: "", to: "", difference: 0 },
);

export default function AdmissionsFunnel() {
  return (
    <Card className="flex min-h-[34rem] min-w-0 flex-col overflow-hidden">
      <CardHeader className="mb-5 items-start">
        <div>
          <CardTitle>Phễu tuyển sinh</CardTitle>
          <p className="mt-1 text-xs leading-5 text-text-tertiary">
            Từ hồ sơ tiềm năng đến nhập học · Niên khóa 2026
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/director/admission-funnel" className="text-xs font-semibold text-brand-500 hover:text-brand-600">
            Phân tích chi tiết
          </Link>
          <span className="rounded-full bg-badge-primary-background px-2.5 py-1 text-xs font-semibold text-badge-primary-text">
            Niên khóa 2026
          </span>
        </div>
      </CardHeader>

      <div className="flex-1" aria-label="Phễu tuyển sinh gồm bảy bước">
        <div className="mb-3 grid grid-cols-[minmax(110px,1fr)_minmax(0,3fr)_64px] items-center gap-3 text-[10px] font-semibold tracking-wide text-text-tertiary uppercase sm:grid-cols-[minmax(140px,1fr)_minmax(0,3fr)_80px]">
          <span>Giai đoạn</span>
          <span className="text-center">Số học sinh còn lại</span>
          <span className="text-right">Tỷ lệ</span>
        </div>

        <ol className="space-y-2.5" aria-label="Các giai đoạn tuyển sinh">
          {admissionsPipeline.map((stage) => (
            <li key={stage.id} className="grid grid-cols-[minmax(110px,1fr)_minmax(0,3fr)_64px] items-center gap-3 sm:grid-cols-[minmax(140px,1fr)_minmax(0,3fr)_80px]">
              <span className="truncate text-xs font-medium text-text-secondary sm:text-sm">{stage.label}</span>
              <div className="flex h-10 items-center justify-center">
                <div
                  className={`flex h-full min-w-16 items-center justify-center rounded-lg px-2 transition-[width] ${STAGE_COLORS[stage.id as keyof typeof STAGE_COLORS]}`}
                  style={{ width: `${Math.max(stage.percentage, 16)}%` }}
                  aria-label={`${stage.label}: ${stage.value} học sinh`}
                >
                  <span className="truncate text-xs font-semibold text-white-100">{stage.value}</span>
                </div>
              </div>
              <span className={`text-right text-xs font-semibold ${stage.id === "enrolled" ? "text-success-500" : "text-text-secondary"}`}>{stage.percentage}%</span>
            </li>
          ))}
        </ol>
      </div>

      <div className="mt-5 grid grid-cols-3 gap-3 border-t border-card-border pt-4">
        <PipelineSummary label="Tổng hồ sơ tiềm năng" value="24.860" />
        <PipelineSummary label="Đã trúng tuyển" value="4.820" />
        <PipelineSummary label="Tỷ lệ nhập học" value="15,4%" valueClassName="text-success-500" />
      </div>

      <p className="mt-4 border-t border-card-border pt-4 text-xs leading-5 text-text-tertiary">
        Điểm giảm lớn nhất: <strong className="font-semibold text-text-secondary">{biggestDrop.from} → {biggestDrop.to}</strong> · giảm {biggestDrop.difference} điểm %.
      </p>
    </Card>
  );
}

function PipelineSummary({
  label,
  value,
  valueClassName = "text-text-primary",
}: {
  label: string;
  value: string;
  valueClassName?: string;
}) {
  return (
    <div className="min-w-0">
      <p className="truncate text-[11px] text-text-tertiary">{label}</p>
      <p className={`mt-1 text-sm font-semibold ${valueClassName}`}>{value}</p>
    </div>
  );
}
