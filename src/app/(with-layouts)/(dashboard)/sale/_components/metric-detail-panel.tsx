import {
  SaleDetailCallout,
  SaleDetailFacts,
  SaleDetailSection,
} from "./sale-detail-primitives";
import type { SaleDashboardDetail } from "./sale-dashboard-detail.types";

interface MetricDetailPanelProps {
  metric: Extract<SaleDashboardDetail, { kind: "metric" }>["metric"];
  performance: Extract<SaleDashboardDetail, { kind: "metric" }>["performance"];
}

function formatCount(value: number | null): string {
  return value === null
    ? "Chưa có dữ liệu"
    : new Intl.NumberFormat("vi-VN").format(value);
}

function formatPercent(value: number | null): string {
  return value === null
    ? "Chưa đủ dữ liệu"
    : `${new Intl.NumberFormat("vi-VN", { maximumFractionDigits: 1 }).format(value)}%`;
}

function formatCoverage(value: number | null): string {
  return value === null
    ? "Chưa đủ dữ liệu"
    : `${new Intl.NumberFormat("vi-VN", { maximumFractionDigits: 2 }).format(value)}x`;
}

export default function MetricDetailPanel({
  metric,
  performance,
}: MetricDetailPanelProps) {
  const targetExists = performance.target !== null && performance.target > 0;
  const remaining = targetExists
    ? (performance.remaining ??
      Math.max(performance.target! - performance.enrollment, 0))
    : null;
  const coverage =
    remaining !== null && remaining > 0
      ? (performance.pipelineCoverage ??
        (performance.expectedEnrollment !== null
          ? performance.expectedEnrollment / remaining
          : null))
      : null;
  const achievement =
    performance.achievement ??
    (targetExists
      ? (performance.enrollment / performance.target!) * 100
      : null);
  const decidedCount =
    performance.lostOpportunities === null
      ? null
      : performance.enrollment + performance.lostOpportunities;
  const enrollmentRate =
    decidedCount && decidedCount > 0
      ? (performance.enrollment / decidedCount) * 100
      : null;

  if (metric === "enrollment") {
    return (
      <div className="space-y-6">
        <SaleDetailSection title="Kết quả nhập học">
          <SaleDetailFacts
            facts={[
              {
                label: "Đã nhập học",
                value: `${formatCount(performance.enrollment)} học sinh`,
              },
              {
                label: "Chỉ tiêu kỳ này",
                value: targetExists
                  ? `${formatCount(performance.target)} học sinh`
                  : "Chưa cấu hình",
              },
              { label: "Mức hoàn thành", value: formatPercent(achievement) },
              {
                label: "Chỉ tiêu còn thiếu",
                value:
                  remaining === null ? "Chưa cấu hình" : formatCount(remaining),
              },
            ]}
          />
        </SaleDetailSection>
        <SaleDetailCallout title="Cách đọc">
          {targetExists
            ? `Đã có ${formatCount(performance.enrollment)} học sinh nhập học, đạt ${formatPercent(achievement)} chỉ tiêu.`
            : "Chưa cấu hình chỉ tiêu nên chưa thể tính mức hoàn thành."}
        </SaleDetailCallout>
      </div>
    );
  }

  if (metric === "coverage") {
    return (
      <div className="space-y-6">
        <SaleDetailSection title="Độ phủ chỉ tiêu">
          <SaleDetailFacts
            facts={[
              {
                label: "Độ phủ",
                value:
                  remaining === null
                    ? "Chưa cấu hình"
                    : remaining === 0
                      ? "Đã đạt chỉ tiêu"
                      : formatCoverage(coverage),
              },
              {
                label: "Dự kiến nhập học",
                value: formatCount(performance.expectedEnrollment),
              },
              {
                label: "Chỉ tiêu còn thiếu",
                value:
                  remaining === null ? "Chưa cấu hình" : formatCount(remaining),
              },
              {
                label: "Cơ hội đang mở",
                value: formatCount(performance.openOpportunities),
              },
            ]}
          />
        </SaleDetailSection>
        <SaleDetailCallout title="Cách tính độ phủ" tone="warning">
          <>
            {remaining !== null && remaining > 0 ? (
              <p className="font-semibold">
                {formatCount(performance.expectedEnrollment)} /{" "}
                {formatCount(remaining)} = {formatCoverage(coverage)}
              </p>
            ) : null}
            <p className="mt-1">
              Độ phủ = số dự kiến nhập học chia cho chỉ tiêu còn thiếu. Đây là
              dự báo từ pipeline, không phải kết quả chắc chắn.
            </p>
          </>
        </SaleDetailCallout>
      </div>
    );
  }

  if (metric === "remaining") {
    return (
      <div className="space-y-6">
        <SaleDetailSection title="Khoảng cách chỉ tiêu">
          <SaleDetailFacts
            facts={[
              {
                label: "Chỉ tiêu còn thiếu",
                value:
                  remaining === null ? "Chưa cấu hình" : formatCount(remaining),
              },
              {
                label: "Chỉ tiêu kỳ này",
                value: targetExists
                  ? formatCount(performance.target)
                  : "Chưa cấu hình",
              },
              {
                label: "Đã nhập học",
                value: formatCount(performance.enrollment),
              },
              {
                label: "Dự kiến nhập học",
                value: formatCount(performance.expectedEnrollment),
              },
            ]}
          />
        </SaleDetailSection>
        <SaleDetailCallout title="Cách tính">
          {targetExists
            ? `${formatCount(performance.target)} chỉ tiêu − ${formatCount(performance.enrollment)} đã nhập học = ${formatCount(remaining)} còn thiếu.`
            : "Chưa cấu hình chỉ tiêu nên chưa thể xác định số còn thiếu."}
        </SaleDetailCallout>
      </div>
    );
  }

  if (metric === "open-opportunities") {
    return (
      <div className="space-y-6">
        <SaleDetailSection title="Quy mô cơ hội">
          <SaleDetailFacts
            facts={[
              {
                label: "Cơ hội đang mở",
                value: formatCount(performance.openOpportunities),
              },
              {
                label: "Cơ hội mới trong kỳ",
                value: formatCount(performance.newOpportunities),
              },
              {
                label: "Dự kiến nhập học",
                value: formatCount(performance.expectedEnrollment),
              },
              {
                label: "Cơ hội không chuyển đổi",
                value: formatCount(performance.lostOpportunities),
              },
            ]}
          />
        </SaleDetailSection>
        <SaleDetailCallout title="Phạm vi chỉ số">
          Cơ hội đang mở chưa có kết quả cuối. Số dự kiến nhập học là dự báo
          riêng từ pipeline và không đồng nghĩa tất cả cơ hội sẽ chuyển đổi.
        </SaleDetailCallout>
      </div>
    );
  }

  if (metric === "enrollment-rate") {
    return (
      <div className="space-y-6">
        <SaleDetailSection title="Tỷ lệ nhập học">
          <SaleDetailFacts
            facts={[
              { label: "Tỷ lệ", value: formatPercent(enrollmentRate) },
              {
                label: "Đã nhập học",
                value: `${formatCount(performance.enrollment)} học sinh`,
              },
              {
                label: "Cơ hội không chuyển đổi",
                value: formatCount(performance.lostOpportunities),
              },
              {
                label: "Tổng cơ hội đã có kết quả",
                value: formatCount(decidedCount),
              },
            ]}
          />
        </SaleDetailSection>
        <SaleDetailCallout title="Cách tính">
          <>
            <p>
              {decidedCount &&
              decidedCount > 0 &&
              performance.lostOpportunities !== null
                ? `${formatCount(performance.enrollment)} / (${formatCount(performance.enrollment)} + ${formatCount(performance.lostOpportunities)}) = ${formatPercent(enrollmentRate)}`
                : "Chưa đủ dữ liệu để tính tỷ lệ."}
            </p>
            <p className="mt-1">
              Tỷ lệ nhập học = số đã nhập học ÷ (số đã nhập học + số cơ hội
              không chuyển đổi). Cơ hội đang mở không nằm trong mẫu số.
            </p>
          </>
        </SaleDetailCallout>
      </div>
    );
  }

  if (metric === "lost-opportunities") {
    return (
      <div className="space-y-6">
        <SaleDetailSection title="Kết quả cơ hội">
          <SaleDetailFacts
            facts={[
              {
                label: "Cơ hội không chuyển đổi",
                value: formatCount(performance.lostOpportunities),
              },
              {
                label: "Đã nhập học",
                value: formatCount(performance.enrollment),
              },
              {
                label: "Tổng cơ hội đã có kết quả",
                value: formatCount(decidedCount),
              },
              { label: "Tỷ lệ nhập học", value: formatPercent(enrollmentRate) },
            ]}
          />
        </SaleDetailSection>
        <SaleDetailCallout title="Phạm vi chỉ số">
          Chỉ tính cơ hội đã đóng nhưng không chuyển đổi; các cơ hội vẫn đang mở
          không được xem là thất bại.
        </SaleDetailCallout>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <SaleDetailSection title="Dự báo chỉ tiêu">
        <SaleDetailFacts
          facts={[
            {
              label: "Dự kiến nhập học",
              value: formatCount(performance.expectedEnrollment),
            },
            {
              label: "Đã nhập học",
              value: formatCount(performance.enrollment),
            },
            {
              label: "Cơ hội đang mở",
              value: formatCount(performance.openOpportunities),
            },
            {
              label: "Chỉ tiêu còn thiếu",
              value:
                remaining === null ? "Chưa cấu hình" : formatCount(remaining),
            },
            {
              label: "Độ phủ",
              value:
                remaining === null
                  ? "Chưa cấu hình"
                  : remaining === 0
                    ? "Đã đạt chỉ tiêu"
                    : formatCoverage(coverage),
            },
            {
              label: "Chỉ tiêu kỳ này",
              value: targetExists
                ? formatCount(performance.target)
                : "Chưa cấu hình",
            },
          ]}
        />
      </SaleDetailSection>
      <SaleDetailCallout title="Cách đọc dự báo" tone="warning">
        <>
          {remaining !== null &&
          remaining > 0 &&
          performance.expectedEnrollment !== null ? (
            <p className="font-semibold">
              {formatCount(performance.expectedEnrollment)} /{" "}
              {formatCount(remaining)} = {formatCoverage(coverage)}
            </p>
          ) : null}
          <p className="mt-1">
            Dự kiến nhập học là ước tính từ pipeline hiện có, không phải kết quả
            chắc chắn. Độ phủ được tính bằng số dự kiến nhập học chia cho chỉ
            tiêu còn thiếu; không hiển thị tỷ lệ khi chưa có chỉ tiêu hoặc đã
            đạt chỉ tiêu.
          </p>
        </>
      </SaleDetailCallout>
    </div>
  );
}
