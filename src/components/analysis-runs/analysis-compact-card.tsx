"use client";

import { ArrowRight, RefreshCircle1Clockwise, Sparkle } from "@tailgrids/icons";
import { useMemo } from "react";

import { Badge } from "@/components/tailgrids/core/badge";
import { Button } from "@/components/tailgrids/core/button";
import type {
  AnalysisRunKind,
  AnalysisRunSnapshot,
} from "@/services/api/analysis-runs";
import { cn } from "@/utils/cn";

import {
  computeAnalysisKpis,
  formatClaimConfidence,
  statusMeta,
} from "./analysis-run-meta";
import AnalysisSignalProfile from "./analysis-signal-profile";

interface AnalysisCompactCardProps {
  kind: AnalysisRunKind;
  targetId: string;
  title: string;
  description?: string;
  run: AnalysisRunSnapshot;
  isActive: boolean;
  isPending: boolean;
  onRequest: () => void;
  onOpenDrawer: () => void;
  embedded?: boolean;
}

export default function AnalysisCompactCard({
  kind,
  targetId,
  title,
  run,
  isActive,
  isPending,
  onRequest,
  onOpenDrawer,
  embedded = false,
}: AnalysisCompactCardProps) {
  const kpis = useMemo(() => computeAnalysisKpis(run.stages), [run.stages]);
  const claims = useMemo(
    () => run.stages.flatMap((stage) => stage.claims),
    [run.stages],
  );
  const topRecommendation = useMemo(
    () => claims.find((c) => c.claimKind === "recommendation") ?? claims[0],
    [claims],
  );
  const supportingInsight = useMemo(
    () => claims.find((claim) => claim.claimKind === "inference"),
    [claims],
  );
  const confidenceInfo = topRecommendation
    ? formatClaimConfidence(topRecommendation.confidence)
    : null;

  const requestLabel = isPending
    ? "Đang gửi"
    : isActive
      ? "Đang phân tích"
      : "Phân tích lại";

  return (
    <div
      className={cn(
        "min-w-0",
        !embedded &&
          "rounded-xl border border-card-border bg-card-background px-5 py-4 lg:px-6",
      )}
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div
            className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-badge-primary-background text-primary-600"
            aria-hidden="true"
          >
            <Sparkle size={16} />
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h3
                id={`${kind}-analysis-heading`}
                className="text-sm font-semibold text-text-primary"
              >
                {title}
              </h3>
              <Badge color={statusMeta[run.status].color} size="sm">
                {isActive && (
                  <span
                    className="size-1.5 rounded-full bg-primary-500 motion-safe:animate-ping"
                    aria-hidden="true"
                  />
                )}
                {statusMeta[run.status].label}
              </Badge>
            </div>
            <p className="mt-0.5 text-xs text-text-tertiary">
              Kết quả từ dữ liệu hiện tại.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            appearance="outline"
            size="sm"
            onPress={onRequest}
            isDisabled={!targetId.trim() || isPending || Boolean(isActive)}
            className="text-text-secondary"
          >
            <RefreshCircle1Clockwise
              size={15}
              className={cn(isActive && "motion-safe:animate-spin")}
              aria-hidden="true"
            />
            {requestLabel}
          </Button>

          <Button size="sm" onPress={onOpenDrawer}>
            <span>Xem tín hiệu</span>
            <ArrowRight size={15} aria-hidden="true" />
          </Button>
        </div>
      </div>

      {topRecommendation ? (
        <div className="mt-5 grid min-w-0 border-t border-card-border lg:grid-cols-[minmax(15rem,0.7fr)_minmax(0,1.3fr)] lg:gap-6">
          <AnalysisSignalProfile
            onOpenDrawer={onOpenDrawer}
            stages={run.stages}
          />

          <section
            className="min-w-0 border-t border-card-border py-5 lg:border-t-0 lg:py-6"
            aria-labelledby={`${kind}-recommendation-heading`}
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm font-semibold text-text-primary">
                Đề xuất tiếp theo
              </p>
              {confidenceInfo && (
                <Badge color={confidenceInfo.color} size="sm">
                  {confidenceInfo.label}
                </Badge>
              )}
            </div>
            <h4
              id={`${kind}-recommendation-heading`}
              className="mt-3 max-w-3xl text-lg leading-7 font-semibold text-text-primary text-pretty"
            >
              {topRecommendation.statement}
            </h4>
            {supportingInsight && (
              <p className="mt-3 max-w-3xl text-sm leading-6 text-text-secondary text-pretty">
                <span className="font-medium text-text-primary">
                  Tín hiệu chính:{" "}
                </span>
                {supportingInsight.statement}
              </p>
            )}
            <p className="mt-4 text-xs text-text-tertiary">
              {kpis.sourcedCount}/{kpis.totalClaims} tín hiệu có nguồn đối soát.
            </p>
          </section>
        </div>
      ) : (
        <div className="mt-5 border-t border-card-border pt-5 text-sm leading-6 text-text-secondary">
          Lần phân tích này chưa có đề xuất trong phạm vi được phép xem.
        </div>
      )}
    </div>
  );
}
