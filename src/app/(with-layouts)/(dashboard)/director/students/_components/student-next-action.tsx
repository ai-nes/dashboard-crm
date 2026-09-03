"use client";

import {
  ArrowRight,
  ErrorCircle1,
  Phone,
} from "@tailgrids/icons";
import { type ReactNode, useMemo } from "react";

import {
  computeAnalysisKpis,
  getDeepAnalysisNotice,
} from "@/components/analysis-runs/analysis-run-meta";
import { Badge } from "@/components/tailgrids/core/badge";
import { Button } from "@/components/tailgrids/core/button";
import { Skeleton } from "@/components/tailgrids/core/skeleton";
import type { AnalysisRunSnapshot } from "@/services/api/analysis-runs";
import type { Student360Data } from "@/services/api/students/types";

interface StudentNextActionProps {
  analysisAction?: ReactNode;
  data: Student360Data;
  run: AnalysisRunSnapshot | null;
  isAwaitingAnalysisResponse: boolean;
  isAnalysisActive: boolean;
  analysisError: Error | null;
  onCall: () => void;
  onOpenAnalysisDetails: () => void;
}

export default function StudentNextAction({
  analysisAction,
  data,
  run,
  isAwaitingAnalysisResponse,
  isAnalysisActive,
  analysisError,
  onCall,
  onOpenAnalysisDetails,
}: StudentNextActionProps) {
  const classification = data.classification;
  const barrier =
    classification.dimensions?.find((dimension) => dimension.id === "barrier")
      ?.value || "-";
  const decisionMaker =
    [data.parentProfile?.name, data.parentProfile?.relation]
      .filter(Boolean)
      .join(" · ") || "-";
  const preferredChannel = data.parentProfile?.preferredChannel || "-";
  const bestContactTime = data.parentProfile?.bestContactTime || "-";
  const steps = [
    {
      title: "Gọi tư vấn",
      detail:
        preferredChannel !== "-"
          ? `Ưu tiên ${preferredChannel}${bestContactTime !== "-" ? ` · ${bestContactTime}` : ""}`
          : "Kết nối để xác nhận nhu cầu hiện tại",
    },
    {
      title: "Làm rõ nhu cầu",
      detail:
        barrier !== "-"
          ? `Trao đổi về ${barrier.toLowerCase()}`
          : "Xác định mối quan tâm cần hỗ trợ",
    },
    {
      title: "Cập nhật hồ sơ",
      detail: "Ghi nhận phản hồi và chốt lần theo dõi tiếp theo",
    },
  ];
  const student360Stage = useMemo(
    () =>
      run?.stages.find((stage) => stage.stageKind === "student_360") ?? null,
    [run],
  );
  const nbaStage = useMemo(
    () =>
      run?.stages.find((stage) => stage.stageKind === "next_best_action") ??
      null,
    [run],
  );
  const report = student360Stage?.report ?? null;
  const nbaRecommendation = useMemo(
    () =>
      nbaStage?.claims.find((claim) => claim.claimKind === "recommendation") ??
      null,
    [nbaStage],
  );
  const reportRecommendation = useMemo(
    () =>
      report?.recommendations.find(
        (item) => item.kind === "recommendation",
      ) ?? null,
    [report],
  );
  const supportingInsight = useMemo(
    () =>
      student360Stage?.claims.find(
        (claim) =>
          claim.claimKind === "inference" || claim.claimKind === "fact",
      ) ?? null,
    [student360Stage],
  );
  const primaryRisk = report?.risks[0] ?? null;
  const nextAction = nbaRecommendation
    ? {
        label: "Hành động tiếp theo từ AI",
        statement: nbaRecommendation.statement,
        detail: supportingInsight?.statement ?? report?.summary ?? null,
      }
    : reportRecommendation
      ? {
          label: "Khuyến nghị từ Hồ sơ 360",
          statement: reportRecommendation.headline,
          detail: reportRecommendation.detail,
        }
      : null;
  const analysisNotice = run ? getDeepAnalysisNotice(run) : null;
  const kpis = useMemo(() => computeAnalysisKpis(run?.stages ?? []), [run]);
  const analysisDetailsLabel =
    kpis.totalClaims > 0
      ? `Xem ${kpis.totalClaims} tín hiệu phân tích`
      : "Xem báo cáo phân tích";

  const isAnalysisLoading = isAwaitingAnalysisResponse || isAnalysisActive;
  return (
    <section
      className="flex min-w-0 flex-col p-5 xl:p-6"
      aria-busy={isAnalysisLoading}
      aria-labelledby="next-action-heading"
    >
      <div className="flex items-start justify-between gap-3">
        <p
          id="next-action-heading"
          className="text-sm font-semibold text-text-primary"
        >
          Hành động tiếp theo
        </p>
        <div className="flex shrink-0 items-center gap-2">
          {analysisAction}
          <Badge color="primary">Hôm nay</Badge>
        </div>
      </div>

      {isAnalysisLoading ? (
        <AnalysisTextSkeleton />
      ) : nextAction || report ? (
        <div className="mt-7">
          <p className="text-xs font-medium text-text-tertiary">
            {nextAction?.label ?? "Phân tích Hồ sơ học sinh 360"}
          </p>
          <h3 className="mt-2 max-w-xl text-2xl leading-8 font-semibold tracking-[-0.4px] text-text-primary text-pretty">
            {nextAction?.statement ??
              report?.title ??
              "Tổng quan hồ sơ học sinh"}
          </h3>
          {(nextAction?.detail || report?.summary) && (
            <p className="mt-3 max-w-xl text-sm leading-6 text-text-secondary text-pretty">
              {nextAction?.label === "Hành động tiếp theo từ AI" && (
                <span className="font-medium text-text-primary">
                  Tín hiệu chính: {" "}
                </span>
              )}
              {nextAction?.detail ?? report?.summary}
            </p>
          )}
          {primaryRisk && (
            <div className="mt-4 rounded-lg border border-warning-200 bg-badge-warning-background px-3 py-2.5 dark:border-warning-800">
              <p className="text-xs font-semibold text-warning-700 dark:text-warning-300">
                Rủi ro cần lưu ý
              </p>
              <p className="mt-1 text-sm font-semibold text-text-primary text-pretty">
                {primaryRisk.headline}
              </p>
              {primaryRisk.detail !== primaryRisk.headline && (
                <p className="mt-1 text-xs leading-5 text-text-secondary text-pretty">
                  {primaryRisk.detail}
                </p>
              )}
            </div>
          )}
          <Button
            appearance="ghost"
            className="mt-3 -ml-2 text-primary-600 hover:text-primary-700"
            onPress={onOpenAnalysisDetails}
            size="xs"
          >
            {analysisDetailsLabel}
            <ArrowRight aria-hidden="true" size={14} />
          </Button>
        </div>
      ) : (
        <div className="mt-7">
          <h3 className="max-w-xl text-2xl leading-8 font-semibold tracking-[-0.4px] text-text-primary">
            {classification.action || "Chưa có hành động cụ thể"}
          </h3>
        </div>
      )}

      {analysisError && !isAnalysisActive && (
        <p
          className="mt-3 flex items-center gap-2 text-xs leading-5 text-error-600"
          role="alert"
        >
          <ErrorCircle1 size={15} aria-hidden="true" />
          Chưa thể hoàn tất phân tích. Bạn có thể thử lại.
        </p>
      )}

      {analysisNotice && !analysisError && (
        <p
          className="mt-3 text-xs leading-5 text-warning-700 dark:text-warning-300"
          role="status"
        >
          {analysisNotice}
        </p>
      )}

      <dl className="mt-7 grid grid-cols-2 gap-x-5 gap-y-5 border-y border-card-border py-4 sm:grid-cols-3">
        <div>
          <dt className="text-[11px] text-text-tertiary">Rào cản cần xử lý</dt>
          <dd className="mt-1 text-sm font-semibold text-warning-500">
            {barrier}
          </dd>
        </div>
        <div>
          <dt className="text-[11px] text-text-tertiary">Người quyết định</dt>
          <dd
            className="mt-1 truncate text-sm font-semibold text-text-primary"
            title={decisionMaker}
          >
            {decisionMaker}
          </dd>
        </div>
        <div>
          <dt className="text-[11px] text-text-tertiary">Kênh ưu tiên</dt>
          <dd className="mt-1 text-sm font-semibold text-text-primary">
            {preferredChannel}
          </dd>
        </div>
      </dl>

      {isAnalysisLoading ? (
        <AnalysisStepsSkeleton />
      ) : (
        <div className="mt-5">
          <h3 className="text-sm font-semibold text-text-primary">
            3 bước tiếp theo
          </h3>
          <ol className="mt-2 grid gap-2 sm:grid-cols-3">
            {steps.map((step, index) => (
              <li key={step.title} className="flex min-w-0 items-start gap-2">
                <span className={stepTone(index)}>{index + 1}</span>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-text-primary">
                    {step.title}
                  </p>
                  <p
                    className="mt-0.5 line-clamp-2 text-xs leading-4 text-text-secondary"
                    title={step.detail}
                  >
                    {step.detail}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      )}

      <div className="relative mt-5 flex flex-wrap gap-2">
        <Button size="sm" onPress={onCall}>
          <Phone size={16} aria-hidden="true" />
          Gọi tư vấn
        </Button>
      </div>
    </section>
  );
}

function stepTone(index: number) {
  if (index === 0)
    return "flex size-6 shrink-0 items-center justify-center rounded-full bg-badge-primary-background text-xs font-semibold text-badge-primary-text";
  if (index === 1)
    return "flex size-6 shrink-0 items-center justify-center rounded-full bg-badge-warning-background text-xs font-semibold text-badge-warning-text";
  return "flex size-6 shrink-0 items-center justify-center rounded-full bg-badge-success-background text-xs font-semibold text-badge-success-text";
}

function AnalysisTextSkeleton() {
  return (
    <div className="mt-7 space-y-3" role="status" aria-live="polite">
      <Skeleton className="h-3 w-48" />
      <Skeleton className="h-8 w-full max-w-xl" />
      <Skeleton className="h-8 w-4/5 max-w-lg" />
      <Skeleton className="h-4 w-full max-w-xl" />
      <Skeleton className="h-4 w-3/5 max-w-md" />
    </div>
  );
}

function AnalysisStepsSkeleton() {
  return (
    <div className="mt-5 space-y-3" aria-hidden="true">
      <Skeleton className="h-4 w-32" />
      <div className="grid gap-3 sm:grid-cols-3">
        {["w-24", "w-28", "w-24"].map((width, index) => (
          <div key={`${width}-${index}`} className="flex gap-2">
            <Skeleton className="size-6 shrink-0 rounded-full" />
            <div className="min-w-0 flex-1 space-y-2">
              <Skeleton className={`h-4 ${width}`} />
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-4/5" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
