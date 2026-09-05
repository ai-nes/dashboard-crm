import { Card, CardHeader, CardTitle } from "@/components/tailgrids/core/card";

import StudentCardEmptyState from "../../students/_components/student-card-empty-state";
import { slaRiskReasons } from "./data";
import type { SlaRiskReason } from "./types";

interface SlaRiskReasonsProps {
  riskReasons?: SlaRiskReason[];
}

export default function SlaRiskReasons({ riskReasons }: SlaRiskReasonsProps) {
  const rows = riskReasons ?? slaRiskReasons;

  return (
    <Card className="min-w-0 p-5">
      <CardHeader className="mb-4 items-start">
        <div>
          <CardTitle>Nguyên nhân chậm chăm sóc</CardTitle>
          <p className="mt-1 text-xs leading-5 text-text-tertiary">
            Tỷ trọng trong nhóm hồ sơ chưa được xử lý đúng hạn.
          </p>
        </div>
      </CardHeader>

      {rows.length === 0 && <StudentCardEmptyState message="Chưa có dữ liệu." className="py-6" />}

      <div className="space-y-5">
        {rows.map((reason) => (
          <div key={reason.label}>
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-medium text-text-primary">
                {reason.label}
              </p>
              <span className="shrink-0 text-sm font-semibold text-text-primary">
                {reason.percentage}%
              </span>
            </div>
            <div
              className="mt-2 h-2 overflow-hidden rounded-full bg-background-soft-200"
              role="progressbar"
              aria-label={reason.label}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={reason.percentage}
            >
              <div
                className="h-full rounded-full bg-warning-500"
                style={{ width: `${reason.percentage}%` }}
              />
            </div>
            <p className="mt-1.5 text-xs text-text-tertiary">{reason.detail}</p>
          </div>
        ))}
      </div>
    </Card>
  );
}
