import { CheckCircle1, Target3 } from "@tailgrids/icons";

import { Badge } from "@/components/tailgrids/core/badge";
import { Card, CardHeader, CardTitle } from "@/components/tailgrids/core/card";
import type { SchoolIntelligenceData } from "@/services/api/schools/types";

interface SchoolPotentialBreakdownProps {
  data: SchoolIntelligenceData;
}

const FACTOR_TONES = [
  { bar: "bg-primary-500", surface: "bg-badge-primary-background/35" },
  { bar: "bg-violet-500", surface: "bg-badge-violet-background/35" },
  { bar: "bg-success-500", surface: "bg-badge-success-background/35" },
  { bar: "bg-warning-500", surface: "bg-badge-warning-background/35" },
  { bar: "bg-orange-500", surface: "bg-badge-orange-background/35" },
];

export default function SchoolPotentialBreakdown({
  data,
}: SchoolPotentialBreakdownProps) {
  return (
    <Card className="h-full min-w-0 border-primary-200/70 p-5">
      <CardHeader className="mb-5 items-start">
        <div className="flex items-start gap-3">
          <span
            className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-badge-primary-background text-badge-primary-text"
            aria-hidden="true"
          >
            <Target3 size={18} />
          </span>
          <div>
            <CardTitle>Vì sao trường có tiềm năng?</CardTitle>
            <p className="mt-1 text-xs leading-5 text-text-tertiary">
              Điểm Potential được tổng hợp từ 5 nhóm tín hiệu chính.
            </p>
          </div>
        </div>
        <Badge color={data.potentialScore >= 88 ? "success" : "primary"}>
          {data.potentialScore >= 88 ? "Điểm nóng" : "Có dư địa"}
        </Badge>
      </CardHeader>

      <div className="mb-5 flex items-end justify-between gap-4 rounded-xl border border-primary-200/60 bg-badge-primary-background/45 p-4">
        <div>
          <p className="text-xs text-text-tertiary">Potential Score</p>
          <p className="mt-1 text-4xl font-semibold leading-none tracking-[-1px] text-text-primary">
            {data.potentialScore}
            <span className="text-base font-medium text-text-tertiary">
              /100
            </span>
          </p>
        </div>
        <div className="min-w-32 flex-1">
          <div className="flex items-center justify-between text-[11px] text-text-tertiary">
            <span>Ngưỡng ưu tiên</span>
            <span>85</span>
          </div>
          <div className="relative mt-2 h-2 overflow-hidden rounded-full bg-background-soft-200">
            <div
              className="h-full rounded-full bg-primary-500 transition-[width] duration-1000 ease-out"
              style={{ width: `${data.potentialScore}%` }}
            />
            <span
              className="absolute top-0 bottom-0 w-px bg-warning-500"
              style={{ left: "85%" }}
              aria-hidden="true"
            />
          </div>
          <p className="mt-2 text-right text-[11px] font-medium text-success-500">
            {data.potentialScore >= 85
              ? "Vượt ngưỡng khai thác"
              : "Cần nuôi dưỡng thêm"}
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {data.potentialFactors.map((factor, index) => {
          const tone = FACTOR_TONES[index % FACTOR_TONES.length];

          return (
            <div
              className={`rounded-lg px-2.5 py-2 ${tone.surface}`}
              key={factor.label}
            >
              <div className="flex items-center justify-between gap-3 text-xs">
                <div className="min-w-0">
                  <p className="font-medium text-text-primary">
                    {factor.label}
                  </p>
                  <p
                    className="mt-0.5 truncate text-[11px] text-text-tertiary"
                    title={factor.description}
                  >
                    {factor.description}
                  </p>
                </div>
                <strong className="shrink-0 text-text-primary">
                  {factor.value}
                </strong>
              </div>
              <div
                className="mt-2 h-1.5 overflow-hidden rounded-full bg-background-soft-200"
                role="progressbar"
                aria-label={factor.label}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={factor.value}
              >
                <div
                  className={`h-full rounded-full ${tone.bar} transition-[width] duration-1000 ease-out`}
                  style={{ width: `${factor.value}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      <p className="mt-5 flex items-center gap-1.5 border-t border-card-border pt-4 text-xs font-medium text-success-500">
        <CheckCircle1 size={14} /> Điểm số đủ tin cậy để ưu tiên ngân sách kỳ
        này.
      </p>
    </Card>
  );
}
