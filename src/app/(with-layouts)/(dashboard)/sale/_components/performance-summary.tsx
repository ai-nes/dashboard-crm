import { Card, CardHeader, CardTitle } from "@/components/tailgrids/core/card";
import type { SalePerformance } from "@/services/api/sale";

interface PerformanceSummaryProps {
  data: SalePerformance;
}

interface PerformanceMetricProps {
  label: string;
  value: string;
  note: string;
  tone?: "default" | "primary" | "success" | "warning";
}

const toneClasses: Record<NonNullable<PerformanceMetricProps["tone"]>, string> = {
  default: "text-text-primary",
  primary: "text-primary-600",
  success: "text-success-600",
  warning: "text-warning-600",
};

function formatCount(value: number | null): string {
  return value === null ? "—" : new Intl.NumberFormat("vi-VN").format(value);
}

function formatPercent(value: number | null): string {
  return value === null ? "—" : `${new Intl.NumberFormat("vi-VN", { maximumFractionDigits: 1 }).format(value)}%`;
}

function formatCoverage(value: number | null): string {
  return value === null ? "—" : `${new Intl.NumberFormat("vi-VN", { maximumFractionDigits: 2 }).format(value)}x`;
}

function PerformanceMetric({ label, value, note, tone = "default" }: PerformanceMetricProps) {
  return (
    <div className="rounded-xl border border-card-border bg-background-soft-50 px-4 py-3.5">
      <p className="text-xs font-medium text-text-tertiary">{label}</p>
      <p className={`mt-1 text-2xl font-semibold tracking-[-0.5px] ${toneClasses[tone]}`}>{value}</p>
      <p className="mt-1 text-[11px] leading-4 text-text-secondary">{note}</p>
    </div>
  );
}

export default function PerformanceSummary({ data }: PerformanceSummaryProps) {
  const targetNote = data.target === null
    ? "Chưa cấu hình chỉ tiêu"
    : `${formatCount(data.enrollment)} / ${formatCount(data.target)} chỉ tiêu`;

  return (
    <Card className="min-w-0 p-5 sm:p-6">
      <CardHeader className="items-start">
        <div>
          <CardTitle>Tiến độ tuyển sinh</CardTitle>
          <p className="mt-1 text-xs leading-5 text-text-tertiary">Kết quả, dự báo và độ phủ pipeline trong kỳ tuyển sinh.</p>
        </div>
      </CardHeader>

      <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-3" role="list" aria-label="Các chỉ số tiến độ tuyển sinh">
        <PerformanceMetric
          label="Nhập học"
          value={formatCount(data.enrollment)}
          note="Kết quả đã ghi nhận"
          tone="success"
        />
        <PerformanceMetric
          label="Tiến độ chỉ tiêu"
          value={formatPercent(data.achievement)}
          note={targetNote}
          tone="primary"
        />
        <PerformanceMetric
          label="Còn thiếu"
          value={formatCount(data.remaining)}
          note={data.remaining === null ? "Chưa có chỉ tiêu để tính" : "Số nhập học cần bổ sung"}
          tone="warning"
        />
        <PerformanceMetric
          label="Dự kiến nhập học"
          value={formatCount(data.expectedEnrollment)}
          note="Ước tính từ pipeline hiện tại"
        />
        <PerformanceMetric
          label="Độ phủ pipeline"
          value={formatCoverage(data.pipelineCoverage)}
          note={data.pipelineCoverage === null ? "Chưa đủ dữ liệu dự báo" : "So với phần chỉ tiêu còn thiếu"}
        />
        <PerformanceMetric
          label="Cơ hội đang mở"
          value={formatCount(data.openOpportunities)}
          note={`+${formatCount(data.newOpportunities)} cơ hội mới`}
        />
      </div>
    </Card>
  );
}
