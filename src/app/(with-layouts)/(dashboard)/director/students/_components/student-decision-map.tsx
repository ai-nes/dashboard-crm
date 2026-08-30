"use client";

import { ArrowRight, TrendUp2 } from "@tailgrids/icons";
import { Button as AriaButton } from "react-aria-components";

import { Badge } from "@/components/tailgrids/core/badge";
import { Card, CardHeader, CardTitle } from "@/components/tailgrids/core/card";

import type { Student360SectionProps } from "./types";

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function getFitPosition(fitValue: string) {
  if (fitValue.toLowerCase().includes("cao")) return 74;
  if (fitValue.toLowerCase().includes("trung bình")) return 48;
  return 22;
}

function getInterestScore(interestEvidence: string[] | undefined, fallback: number) {
  const scoreEvidence = interestEvidence?.find((item) => item.startsWith("Điểm tín hiệu"));
  const score = scoreEvidence ? Number(scoreEvidence.match(/\d+/)?.[0]) : Number.NaN;
  return Number.isFinite(score) ? score : fallback;
}

export default function StudentDecisionMap({ data }: Student360SectionProps) {
  const interest = data.classification.dimensions.find((dimension) => dimension.id === "interest");
  const fit = data.classification.dimensions.find((dimension) => dimension.id === "fit");
  const barrier = data.classification.dimensions.find((dimension) => dimension.id === "barrier");
  const interestScore = getInterestScore(interest?.evidence, data.insight.probability);
  const fitPosition = getFitPosition(fit?.value ?? "");
  const xPosition = clamp(interestScore, 12, 88);
  const priorityZone = interestScore >= 70 && fit?.value === "Phù hợp cao";

  return (
    <Card className="flex h-full min-w-0 flex-col bg-card-background p-4">
      <CardHeader className="items-start">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <CardTitle>Bản đồ khả năng chuyển đổi</CardTitle>
            <Badge color={priorityZone ? "success" : "warning"}>
              <TrendUp2 size={13} aria-hidden="true" />
              {priorityZone ? "Vùng ưu tiên" : "Cần theo dõi"}
            </Badge>
          </div>
          <p className="mt-1 max-w-xl text-sm leading-6 text-text-tertiary">
            Đặt mức quan tâm cạnh tính phù hợp để nhìn ra cơ hội và điểm nghẽn trong cùng một khung.
          </p>
        </div>
        <div className="hidden items-center gap-1 text-sm text-text-tertiary sm:flex">
          <span className="size-2 rounded-full bg-primary-500" aria-hidden="true" />
          Học sinh hiện tại
        </div>
      </CardHeader>

      <div
        className="relative mt-5 min-h-72 flex-1 rounded-2xl border border-card-border bg-card-background"
        role="img"
        aria-label={`Bản đồ quyết định: mức quan tâm ${interestScore}%, mức phù hợp ${fit?.value ?? "chưa xác định"}, rào cản ${barrier?.value ?? "chưa xác định"}.`}
      >
        <div className="absolute top-3 right-3 bottom-12 left-20 overflow-hidden rounded-xl border border-card-border">
          <div className="absolute top-0 right-0 h-1/2 w-1/2 bg-badge-success-background" />
          <div className="absolute top-0 left-0 h-1/2 w-1/2 bg-badge-sky-background" />
          <div className="absolute right-0 bottom-0 h-1/2 w-1/2 bg-badge-warning-background" />
          <div className="absolute bottom-0 left-0 h-1/2 w-1/2 bg-card-background" />

          <div className="absolute inset-x-0 top-1/2 border-t border-dashed border-card-border" aria-hidden="true" />
          <div className="absolute inset-y-0 left-1/2 border-l border-dashed border-card-border" aria-hidden="true" />

          <div className="absolute top-3 right-3 text-right text-xs font-medium text-success-500">
            <p className="sm:hidden">Ưu tiên</p>
            <p className="hidden sm:block">Ưu tiên chuyển đổi</p>
            <p className="mt-0.5 hidden text-xs font-normal text-text-tertiary sm:block">Quan tâm + phù hợp cao</p>
          </div>
          <div className="absolute bottom-3 right-3 text-right text-xs font-medium text-warning-500">
            <p className="sm:hidden">Tháo gỡ</p>
            <p className="hidden sm:block">Cần tháo gỡ</p>
            <p className="mt-0.5 hidden text-xs font-normal text-text-tertiary sm:block">Quan tâm cao, còn vướng</p>
          </div>
          <div className="absolute top-3 left-3 text-xs font-medium text-badge-sky-text">
            <p className="sm:hidden">Nuôi dưỡng</p>
            <p className="hidden sm:block">Nuôi dưỡng có chọn lọc</p>
          </div>

          <div
            className="group/marker absolute z-10 -translate-x-1/2 translate-y-1/2"
            style={{ left: `${xPosition}%`, bottom: `${fitPosition}%` }}
          >
            <div className="relative flex flex-col items-center">
              <div
                className="invisible absolute bottom-5 left-1/2 w-max max-w-40 -translate-x-1/2 scale-95 rounded-lg bg-text-primary px-2.5 py-1.5 text-center text-xs font-semibold text-card-background opacity-0 shadow-md transition duration-150 group-hover/marker:visible group-hover/marker:scale-100 group-hover/marker:opacity-100 group-focus-within/marker:visible group-focus-within/marker:scale-100 group-focus-within/marker:opacity-100"
                role="tooltip"
                aria-hidden="true"
              >
                {data.student.name}
                <span className="mt-0.5 block text-[11px] font-normal text-card-background/70">
                  {interest?.value ?? "Đang đánh giá"} · {fit?.value ?? "Chưa xác định"}
                </span>
              </div>
              <AriaButton
                aria-label={`Xem vị trí của ${data.student.name}: ${interestScore}% quan tâm, ${fit?.value ?? "chưa xác định"}.`}
                className="relative flex size-8 cursor-pointer appearance-none items-center justify-center rounded-full border-0 bg-transparent p-0 outline-none focus-visible:ring-4 focus-visible:ring-primary-500/20"
                onPress={() => undefined}
              >
                <span className="absolute size-8 animate-ping rounded-full bg-primary-500/20" aria-hidden="true" />
                <span className="relative size-4 rounded-full border-4 border-card-background bg-primary-500 shadow-md" aria-hidden="true" />
              </AriaButton>
            </div>
          </div>
        </div>

        <div className="absolute top-3 bottom-12 left-2 flex w-16 flex-col justify-between py-1 text-right text-xs leading-5 text-text-tertiary">
          <span>Phù hợp cao</span>
          <span>Trung bình</span>
          <span>Phù hợp thấp</span>
        </div>
        <div className="absolute right-3 bottom-2 left-20 flex justify-between text-xs text-text-tertiary">
          <span>Ít quan tâm</span>
          <span>Nhiều quan tâm</span>
        </div>
        <span className="absolute bottom-2 left-1/2 hidden -translate-x-1/2 text-xs font-medium text-text-tertiary sm:block">
          Mức độ quan tâm <ArrowRight size={11} className="ml-0.5 inline" aria-hidden="true" />
        </span>
      </div>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-sm">
        <div className="flex items-center gap-2 text-text-secondary">
          <span className="size-2 rounded-full bg-primary-500" aria-hidden="true" />
          <span>Vị trí hiện tại: {interestScore}% quan tâm</span>
        </div>
        <span className="text-text-tertiary">Rào cản: <strong className="font-medium text-warning-500">{barrier?.value ?? "Chưa xác định"}</strong></span>
      </div>

    </Card>
  );
}
