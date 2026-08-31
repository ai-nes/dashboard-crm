import { Card, CardHeader, CardTitle } from "@/components/tailgrids/core/card";
import Link from "next/link";

import { initialPipelineStages } from "@/services/api/director-overview/data";
import type { AdmissionsPipeline } from "./types";

const STAGE_COLORS: Record<string, string> = {
  prospect: "bg-brand-500",
  engaged: "bg-info-500",
  qualified: "bg-primary-400",
  counselling: "bg-primary-500",
  application: "bg-warning-500",
  accepted: "bg-primary-600",
  enrolled: "bg-success-500",
};

interface AdmissionsFunnelProps {
  pipeline?: AdmissionsPipeline;
  admissionYear?: number;
}

export default function AdmissionsFunnel({ pipeline, admissionYear = 2026 }: AdmissionsFunnelProps) {
  const stages = pipeline?.stages ?? initialPipelineStages;
  const summary = pipeline?.summary ?? {
    prospects: 24860,
    accepted: 4820,
    enrolled: 3820,
    enrollmentRate: 15.4,
  };
  const biggestDrop = pipeline?.biggestDrop ?? {
    fromLabel: "Hồ sơ tiềm năng",
    toLabel: "Đã tương tác",
    differencePoints: 24,
  };

  const prospects = safeNumber(summary.prospects);
  const accepted = safeNumber(summary.accepted);
  const enrolled = safeNumber(summary.enrolled);
  const enrollmentRate = Number.isFinite(summary.enrollmentRate)
    ? summary.enrollmentRate
    : (prospects > 0 ? (enrolled / prospects) * 100 : 0);
  const differencePoints = Number.isFinite(biggestDrop.differencePoints) ? biggestDrop.differencePoints : 0;

  return (
    <Card className="flex min-h-[34rem] min-w-0 flex-col overflow-hidden">
      <CardHeader className="mb-5 items-start">
        <div>
          <CardTitle>Phễu tuyển sinh</CardTitle>
          <p className="mt-1 text-xs leading-5 text-text-tertiary">
            Từ hồ sơ tiềm năng đến nhập học · Niên khóa {admissionYear}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/director/admission-funnel" className="text-xs font-semibold text-brand-500 hover:text-brand-600">
            Phân tích chi tiết
          </Link>
          <span className="rounded-full bg-badge-primary-background px-2.5 py-1 text-xs font-semibold text-badge-primary-text">
            Niên khóa {admissionYear}
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
          {stages.map((stage) => {
            const percentage = Number.isFinite(stage.percentage) ? stage.percentage : 0;
            const stageValue = typeof stage.value === "number" ? (stage.value as number).toLocaleString("vi-VN") : stage.value;

            return (
              <li key={stage.id} className="grid grid-cols-[minmax(110px,1fr)_minmax(0,3fr)_64px] items-center gap-3 sm:grid-cols-[minmax(140px,1fr)_minmax(0,3fr)_80px]">
                <span className="truncate text-xs font-medium text-text-secondary sm:text-sm">{stage.label}</span>
                <div className="flex h-10 items-center justify-center">
                  <div
                    className={`flex h-full min-w-16 items-center justify-center rounded-lg px-2 transition-[width] ${STAGE_COLORS[stage.id] ?? "bg-brand-500"}`}
                    style={{ width: `${Math.max(percentage, 16)}%` }}
                    aria-label={`${stage.label}: ${stageValue} học sinh`}
                  >
                    <span className="truncate text-xs font-semibold text-white-100">{stageValue}</span>
                  </div>
                </div>
                <span className={`text-right text-xs font-semibold ${stage.id === "enrolled" ? "text-success-500" : "text-text-secondary"}`}>{percentage}%</span>
              </li>
            );
          })}
        </ol>
      </div>

      <div className="mt-5 grid grid-cols-3 gap-3 border-t border-card-border pt-4">
        <PipelineSummary label="Tổng hồ sơ tiềm năng" value={prospects.toLocaleString("vi-VN")} />
        <PipelineSummary label="Đã trúng tuyển" value={accepted.toLocaleString("vi-VN")} />
        <PipelineSummary
          label="Tỷ lệ nhập học"
          value={`${enrollmentRate.toLocaleString("vi-VN", { maximumFractionDigits: 1 })}%`}
          valueClassName="text-success-500"
        />
      </div>

      <p className="mt-4 border-t border-card-border pt-4 text-xs leading-5 text-text-tertiary">
        Điểm giảm lớn nhất: <strong className="font-semibold text-text-secondary">{biggestDrop.fromLabel} → {biggestDrop.toLabel}</strong> · giảm {differencePoints} điểm %.
      </p>
    </Card>
  );
}

function safeNumber(value: unknown): number {
  if (typeof value === "number") return Number.isFinite(value) ? value : 0;
  if (!value) return 0;
  const str = String(value).trim();
  if (str.toLowerCase().includes("nan") || str === "null" || str === "undefined") return 0;
  const cleaned = str.replace(/[^\d.-]/g, "");
  const num = Number(cleaned);
  return Number.isFinite(num) ? num : 0;
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
