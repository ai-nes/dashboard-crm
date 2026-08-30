"use client";

import { CheckCircle1, InfoTriangle } from "@tailgrids/icons";

import { Badge } from "@/components/tailgrids/core/badge";
import { Card, CardHeader, CardTitle } from "@/components/tailgrids/core/card";

import type { Student360SectionProps } from "./types";

const toneLabels = {
  primary: "text-primary-500",
  success: "text-success-500",
  warning: "text-warning-500",
  sky: "text-info-500",
  gray: "text-text-tertiary",
} as const;

const toneSurfaces = {
  primary: "bg-badge-primary-background",
  success: "bg-badge-success-background",
  warning: "bg-badge-warning-background",
  sky: "bg-badge-sky-background",
  gray: "bg-card-background",
} as const;

export default function StudentClassificationSnapshot({ data }: Student360SectionProps) {
  const confirmed = data.classification.reviewStatus === "Đã xác nhận";

  return (
    <Card className="min-w-0 bg-card-background p-4">
      <CardHeader className="items-start">
        <div>
          <CardTitle>Snapshot 4 chiều</CardTitle>
          <p className="mt-1 text-sm leading-6 text-text-tertiary">Tóm tắt nhanh các tín hiệu đứng sau vị trí của học sinh.</p>
        </div>
        <Badge color={confirmed ? "success" : "warning"}>{confirmed ? <CheckCircle1 size={13} aria-hidden="true" /> : <InfoTriangle size={13} aria-hidden="true" />}{data.classification.reviewStatus}</Badge>
      </CardHeader>

      <ol className="mt-4 divide-y divide-card-border rounded-xl bg-card-background px-3">
        {data.classification.dimensions.map((dimension, index) => (
          <li key={dimension.id} className="py-3 first:pt-3 last:pb-3">
            <div className="flex items-start gap-3">
              <span className={`flex size-7 shrink-0 items-center justify-center rounded-lg ${toneSurfaces[dimension.tone]} text-[11px] font-semibold ${toneLabels[dimension.tone]}`} aria-hidden="true">
                {String(index + 1).padStart(2, "0")}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center justify-between gap-x-2 gap-y-1">
                  <p className="text-sm font-medium text-text-tertiary">{dimension.label}</p>
                  <Badge color={dimension.tone}>{dimension.value}</Badge>
                </div>
                <p className="mt-1 text-xs leading-5 text-text-secondary">{dimension.description}</p>
                {dimension.fitFactors ? <ul className="mt-2 grid grid-cols-2 gap-2" aria-label="Các yếu tố đánh giá mức độ phù hợp">{dimension.fitFactors.map((factor) => <li key={factor.label} className={`min-w-0 rounded-lg px-2.5 py-2 ${toneSurfaces[factor.tone]}`}><p className="truncate text-[10px] text-text-tertiary">{factor.label}</p><p className={`mt-0.5 truncate text-[11px] font-medium ${toneLabels[factor.tone]}`}>{factor.value}</p></li>)}</ul> : <div className="mt-1.5 flex items-start gap-1.5 text-[11px] leading-5 text-text-tertiary"><CheckCircle1 size={13} className="mt-0.5 shrink-0 text-success-500" aria-hidden="true" /><span>{dimension.evidence.join(" · ")}</span></div>}
              </div>
            </div>
          </li>
        ))}
      </ol>

      <div className="mt-4 rounded-xl border border-warning-500/25 bg-badge-warning-background p-3">
        <p className="text-[11px] font-semibold tracking-wide text-badge-warning-text uppercase">Điểm cần gỡ trước</p>
        <p className="mt-1 text-sm font-semibold text-text-primary">{data.classification.dimensions.find((dimension) => dimension.id === "barrier")?.value ?? "Cần xác minh"}</p>
        <p className="mt-1 text-sm leading-6 text-text-secondary">Giải quyết đúng điểm này sẽ giúp tín hiệu quan tâm chuyển thành bước hồ sơ.</p>
      </div>
    </Card>
  );
}
