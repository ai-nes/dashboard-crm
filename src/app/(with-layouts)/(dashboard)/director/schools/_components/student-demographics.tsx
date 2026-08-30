import { ArrowDownward, ArrowUpward } from "@tailgrids/icons";

import { Card, CardHeader, CardTitle } from "@/components/tailgrids/core/card";
import type { SchoolIntelligenceData } from "@/services/api/schools/types";

interface StudentDemographicsProps {
  data: SchoolIntelligenceData;
}

export default function StudentDemographics({
  data,
}: StudentDemographicsProps) {
  return (
    <Card className="min-w-0 border-primary-200/60 p-5">
      <CardHeader className="mb-5">
        <div>
          <CardTitle>Nhân khẩu học học sinh lớp 12</CardTitle>
          <p className="mt-1 text-xs leading-5 text-text-tertiary">
            Tệp prospects đã ghi nhận trong kỳ tuyển sinh hiện tại.
          </p>
        </div>
      </CardHeader>

      <div className="grid gap-6 lg:grid-cols-[0.8fr_1fr_1.25fr]">
        <section aria-label="Giới tính">
          <h3 className="text-xs font-medium text-text-secondary">Giới tính</h3>
          <div className="mt-4 space-y-3">
            {data.demographics.gender.map((item) => (
              <div key={item.label}>
                <div className="mb-1 flex justify-between text-xs">
                  <span className="text-text-secondary">{item.label}</span>
                  <strong className="text-text-primary">{item.value}%</strong>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-background-soft-200">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${item.value}%`,
                      backgroundColor: item.color,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>

        <section aria-label="Học lực">
          <h3 className="text-xs font-medium text-text-secondary">
            Học lực dự kiến
          </h3>
          <div className="mt-4 space-y-3">
            {data.demographics.academicProfile.map((item, index) => (
              <div key={item.label} className="flex items-center gap-3 text-xs">
                <span className="w-27 shrink-0 text-text-secondary">
                  {item.label}
                </span>
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-background-soft-200">
                  <div
                    className={`h-full rounded-full ${["bg-primary-500", "bg-violet-500", "bg-warning-500"][index] ?? "bg-primary-400"}`}
                    style={{ width: `${item.value}%` }}
                  />
                </div>
                <strong className="w-8 text-right text-text-primary">
                  {item.value}%
                </strong>
              </div>
            ))}
          </div>
        </section>

        <section aria-label="Sở thích ngành học">
          <h3 className="text-xs font-medium text-text-secondary">
            Sở thích ngành học
          </h3>
          <div className="mt-3 divide-y divide-card-border rounded-lg border border-card-border">
            {data.demographics.majorInterests.map((item) => (
              <div
                key={item.label}
                className="flex items-center justify-between gap-3 px-3 py-2.5 text-xs"
              >
                <span className="min-w-0 truncate text-text-secondary">
                  {item.label}
                </span>
                <span className="flex shrink-0 items-center gap-2">
                  <strong className="text-text-primary">{item.value}%</strong>
                  <span
                    className={`inline-flex items-center ${item.change >= 0 ? "text-success-500" : "text-error-500"}`}
                  >
                    {item.change >= 0 ? (
                      <ArrowUpward size={13} />
                    ) : (
                      <ArrowDownward size={13} />
                    )}
                    {Math.abs(item.change)}%
                  </span>
                </span>
              </div>
            ))}
          </div>
        </section>
      </div>

      <div className="mt-5 grid grid-cols-3 gap-2 border-t border-primary-200/60 pt-4 text-center">
        <DemographicSignal
          label="Nữ chiếm đa số"
          tone="text-primary-500"
          value={`${data.demographics.gender[0]?.value ?? 0}%`}
        />
        <DemographicSignal
          label="Học lực giỏi"
          tone="text-violet-500"
          value={`${data.demographics.academicProfile[0]?.value ?? 0}%`}
        />
        <DemographicSignal
          label="Ngành tăng"
          tone="text-success-500"
          value={`+${data.demographics.majorInterests[0]?.change ?? 0}%`}
        />
      </div>
    </Card>
  );
}

function DemographicSignal({
  label,
  tone,
  value,
}: {
  label: string;
  tone: string;
  value: string;
}) {
  return (
    <div className="rounded-lg bg-background-soft-50 px-2 py-2">
      <p className="truncate text-[10px] text-text-tertiary" title={label}>
        {label}
      </p>
      <p className={`mt-1 text-sm font-semibold ${tone}`}>{value}</p>
    </div>
  );
}
