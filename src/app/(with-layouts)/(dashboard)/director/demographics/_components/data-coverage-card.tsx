import { InfoTriangle, Shield1Check } from "@tailgrids/icons";

import { Badge } from "@/components/tailgrids/core/badge";
import { Card, CardHeader, CardTitle } from "@/components/tailgrids/core/card";
import { dataCoverageMetrics as defaultMetrics } from "@/services/api/demographics/data";
import type { DataCoverageMetric } from "@/services/api/demographics/types";

const toneStyles = {
  success: { bar: "bg-success-500", text: "text-success-500" },
  warning: { bar: "bg-warning-500", text: "text-warning-500" },
  danger: { bar: "bg-error-500", text: "text-error-500" },
};

interface DataCoverageCardProps {
  metrics?: DataCoverageMetric[];
}

export default function DataCoverageCard({ metrics = defaultMetrics }: DataCoverageCardProps) {
  return (
    <Card className="flex h-full min-w-0 flex-col bg-card-background">
      <CardHeader className="mb-4 items-start">
        <div>
          <CardTitle>Mức độ đầy đủ của dữ liệu</CardTitle>
          <p className="mt-1 text-xs leading-5 text-text-tertiary">Tỷ lệ hồ sơ có thông tin theo từng tiêu chí.</p>
        </div>
        <Badge color="success">
          <Shield1Check size={13} aria-hidden="true" />
          Đang kiểm soát
        </Badge>
      </CardHeader>
      <div className="space-y-4">
        {metrics.map((metric) => {
          const tone = toneStyles[metric.tone] ?? toneStyles.warning;
          return (
            <div key={metric.label}>
              <div className="mb-1.5 flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-medium text-text-secondary">{metric.label}</p>
                  <p className="mt-0.5 text-[10px] text-text-tertiary">{metric.detail}</p>
                </div>
                <span className={`text-xs font-semibold ${tone.text}`}>{metric.value}%</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-background-gray-secondary">
                <div className={`h-full rounded-full ${tone.bar}`} style={{ width: `${metric.value}%` }} />
              </div>
            </div>
          );
        })}
      </div>
      <div className="mt-auto pt-5">
        <div className="flex items-start gap-2 rounded-xl border border-card-border bg-background-gray-primary p-3 text-xs leading-5 text-text-tertiary">
          <InfoTriangle size={15} className="mt-0.5 shrink-0 text-warning-500" aria-hidden="true" />
          <span>Thông tin học lực mới có ở 31,2% hồ sơ. Kết quả dùng tiêu chí này có thể chưa đại diện.</span>
        </div>
      </div>
    </Card>
  );
}
