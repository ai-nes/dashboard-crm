"use client";

import {
  ArrowRight,
  ErrorCircle1,
  Phone,
  RefreshCircle1Clockwise,
} from "@tailgrids/icons";
import { useMemo } from "react";

import { computeAnalysisKpis } from "@/components/analysis-runs/analysis-run-meta";
import { Badge } from "@/components/tailgrids/core/badge";
import { Button } from "@/components/tailgrids/core/button";
import { Skeleton } from "@/components/tailgrids/core/skeleton";
import type { AnalysisRunSnapshot } from "@/services/api/analysis-runs";
import type { Student360Data } from "@/services/api/students/types";

interface StudentNextActionProps {
  data: Student360Data;
  run: AnalysisRunSnapshot | null;
  isAwaitingAnalysisResponse: boolean;
  isAnalysisActive: boolean;
  analysisError: Error | null;
  onCall: () => void;
  onOpenAnalysisDetails: () => void;
}

export default function StudentNextAction({
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
  const claims = useMemo(
    () => run?.stages.flatMap((stage) => stage.claims) ?? [],
    [run],
  );
  const recommendation = useMemo(
    () => claims.find((claim) => claim.claimKind === "recommendation"),
    [claims],
  );
  const supportingInsight = useMemo(
    () => claims.find((claim) => claim.claimKind === "inference"),
    [claims],
  );
  const kpis = useMemo(() => computeAnalysisKpis(run?.stages ?? []), [run]);
  return (
    <section
      className="flex min-w-0 flex-col p-5 xl:p-6"
      aria-busy={isAwaitingAnalysisResponse}
      aria-labelledby="next-action-heading"
    >
      <div className="flex items-start justify-between gap-3">
        <p
          id="next-action-heading"
          className="text-sm font-semibold text-text-primary"
        >
          Hành động tiếp theo
        </p>
        <Badge color="primary">Hôm nay</Badge>
      </div>

      {isAwaitingAnalysisResponse ? (
        <ActionResultSkeleton />
      ) : isAnalysisActive ? (
        <div
          className="mt-7 flex items-center gap-2 text-sm text-text-secondary"
          role="status"
        >
          <RefreshCircle1Clockwise
            className="shrink-0 text-primary-500 motion-safe:animate-spin"
            size={16}
            aria-hidden="true"
          />
          <span>Đang tổng hợp tín hiệu hồ sơ…</span>
        </div>
      ) : recommendation ? (
        <div className="mt-7">
          <p className="text-xs font-medium text-text-tertiary">
            Phân tích Hồ sơ học sinh 360
          </p>
          <h3 className="mt-2 max-w-xl text-2xl leading-8 font-semibold tracking-[-0.4px] text-text-primary text-pretty">
            {recommendation.statement}
          </h3>
          {supportingInsight && (
            <p className="mt-3 max-w-xl text-sm leading-6 text-text-secondary text-pretty">
              <span className="font-medium text-text-primary">
                Tín hiệu chính:
              </span>
              {supportingInsight.statement}
            </p>
          )}
          <Button
            appearance="ghost"
            className="mt-3 -ml-2 text-primary-600 hover:text-primary-700"
            onPress={onOpenAnalysisDetails}
            size="xs"
          >
            Xem {kpis.totalClaims} tín hiệu phân tích
            <ArrowRight aria-hidden="true" size={14} />
          </Button>
        </div>
      ) : (
        <div className="mt-7">
          <h3 className="max-w-xl text-2xl leading-8 font-semibold tracking-[-0.4px] text-text-primary">
            {classification.action || "Chưa có hành động cụ thể"}
          </h3>
          <p className="mt-3 max-w-xl text-sm leading-6 text-text-secondary">
            {barrier !== "-"
              ? `Mục tiêu: xử lý ${barrier.toLowerCase()} trước cuộc gọi.`
              : "Mục tiêu: chuẩn bị phương án tư vấn trước cuộc gọi."}
          </p>
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

      <dl className="mt-7 grid grid-cols-2 gap-x-5 gap-y-5 border-y border-card-border py-4">
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
        <div>
          <dt className="text-[11px] text-text-tertiary">Khung giờ</dt>
          <dd className="mt-1 text-sm font-semibold text-text-primary">
            {bestContactTime}
          </dd>
        </div>
      </dl>

      <div className="relative mt-5 flex flex-wrap gap-2">
        <Button size="sm" onPress={onCall}>
          <Phone size={16} aria-hidden="true" />
          Gọi tư vấn
        </Button>
      </div>
    </section>
  );
}

function ActionResultSkeleton() {
  return (
    <div className="mt-7 space-y-3" aria-label="Đang tải kết quả phân tích">
      <Skeleton className="h-3 w-40" />
      <Skeleton className="h-8 w-full max-w-xl" />
      <Skeleton className="h-8 w-4/5 max-w-lg" />
      <Skeleton className="h-4 w-full max-w-xl" />
      <Skeleton className="h-4 w-3/5 max-w-md" />
    </div>
  );
}
