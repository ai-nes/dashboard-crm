import { ArrowRight } from "@tailgrids/icons";

import { Card, CardHeader, CardTitle } from "@/components/tailgrids/core/card";

import { admissionsPipeline } from "./data";

export default function AdmissionsFunnel() {
  return (
    <Card className="min-w-0">
      <CardHeader className="mb-6">
        <div>
          <CardTitle>Phễu tuyển sinh</CardTitle>
          <p className="mt-1 text-xs text-text-tertiary">
            Hiệu suất chuyển đổi qua từng giai đoạn tuyển sinh
          </p>
        </div>
        <span className="rounded-full bg-badge-primary-background px-2.5 py-1 text-xs font-medium text-badge-primary-text">
          Niên khóa 2026
        </span>
      </CardHeader>

      <div className="space-y-4" aria-label="Phễu tuyển sinh">
        {admissionsPipeline.map((stage, index) => (
          <div key={stage.id} className="group">
            <div className="mb-2 flex items-center justify-between gap-3 text-sm">
              <div className="flex min-w-0 items-center gap-2">
                <span className={`size-2.5 shrink-0 rounded-full ${stage.barClassName}`} />
                <span className="truncate font-medium text-text-secondary">{stage.label}</span>
                <span className="text-text-tertiary">{stage.value}</span>
              </div>
              <span className="shrink-0 font-semibold text-text-primary">{stage.conversion}</span>
            </div>
            <div
              className="h-2.5 w-full overflow-hidden rounded-full bg-background-gray-secondary"
              role="progressbar"
              aria-label={`${stage.label}: ${stage.percentage}%`}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={stage.percentage}
            >
              <div
                className={`h-full rounded-full transition-all ${stage.barClassName}`}
                style={{ width: `${stage.percentage}%` }}
              />
            </div>
            {index < admissionsPipeline.length - 1 && (
              <div className="mt-2 hidden items-center gap-1 text-[11px] text-text-tertiary sm:flex">
                <ArrowRight size={12} aria-hidden="true" />
                <span>{admissionsPipeline[index + 1].conversion} chuyển giai đoạn</span>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="mt-6 grid grid-cols-2 gap-3 border-t border-card-border pt-4 sm:grid-cols-3">
        <div>
          <p className="text-xs text-text-tertiary">Mất hồ sơ</p>
          <p className="mt-1 font-semibold text-text-primary">1,364</p>
        </div>
        <div>
          <p className="text-xs text-text-tertiary">Nuôi dưỡng</p>
          <p className="mt-1 font-semibold text-text-primary">840</p>
        </div>
        <div className="col-span-2 sm:col-span-1">
          <p className="text-xs text-text-tertiary">Tỷ lệ nhập học</p>
          <p className="mt-1 font-semibold text-green-600">7.9%</p>
        </div>
      </div>
    </Card>
  );
}
